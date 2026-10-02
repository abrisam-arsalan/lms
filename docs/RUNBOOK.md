# RUNBOOK — LMS SMPN 5 Tegal (lms.smp5tegal.sch.id)

> Untuk operator server (pemilik proyek). Pola sama dengan mpi/presensi:
> **developer push ke GitHub → server tinggal `git pull`**. Tidak ada build di server.

## 0. Prinsip & batas

- **Laptop developer = Windows, server = Ubuntu.** Pembagian jalan:
  - Semua perintah `bash scripts/deploy.sh` dst. di laptop dijalankan dari **Git Bash**
    (PowerShell/CMD tidak — bukan masalah isi skrip, soal kenyamanan jalur).
  - Engine Prisma Linux sudah dibundel di branch `deploy` sejak build Windows
    (`binaryTargets=["native","debian-openssl-3.0.x"]` di schema) — server TIDAK build apa pun.
  - Seluruh file di repo dipaksa **LF** lewat `.gitattributes` ⇒ skrip server
    (`backup-lms.sh`, systemd ExecStart, dst.) langsung jalan tanpa `dos2unix`.
  - SSH dari Windows: Windows Terminal / `ssh deploy@server` bawaan sudah cukup.
- Setelah clone di server (antisipasi bit eksekusi engine, idempoten):
  `find /var/www/lms -name "*.so.node" -exec chmod +x {} +`
- Port internal **3005** (3000 sudah dipakai presensi). nginx tetap satu di port 80, dipilah `server_name`.
- HTTPS diurus Cloudflare Tunnel; origin cukup listen 80.
- DB: **MariaDB existing**, `smp_lms`, user `lms_user` (grant hanya ke `smp_lms.*`).
- RAM 8 GB: Node dibatasi `--max-old-space-size=768`, **swap 2 GB wajib aktif**.
- Jangan pernah restart `cloudflared`/`nginx`/`lms` saat jam ujian CBT berlangsung.
- `lms.smp5tegal.sch.id` dan file contoh nilai (PII) — **data siswa jangan di-commit**.

## 1. Setup awal server (sekali)

### Jalur cepat (direkomendasikan) — dari SSH Ubuntu:

```bash
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/abrisam-arsalan/lms/deploy/deploy/setup-server.sh)"
# lalu bootstrap data lama:
sudo bash /var/www/lms/deploy/bootstrap-data.sh      # dry-run dulu, konfirmasi y utk tulis
```
`setup-server.sh` idempoten: Node ≥24 (tarball resmi — sengaja **bukan** apt, karena
PPA php `ondrej` yang rusak bisa memblokir `apt update`), swap, user deploy, clone branch `deploy`,
DB+user+sandi acak (tersimpan di `/root/lms-kredensial.txt`), `.env`, migrate,
systemd, nginx vhost, cek `/healthz`. **Tunnel ingress tetap manual (§6).**

### Jalur manual (fallback / belajar):

```bash
# Node ≥24 dari TARBALL (bukan apt). Penting: `apt update` di server ini bisa gagal
# gara2 PPA ondrej/php 404 (Ubuntu resolute) & nodesource lama mengunci v20 tanpa
# node:sqlite. Tarball ke /usr/local menyalip PATH tanpa menyentuh apt:
F=node-v24.1.0-linux-x64.tar.xz   # cek https://nodejs.org/dist/latest-v24.x/ utk versi terkini
curl -fsSLO https://nodejs.org/dist/latest-v24.x/$F
sudo tar -xJf $F -C /usr/local/lib/nodejs 2>/dev/null || { sudo mkdir -p /usr/local/lib/nodejs; sudo tar -xJf $F -C /usr/local/lib/nodejs; }
B=${F%.tar.xz}; sudo ln -sfn /usr/local/lib/nodejs/$B/bin/node /usr/local/bin/node
sudo ln -sfn /usr/local/lib/nodejs/$B/bin/npm /usr/local/bin/npm; rm -f $F
node --version          # ≥ 24 — WAJIB: node:sqlite dipakai bootstrap, tak ada di v20

# Swap 2 GB bila belum ada:
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab && sudo swapon -a
free -h                 # cek Swap 2.0Gi

# Repo PUBLIC (abrisam-arsalan/lms) → cukup HTTPS, tanpa token/deploy key:
sudo git clone -b deploy --depth 1 https://github.com/abrisam-arsalan/lms.git /var/www/lms
# (branch `deploy` = artefak hasil build; `main` = source, lihat §4 update rutin)
sudo mkdir -p /var/www/lms/storage/uploads
sudo chown -R deploy:deploy /var/www/lms/storage
```

## 2. Database & .env (sekali)

```bash
# 2a. buat DB + user (edit password di db.sql dulu!)
sudo nano /var/www/lms/deploy/db.sql     # ganti GANTI_PASSWORD_KUAT
sudo mysql < /var/www/lms/deploy/db.sql

# 2b. .env
sudo cp /var/www/lms/.env.example /var/www/lms/.env
sudo nano /var/www/lms/.env              # DATABASE_URL, AUTH_SECRET, dst.
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # AUTH_SECRET
sudo chown deploy:deploy /var/www/lms/.env && sudo chmod 600 /var/www/lms/.env
```

## 3. Migrations (pertama & tiap update)

`schema.prisma` + folder `prisma/migrations` ikut ter-bundle di branch deploy.
Jalankan dari **checkout branch main** yang di-clone terpisah, atau pakai bin yang
dibawa deploy (Prisma CLI tidak di-bundle standalone). Cara paling simpel: dari laptop,
sambungkan sementara via SSH tunnel — TIDAK diperlukan. Gunakan sqlite? Tidak.

**Cara baku (di server, sekali per perubahan migrasi):**
```bash
# Prisma CLI di-install ke folder tools (di luar app, sekali saja):
sudo npm install --prefix /opt/lms-tools prisma@6.3.0
sudo chmod -R a+rX /opt/lms-tools   # hindari "prisma: Permission denied" saat jalan sbg deploy
# jalankan migrate (panggil bin langsung, bukan via PATH shim):
cd /var/www/lms && sudo bash -c 'set -a; . /var/www/lms/.env; set +a; node /opt/lms-tools/node_modules/prisma/build/index.js migrate deploy'
```

## 4. Update rutin (setiap rilis)

```bash
# ── di LAPTOP ──
bash scripts/deploy.sh            # build + push branch deploy

# ── di SERVER ──
# PENTING: /var/www/lms & .git milik user `deploy` → pull HARUS via deploy,
# kalau jalan sebagai usernya login biasa muncul "Permission denied"/"dubious ownership":
cd /var/www/lms && sudo -u deploy git pull
# bila rilis membawa perubahan skema (dilihat dari pesan commit "deploy artefak … main@xxxx"):
#   jalankan §3 ulang
sudo systemctl restart lms
systemctl status lms --no-pager
curl -s http://127.0.0.1:3005/healthz
```

## 5. Bootstrap migrasi data (sekali, M0)

Sumber: `/var/www/presensi/data/sekolah.db` + MariaDB `cbt_tka`. Idempoten — boleh diulang.

```bash
# grant SELECT sementara ke cbt_tka (lihat deploy/db.sql, baris terakhir)
sudo mysql -e "GRANT SELECT ON cbt_tka.* TO 'lms_user'@'localhost'; FLUSH PRIVILEGES;"

cd /var/www/lms
node --env-file=.env scripts-server/bootstrap.mjs --dry-run   # baca laporan + peringatan
node --env-file=.env scripts-server/bootstrap.mjs             # tulis sungguhan

# cabut lagi:
sudo mysql -e "REVOKE SELECT ON cbt_tka.* FROM 'lms_user'@'localhost'; FLUSH PRIVILEGES;"
```

Rapikan hasil: peringatan `tak cocok dgn Presensi` = akun CBT yang namanya tak ketemu;
login LMS siswa = NISN (dari CBT), username lama presensi (`siswa.andi`) tetap jalan
dgn password lama — informasikan guru bahwa password akan diseragamkan saat SSO (Fase 2).

## 6. Nginx vhost + Tunnel (sekali)

```bash
sudo cp /var/www/lms/deploy/nginx-lms.conf /etc/nginx/sites-available/lms.smp5tegal.sch.id
sudo ln -s /etc/nginx/sites-available/lms.smp5tegal.sch.id /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Tunnel: tambahkan hostname lms (pola deploy/cloudflared-ingress-add.yml)
sudo cp /etc/cloudflared/config.yml /etc/cloudflared/config.yml.bak-$(date +%F)
sudo nano /etc/cloudflared/config.yml    # 2 baris ingress, indentasi 2 spasi, sebelum fallback 404
sudo cloudflared tunnel ingress validate -f /etc/cloudflared/config.yml || { sudo cp /etc/cloudflared/config.yml.bak-* /etc/cloudflared/config.yml; echo "RESTORED, perbaiki manual"; exit 1; }
sudo systemctl restart cloudflared       # ← LUAR JAM SEKOLAH/ujian

# DNS (sekali, dari laptop yg login cloudflared):
#   cloudflared tunnel route dns <NAMA-TUNNEL> lms.smp5tegal.sch.id
```

## 7. Backup & restore

```bash
# cron /etc/cron.d/lms-backup — jam 02:30 (presensi sudah 02:00)
# BACKUP_DIR = mountpoint disk sdb (NTFS) — cek `lsblk -f` & `df -h`, sesuaikan.
30 2 * * * deploy /var/www/lms/scripts-server/backup-lms.sh /mnt/sdb/lms-backup
```

`scripts-server/backup-lms.sh` (sudah dibundle): `mysqldump` + tar uploads, retensi 30 hari.
Restore:
```bash
gunzip < /mnt/sdb/lms-backup/db-YYYYMMDD.sql.gz | mysql smp_lms
# uploads: tar -xzf uploads-YYYYMMDD.tar.gz -C /var/www/lms/storage/
```
**Drill restore wajib tiap awal semester** (catat tanggal di kalender sekolah).

## 8. Monitoring & troubleshooting

```bash
systemctl status lms; journalctl -u lms -n 50 --no-pager
free -h                      # WASPADA bila < 800 MB free setelah LMS up
df -h /var/www /mnt/sdb      # upload & backup makan disk
curl -s http://127.0.0.1:3005/healthz
tail -50 /var/log/nginx/lms.error.log
```

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| 502 dari nginx | lms.service mati | `journalctl -u lms` — cek .env/DATABASE_URL/port 3005 |
| 523/521 Cloudflare | tunnel mati / ingress salah indentasi | §6, restore `config.yml.bak`, restart cloudflared luar jam |
| OOM saat load | tanpa swap / max-old-space tak terbaca | §1 swap; matikan layanan tak penting saat ujian |
| Login semua gagal | hash bcrypt dari CBT ($2y$) — harusnya OK; cek jam server | `SELECT 1`; TZ server (WIB) & kolom expiresAt |
| NISN tidak muncul | bootstrap belum jalan / nama tak cocok | §5 ulangi (idempoten), cek laporan peringatan |

## 9. Rollback rilis

```bash
cd /var/www/lms
git log --oneline -5          # artefak deploy di-tag "deploy artefak <stamp> (main@sha)"
git checkout <commit-lama>
sudo systemctl restart lms
# catatan DB: migrasi TIDAK otomatis mundur — skema dibuat backward-compatible
# (tambah kolom baru, jangan hapus/ubah semantik) sesuai PRD §2.1 disiplin rilis.
```
