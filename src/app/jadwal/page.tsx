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
        include: { subject: true, class: true, teacher: { select: { nama: true } } },
      },
    },
    orderBy: [{ day: "asc" }, { startTime: "asc" }],
  });
}

function WeekView({ rows, today }: { rows: Awaited<ReturnType<typeof loadSchedules>>; today: number }) {
  const byDay = new Map<number, typeof rows>();
  for (const r of rows) {
    const arr = byDay.get(r.day) ?? [];
    arr.push(r);
    byDay.set(r.day, arr);
  }
  const days = [...byDay.keys()].sort((a, b) => a - b).filter((d) => d >= 1);
  const nowStr = new Date().toTimeString().slice(0, 5);

  return (
    <>
      {days.map((d) => (
        <div className="card" key={d}>
          <div className="card-head">
            <h2>{DAYS[d]}</h2>
            {d === today && <span className="badge badge-green">HARI INI</span>}
          </div>
          <div className="card-body">
            {byDay.get(d)!.map((s) => {
              const isToday = s.day === today;
              const isOngoing = isToday && nowStr >= s.startTime && nowStr <= s.endTime;
              const isPast = isToday && nowStr > s.endTime;
              return (
                <div className="list-row" key={String(s.id)} style={{ marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                      <b style={{ fontSize: 16 }}>{s.assignment.subject.name}</b>
                      <span className="badge badge-yellow">⏰ {s.startTime} – {s.endTime}</span>
                      {s.room && <span className="pill">Ruang: {s.room}</span>}
                      {isToday && (
                        isOngoing ? (
                          <span className="badge badge-green">SEDANG BERLANGSUNG</span>
                        ) : isPast ? (
                          <span className="badge badge-neutral">SELESAI</span>
                        ) : (
                          <span className="badge badge-yellow">AKAN DATANG</span>
                        )
                      )}
                    </div>
                    <div className="meta">
                      Kelas {s.assignment.class.name} · Guru Pengampu: {s.assignment.teacher?.nama ?? "—"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {!days.length && <div className="empty">Belum ada jadwal pelajaran untuk penugasan ini.</div>}
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

  if (a) {
    const assignmentId = BigInt(a);
    if (user.role === "GURU") {
      const own = await prisma.assignment.findFirst({ where: { id: assignmentId, teacherId: user.id }, select: { id: true } });
      if (!own) redirect("/jadwal");
    } else if (user.role !== "ADMIN" && user.role !== "KEPSEK") {
      redirect("/jadwal");
    }

    const rows = await loadSchedules({ id: assignmentId });
    const asg = rows[0]?.assignment;
    return (
      <AppShell user={user} active="/jadwal">
        <div className="breadcrumb">
          <a href="/dashboard">Beranda</a>
          <span className="sep">&gt;</span>
          <a href="/jadwal">Jadwal</a>
          <span className="sep">&gt;</span>
          <span className="current">{asg ? `${asg.class.name} · ${asg.subject.name}` : "Rombel"}</span>
        </div>
        <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1>Jadwal Pelajaran{asg ? ` — ${asg.class.name} · ${asg.subject.name}` : ""}</h1>
            {user.role === "ADMIN" ? (
              <p className="muted">Mode kelola — tambah atau hapus slot jam pelajaran untuk rombel ini.</p>
            ) : (
              <p className="muted">Jadwal tatap muka mingguan untuk mata pelajaran ini.</p>
            )}
          </div>
          <a className="btn btn-sm" href="/jadwal">← Kembali ke Jadwal</a>
        </div>

        {user.role === "ADMIN" && (
          <div className="card">
            <div className="card-head"><h2>➕ Tambah Jam Pelajaran</h2></div>
            <div className="card-body">
              <form action={addSchedule} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
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
                <div className="field" style={{ margin: 0, width: 130 }}>
                  <label className="field-label">Ruang Kelas</label>
                  <input className="input" name="room" placeholder="mis. Lab 1" />
                </div>
                <button className="btn btn-primary" type="submit">+ Tambah Jam</button>
              </form>
            </div>
          </div>
        )}

        <WeekView rows={rows} today={today} />
        {user.role === "ADMIN" && rows.length > 0 && (
          <div className="card">
            <div className="card-head"><h2>Hapus Baris Jadwal</h2></div>
            <div className="card-body">
              {rows.map((s) => (
                <div key={String(s.id)} className="row-actions" style={{ marginBottom: 8 }}>
                  <span className="pill">{DAYS[s.day]} : {s.startTime} – {s.endTime}</span>
                  <DangerSubmit action={deleteSchedule} hidden={{ id: String(s.id), assignmentId: a }} confirmText="Hapus baris jadwal ini?">✕ Hapus</DangerSubmit>
                </div>
              ))}
            </div>
          </div>
        )}
      </AppShell>
    );
  }

  if (user.role === "SISWA" || user.role === "ORTU") {
    let siswaUserId = user.id;
    if (user.role === "ORTU") {
      const anak = await prisma.parentLink.findFirst({
        where: { parentId: user.id },
        select: { childId: true },
      });
      if (!anak) return <AppShell user={user} active="/jadwal"><div className="empty">Belum ada anak terhubung.</div></AppShell>;
      siswaUserId = anak.childId;
    }
    const clsId = await studentClassId(siswaUserId);
    const assigns = clsId ? await classAssignments([clsId], semesterId) : [];
    const rows = await loadSchedules({ id: { in: assigns.map((x) => x.id) } });
    return (
      <AppShell user={user} active="/jadwal">
        <div className="breadcrumb">
          <a href="/dashboard">Beranda</a>
          <span className="sep">&gt;</span>
          <span className="current">Jadwal Pelajaran</span>
        </div>
        <div className="page-head">
          <h1>Jadwal Pelajaran Mingguan 🗓️</h1>
          <p>{clsId ? "Jadwal tatap muka mingguan kelasmu di SMPN 5 Tegal." : "Kelas belum ditautkan — hubungi admin."}</p>
        </div>
        <WeekView rows={rows} today={today} />
      </AppShell>
    );
  }

  if (user.role === "GURU") {
    const my = await teacherAssignments(user.id, semesterId);
    const rows = await loadSchedules({ id: { in: my.map((x) => x.id) } });
    return (
      <AppShell user={user} active="/jadwal">
        <div className="breadcrumb">
          <a href="/dashboard">Beranda</a>
          <span className="sep">&gt;</span>
          <span className="current">Jadwal Mengajar</span>
        </div>
        <div className="page-head">
          <h1>Jadwal Mengajar Mingguan 🗓️</h1>
          <p>{my.length} rombel × mapel yang kamu ampu semester ini.</p>
        </div>
        <WeekView rows={rows} today={today} />
      </AppShell>
    );
  }

  const classes = await prisma.class.findMany({
    where: { ...(semesterId && ctx ? { academicYearId: ctx.year.id } : {}) },
    orderBy: { name: "asc" },
    include: { assignments: { include: { subject: true, teacher: { select: { nama: true } } } } },
  });
  return (
    <AppShell user={user} active="/jadwal">
      <div className="breadcrumb">
        <a href="/dashboard">Beranda</a>
        <span className="sep">&gt;</span>
        <span className="current">Jadwal</span>
      </div>
      <div className="page-head">
        <h1>Jadwal Pelajaran Per Rombel 🗓️</h1>
        <p>{user.role === "ADMIN" ? "Kelola" : "Pantau"} jadwal pelajaran per rombel × mapel.</p>
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
