import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/app-shell";

export default async function AdminUjianPage() {
  const user = await requireRole(["ADMIN"]);
  const cbtBaseUrl = process.env.CBT_BASE_URL ?? "https://ujian.smpn5tegal.sch.id";

  const totalSiswa = await prisma.user.count({
    where: { role: "SISWA", isActive: true, deletedAt: null },
  });

  const totalTpScores = await prisma.tpScore.count();

  return (
    <AppShell user={user} active="/admin/ujian">
      <div className="page-head">
        <h1>Integrasi Sistem Ujian (CBT) 📋</h1>
        <p>Sinkronisasi data siswa ke engine Ujian dan penerimaan hasil asesmen sumatif.</p>
      </div>

      <div className="stat-grid small" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ margin: 0 }}>
          <h3>🎓 Siswa Aktif Siap Sync</h3>
          <span style={{ fontSize: 28, fontWeight: 900 }}>{totalSiswa}</span>
          <p className="meta" style={{ marginTop: 4 }}>Tersedia di endpoint <code>/api/v1/siswa</code></p>
        </div>

        <div className="card" style={{ margin: 0 }}>
          <h3>📥 Nilai CBT Masuk</h3>
          <span style={{ fontSize: 28, fontWeight: 900 }}>{totalTpScores}</span>
          <p className="meta" style={{ marginTop: 4 }}>Diterima via push <code>/api/v1/tp-skor</code></p>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Status Koneksi & Endpoint</h2>
        </div>
        <div className="card-body">
          <table className="table" style={{ width: "100%" }}>
            <tbody>
              <tr>
                <td style={{ width: 220, fontWeight: "bold" }}>Base URL CBT</td>
                <td><code>{cbtBaseUrl}</code></td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold" }}>Endpoint Siswa</td>
                <td><code>GET /api/v1/siswa</code> (Auth: Bearer PANGLIMA_SYNC_TOKEN)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold" }}>Endpoint Jadwal</td>
                <td><code>GET /api/v1/jadwal</code> (Auth: Bearer PANGLIMA_SYNC_TOKEN)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold" }}>Endpoint Push Skor CBT</td>
                <td><code>POST /api/v1/tp-skor</code> (Auth: Bearer PANGLIMA_SYNC_TOKEN)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold" }}>Endpoint SSO Handoff</td>
                <td><code>GET /api/v1/cbt/handoff-verify?code=...</code></td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: 20 }}>
            <a className="btn btn-primary" href={`${cbtBaseUrl}/admin/sync`} target="_blank" rel="noopener noreferrer">
              Buka Panel Tarik Data di CBT →
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
