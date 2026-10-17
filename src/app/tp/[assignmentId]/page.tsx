import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageAssignment } from "@/lib/academic";
import AppShell from "@/components/app-shell";
import DangerSubmit from "@/components/danger-submit";
import { createTp, updateTp, deleteTp, importTpTemplate } from "./actions";

export default async function TpEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ assignmentId: string }>;
  searchParams: Promise<{ err?: string; imp?: string; skip?: string; roster?: string }>;
}) {
  const user = await requireRole(["GURU", "ADMIN"]);
  const { assignmentId: rawId } = await params;
  const { err, imp, skip, roster } = await searchParams;
  const assignmentId = BigInt(rawId);

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      subject: true,
      class: true,
      teacher: { select: { nama: true } },
      learningTargets: { orderBy: { urutan: "asc" } },
    },
  });
  if (!assignment) notFound();
  if (!(await canManageAssignment(user, assignmentId))) redirect("/tp");

  return (
    <AppShell user={user} active="/tp">
      <div className="breadcrumb">
        <a href="/dashboard">Beranda</a>
        <span className="sep">&gt;</span>
        <a href="/tp">Tujuan Pembelajaran</a>
        <span className="sep">&gt;</span>
        <span className="current">{assignment.class.name} · {assignment.subject.name}</span>
      </div>
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>TP — {assignment.class.name} · {assignment.subject.name}</h1>
          <p className="muted">Guru Pengampu: {assignment.teacher?.nama ?? "—"}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a className="btn btn-sm" href={`/materi?a=${assignmentId}`}>📖 Kelola Materi</a>
          <a className="btn btn-sm" href={`/tugas?a=${assignmentId}`}>📝 Kelola Tugas</a>
          <a className="btn btn-sm" href={`/nilai?a=${assignmentId}`}>📊 Buka Gradebook</a>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h2>➕ Tambah Tujuan Pembelajaran (TP)</h2></div>
        <div className="card-body">
          {err && <p className="error">Kode &amp; isi deskripsi TP wajib diisi.</p>}
          {imp === "toobig" && <p className="error">File lebih dari 2 MB — pastikan file template e-Rapor resmi kementerian.</p>}
          {imp === "empty" && <p className="error">Lembar kerja Excel tidak terbaca atau format kolom tidak sesuai.</p>}
          {imp && imp !== "toobig" && imp !== "empty" && (
            <p className="badge badge-green" style={{ display: "block", marginBottom: 12, padding: "8px 12px" }}>
              ✔ Berhasil Mengimpor: {imp} TP dibuat{skip ? `, ${skip} dilewati (kode sudah ada)` : ""}
              {roster ? ` · Template memuat ${roster} data siswa` : ""}
            </p>
          )}
          <form action={createTp}>
            <input type="hidden" name="assignmentId" value={String(assignmentId)} />
            <div className="form-grid two">
              <div className="field">
                <label className="field-label">Kode TP (mis. TP.9220)</label>
                <input className="input" name="code" placeholder="TP.1 / TP.9220" required />
              </div>
              <div className="field">
                <label className="field-label">Isi / Capaian Pembelajaran</label>
                <input className="input" name="content" placeholder="mis. Memahami perlindungan data pribadi dan privasi digital…" required />
              </div>
            </div>
            <button className="btn btn-primary" type="submit">+ Simpan TP</button>
          </form>
          <hr style={{ border: 0, borderTop: "2px dashed var(--ink)", margin: "16px 0" }} />
          <p className="muted" style={{ marginBottom: 8 }}>
            ⚡ <b>Salin Cepat dari Template e-Rapor:</b> Unggah file format import nilai rapor (format
            <i> "FORMAT IMPORT NILAI RAPOR … .xlsx"</i>) — kode &amp; deskripsi TP akan dibuat otomatis.
          </p>
          <form action={importTpTemplate} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input type="hidden" name="assignmentId" value={String(assignmentId)} />
            <input className="input" style={{ width: "auto", minWidth: 240 }} type="file" name="file" accept=".xlsx" required />
            <button className="btn btn-sm btn-primary" type="submit">📥 Unggah &amp; Impor TP</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Daftar Tujuan Pembelajaran ({assignment.learningTargets.length})</h2>
          <span className="pill">Urutan tampil di portal</span>
        </div>
        <div className="card-body">
          {assignment.learningTargets.length === 0 && (
            <div className="empty">Belum ada TP. Tambahkan secara manual di atas atau impor langsung dari file Excel e-Rapor.</div>
          )}
          {assignment.learningTargets.map((tp) => (
            <div className="list-row" key={String(tp.id)}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span className="badge badge-blue">Urutan #{tp.urutan}</span>
                  <span className="pill" style={{ fontWeight: 900 }}>{tp.code}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, margin: "4px 0" }}>{tp.content}</div>
                <details style={{ marginTop: 8 }}>
                  <summary className="btn btn-sm" style={{ cursor: "pointer", display: "inline-flex" }}>✏️ Ubah TP</summary>
                  <form action={updateTp} style={{ marginTop: 10, maxWidth: 580 }}>
                    <input type="hidden" name="id" value={String(tp.id)} />
                    <input type="hidden" name="assignmentId" value={String(assignmentId)} />
                    <div className="form-grid two">
                      <div className="field">
                        <label className="field-label">Kode TP</label>
                        <input className="input" name="code" defaultValue={tp.code} required />
                      </div>
                      <div className="field">
                        <label className="field-label">Nomor Urutan</label>
                        <input className="input" name="urutan" type="number" min={0} defaultValue={tp.urutan} />
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label">Deskripsi Capaian TP</label>
                      <input className="input" name="content" defaultValue={tp.content} required />
                    </div>
                    <button className="btn btn-sm btn-primary" type="submit">Perbarui TP</button>
                  </form>
                </details>
              </div>
              <DangerSubmit
                action={deleteTp}
                hidden={{ id: String(tp.id), assignmentId: String(assignmentId) }}
                confirmText={`Hapus ${tp.code}? Materi dan tugas yang terhubung akan kehilangan tag TP ini.`}
              >
                🗑 Hapus TP
              </DangerSubmit>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
