import { requireUser } from "@/lib/auth";
import AppShell from "@/components/app-shell";
import { launchCbt } from "./actions";

export default async function UjianPortalPage() {
  const user = await requireUser();
  const cbtBaseUrl = process.env.CBT_BASE_URL || "http://localhost:8000";
  const isStaff = user.role === "ADMIN" || user.role === "GURU" || user.role === "KEPSEK";
  const targetUrl = isStaff ? `${cbtBaseUrl}/admin/login` : `${cbtBaseUrl}/login`;

  return (
    <AppShell user={user} active="/ujian">
      <div className="breadcrumb">
        <a href="/dashboard">Beranda</a>
        <span className="sep">&gt;</span>
        <span className="current">Ujian CBT</span>
      </div>
      <div className="page-head">
        <h1>Platform Ujian &amp; Asesmen (CBT) 📋</h1>
        <p>Akses ruang Computer Based Test (CBT) untuk pelaksanaan asesmen dan ujian sekolah.</p>
      </div>

      <div className="card" style={{ maxWidth: 680 }}>
        <div className="card-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h2>Buka Platform Ujian</h2>
          <span className="badge badge-green">SERVER AKTIF (PORT 8000)</span>
        </div>
        <div className="card-body">
          <p style={{ lineHeight: 1.6, fontSize: 15, marginBottom: 16 }}>
            Engine Ujian CBT berjalan mandiri di server khusus untuk memastikan ujian tetap lancar, cepat, dan bebas gangguan.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <div className="list-row" style={{ margin: 0, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span>👤 <b>Akun Login:</b></span>
              <span className="pill"><code>{user.username}</code> ({user.nama})</span>
            </div>
            <div className="list-row" style={{ margin: 0, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span>🔑 <b>PIN / Sandi:</b></span>
              <span className="meta">Gunakan PIN yang sama dengan portal (default: <code>123456</code>)</span>
            </div>
            <div className="list-row" style={{ margin: 0, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span>🌐 <b>Alamat Server:</b></span>
              <code style={{ fontSize: 13 }}>{cbtBaseUrl}</code>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              className="btn btn-primary btn-block-mobile"
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 16, padding: "12px 24px", minHeight: 48, display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
            >
              🚀 Buka Platform Ujian Sekarang ↗
            </a>
            {isStaff && (
              <a
                className="btn btn-block-mobile"
                href={`${cbtBaseUrl}/login`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 15, minHeight: 48, display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
              >
                Tampilan Login Siswa ↗
              </a>
            )}
          </div>

          <div className="meta" style={{ marginTop: 16, fontSize: 13, borderTop: "1px dashed var(--ink)", paddingTop: 12 }}>
            💡 <i>Tips: Halaman ujian akan terbuka di tab baru. Anda dapat tetap membuka portal ini selama ujian berlangsung.</i>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
