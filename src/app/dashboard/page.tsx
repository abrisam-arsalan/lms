import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./logout-button";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin / TU",
  GURU: "Guru",
  SISWA: "Siswa",
  ORTU: "Orang tua",
  KEPSEK: "Kepala sekolah",
};

const MODULES: { nama: string; desc: string; milestone: string; href?: string }[] = [
  { nama: "Materi", desc: "Baca materi & unduh lampiran per rombel", milestone: "M1" },
  { nama: "Tugas", desc: "Kumpulkan tugas & lihat nilai", milestone: "M1" },
  { nama: "TP & Nilai", desc: "Tujuan Pembelajaran & rekap nilai per mapel", milestone: "M2" },
  { nama: "Jadwal", desc: "Jadwal hari ini & minggu ini", milestone: "M3" },
  { nama: "Pengumuman", desc: "Informasi sekolah", milestone: "M3" },
];

export default async function DashboardPage() {
  const user = await requireUser();

  const [counts, assignments] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    user.role === "GURU"
      ? prisma.assignment.count({ where: { teacher: { userId: user.id } } })
      : Promise.resolve(0),
  ]);
  const totalUser = counts.reduce((s, c) => s + c._count._all, 0);
  const initials = user.nama.split(/[\s,.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <>
      <header className="topbar">
        <a className="brand" href="/dashboard">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-logo" src="/assets/logo.png" alt="Logo" />
          <span className="brand-text">LMS<small>SMPN 5 Tegal</small></span>
        </a>
        <div className="topbar-right">
          <span className="userchip">
            <span className="avatar">{initials}</span>
            <span className="user-meta"><b>{user.nama}</b><small>{ROLE_LABEL[user.role] ?? user.role}</small></span>
          </span>
          <LogoutButton />
        </div>
      </header>
      <main>
        <div className="page-head">
          <h1>Selamat datang, {user.nama.split(",")[0]} 👋</h1>
          {user.role === "ADMIN" && (
            <p>Total akun terdaftar: <strong>{totalUser}</strong>. <a href="/admin/users">Kelola akun →</a></p>
          )}
          {user.role === "GURU" && (
            <p>
              {assignments > 0
                ? `Kamu mengajar di ${assignments} rombel × mapel semester ini.`
                : "Belum ada penugasan rombel — tunggu import jadwal oleh admin."}
            </p>
          )}
        </div>

        <h2 style={{ margin: "4px 0 12px" }}>Modul pembelajaran</h2>
        <div className="grid">
          {MODULES.map((m) => (
            <div className="card" key={m.nama}>
              <div className="card-body">
                <h2 style={{ marginBottom: 4 }}>{m.nama}</h2>
                <p className="muted" style={{ marginBottom: 10 }}>{m.desc}</p>
                <span className="badge badge-neutral">{m.milestone} — segera</span>
              </div>
            </div>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 16 }}>
          Fondasi (login, data master, audit) sudah aktif — M0 selesai. 🎉
        </p>
      </main>
    </>
  );
}
