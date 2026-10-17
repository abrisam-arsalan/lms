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

      <div className="card" style={{ maxWidth: 680 }}>
        <div className="card-head">
          <h2>Masuk ke Engine Ujian</h2>
          <span className="pill">Single Sign-On (SSO)</span>
        </div>
        <div className="card-body">
          <p style={{ lineHeight: 1.6 }}>
            Engine Ujian SMPN 5 Tegal berjalan terpisah untuk menjamin kestabilan performa dan keamanan tes.
            Dengan mengklik tombol di bawah ini, akun Anda (<b>{user.nama}</b>) akan secara otomatis login ke sistem ujian
            melalui token handoff aman tanpa perlu memasukkan PIN kembali.
          </p>

          <div style={{ marginTop: 20 }}>
            <form action={launchCbt}>
              <button className="btn btn-primary" type="submit" style={{ fontSize: 16, padding: "12px 24px" }}>
                🚀 Buka Platform Ujian →
              </button>
            </form>
          </div>

          <div className="meta" style={{ marginTop: 16 }}>
            Target URL: <code>{cbtBaseUrl}</code>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
