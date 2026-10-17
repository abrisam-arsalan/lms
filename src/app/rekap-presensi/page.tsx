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
        <div className="breadcrumb">
          <a href="/dashboard">Beranda</a>
          <span className="sep">&gt;</span>
          <span className="current">Kehadiran Saya</span>
        </div>
        <div className="page-head">
          <h1>Riwayat Kehadiran Siswa 📅</h1>
          <p>Rekapitulasi kehadiran dan catatan jurnal materi belajar di kelas.</p>
        </div>

        <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 16 }}>
          <div className="card" style={{ textAlign: "center", margin: 0, padding: 14 }}>
            <h3 style={{ fontSize: 13, textTransform: "uppercase" }}>✅ Hadir</h3>
            <span style={{ fontSize: 26, fontWeight: 900, color: "var(--teal)" }}>{summary.HADIR}</span>
          </div>
          <div className="card" style={{ textAlign: "center", margin: 0, padding: 14 }}>
            <h3 style={{ fontSize: 13, textTransform: "uppercase" }}>🤒 Sakit</h3>
            <span style={{ fontSize: 26, fontWeight: 900 }}>{summary.SAKIT}</span>
          </div>
          <div className="card" style={{ textAlign: "center", margin: 0, padding: 14 }}>
            <h3 style={{ fontSize: 13, textTransform: "uppercase" }}>📄 Izin</h3>
            <span style={{ fontSize: 26, fontWeight: 900 }}>{summary.IZIN}</span>
          </div>
          <div className="card" style={{ textAlign: "center", margin: 0, padding: 14 }}>
            <h3 style={{ fontSize: 13, textTransform: "uppercase" }}>❌ Alpa</h3>
            <span style={{ fontSize: 26, fontWeight: 900, color: "var(--magenta)" }}>{summary.ALPHA}</span>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Daftar Catatan Absensi Terakhir</h2>
          </div>
          <div className="card-body">
            {records.length === 0 && <div className="empty">Belum ada data kehadiran siswa tercatat.</div>}
            {records.map((r) => (
              <div key={String(r.id)} className="list-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px" }}>
                <div>
                  <b style={{ fontSize: 16 }}>{r.session.schedule.assignment.subject.name}</b>
                  <div className="meta">
                    {new Date(r.session.date).toLocaleDateString("id-ID", { dateStyle: "medium" })} · Guru: {r.session.schedule.assignment.teacher.nama}
                  </div>
                  {r.session.materi && <div style={{ fontSize: 13, marginTop: 4 }}>📖 Materi: {r.session.materi}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className={`badge ${r.status === "HADIR" ? "badge-green" : r.status === "SAKIT" ? "badge-yellow" : "badge-red"}`} style={{ fontSize: 13 }}>
                    {r.status}
                  </span>
                  {r.keterangan && <div className="meta" style={{ marginTop: 2 }}>{r.keterangan}</div>}
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
        <div className="breadcrumb">
          <a href="/dashboard">Beranda</a>
          <span className="sep">&gt;</span>
          <span className="current">Kehadiran Anak</span>
        </div>
        <div className="page-head">
          <h1>Kehadiran Siswa: {currentChild?.nama ?? "—"} 📅</h1>
          <p>Pantau kehadiran harian dan jurnal materi pembelajaran anak Anda.</p>
        </div>

        <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 16 }}>
          <div className="card" style={{ textAlign: "center", margin: 0, padding: 14 }}>
            <h3 style={{ fontSize: 13, textTransform: "uppercase" }}>✅ Hadir</h3>
            <span style={{ fontSize: 26, fontWeight: 900, color: "var(--teal)" }}>{summary.HADIR}</span>
          </div>
          <div className="card" style={{ textAlign: "center", margin: 0, padding: 14 }}>
            <h3 style={{ fontSize: 13, textTransform: "uppercase" }}>🤒 Sakit</h3>
            <span style={{ fontSize: 26, fontWeight: 900 }}>{summary.SAKIT}</span>
          </div>
          <div className="card" style={{ textAlign: "center", margin: 0, padding: 14 }}>
            <h3 style={{ fontSize: 13, textTransform: "uppercase" }}>📄 Izin</h3>
            <span style={{ fontSize: 26, fontWeight: 900 }}>{summary.IZIN}</span>
          </div>
          <div className="card" style={{ textAlign: "center", margin: 0, padding: 14 }}>
            <h3 style={{ fontSize: 13, textTransform: "uppercase" }}>❌ Alpa</h3>
            <span style={{ fontSize: 26, fontWeight: 900, color: "var(--magenta)" }}>{summary.ALPHA}</span>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Riwayat Sesi &amp; Kehadiran</h2>
          </div>
          <div className="card-body">
            {records.length === 0 && <div className="empty">Belum ada riwayat kehadiran tercatat.</div>}
            {records.map((r) => (
              <div key={String(r.id)} className="list-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px" }}>
                <div>
                  <b style={{ fontSize: 16 }}>{r.session.schedule.assignment.subject.name}</b>
                  <div className="meta">
                    {new Date(r.session.date).toLocaleDateString("id-ID", { dateStyle: "medium" })} · Guru: {r.session.schedule.assignment.teacher.nama}
                  </div>
                  {r.session.materi && <div style={{ fontSize: 13, marginTop: 4 }}>📖 Materi: {r.session.materi}</div>}
                  {r.session.catatanKelas && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>📌 Catatan guru: {r.session.catatanKelas}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className={`badge ${r.status === "HADIR" ? "badge-green" : r.status === "SAKIT" ? "badge-yellow" : "badge-red"}`} style={{ fontSize: 13 }}>
                    {r.status}
                  </span>
                  {r.keterangan && <div className="meta" style={{ marginTop: 2 }}>{r.keterangan}</div>}
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
      <div className="breadcrumb">
        <a href="/dashboard">Beranda</a>
        <span className="sep">&gt;</span>
        <span className="current">Rekapitulasi Presensi</span>
      </div>
      <div className="page-head">
        <h1>Rekapitulasi Kehadiran &amp; Jurnal Mengajar 📊</h1>
        <p className="muted">Monitoring kehadiran harian dan keterlaksanaan jurnal sesi mengajar kelas.</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-head"><h2>🔍 Filter Rekap Presensi</h2></div>
        <div className="card-body">
          <form method="get" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="field-label" style={{ display: "block", marginBottom: 6 }}>
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

            <div style={{ minWidth: 160 }}>
              <label className="field-label" style={{ display: "block", marginBottom: 6 }}>
                Tanggal Pelaksanaan
              </label>
              <input type="date" name="date" className="input" defaultValue={selectedDateStr} required />
            </div>

            <button className="btn btn-primary" type="submit" style={{ minWidth: 130 }}>
              Tampilkan Data
            </button>
          </form>
        </div>
      </div>

      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ textAlign: "center", margin: 0, padding: 14 }}>
          <h3 style={{ fontSize: 13, textTransform: "uppercase" }}>📝 Sesi Selesai</h3>
          <span style={{ fontSize: 24, fontWeight: 900 }}>
            {sessions.filter((s) => s.status === "SELESAI").length} / {sessions.length}
          </span>
        </div>
        <div className="card" style={{ textAlign: "center", margin: 0, padding: 14 }}>
          <h3 style={{ fontSize: 13, textTransform: "uppercase" }}>✅ Hadir</h3>
          <span style={{ fontSize: 24, fontWeight: 900, color: "var(--teal)" }}>{totalHadir}</span>
        </div>
        <div className="card" style={{ textAlign: "center", margin: 0, padding: 14 }}>
          <h3 style={{ fontSize: 13, textTransform: "uppercase" }}>🤒 Sakit</h3>
          <span style={{ fontSize: 24, fontWeight: 900 }}>{totalSakit}</span>
        </div>
        <div className="card" style={{ textAlign: "center", margin: 0, padding: 14 }}>
          <h3 style={{ fontSize: 13, textTransform: "uppercase" }}>📄 Izin</h3>
          <span style={{ fontSize: 24, fontWeight: 900 }}>{totalIzin}</span>
        </div>
        <div className="card" style={{ textAlign: "center", margin: 0, padding: 14 }}>
          <h3 style={{ fontSize: 13, textTransform: "uppercase" }}>❌ Alpa</h3>
          <span style={{ fontSize: 24, fontWeight: 900, color: "var(--magenta)" }}>{totalAlpa}</span>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Sesi Mengajar Terjadwal ({sessions.length})</h2>
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
                  padding: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 240 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>
                    {s.schedule.assignment.class.name} · {s.schedule.assignment.subject.name}
                  </h3>
                  <div className="meta" style={{ marginTop: 4 }}>
                    ⏰ {s.schedule.startTime}–{s.schedule.endTime} · Guru: {s.schedule.assignment.teacher.nama} · Status:{" "}
                    <span className={`badge ${s.status === "SELESAI" ? "badge-green" : "badge-yellow"}`}>{s.status}</span>
                  </div>
                  {s.materi && <div style={{ fontSize: 13, marginTop: 6 }}>📖 <b>Materi:</b> {s.materi}</div>}
                  {s.catatanKelas && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>📌 <b>Catatan:</b> {s.catatanKelas}</div>}
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800 }}>
                    Kehadiran: <span className="badge badge-green">{h} / {s.records.length} Siswa</span>
                  </div>
                  {skl.length > 0 && (
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                      Tidak hadir: {skl.map((r) => `${r.status}`).join(", ")}
                    </div>
                  )}
                  {user.role === "GURU" && s.schedule.assignment.teacherId === user.id && (
                    <div style={{ marginTop: 8 }}>
                      <a className="btn btn-sm btn-primary" href={`/presensi?session=${s.id}`}>
                        ✏️ Edit Presensi
                      </a>
                    </div>
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
