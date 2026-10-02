#!/usr/bin/env bash
# ── DEPLOY: build di LAPTOP → commit artefak ke branch `deploy` → push ──
# Aturan sekolah: hasil push ke GitHub, server tinggal `git pull` (TANPA CI).
# Jalankan dari git-bash di folder repo (laptop developer Windows/WSL/Linux).
#
# Server afterwards:
#   cd /var/www/lms && sudo -u deploy git pull && sudo systemctl restart lms
# (bila ada migrasi baru: bash /var/www/lms/scripts-server/migrate.sh — lihat RUNBOOK §4)
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=$(git rev-parse --short HEAD)
STAMP=$(date +%Y%m%d-%H%M%S)

echo "▶ 1/5 install & build (binaryTargets linux ikut ter-generate via postinstall)"
# SKIP_INSTALL=1 lewati npm ci (node_modules masih sehat) — hemat ~2-3 menit
[ "${SKIP_INSTALL:-0}" = "1" ] || npm ci --no-audit --no-fund
[ "${SKIP_BUILD:-0}" = "1" ] || npm run build

# Next standalone bisa menaruh output di root ATAU di subfolder nama proyek
if [ -f .next/standalone/server.js ]; then SA=.next/standalone; else SA=.next/standalone/lms; fi
[ -f "$SA/server.js" ] || { echo "!! server.js tidak ditemukan di standalone"; exit 1; }
echo "▶ standalone root: $SA"

WT=../.lms-deploy-wt
echo "▶ 2/5 menyiapkan worktree branch deploy di $WT"
git worktree remove --force "$WT" 2>/dev/null || true
git worktree prune
git show-ref --verify --quiet refs/heads/deploy || git branch deploy HEAD
git worktree add --force "$WT" deploy
git -C "$WT" reset --hard HEAD
git -C "$WT" config core.autocrlf false

echo "▶ 3/5 menyalin artefak"
find "$WT" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -r "$SA"/. "$WT"/
mkdir -p "$WT/.next"
cp -r .next/static "$WT/.next/static"
[ -d public ] && cp -r public "$WT/public" || true
cp -r prisma "$WT/prisma"
mkdir -p "$WT/src/generated" "$WT/scripts-server" "$WT/deploy"
cp -r src/generated/cbt-client "$WT/src/generated/cbt-client"
cp scripts/bootstrap.mjs "$WT/scripts-server/bootstrap.mjs"
cp scripts-server/backup-lms.sh "$WT/scripts-server/backup-lms.sh"
cp deploy/lms.service deploy/nginx-lms.conf deploy/db.sql "$WT/deploy/" 2>/dev/null || true
cp deploy/setup-server.sh deploy/bootstrap-data.sh "$WT/deploy/" 2>/dev/null || true
chmod +x "$WT"/deploy/*.sh 2>/dev/null || true
cp .env.example "$WT/.env.example"
[ -f docs/RUNBOOK.md ] && { mkdir -p "$WT/docs"; cp docs/RUNBOOK.md "$WT/docs/"; } || true

# engine Prisma utk Linux HARUS ikut (runtime server = debian)
if ! find "$WT/node_modules" -name 'libquery_engine-debian-openssl-3.0.x.so.node' -print -quit | grep -q .; then
  echo "!! Engine debian tidak ada di standalone — jalankan 'npx prisma generate' lalu ulangi"
  exit 1
fi

# .gitattributes: cegah git merapikan byte file engine (.so/.node)
echo '* -text' > "$WT/.gitattributes"

echo "▶ 4/5 commit"
git -C "$WT" add -A
git -C "$WT" commit -q -m "deploy artefak $STAMP (main@$SRC)"

echo "▶ 5/5 push branch deploy"
git -C "$WT" push origin deploy
git worktree remove --force "$WT"

cat <<EOF
✔ Selesai — artefak ter-push ke branch 'deploy'.

DI SERVER (operator):
  cd /var/www/lms && sudo -u deploy git pull
  # bila muncul migrasi baru:  node scripts-server/migrate-helper? → lihat RUNBOOK §4
  sudo systemctl restart lms
EOF
