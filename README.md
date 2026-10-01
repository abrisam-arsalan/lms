# LMS SMP Negeri 5 Tegal

Inti belajar-mengajar: materi, tugas, **gradebook berbasis TP** (Tujuan Pembelajaran
diset guru, kode mengikuti app rapor kementerian), jadwal, pengumuman.
Ekspor Excel per jenjang siap copy-paste ke format import kementerian.

- **PRD**: lihat `PRD-LMS-SMP.md` di workspace (v1.3.1) — keputusan produk & anti-bentrok
- **Server/ops**: `docs/RUNBOOK.md` — pola sekolah: *developer push → GitHub, server tinggal pull*
- **Port**: 3005 · **DB**: MariaDB `smp_lms` · **Domain**: lms.smp5tegal.sch.id

## Development (laptop)

```bash
cp .env.example .env       # DATABASE_URL lokal/ssh-tunnel ke server utk dev db;
                           # atau skip: node --env-file=.env scripts/seed-demo.mjs
npm install                # postinstall: prisma generate (client + cbt-readonly + engine linux)
npx prisma migrate dev     # saat DATABASE_URL dev tersedia
npm run dev                # http://localhost:3000 (dev saja; produksi 3005)
```

## Rilis

```bash
bash scripts/deploy.sh     # build di laptop → branch `deploy` → push. Lalu di server: git pull + restart
```

## Struktur

```
src/app/          halaman & API route (Next.js App Router)
src/lib/          prisma singleton, auth sesi (cookie lms_session)
src/middleware.ts gerbang login kasar
prisma/           schema utama + cbt-readonly (bootstrap)
scripts/          deploy.sh, bootstrap.mjs (migrasi M0), seed-demo
scripts-server/   backup-lms.sh (cron 02:30 → sdb)
deploy/           lms.service, nginx vhost, ingress tunnel, db.sql
docs/             RUNBOOK.md
```

⚠️ Jangan pernah commit data PII siswa (file contoh nilai kementerian disimpan di luar repo).
