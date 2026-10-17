import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/app-shell";
import { AttendanceStatus } from "@prisma/client";

export default async function RekapPresensiPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string; childId?: string }>;
}) {
  const user = await requireUser();
  const { classId: rawClassId, date: rawDate, childId: rawChildId } = await searchParams;

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedDateStr = rawDate ?? todayStr;
  const filterDate = new Date(`${selectedDateStr}T00:00:00.000Z`);

  // Siswa melihat rekap kehadiran dirinya sendiri
  if (user.role === "SISWA") {
    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: user.id },
      include: {
        session: {
          include: {
            schedule: {
              include: { assignment: { include: { subject: true, teacher: true } } },
            },
          },
        },
      },
      orderBy: { session: { date: "desc" } },
      take: 50,
    });

    const summary = {
      HADIR: records.filter((r) => r.status === "HADIR").length,
      SAKIT: records.filter((r) => r.status === "SAKIT").length,
      IZIN: records.filter((r) => r.status === "IZIN").length,
      ALPHA: records.filter((r) => r.status === "ALPHA").length,
    };

    return (
      <AppShell user={user} active="/rekap-presensi">
        <div className="page-head">
          <h1>Riwayat Kehadiran Saya 📅</h1>
          <p>Rekap kehadiran dan catatan kegiatan belajar di kelas.</p>
        </div>

        <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
          <div className="card" style={{ textAlign: "center", margin: 0, padding: 12 }}>
            <h3 style={{ fontSize: 14 }}>✅ Hadir</h3>
            <span style={{ fontSize: 22, fontWeight: 900 }}>{summary.HADIR}</span>
          </div>
          <div className="card" style={{ textAlign: "center", margin: 0, padding: 12 }}>
            <h3 style={{ fontSize: 14 }}>🤒 Sakit</h3>
            <span style={{ fontSize: 22, fontWeight: 900 }}>{summary.SAKIT}</span>
          </div>
          <div className="card" style={{ textAlign: "center", margin: 0, padding: 12 }}>
            <h3 style={{ fontSize: 14 }}>📄 Izin</h3>
            <span style={{ fontSize: 22, fontWeight: 900 }}>{summary.IZIN}</span>
          </div>
          <div className="card" style={{ textAlign: "center", margin: 0, padding: 12 }}>
            <h3 style={{ fontSize: 14 }}>❌ Alpa</h3>
            <span style={{ fontSize: 22, fontWeight: 900 }}>{summary.ALPHA}</span>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Daftar Catatan Absensi Terakhir</h2>
          </div>
          <div className="card-body">
            {records.length === 0 && <div className="empty">Belum ada data kehadiran.</div>}
            {records.map((r) => (
              <div key={String(r.id)} className="list-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                <div>
                  <b>{r.session.schedule.assignment.subject.name}</b>
                  <div className="meta">
                    {new Date(r.session.date).toLocaleDateString("id-ID", { dateStyle: "medium" })} · Guru: {r.session.schedule.assignment.teacher.nama}
                  </div>
                  {r.session.materi && <div style={{ fontSize: 13, marginTop: 4 }}>📖 Materi: {r.session.materi}</div>}
                </div>
                <div>
                  <span className={`badge ${r.status === "HADIR" ? "badge-green" : r.status === "SAKIT" ? "badge-yellow" : "badge-red"}`}>
                    {r.status}
                  </span>
                  {r.keterangan && <div className="meta" style={{ textAlign: "right" }}>{r.keterangan}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  // Orang tua melihat kehadiran anak
  if (user.role === "ORTU") {
    const parentLinks = await prisma.parentLink.findMany({
      where: { parentId: user.id },
      include: { child: true },
    });

    const activeChildId = rawChildId ? BigInt(rawChildId) : parentLinks[0]?.childId;
    const currentChild = parentLinks.find((l) => l.childId === activeChildId)?.child ?? parentLinks[0]?.child;

    const records = currentChild
      ? await prisma.attendanceRecord.findMany({
          where: { studentId: currentChild.id },
          include: {
            session: {
              include: {
                schedule: {
                  include: { assignment: { include: { subject: true, teacher: true } } },
                },
              },
            },
          },
          orderBy: { session: { date: "desc" } },
          take: 50,
        })
      : [];

    const summary = {
      HADIR: records.filter((r) => r.status === "HADIR").length,
      SAKIT: records.filter((r) => r.status === "SAKIT").length,
      IZIN: records.filter((r) => r.status === "IZIN").length,
      ALPHA: records.filter((r) => r.status === "ALPHA").length,
    };

    return (
      <AppShell user={user} active="/rekap-presensi">
        <div className="page-head">
          <h1>Kehadiran Anak: {currentChild?.nama ?? "—"} 📅</h1>
          <p>Pantau kehadiran harian dan jurnal materi pembelajaran anak Anda.</p>
        </div>

        <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
          <div className="card" style={{ textAlign: "center", margin: 0, padding: 12 }}>
            <h3 style={{ fontSize: 14 }}>✅ Hadir</h3>
            <span style={{ fontSize: 22, fontWeight: 900 }}>{summary.HADIR}</span>
          </div>
          <div className="card" style={{ textAlign: "center", margin: 0, padding: 12 }}>
            <h3 style={{ fontSize: 14 }}>🤒 Sakit</h3>
            <span style={{ fontSize: 22, fontWeight: 900 }}>{summary.SAKIT}</span>
          </div>
          <div className="card" style={{ textAlign: "center", margin: 0, padding: 12 }}>
            <h3 style={{ fontSize: 14 }}>📄 Izin</h3>
            <span style={{ fontSize: 22, fontWeight: 900 }}>{summary.IZIN}</span>
          </div>
          <div className="card" style={{ textAlign: "center", margin: 0, padding: 12 }}>
            <h3 style={{ fontSize: 14 }}>❌ Alpa</h3>
            <span style={{ fontSize: 22, fontWeight: 900 }}>{summary.ALPHA}</span>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Riwayat Sesi & Kehadiran</h2>
          </div>
          <div className="card-body">
            {records.length === 0 && <div className="empty">Belum ada riwayat kehadiran tercatat.</div>}
            {records.map((r) => (
              <div key={String(r.id)} className="list-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                <div>
                  <b>{r.session.schedule.assignment.subject.name}</b>
                  <div className="meta">
                    {new Date(r.session.date).toLocaleDateString("id-ID", { dateStyle: "medium" })} · Guru: {r.session.schedule.assignment.teacher.nama}
                  </div>
                  {r.session.materi && <div style={{ fontSize: 13, marginTop: 4 }}>📖 Materi: {r.session.materi}</div>}
                  {r.session.catatanKelas && <div style={{ fontSize: 12, color: "var(--muted)" }}>📌 Catatan guru: {r.session.catatanKelas}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className={`badge ${r.status === "HADIR" ? "badge-green" : r.status === "SAKIT" ? "badge-yellow" : "badge-red"}`}>
                    {r.status}
                  </span>
                  {r.keterangan && <div className="meta">{r.keterangan}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  // Admin / Guru / Kepsek: Monitor rekap per rombel atau tanggal
  const classes = await prisma.class.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const selectedClassId = rawClassId ? BigInt(rawClassId) : undefined;

  const sessions = await prisma.classSession.findMany({
    where: {
      date: filterDate,
      ...(selectedClassId ? { schedule: { assignment: { classId: selectedClassId } } } : {}),
    },
    include: {
      schedule: {
        include: { assignment: { include: { class: true, subject: true, teacher: true } } },
      },
      records: true,
    },
    orderBy: { schedule: { startTime: "asc" } },
  });

  // Hitung total status pada tanggal ini
  const allRecords = sessions.flatMap((s) => s.records);
  const totalHadir = allRecords.filter((r) => r.status === "HADIR").length;
  const totalSakit = allRecords.filter((r) => r.status === "SAKIT").length;
  const totalIzin = allRecords.filter((r) => r.status === "IZIN").length;
  const totalAlpa = allRecords.filter((r) => r.status === "ALPHA").length;

  return (
    <AppShell user={user} active="/rekap-presensi">
      <div className="page-head">
        <h1>Rekapitulasi Kehadiran & Jurnal 📊</h1>
        <p>Monitoring kehadiran harian dan keterlaksanaan sesi mengajar kelas.</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <form method="get" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label className="field-label" style={{ display: "block", marginBottom: 4, fontWeight: "bold" }}>
              Rombel / Kelas
            </label>
            <select name="classId" className="input" defaultValue={rawClassId ?? ""}>
              <option value="">Semua Rombel</option>
              {classes.map((c) => (
                <option key={String(c.id)} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" style={{ display: "block", marginBottom: 4, fontWeight: "bold" }}>
              Tanggal
            </label>
            <input type="date" name="date" className="input" defaultValue={selectedDateStr} required />
          </div>

          <button className="btn btn-primary" type="submit">
            Tampilkan
          </button>
        </form>
      </div>

      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
        <div className="card" style={{ textAlign: "center", margin: 0, padding: 12 }}>
          <h3 style={{ fontSize: 13 }}>📝 Sesi Selesai</h3>
          <span style={{ fontSize: 22, fontWeight: 900 }}>
            {sessions.filter((s) => s.status === "SELESAI").length} / {sessions.length}
          </span>
        </div>
        <div className="card" style={{ textAlign: "center", margin: 0, padding: 12 }}>
          <h3 style={{ fontSize: 13 }}>✅ Hadir</h3>
          <span style={{ fontSize: 22, fontWeight: 900 }}>{totalHadir}</span>
        </div>
        <div className="card" style={{ textAlign: "center", margin: 0, padding: 12 }}>
          <h3 style={{ fontSize: 13 }}>🤒 Sakit</h3>
          <span style={{ fontSize: 22, fontWeight: 900 }}>{totalSakit}</span>
        </div>
        <div className="card" style={{ textAlign: "center", margin: 0, padding: 12 }}>
          <h3 style={{ fontSize: 13 }}>📄 Izin</h3>
          <span style={{ fontSize: 22, fontWeight: 900 }}>{totalIzin}</span>
        </div>
        <div className="card" style={{ textAlign: "center", margin: 0, padding: 12 }}>
          <h3 style={{ fontSize: 13 }}>❌ Alpa</h3>
          <span style={{ fontSize: 22, fontWeight: 900 }}>{totalAlpa}</span>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Sesi Mengajar ({sessions.length})</h2>
          <span className="pill">{selectedDateStr}</span>
        </div>
        <div className="card-body">
          {sessions.length === 0 && <div className="empty">Tidak ada sesi mengajar tercatat pada tanggal dan rombel ini.</div>}
          {sessions.map((s) => {
            const h = s.records.filter((r) => r.status === "HADIR").length;
            const skl = s.records.filter((r) => r.status !== "HADIR");
            return (
              <div
                key={String(s.id)}
                className="list-row"
                style={{
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>
                    {s.schedule.assignment.class.name} · {s.schedule.assignment.subject.name}
                  </h3>
                  <div className="meta">
                    ⏰ {s.schedule.startTime}–{s.schedule.endTime} · Guru: {s.schedule.assignment.teacher.nama} · Status:{" "}
                    <span className={`badge ${s.status === "SELESAI" ? "badge-green" : "badge-yellow"}`}>{s.status}</span>
                  </div>
                  {s.materi && <div style={{ fontSize: 13, marginTop: 4 }}>📖 <b>Materi:</b> {s.materi}</div>}
                  {s.catatanKelas && <div style={{ fontSize: 12, color: "var(--muted)" }}>📌 <b>Catatan:</b> {s.catatanKelas}</div>}
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800 }}>
                    Hadir: {h} / {s.records.length} siswa
                  </div>
                  {skl.length > 0 && (
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                      Tidak hadir: {skl.map((r) => `${r.status}`).join(", ")}
                    </div>
                  )}
                  {user.role === "GURU" && s.schedule.assignment.teacherId === user.id && (
                    <a className="btn btn-sm btn-ghost" style={{ marginTop: 6, display: "inline-block" }} href={`/presensi?session=${s.id}`}>
                      ✏️ Edit Presensi
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
