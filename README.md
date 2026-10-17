# Portal Panglima — SMPN 5 Tegal

Portal terpadu: LMS + Presensi + MPI dalam satu aplikasi Next.js.
Ujian (CBT) tetap terpisah di domain sendiri, sinkron via VIEW & API.

## Stack
- Next.js 15 (App Router, standalone output)
- Prisma 6 + MariaDB 11.8
- TypeScript, no Tailwind (CSS custom neo-brutalism sekolah)

## Setup lokal (dev)
```bash
npm install
cp .env.example .env   # isi DATABASE_URL, AUTH_SECRET, API_TOKEN
npx prisma migrate dev --name init
node scripts/reset-admin.mjs
npm run dev
```

## Deploy ke server (pull dari GitHub)
```bash
git pull
npm ci --omit=dev
npx prisma migrate deploy
npm run build
# restart systemd: sudo systemctl restart panglima
```

## Variabel ENV wajib
| Variabel | Keterangan |
|---|---|
| `DATABASE_URL` | `mysql://panglima_user:PASS@127.0.0.1:3306/panglima` |
| `AUTH_SECRET` | 64-char hex random |
| `API_TOKEN` | Token untuk push skor dari CBT |
| `CBT_HANDOFF_SECRET` | Shared secret handoff portal → CBT |
| `CBT_BASE_URL` | `https://ujian.smp5tegal.sch.id` |
| `PORT` | `3005` |
| `HOST` | `127.0.0.1` |
| `NODE_ENV` | `production` |
| `SCHOOL_NAME` | `SMP Negeri 5 Tegal` |
| `SCHOOL_ACADEMIC_YEAR` | `2026/2027` |
| `SCHOOL_SEMESTER_NUMBER` | `1` |

## Struktur modul
- `/login` — login semua peran
- `/dashboard` — ringkasan semua modul
- `/presensi` — sesi mengajar & absensi (guru)
- `/rekap-presensi` — rekap kehadiran (semua peran sesuai hak)
- `/materi` — materi per assignment
- `/tugas` — tugas + submission
- `/nilai` — gradebook TP
- `/tp` — kelola Tujuan Pembelajaran
- `/jadwal` — jadwal mingguan
- `/pengumuman` — pengumuman sekolah
- `/mpi` — game edukasi MPI
- `/ujian` — info ujian + tombol handoff ke CBT
- `/notifikasi` — notifikasi in-app
- `/admin/*` — kelola akun, rombel, master, import, jadwal admin
