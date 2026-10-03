import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageAssignment } from "@/lib/academic";
import AppShell from "@/components/app-shell";
import DangerSubmit from "@/components/danger-submit";
import { createTp, updateTp, deleteTp } from "./actions";

export default async function TpEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ assignmentId: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  const user = await requireRole(["GURU", "ADMIN"]);
  const { assignmentId: rawId } = await params;
  const { err } = await searchParams;
  const assignmentId = BigInt(rawId);

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      subject: true,
      class: true,
      teacher: { include: { user: { select: { nama: true } } } },
      learningTargets: { orderBy: { urutan: "asc" } },
    },
  });
  if (!assignment) notFound();
  if (!(await canManageAssignment(user, assignmentId))) redirect("/tp");

  return (
    <AppShell user={user} active="/tp">
      <div className="page-head">
        <h1>
          TP — {assignment.class.name} · {assignment.subject.name}
        </h1>
        <p>Guru: {assignment.teacher?.nama ?? "—"}</p>
      </div>

      <div className="card">
        <div className="card-head"><h2>➕ Tambah TP</h2></div>
        <div className="card-body">
          {err && <p className="error">Kode &amp; isi TP wajib diisi.</p>}
          <form action={createTp}>
            <input type="hidden" name="assignmentId" value={String(assignmentId)} />
            <div className="form-grid two">
              <div className="field">
                <label className="field-label">Kode TP (mis. TP.9220)</label>
                <input className="input" name="code" placeholder="TP." required />
              </div>
              <div className="field">
                <label className="field-label">Isi / tujuan pembelajaran</label>
                <input className="input" name="content" placeholder="mis. melindungi data pribadi…" required />
              </div>
            </div>
            <button className="btn btn-primary" type="submit">Simpan TP</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Daftar TP ({assignment.learningTargets.length})</h2>
          <span className="pill">urutan = tampilan ke siswa</span>
        </div>
        <div className="card-body">
          {assignment.learningTargets.length === 0 && (
            <div className="empty">Belum ada TP. Tambahkan di atas — jumlah bebas, sesuai app kementerian.</div>
          )}
          {assignment.learningTargets.map((tp) => (
            <div className="list-row" key={String(tp.id)}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <span className="badge badge-blue">{tp.urutan}</span>{" "}
                <b>{tp.code}</b>
                <div className="muted">{tp.content}</div>
                <details style={{ marginTop: 6 }}>
                  <summary style={{ cursor: "pointer", fontWeight: 800, fontSize: 12.5 }}>✏️ ubah</summary>
                  <form action={updateTp} style={{ marginTop: 8, maxWidth: 560 }}>
                    <input type="hidden" name="id" value={String(tp.id)} />
                    <input type="hidden" name="assignmentId" value={String(assignmentId)} />
                    <div className="form-grid two">
                      <div className="field">
                        <label className="field-label">Kode</label>
                        <input className="input" name="code" defaultValue={tp.code} required />
                      </div>
                      <div className="field">
                        <label className="field-label">Urutan</label>
                        <input className="input" name="urutan" type="number" min={0} defaultValue={tp.urutan} />
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label">Isi</label>
                      <input className="input" name="content" defaultValue={tp.content} required />
                    </div>
                    <button className="btn btn-sm btn-primary" type="submit">Perbarui</button>
                  </form>
                </details>
              </div>
              <DangerSubmit
                action={deleteTp}
                hidden={{ id: String(tp.id), assignmentId: String(assignmentId) }}
                confirmText={`Hapus ${tp.code}? Materi/tugas yang merujuknya akan kehilangan tag TP.`}
              >
                🗑 Hapus
              </DangerSubmit>
            </div>
          ))}
        </div>
      </div>

      <p className="muted" style={{ textAlign: "center" }}>
        <a href={`/materi?a=${assignmentId}`}>→ kelola materi utk TP ini</a> ·{" "}
        <a href={`/tugas?a=${assignmentId}`}>→ kelola tugas</a>
      </p>
    </AppShell>
  );
}
