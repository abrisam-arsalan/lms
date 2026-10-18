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
                <div className="list-row" key={String(s.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: "1 1 200px" }}>
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
  searchParams: Promise<{ a?: string; childId?: string }>;
}) {
  const user = await requireUser();
  const { a, childId: rawChildId } = await searchParams;
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
              <form action={addSchedule} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch", width: "100%" }}>
                <input type="hidden" name="assignmentId" value={a} />
                <div className="field" style={{ margin: 0, flex: "1 1 120px" }}>
                  <label className="field-label">Hari</label>
                  <select className="input" name="day" defaultValue={String(today)} style={{ minHeight: 44 }}>
                    {[1, 2, 3, 4, 5, 6].map((d) => <option key={d} value={d}>{DAYS[d]}</option>)}
                  </select>
                </div>
                <div className="field" style={{ margin: 0, flex: "1 1 100px" }}>
                  <label className="field-label">Mulai</label>
                  <input className="input" type="time" name="start" required defaultValue="07:30" style={{ minHeight: 44 }} />
                </div>
                <div className="field" style={{ margin: 0, flex: "1 1 100px" }}>
                  <label className="field-label">Selesai</label>
                  <input className="input" type="time" name="end" required defaultValue="09:00" style={{ minHeight: 44 }} />
                </div>
                <div className="field" style={{ margin: 0, flex: "1 1 120px" }}>
                  <label className="field-label">Ruang Kelas</label>
                  <input className="input" name="room" placeholder="mis. Ruang 9A" style={{ minHeight: 44 }} />
                </div>
                <button className="btn btn-primary btn-block-mobile" type="submit" style={{ minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", alignSelf: "flex-end" }}>+ Tambah Jam</button>
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
                <div key={String(s.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8, padding: "6px 0", borderBottom: "1px dashed var(--ink)" }}>
                  <span className="pill" style={{ minHeight: 36, display: "inline-flex", alignItems: "center" }}>{DAYS[s.day]} : {s.startTime} – {s.endTime} {s.room ? `(${s.room})` : ""}</span>
                  <DangerSubmit action={deleteSchedule} hidden={{ id: String(s.id), assignmentId: a }} confirmText="Hapus baris jadwal ini?" btnClass="btn btn-danger btn-sm btn-block-mobile">✕ Hapus</DangerSubmit>
                </div>
              ))}
            </div>
          </div>
        )}
      </AppShell>
    );
  }

  if (user.role === "ORTU") {
    const parentLinks = await prisma.parentLink.findMany({
      where: { parentId: user.id },
      include: { child: { include: { classRef: { select: { name: true } } } } },
    });
    if (!parentLinks.length) {
      return (
        <AppShell user={user} active="/jadwal">
          <div className="breadcrumb">
            <a href="/dashboard">Beranda</a>
            <span className="sep">&gt;</span>
            <span className="current">Jadwal Pelajaran</span>
          </div>
          <div className="empty">Belum ada data siswa yang terhubung dengan akun Anda.</div>
        </AppShell>
      );
    }
    const activeChildId = rawChildId ? BigInt(rawChildId) : parentLinks[0]?.childId;
    const currentChild = parentLinks.find((l) => l.childId === activeChildId)?.child ?? parentLinks[0]?.child;
    const clsId = currentChild.classId;
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
          <h1>Jadwal Pelajaran: {currentChild?.nama ?? "Anak"} 🗓️</h1>
          <p>
            {clsId
              ? `Jadwal tatap muka mingguan kelas ${currentChild.classRef?.name ?? ""} di SMPN 5 Tegal.`
              : "Kelas belum ditautkan — hubungi admin sekolah."}
          </p>
        </div>

        {parentLinks.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {parentLinks.map((l) => (
              <a
                key={String(l.childId)}
                className={`pill ${l.childId === currentChild?.id ? "hl" : ""}`}
                href={`/jadwal?childId=${l.childId}`}
                style={{ padding: "8px 14px", minHeight: 40, display: "inline-flex", alignItems: "center", textDecoration: "none" }}
              >
                👦 {l.child.nama}
              </a>
            ))}
          </div>
        )}

        <WeekView rows={rows} today={today} />
      </AppShell>
    );
  }

  if (user.role === "SISWA") {
    const clsId = await studentClassId(user.id);
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
          <p>Jadwal tatap muka mingguan untuk {my.length} kelas yang Anda ajar pada semester ini.</p>
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
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Jadwal Pelajaran Per Rombel 🗓️</h1>
          <p>{user.role === "ADMIN" ? "Kelola jadwal pelajaran mingguan untuk setiap kelas dan mata pelajaran." : "Pantau jadwal pelajaran mingguan di seluruh kelas."}</p>
        </div>
        {user.role === "ADMIN" && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a className="btn btn-sm btn-yellow btn-block-mobile" href="/admin/import" style={{ minHeight: 40, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>📥 Impor Jadwal CSV</a>
            <a className="btn btn-sm btn-block-mobile" href="/api/templates/jadwal" download style={{ minHeight: 40, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>📋 Template CSV</a>
          </div>
        )}
      </div>
      {classes.map((c) => (
        <div className="card" key={String(c.id)}>
          <div className="card-head"><h2>{c.name}</h2><span className="pill">{c.assignments.length} mapel</span></div>
          <div className="card-body" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {c.assignments.map((x) => (
              <a key={String(x.id)} className="filechip" href={`/jadwal?a=${x.id}`} style={{ minHeight: 40, display: "inline-flex", alignItems: "center", margin: 0, padding: "8px 12px" }}>
                <span><b>{x.subject.name}</b> <small className="muted">· {x.teacher?.nama?.split(",")[0] ?? "—"}</small></span>
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
