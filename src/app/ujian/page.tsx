import { requireUser } from "@/lib/auth";
import AppShell from "@/components/app-shell";
import { launchCbt } from "./actions";

export default async function UjianPortalPage() {
  const user = await requireUser();
  const cbtBaseUrl = process.env.CBT_BASE_URL ?? "https://ujian.smpn5tegal.sch.id";

  return (
    <AppShell user={user} active="/ujian">
      <div className="page-head">
        <h1>Ujian & Computer Based Test (CBT) 📋</h1>
        <p>Akses platform ujian sekolah, tes formatif, dan asesmen sumatif.</p>
      </div>

      <div className="card" style={{ maxWidth: 720 }}>
        <div className="card-head">
          <h2>Masuk ke Engine Ujian</h2>
          <span className="badge badge-yellow">Single Sign-On (SSO)</span>
        </div>
        <div className="card-body">
          <p style={{ lineHeight: 1.6, fontSize: 15, marginBottom: 16 }}>
            Engine Ujian SMPN 5 Tegal berjalan terpisah untuk menjamin kestabilan performa dan integritas tes.
            Sistem Single Sign-On (SSO) handoff memungkinkan Anda langsung masuk tanpa perlu mengetik ulang PIN.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            <div className="list-row" style={{ margin: 0, padding: "10px 14px", background: "var(--paper)" }}>
              <span>👤 Akun Terhubung: <b>{user.nama}</b> ({user.role})</span>
            </div>
            <div className="list-row" style={{ margin: 0, padding: "10px 14px", background: "var(--paper)" }}>
              <span>🔒 Keamanan Sesi: <b>Token Enkripsi Sekali Pakai (TTL 60 Detik)</b></span>
            </div>
            <div className="list-row" style={{ margin: 0, padding: "10px 14px", background: "var(--paper)" }}>
              <span>🎯 Sinkronisasi Nilai: <b>Otomatis tercatat di LMS & Raport</b></span>
            </div>
          </div>

          <div>
            <form action={launchCbt}>
              <button className="btn btn-primary btn-block-mobile" type="submit" style={{ fontSize: 16, padding: "14px 28px", minHeight: 48 }}>
                🚀 Buka Platform Ujian Sekarang →
              </button>
            </form>
          </div>

          <div className="meta" style={{ marginTop: 14 }}>
            Server Engine Ujian: <code>{cbtBaseUrl}</code>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
