import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/app-shell";

const MODULES: { nama: string; href: string; desc: string; status: string; aktif?: boolean }[] = [
  { nama: "TP", href: "/tp", desc: "Atur Tujuan Pembelajaran per rombel", status: "M1 · AKTIF", aktif: true },
  { nama: "Materi", href: "/materi", desc: "Baca materi & unduh lampiran per rombel", status: "M1 · AKTIF", aktif: true },
  { nama: "Tugas", href: "/tugas", desc: "Kumpulkan tugas & lihat nilai", status: "M1 · AKTIF", aktif: true },
  { nama: "Nilai", href: "/nilai", desc: "Matriks ketercapaian TP & unduh Excel", status: "M2" },
  { nama: "Jadwal", href: "/jadwal", desc: "Jadwal hari ini & minggu ini", status: "M3" },
  { nama: "Pengumuman", href: "/pengumuman", desc: "Informasi sekolah", status: "M3" },
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
    <AppShell user={user} active="/dashboard">
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

      {user.role === "ADMIN" && (
        <div className="stat-grid">
          {counts.map((c) => (
            <div className="stat" key={c.role}>
              <span className="stat-icon">👤</span>
              <div>
                <div className="stat-value">{c._count._all}</div>
                <div className="stat-label">{c.role}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ margin: "4px 0 12px" }}>Modul pembelajaran</h2>
      <div className="grid">
        {MODULES.map((m) => (
          <a className="card" key={m.nama} href={m.href} style={{ display: "block", color: "inherit" }}>
            <div className="card-body">
              <h2 style={{ marginBottom: 4 }}>{m.nama}</h2>
              <p className="muted" style={{ marginBottom: 10 }}>{m.desc}</p>
              <span className={`badge ${m.aktif ? "badge-green" : "badge-neutral"}`}>{m.status}</span>
            </div>
          </a>
        ))}
      </div>
    </AppShell>
  );
}
