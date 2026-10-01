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

  return (
    <>
      <div className="topbar">
        <strong>LMS SMPN 5 Tegal</strong>
        <span className="spacer" />
        <span>{user.nama}</span>
        <span className="pill">{ROLE_LABEL[user.role] ?? user.role}</span>
        <LogoutButton />
      </div>
      <main>
        <div className="card">
          <h2 style={{ fontSize: "1.05rem", marginBottom: 6 }}>Selamat datang, {user.nama} 👋</h2>
          {user.role === "ADMIN" && (
            <p className="muted">
              Total akun terdaftar: <strong>{totalUser}</strong>.{" "}
              <a href="/admin/users">Kelola akun →</a>
            </p>
          )}
          {user.role === "GURU" && (
            <p className="muted">
              {assignments > 0
                ? `Kamu mengajar di ${assignments} rombel × mapel semester ini.`
                : "Belum ada penugasan rombel — tunggu import jadwal oleh admin (M3) atau minta admin menambah assignmen."}
            </p>
          )}
        </div>

        <h3 style={{ fontSize: "0.95rem", margin: "8px 0" }}>Modul pembelajaran</h3>
        <div className="grid">
          {MODULES.map((m) => (
            <div className="card" key={m.nama} style={{ marginBottom: 0 }}>
              <strong>{m.nama}</strong>
              <p className="muted">{m.desc}</p>
              <span className="pill">{m.milestone} — segera</span>
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
