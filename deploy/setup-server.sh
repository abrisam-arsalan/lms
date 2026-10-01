#!/usr/bin/env bash
# ── SETUP AWAL SERVER UBUNTU — sekali jalan, idempoten (boleh diulang) ──
# Dari laptop Windows:  ssh kamu@server
#   sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/abrisam-arsalan/lms/deploy/deploy/setup-server.sh)"
#
# Melakukan: Node 22 → swap → user deploy → clone branch artefak → DB+user
# MariaDB (password acak, disimpan aman di /root/lms-kredensial.txt) → .env →
# prisma migrate → systemd → nginx vhost → cek /healthz.
# TIDAK termasuk: ingress cloudflared (§6 RUNBOOK — berbahaya bila salah, kerjakan manual).
set -euo pipefail

REPO_URL="https://github.com/abrisam-arsalan/lms.git"
APP=/var/www/lms
KRED=/root/lms-kredensial.txt
[ "$(id -u)" = 0 ] || { echo "jalankan dengan sudo"; exit 1; }

echo "▶ 1/8 Node.js ≥22"
if ! node --version 2>/dev/null | grep -qE 'v(2[2-9]|[3-9][0-9])'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node --version

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
# dipertahankan antar-run agar idempoten
if [ -f "$KRED" ]; then
  DB_PASS=$(sed -n 's/^LMS_DB_PASS=//p' "$KRED")
  AUTH_SECRET=$(sed -n 's/^AUTH_SECRET=//p' "$KRED")
else
  DB_PASS=$(openssl rand -hex 16)
  AUTH_SECRET=$(openssl rand -hex 32)
  umask 077
  cat > "$KRED" <<EOF
LMS_DB_PASS=$DB_PASS
AUTH_SECRET=$AUTH_SECRET
# simpan & pindahkan ke tempat aman, lalu pertimbangkan hapus file ini
EOF
  echo "   ✔ kredensial ditulis ke $KRED (root-only)"
fi
mysql <<SQL
CREATE DATABASE IF NOT EXISTS smp_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'lms_user'@'localhost' IDENTIFIED BY '$DB_PASS';
ALTER USER 'lms_user'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON smp_lms.* TO 'lms_user'@'localhost';
FLUSH PRIVILEGES;
SQL

echo "▶ 5/8 /var/www/lms/.env"
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

echo "▶ 6/8 Migrate skema"
if [ ! -x /opt/lms-tools/node_modules/.bin/prisma ]; then
  npm install --prefix /opt/lms-tools prisma@6.3.0 --no-audit --no-fund
fi
sudo -u deploy env PATH="/opt/lms-tools/node_modules/.bin:$PATH" \
  sh -c "cd $APP && prisma migrate deploy"

echo "▶ 7/8 systemd + nginx"
sed "s|ExecStart=.*|ExecStart=$(which node) --max-old-space-size=768 server.js|" \
  "$APP/deploy/lms.service" > /etc/systemd/system/lms.service
systemctl daemon-reload && systemctl enable --now lms && systemctl restart lms
if [ ! -e /etc/nginx/sites-enabled/lms.smp5tegal.sch.id ]; then
  cp "$APP/deploy/nginx-lms.conf" /etc/nginx/sites-available/lms.smp5tegal.sch.id
  ln -s /etc/nginx/sites-available/lms.smp5tegal.sch.id /etc/nginx/sites-enabled/
  nginx -t && systemctl reload nginx
fi

echo "▶ 8/8 Cek akhir"
sleep 3
curl -s -o /dev/null -w "  local  http://127.0.0.1:3005/healthz → %{http_code}\n" http://127.0.0.1:3005/healthz
curl -s -H "Host: lms.smp5tegal.sch.id" -o /dev/null -w "  vhost  nginx :80 → %{http_code}\n" http://127.0.0.1/healthz
echo
echo "✔ Setup server selesai (tanpa tunnel)."
echo "  Lanjut bootstrap data  : sudo bash $APP/deploy/bootstrap-data.sh"
echo "  Tunnel ingress (manual): RUNBOOK §6"
