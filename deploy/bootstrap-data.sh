#!/usr/bin/env bash
# ── BOOTSTRAP DATA: tarik Presensi (sekolah.db) + CBT (cbt_tka) ke smp_lms ──
# Sekali jalan SETELAH setup-server.sh. Idempoten — boleh diulang.
#   sudo bash /var/www/lms/deploy/bootstrap-data.sh
set -euo pipefail
APP=/var/www/lms
[ "$(id -u)" = 0 ] || { echo "jalankan dengan sudo"; exit 1; }
[ -f "$APP/.env" ] || { echo ".env belum ada — jalankan setup-server.sh dulu"; exit 1; }
[ -f /var/www/presensi/data/sekolah.db ] || { echo "sekolah.db presensi tidak ditemukan"; exit 1; }

echo "▶ grant SELECT sementara ke cbt_tka utk lms_user"
DB_PASS=$(grep -m1 '^CBT_DATABASE_URL' "$APP/.env" | sed -E 's#.*://[^:]+:([^@]+)@.*#\1#')
mysql -u lms_user -p"$DB_PASS" -e "SELECT 1" cbt_tka >/dev/null 2>&1 \
  || mysql -e "GRANT SELECT ON cbt_tka.* TO 'lms_user'@'localhost'; FLUSH PRIVILEGES;" \
  || { echo "gagal grant — jalankan manual sbg root: GRANT SELECT ON cbt_tka.* TO 'lms_user'@'localhost';"; exit 1; }

echo
echo "════ DRY-RUN (tidak menulis apa pun) ════"
sudo -u deploy node --env-file="$APP/.env" "$APP/scripts-server/bootstrap.mjs" --dry-run
echo
read -rp "Lanjut MENULIS ke smp_lms? [y/N] " ans
[ "${ans,,}" = "y" ] || { echo "dibatalkan."; exit 0; }

sudo -u deploy node --env-file="$APP/.env" "$APP/scripts-server/bootstrap.mjs"

echo "▶ cabut lagi akses cbt_tka"
mysql -e "REVOKE SELECT ON cbt_tka.* FROM 'lms_user'@'localhost'; FLUSH PRIVILEGES;" 2>/dev/null || true
echo "✔ Bootstrap selesai."
echo "  Login admin → username 'admin' dengan password Presensi-mu."
echo "  Lupa password? reset ke bawaan skrip:"
echo "    cd $APP && sudo -u deploy node --env-file=$APP/.env $APP/scripts-server/reset-admin.mjs"
