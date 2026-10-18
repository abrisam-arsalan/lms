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
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", width: "100%", maxWidth: 460 }}>
          <a className="btn btn-sm btn-block-mobile" href={`/materi?a=${assignmentId}`} style={{ flex: "1 1 120px", display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 40 }}>📖 Kelola Materi</a>
          <a className="btn btn-sm btn-block-mobile" href={`/tugas?a=${assignmentId}`} style={{ flex: "1 1 120px", display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 40 }}>📝 Kelola Tugas</a>
          <a className="btn btn-sm btn-block-mobile" href={`/nilai?a=${assignmentId}`} style={{ flex: "1 1 120px", display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 40 }}>📊 Buka Gradebook</a>
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
                <input className="input" name="code" placeholder="TP.1 / TP.9220" required style={{ minHeight: 44 }} />
              </div>
              <div className="field">
                <label className="field-label">Isi / Capaian Pembelajaran</label>
                <input className="input" name="content" placeholder="mis. Memahami konsep relasi dan fungsi matematika..." required style={{ minHeight: 44 }} />
              </div>
            </div>
            <button className="btn btn-primary btn-block-mobile" type="submit" style={{ minHeight: 44, marginTop: 4 }}>+ Simpan TP</button>
          </form>
          <hr style={{ border: 0, borderTop: "2px dashed var(--ink)", margin: "18px 0" }} />
          <p className="muted" style={{ marginBottom: 10, fontSize: 13.5 }}>
            ⚡ <b>Salin Cepat dari Template e-Rapor:</b> Unggah file format import nilai rapor (format
            <i> "FORMAT IMPORT NILAI RAPOR … .xlsx"</i>) — kode &amp; deskripsi TP akan dibuat otomatis.
          </p>
          <form action={importTpTemplate} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }}>
            <input type="hidden" name="assignmentId" value={String(assignmentId)} />
            <input className="input" style={{ flex: "1 1 200px", maxWidth: "100%", minHeight: 44, padding: "8px 10px" }} type="file" name="file" accept=".xlsx" required />
            <button className="btn btn-primary btn-block-mobile" type="submit" style={{ minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>📥 Unggah &amp; Impor TP</button>
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
            <div className="list-row" key={String(tp.id)} style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="badge badge-blue">Urutan #{tp.urutan}</span>
                  <span className="pill" style={{ fontWeight: 900 }}>{tp.code}</span>
                </div>
                <DangerSubmit
                  action={deleteTp}
                  hidden={{ id: String(tp.id), assignmentId: String(assignmentId) }}
                  confirmText={`Hapus ${tp.code}? Materi dan tugas yang terhubung akan kehilangan tag TP ini.`}
                  btnClass="btn btn-danger btn-sm"
                >
                  🗑 Hapus TP
                </DangerSubmit>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, margin: "2px 0", lineHeight: 1.45 }}>{tp.content}</div>
              <details style={{ marginTop: 4 }}>
                <summary className="btn btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", minHeight: 40 }}>✏️ Ubah TP</summary>
                <form action={updateTp} style={{ marginTop: 12, maxWidth: 580 }}>
                  <input type="hidden" name="id" value={String(tp.id)} />
                  <input type="hidden" name="assignmentId" value={String(assignmentId)} />
                  <div className="form-grid two">
                    <div className="field">
                      <label className="field-label">Kode TP</label>
                      <input className="input" name="code" defaultValue={tp.code} required style={{ minHeight: 44 }} />
                    </div>
                    <div className="field">
                      <label className="field-label">Nomor Urutan</label>
                      <input className="input" name="urutan" type="number" min={0} defaultValue={tp.urutan} style={{ minHeight: 44 }} />
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Deskripsi Capaian TP</label>
                    <input className="input" name="content" defaultValue={tp.content} required style={{ minHeight: 44 }} />
                  </div>
                  <button className="btn btn-primary btn-block-mobile" type="submit" style={{ minHeight: 44, marginTop: 4 }}>Perbarui TP</button>
                </form>
              </details>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
