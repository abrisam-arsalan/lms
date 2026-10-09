import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentSemester } from "@/lib/academic";
import AppShell from "@/components/app-shell";
import DangerSubmit from "@/components/danger-submit";
import { createAssignment, deleteAssignment, setHomeroom, addSubject, addClass } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminMasterPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const me = await requireRole(["ADMIN"]);
  const { err } = await searchParams;
  const ctx = await currentSemester();

  const [assignments, teachers, subjects, classes] = await Promise.all([
    ctx
      ? prisma.assignment.findMany({
          where: { semesterId: ctx.semester.id },
          include: {
            subject: true,
            class: true,
            teacher: { include: { user: { select: { id: true, nama: true } } } },
            _count: { select: { learningTargets: true, materials: true, tasks: true } },
          },
          orderBy: [{ class: { name: "asc" } }, { subject: { name: "asc" } }],
        })
      : Promise.resolve([]),
    prisma.teacher.findMany({
      where: { user: { isActive: true, deletedAt: null } },
      include: { user: { select: { id: true, nama: true } } },
      orderBy: { nama: "asc" },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    ctx
      ? prisma.class.findMany({
          where: { academicYearId: ctx.year.id },
          orderBy: { name: "asc" },
          include: { homeroomTeacher: { select: { id: true, nama: true } } },
        })
      : Promise.resolve([]),
  ]);

  return (
    <AppShell user={me} active="/admin/master">
      <div className="page-head">
        <h1>Master &amp; Assignmen 🗂</h1>
        <p>
          <a href="/admin/users">👥 Akun</a> · <a href="/admin/import">📥 Import CSV</a>
          {ctx ? ` · aktif: ${ctx.year.name} / ${ctx.semester.name}` : " · ⚠ tahun/semester aktif belum ada"}
        </p>
        {err && <p className="error">{decodeURIComponent(err)}</p>}
      </div>

      {ctx && (
        <div className="card">
          <div className="card-head"><h2>➕ Assignment guru × mapel × rombel</h2></div>
          <div className="card-body">
            <form action={createAssignment} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}>
              <div className="field" style={{ margin: 0, minWidth: 220 }}>
                <label className="field-label">Guru</label>
                <select className="input" name="teacherUserId" required defaultValue="">
                  <option value="" disabled>— pilih guru —</option>
                  {teachers.map((t) => <option key={String(t.id)} value={String(t.user.id)}>{t.nama}</option>)}
                </select>
              </div>
              <div className="field" style={{ margin: 0, minWidth: 160 }}>
                <label className="field-label">Mapel</label>
                <select className="input" name="subjectId" required defaultValue="">
                  <option value="" disabled>— mapel —</option>
                  {subjects.map((s) => <option key={String(s.id)} value={String(s.id)}>{s.name}</option>)}
                </select>
              </div>
              <div className="field" style={{ margin: 0, minWidth: 110 }}>
                <label className="field-label">Rombel</label>
                <select className="input" name="classId" required defaultValue="">
                  <option value="" disabled>— rombel —</option>
                  {classes.map((k) => <option key={String(k.id)} value={String(k.id)}>{k.name}</option>)}
                </select>
              </div>
              <button className="btn btn-sm btn-primary">Tugaskan</button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-head"><h2>Assignment aktif ({assignments.length})</h2></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Rombel</th><th>Mapel</th><th>Guru</th><th>TP · Materi · Tugas</th><th></th></tr></thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={String(a.id)}>
                  <td><b>{a.class.name}</b></td>
                  <td>{a.subject.name}</td>
                  <td>{a.teacher?.user.nama ?? "—"}</td>
                  <td className="muted">{a._count.learningTargets} · {a._count.materials} · {a._count.tasks}</td>
                  <td>
                    <a className="pill" href={`/nilai?a=${a.id}`}>nilai</a>{" "}
                    <a className="pill" href={`/tp/${a.id}`}>TP</a>{" "}
                    <DangerSubmit
                      action={deleteAssignment}
                      hidden={{ id: String(a.id) }}
                      confirmText={`Hapus assignment ${a.class.name}·${a.subject.name}?`}
                      btnClass="btn btn-sm"
                    >✕</DangerSubmit>
                  </td>
                </tr>
              ))}
              {!assignments.length && <tr><td colSpan={5}><div className="empty">Belum ada assignment semester ini.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {ctx && (
        <div className="card">
          <div className="card-head"><h2>Wali kelas</h2></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Rombel</th><th>Wali saat ini</th><th>Ganti</th></tr></thead>
              <tbody>
                {classes.map((k) => (
                  <tr key={String(k.id)}>
                    <td><b>{k.name}</b></td>
                    <td>{k.homeroomTeacher?.nama ?? "—"}</td>
                    <td>
                      <form action={setHomeroom} style={{ display: "flex", gap: 6 }}>
                        <input type="hidden" name="classId" value={String(k.id)} />
                        <select className="input" style={{ minHeight: 34, width: 220 }} name="homeroomUserId" defaultValue="">
                          <option value="">— kosongkan —</option>
                          {teachers.map((t) => <option key={String(t.id)} value={String(t.user.id)}>{t.nama}</option>)}
                        </select>
                        <button className="btn btn-sm">set</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid">
        <div className="card">
          <div className="card-head"><h2>➕ Mapel baru</h2></div>
          <div className="card-body">
            <form action={addSubject} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input className="input" style={{ width: 180 }} name="name" placeholder="Informatika" required />
              <input className="input" style={{ width: 90 }} name="code" placeholder="INF" />
              <button className="btn btn-sm btn-primary">Tambah</button>
            </form>
            <p className="muted" style={{ marginTop: 8 }}>{subjects.map((s) => s.name).join(", ")}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h2>➕ Rombel baru</h2></div>
          <div className="card-body">
            <form action={addClass} style={{ display: "flex", gap: 8 }}>
              <input className="input" style={{ width: 120 }} name="name" placeholder="7D" required pattern="[0-9][A-Za-z]" />
              <button className="btn btn-sm btn-primary">Tambah</button>
            </form>
            <p className="muted" style={{ marginTop: 8 }}>Tahun aktif: {ctx?.year.name ?? "—"} · {classes.length} rombel</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
