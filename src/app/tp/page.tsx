import { requireRole } from "@/lib/auth";
import { teacherAssignments } from "@/lib/academic";
import AppShell from "@/components/app-shell";

export default async function TpListPage() {
  const user = await requireRole(["GURU", "ADMIN"]);
  const assigns = await teacherAssignments(user.id);

  return (
    <AppShell user={user} active="/tp">
      <div className="page-head">
        <h1>Tujuan Pembelajaran 🎯</h1>
        <p>Pilih rombel × mapel — jumlah &amp; isi TP kamu yang atur (kode mengikuti app kementerian, mis. TP.9220).</p>
      </div>
      {assigns.length === 0 && (
        <div className="empty">Belum ada penugasan rombel semester ini.</div>
      )}
      {assigns.map((a) => (
        <a className="card" key={String(a.id)} href={`/tp/${a.id}`}>
          <div className="card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2>{a.class.name} · {a.subject.name}</h2>
              <span className="muted">Guru: {a.teacher?.nama ?? "—"}</span>
            </div>
            <span className="pill">kelola TP →</span>
          </div>
        </a>
      ))}
    </AppShell>
  );
}
