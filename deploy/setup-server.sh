#!/usr/bin/env bash
# ── SETUP AWAL SERVER UBUNTU — sekali jalan, idempoten (boleh diulang) ──
#   sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/abrisam-arsalan/lms/deploy/deploy/setup-server.sh)"
#
# Node dipasang dari TARBALL resmi nodejs.org ke /usr/local (bukan apt):
# kebal terhadap repo/PPA lain yang rusak di server (kasus: ondrej PPA 404
# memblokir `apt update`, nodesource lama mengunci v20 tanpa node:sqlite).
# Melakukan: Node ≥24 → swap → user deploy → clone artefak → DB+user MariaDB →
# .env → prisma migrate → systemd → nginx → cek /healthz.
# TIDAK termasuk cloudflared ingress (§6 RUNBOOK — tetap manual).
set -euo pipefail

REPO_URL="https://github.com/abrisam-arsalan/lms.git"
APP=/var/www/lms
KRED=/root/lms-kredensial.txt
NEED_MAJOR=24
[ "$(id -u)" = 0 ] || { echo "jalankan dengan sudo"; exit 1; }

echo "▶ 1/8 Node.js — cek fitur node:sqlite, pasang tarball bila kurang"
sqlite_ok() { node -e 'import("node:sqlite").then(()=>{}).catch(()=>{process.exit(1)})' 2>/dev/null; }
if ! sqlite_ok; then
  case $(uname -m) in x86_64) ARCH=x64;; aarch64) ARCH=arm64;; *) ARCH=x64;; esac
  FILE=$(curl -fsSL "https://nodejs.org/dist/latest-v${NEED_MAJOR}.x/" | grep -oE "node-v[0-9.]+-linux-${ARCH}\.tar\.xz" | head -1)
  [ -n "$FILE" ] || { echo "gagal deteksi berkas Node ${NEED_MAJOR}.x linux-${ARCH}"; exit 1; }
  curl -fsSL -o /tmp/$FILE "https://nodejs.org/dist/latest-v${NEED_MAJOR}.x/$FILE"
  # verifikasi checksum resmi
  EXPECT=$(curl -fsSL "https://nodejs.org/dist/latest-v${NEED_MAJOR}.x/SHASUMS256.txt" | grep " $FILE\$" | cut -d' ' -f1)
  echo "$EXPECT  /tmp/$FILE" | sha256sum -c -
  mkdir -p /usr/local/lib/nodejs
  tar -xJf /tmp/$FILE -C /usr/local/lib/nodejs
  BASE="${FILE%.tar.xz}"
  ln -sfn "/usr/local/lib/nodejs/$BASE/bin/node" /usr/local/bin/node
  ln -sfn "/usr/local/lib/nodejs/$BASE/bin/npm"  /usr/local/bin/npm
  ln -sfn "/usr/local/lib/nodejs/$BASE/bin/npx"  /usr/local/bin/npx
  rm -f /tmp/$FILE
  hash -r 2>/dev/null || true
fi
sqlite_ok || { echo "node:sqlite tetap tidak tersedia — periksa manual"; exit 1; }
NODE_BIN=$(command -v node)
echo "   node: $($NODE_BIN --version) di $NODE_BIN"

echo "▶ 2/8 Swap 2 GB"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
free -h | sed -n '1,3p'

echo "▶ 3/8 User & kode (branch artefak 'deploy')"
id -u deploy &>/dev/null || useradd -r -m -d "$APP" -s /usr/sbin/nologin deploy
if [ -d "$APP/.git" ]; then
  sudo -u deploy git -C "$APP" fetch origin deploy && sudo -u deploy git -C "$APP" reset --hard origin/deploy
else
  rm -rf "$APP"; git clone -b deploy --depth 1 "$REPO_URL" "$APP"
fi
find "$APP" -name "*.so.node" -exec chmod +x {} +
mkdir -p "$APP/storage/uploads"
chown -R deploy:deploy "$APP"

echo "▶ 4/8 Kredensial & database"
if [ -f "$KRED" ]; then
  DB_PASS=$(sed -n 's/^LMS_DB_PASS=//p' "$KRED")
  AUTH_SECRET=$(sed -n 's/^AUTH_SECRET=//p' "$KRED")
else
  DB_PASS=$(openssl rand -hex 16)
  AUTH_SECRET=$(openssl rand -hex 32)
  umask 077
  printf 'LMS_DB_PASS=%s\nAUTH_SECRET=%s\n' "$DB_PASS" "$AUTH_SECRET" > "$KRED"
  echo "   ✔ kredensial ditulis ke $KRED (root-only) — salin ke pengelola password"
fi
mysql <<SQL
CREATE DATABASE IF NOT EXISTS smp_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'lms_user'@'localhost' IDENTIFIED BY '$DB_PASS';
ALTER USER 'lms_user'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON smp_lms.* TO 'lms_user'@'localhost';
FLUSH PRIVILEGES;
SQL

echo "▶ 5/8 $APP/.env"
cat > "$APP/.env" <<EOF
DATABASE_URL="mysql://lms_user:$DB_PASS@127.0.0.1:3306/smp_lms"
PORT=3005
HOST=127.0.0.1
NODE_ENV=production
AUTH_SECRET="$AUTH_SECRET"
BOOTSTRAP_SQLITE_PATH="/var/www/presensi/data/sekolah.db"
CBT_DATABASE_URL="mysql://lms_user:$DB_PASS@127.0.0.1:3306/cbt_tka"
SCHOOL_NAME="SMP Negeri 5 Tegal"
SCHOOL_ACADEMIC_YEAR="2026/2027"
SCHOOL_SEMESTER_NUMBER=1
EOF
chown deploy:deploy "$APP/.env" && chmod 600 "$APP/.env"

echo "▶ 6/8 Migrate skema (prisma CLI root, PATH terpisah dari app)"
if [ ! -d /opt/lms-tools/node_modules/prisma ]; then
  npm install --prefix /opt/lms-tools prisma@6.3.0 --no-audit --no-fund
  chmod -R a+rX /opt/lms-tools
fi
cd "$APP"
set -a; . "$APP/.env"; set +a
$NODE_BIN /opt/lms-tools/node_modules/prisma/build/index.js migrate deploy

echo "▶ 7/8 systemd + nginx"
sed "s|ExecStart=.*|ExecStart=$NODE_BIN --max-old-space-size=768 server.js|" \
  "$APP/deploy/lms.service" > /etc/systemd/system/lms.service
systemctl daemon-reload && systemctl enable --now lms && systemctl restart lms
if [ ! -e /etc/nginx/sites-enabled/lms.smp5tegal.sch.id ]; then
  cp "$APP/deploy/nginx-lms.conf" /etc/nginx/sites-available/lms.smp5tegal.sch.id
  ln -s /etc/nginx/sites-available/lms.smp5tegal.sch.id /etc/nginx/sites-enabled/
  nginx -t && systemctl reload nginx
fi

echo "▶ 8/8 Cek akhir"
sleep 3
curl -s -o /dev/null -w "  local  :3005/healthz → %{http_code}\n" http://127.0.0.1:3005/healthz
curl -s -H "Host: lms.smp5tegal.sch.id" -o /dev/null -w "  nginx  :80/healthz    → %{http_code}\n" http://127.0.0.1/healthz
echo
echo "✔ Setup server selesai (tanpa tunnel)."
echo "  Bootstrap data lama    : sudo bash $APP/deploy/bootstrap-data.sh"
echo "  Tunnel ingress (manual): RUNBOOK §6 — jangan lupa route dns lms.smp5tegal.sch.id"
