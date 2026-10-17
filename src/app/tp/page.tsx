import { requireRole } from "@/lib/auth";
import { teacherAssignments } from "@/lib/academic";
import AppShell from "@/components/app-shell";

export default async function TpListPage() {
  const user = await requireRole(["GURU", "ADMIN"]);
  const assigns = await teacherAssignments(user.id);

  return (
    <AppShell user={user} active="/tp">
      <div className="breadcrumb">
        <a href="/dashboard">Beranda</a>
        <span className="sep">&gt;</span>
        <span className="current">Tujuan Pembelajaran</span>
      </div>
      <div className="page-head">
        <h1>Tujuan Pembelajaran (TP) 🎯</h1>
        <p className="muted">Kelola daftar TP per rombel × mapel. Format kode selaras dengan template e-Rapor kementerian (mis. TP.9220).</p>
      </div>
      {assigns.length === 0 && (
        <div className="empty">Belum ada penugasan mengajar rombel semester ini.</div>
      )}
      {assigns.map((a) => (
        <a className="card" key={String(a.id)} href={`/tp/${a.id}`} style={{ textDecoration: "none" }}>
          <div className="card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <h2>{a.class.name} · {a.subject.name}</h2>
              <span className="muted">Guru Pengampu: {a.teacher?.nama ?? "—"}</span>
            </div>
            <span className="btn btn-sm btn-primary">Kelola TP →</span>
          </div>
        </a>
      ))}
    </AppShell>
  );
}
