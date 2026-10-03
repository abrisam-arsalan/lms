import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageAssignment, classAssignments, currentSemester, studentClassId, childrenOfClassIds, teacherAssignments } from "@/lib/academic";
import AppShell from "@/components/app-shell";
import DangerSubmit from "@/components/danger-submit";
import { DAYS } from "@/lib/notify";
import { addSchedule, deleteSchedule } from "./actions";

import type { Prisma } from "@prisma/client";

async function loadSchedules(assignmentWhere: Prisma.AssignmentWhereInput) {
  return prisma.schedule.findMany({
    where: { assignment: assignmentWhere },
    include: {
      assignment: {
        include: { subject: true, class: true, teacher: { include: { user: { select: { nama: true } } } } },
      },
    },
    orderBy: [{ day: "asc" }, { start: "asc" }],
  });
}

function WeekView({ rows, today }: { rows: Awaited<ReturnType<typeof loadSchedules>>; today: number }) {
  const byDay = new Map<number, typeof rows>();
  for (const r of rows) {
    const arr = byDay.get(r.day) ?? [];
    arr.push(r);
    byDay.set(r.day, arr);
  }
  const days = [...byDay.keys()].sort((a, b) => a - b).filter((d) => d >= 1); // skip Minggu kosong
  return (
    <>
      {days.map((d) => (
        <div className="card" key={d}>
          <div className="card-head">
            <h2>{DAYS[d]}</h2>
            {d === today && <span className="badge badge-green">HARI INI</span>}
          </div>
          <div className="card-body">
            {byDay.get(d)!.map((s) => (
              <div className="list-row" key={String(s.id)} style={{ marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <b>{s.assignment.subject.name}</b>{" "}
                  <span className="muted">{s.start}–{s.end}{s.room ? ` · ${s.room}` : ""}</span>
                  <div className="meta">{s.assignment.class.name} · {s.assignment.teacher?.nama ?? "—"}</div>
                </div>
                {s.day === today && (
                  <span className="badge badge-yellow">{new Date().toTimeString().slice(0, 5) >= s.start ? "berlangsung/selesai" : "akan datang"}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {!days.length && <div className="empty">Belum ada jadwal untuk penugasan ini.</div>}
    </>
  );
}

export default async function JadwalPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string }>;
}) {
  const user = await requireUser();
  const { a } = await searchParams;
  const ctx = await currentSemester();
  const semesterId = ctx?.semester.id;
  const today = new Date().getDay();

  /* ── admin/kepsek/guru: mode kelola per assignment (admin = CRUD) ── */
  if (a) {
    const assignmentId = BigInt(a);
    const canEdit = await canManageAssignment(user, assignmentId) && user.role === "ADMIN";
    if (user.role === "GURU") {
      // guru boleh buka miliknya sendiri (lihat)
      const own = await prisma.assignment.findFirst({ where: { id: assignmentId, teacher: { userId: user.id } }, select: { id: true } });
      if (!own) redirect("/jadwal");
    } else if (user.role === "ADMIN" || user.role === "KEPSEK") {
      /* boleh */
    } else redirect("/jadwal");

    const rows = await loadSchedules({ id: assignmentId });
    const asg = rows[0]?.assignment;
    return (
      <AppShell user={user} active="/jadwal">
        <div className="page-head">
          <h1>Jadwal{asg ? ` — ${asg.class.name} · ${asg.subject.name}` : ""}</h1>
          {user.role === "ADMIN" && <p>Mode kelola — tambah/hapus baris jadwal rombel ini.</p>}
        </div>

        {user.role === "ADMIN" && (
          <div className="card">
            <div className="card-head"><h2>➕ Tambah jam</h2></div>
            <div className="card-body">
              <form action={addSchedule} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}>
                <input type="hidden" name="assignmentId" value={a} />
                <div className="field" style={{ margin: 0, width: 130 }}>
                  <label className="field-label">Hari</label>
                  <select className="input" name="day" defaultValue={String(today)}>
                    {[1, 2, 3, 4, 5, 6].map((d) => <option key={d} value={d}>{DAYS[d]}</option>)}
                  </select>
                </div>
                <div className="field" style={{ margin: 0, width: 110 }}>
                  <label className="field-label">Mulai</label>
                  <input className="input" type="time" name="start" required defaultValue="07:30" />
                </div>
                <div className="field" style={{ margin: 0, width: 110 }}>
                  <label className="field-label">Selesai</label>
                  <input className="input" type="time" name="end" required defaultValue="09:00" />
                </div>
                <div className="field" style={{ margin: 0, width: 120 }}>
                  <label className="field-label">Ruang</label>
                  <input className="input" name="room" placeholder="mis. Lab 1" />
                </div>
                <button className="btn btn-sm btn-primary">Tambah</button>
              </form>
            </div>
          </div>
        )}

        <WeekView rows={rows} today={today} />
        {user.role === "ADMIN" && rows.length > 0 && (
          <div className="card">
            <div className="card-head"><h2>Hapus baris</h2></div>
            <div className="card-body">
              {rows.map((s) => (
                <div key={String(s.id)} className="row-actions" style={{ marginBottom: 6 }}>
                  <span className="pill">{DAYS[s.day]} {s.start}–{s.end}</span>
                  <DangerSubmit action={deleteSchedule} hidden={{ id: String(s.id), assignmentId: a }} confirmText="Hapus baris jadwal ini?">✕ hapus</DangerSubmit>
                </div>
              ))}
            </div>
          </div>
        )}
      </AppShell>
    );
  }

  /* ── siswa / ortu: jadwal kelasnya ── */
  if (user.role === "SISWA" || user.role === "ORTU") {
    let siswaUserId = user.id;
    if (user.role === "ORTU") {
      const anak = await prisma.linkParentStudent.findFirst({
        where: { parentId: user.id },
        include: { studentRec: { include: { user: { select: { id: true } } } } },
      });
      if (!anak) return <AppShell user={user} active="/jadwal"><div className="empty">Belum ada anak terhubung.</div></AppShell>;
      siswaUserId = anak.studentRec.user.id;
    }
    const clsId = await studentClassId(siswaUserId);
    const assigns = clsId ? await classAssignments([clsId], semesterId) : [];
    const rows = await loadSchedules({ id: { in: assigns.map((x) => x.id) } });
    return (
      <AppShell user={user} active="/jadwal">
        <div className="page-head"><h1>Jadwal 🗓️</h1><p>{clsId ? "Jadwal mingguan kelasmu." : "Kelas belum ditautkan — hubungi admin."}</p></div>
        <WeekView rows={rows} today={today} />
      </AppShell>
    );
  }

  /* ── guru: jadwal mengajarnya ── */
  if (user.role === "GURU") {
    const my = await teacherAssignments(user.id, semesterId);
    const rows = await loadSchedules({ id: { in: my.map((x) => x.id) } });
    return (
      <AppShell user={user} active="/jadwal">
        <div className="page-head"><h1>Jadwal Mengajar 🗓️</h1><p>{my.length} rombel × mapel semester ini.</p></div>
        <WeekView rows={rows} today={today} />
      </AppShell>
    );
  }

  /* ── admin / kepsek: pilih rombel ── */
  const classes = await prisma.class.findMany({
    where: { ...(semesterId ? { academicYearId: (await currentSemester())!.year.id } : {}) },
    orderBy: { name: "asc" },
    include: { assignments: { include: { subject: true, teacher: { include: { user: { select: { nama: true } } } } } } },
  });
  return (
    <AppShell user={user} active="/jadwal">
      <div className="page-head">
        <h1>Jadwal 🗓️</h1>
        <p>{user.role === "ADMIN" ? "Kelola" : "Lihat"} jadwal per rombel × mapel.</p>
      </div>
      {classes.map((c) => (
        <div className="card" key={String(c.id)}>
          <div className="card-head"><h2>{c.name}</h2><span className="pill">{c.assignments.length} mapel</span></div>
          <div className="card-body" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {c.assignments.map((x) => (
              <a key={String(x.id)} className="filechip" href={`/jadwal?a=${x.id}`}>
                {x.subject.name} <small className="muted">· {x.teacher?.nama?.split(",")[0] ?? "—"}</small>
              </a>
            ))}
            {!c.assignments.length && <span className="muted">belum ada penugasan</span>}
          </div>
        </div>
      ))}
      {!classes.length && <div className="empty">Belum ada rombel tahun ajaran aktif.</div>}
    </AppShell>
  );
}
