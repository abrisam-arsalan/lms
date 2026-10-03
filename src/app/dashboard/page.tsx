import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentSemester, classAssignments, studentClassId, childrenOfClassIds, teacherAssignments } from "@/lib/academic";
import { DAYS } from "@/lib/notify";
import AppShell from "@/components/app-shell";

const MODULES: { nama: string; href: string; desc: string; status: string; aktif?: boolean }[] = [
  { nama: "TP", href: "/tp", desc: "Atur Tujuan Pembelajaran per rombel", status: "M1 · AKTIF", aktif: true },
  { nama: "Materi", href: "/materi", desc: "Baca materi & unduh lampiran per rombel", status: "M1 · AKTIF", aktif: true },
  { nama: "Tugas", href: "/tugas", desc: "Kumpulkan tugas & lihat nilai", status: "M1 · AKTIF", aktif: true },
  { nama: "Nilai", href: "/nilai", desc: "Matriks ketercapaian TP & unduh Excel", status: "M2 · AKTIF", aktif: true },
  { nama: "Jadwal", href: "/jadwal", desc: "Jadwal hari ini & minggu ini", status: "M3 · AKTIF", aktif: true },
  { nama: "Pengumuman", href: "/pengumuman", desc: "Informasi sekolah", status: "M3 · AKTIF", aktif: true },
];

export default async function DashboardPage() {
  const user = await requireUser();
  const ctx = await currentSemester();
  const today = new Date().getDay();

  // jadwal hari ini utk pembaca (siswa/ortu/guru)
  let dayRows: { id: bigint; start: string; end: string; room: string | null; subject: string; className: string; teacherName: string | null }[] = [];
  let latestAnnouncements: { id: bigint; judul: string; createdAt: Date; target: string; className: string | null }[] = [];
  try {
    let classIds: bigint[] = [];
    let assignIds: bigint[] | null = null; // null = semua sesuai kelas; utk guru: id miliknya
    if (user.role === "SISWA") { const c = await studentClassId(user.id); classIds = c ? [c] : []; }
    else if (user.role === "ORTU") classIds = await childrenOfClassIds(user.id);
    else if (user.role === "GURU") {
      const my = await teacherAssignments(user.id, ctx?.semester.id);
      assignIds = my.map((m) => m.id);
      classIds = [];
    }
    let ids = assignIds ?? [];
    if (assignIds === null) {
      const asgs = await classAssignments(classIds, ctx?.semester.id);
      ids = asgs.map((x) => x.id);
    }
    if (ids.length) {
      const sched = await prisma.schedule.findMany({
        where: { day: today, assignmentId: { in: ids } },
        include: { assignment: { include: { subject: true, class: true, teacher: { include: { user: { select: { nama: true } } } } } } },
        orderBy: { start: "asc" },
      });
      dayRows = sched.map((s) => ({
        id: s.id, start: s.start, end: s.end, room: s.room,
        subject: s.assignment.subject.name, className: s.assignment.class.name,
        teacherName: s.assignment.teacher?.user.nama ?? null,
      }));
    }
    const anns = await prisma.announcement.findMany({
      where: {
        deletedAt: null,
        ...(user.role === "SISWA" || user.role === "ORTU"
          ? { OR: [{ target: "SEMUA" }, ...(classIds.length ? [{ classId: { in: classIds } }] : [])] }
          : { target: "SEMUA" }),
      },
      include: { class: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 2,
    });
    latestAnnouncements = anns.map((p) => ({ id: p.id, judul: p.judul, createdAt: p.createdAt, target: p.target, className: p.class?.name ?? null }));
  } catch { /* dashboard tetap jalan walau query jadwal gagal */ }

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

      {dayRows.length > 0 && (
        <div className="card">
          <div className="card-head">
            <h2>Jadwal hari ini ({DAYS[today]})</h2>
            <a className="pill" href="/jadwal">seminggu →</a>
          </div>
          <div className="card-body">
            {dayRows.map((s) => (
              <div className="list-row" key={String(s.id)} style={{ marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <b>{s.subject}</b> <span className="muted">{s.start}–{s.end}{s.room ? ` · ${s.room}` : ""}</span>
                  <div className="meta">{s.className}{user.role !== "SISWA" && user.role !== "ORTU" ? "" : ""} · {s.teacherName ?? "—"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {latestAnnouncements.length > 0 && (
        <div className="card">
          <div className="card-head"><h2>Pengumuman terbaru</h2><a className="pill" href="/pengumuman">semua →</a></div>
          <div className="card-body">
            {latestAnnouncements.map((p) => (
              <div className="muted" key={String(p.id)} style={{ marginBottom: 6 }}>
                📢 <a href="/pengumuman"><b>{p.judul}</b></a>{" "}
                <span style={{ fontSize: 12 }}>· {p.target === "SEMUA" ? "seluruh sekolah" : p.className ?? ""} · {new Date(p.createdAt).toLocaleDateString("id-ID")}</span>
              </div>
            ))}
          </div>
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
