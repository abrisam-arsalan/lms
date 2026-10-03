import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  canManageAssignment, classAssignments, currentSemester,
  studentClassId, childrenOfClassIds, teacherAssignments,
} from "@/lib/academic";
import AppShell from "@/components/app-shell";
import DangerSubmit from "@/components/danger-submit";
import { createMateri, updateMateri, deleteMateri, addMateriFile, deleteMateriFile } from "./actions";

const fmt = (d: Date | null) => (d ? new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—");
const size = (b: bigint) => `${(Number(b) / 1024).toFixed(0)} KB`;

export default async function MateriPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string }>;
}) {
  const user = await requireUser();
  const { a } = await searchParams;
  const ctx = await currentSemester();
  const semesterId = ctx?.semester.id;

  /* ── pembacaan (siswa/ortu): daftar gabungan materi TERBIT kelasnya ── */
  if (user.role === "SISWA" || user.role === "ORTU") {
    const classIds =
      user.role === "SISWA"
        ? [await studentClassId(user.id)].filter((x): x is bigint => !!x)
        : await childrenOfClassIds(user.id);
    const assigns = await classAssignments(classIds, semesterId);
    const materials = await prisma.material.findMany({
      where: {
        assignmentId: { in: assigns.map((x) => x.id) },
        status: "TERBIT",
        deletedAt: null,
        OR: [{ publishAt: null }, { publishAt: { lte: new Date() } }],
      },
      include: {
        tp: true,
        files: true,
        assignment: { include: { subject: true, class: true } },
      },
      orderBy: { publishAt: "desc" },
    });
    return (
      <AppShell user={user} active="/materi">
        <div className="page-head">
          <h1>Materi 📖</h1>
          <p>{materials.length} materi terbit untuk kelasmu.</p>
        </div>
        {materials.length === 0 && <div className="empty">Belum ada materi. Nanti guru yang mengunggah ke sini.</div>}
        {materials.map((m) => (
          <div className="card" key={String(m.id)}>
            <div className="card-head">
              <h2>{m.judul}</h2>
              <span className="badge badge-blue">{m.assignment.class.name} · {m.assignment.subject.name}</span>
            </div>
            <div className="card-body">
              {m.tp && <p className="muted" style={{ marginBottom: 6 }}><span className="pill">{m.tp.code}</span> {m.tp.content}</p>}
              <p className="prose">{m.body}</p>
              <div style={{ marginTop: 10 }}>
                {m.files.map((f) => (
                  <a className="filechip" key={String(f.id)} href={`/api/file/${f.id}?k=m`} title={size(f.sizeBytes)}>
                    📎 {f.nama}
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </AppShell>
    );
  }

  /* ── pengelola (guru/admin/kepsek): pilih assignment ── */
  const assigns =
    user.role === "GURU"
      ? await teacherAssignments(user.id, semesterId)
      : await prisma.assignment.findMany({
          where: { ...(semesterId ? { semesterId } : {}) },
          include: { subject: true, class: true, teacher: { include: { user: { select: { nama: true } } } } },
          orderBy: [{ class: { name: "asc" } }, { subject: { name: "asc" } }],
        });

  if (!a) {
    return (
      <AppShell user={user} active="/materi">
        <div className="page-head">
          <h1>Materi 📖</h1>
          <p>Pilih rombel × mapel untuk mengelola materi{user.role === "KEPSEK" ? " (mode baca)" : ""}.</p>
        </div>
        {assigns.length === 0 && <div className="empty">Belum ada penugasan semester ini.</div>}
        {assigns.map((x) => (
          <a className="card" key={String(x.id)} href={`/materi?a=${x.id}`}>
            <div className="card-body" style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <h2>{x.class.name} · {x.subject.name}</h2>
                <span className="muted">Guru: {x.teacher?.nama ?? "—"}</span>
              </div>
              <span className="pill">→</span>
            </div>
          </a>
        ))}
      </AppShell>
    );
  }

  const assignmentId = BigInt(a);
  if (!(await canManageAssignment(user, assignmentId))) redirect("/materi");
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      subject: true,
      class: true,
      learningTargets: { orderBy: { urutan: "asc" } },
      materials: {
        where: { deletedAt: null },
        include: { tp: true, files: true },
        orderBy: { urutan: "asc" },
      },
    },
  });
  if (!assignment) notFound();
  const ro = user.role === "KEPSEK";

  return (
    <AppShell user={user} active="/materi">
      <div className="page-head">
        <h1>
          Materi — {assignment.class.name} · {assignment.subject.name}
        </h1>
        <p><a href={`/tp/${assignmentId}`}>🎯 atur TP</a> · <a href={`/tugas?a=${assignmentId}`}>📝 kelola tugas</a></p>
      </div>

      {!ro && (
        <div className="card">
          <div className="card-head"><h2>➕ Materi baru</h2></div>
          <div className="card-body">
            <form action={createMateri}>
              <input type="hidden" name="assignmentId" value={String(assignmentId)} />
              <div className="field">
                <label className="field-label">Judul</label>
                <input className="input" name="judul" placeholder="mis. Data Pribadi & Identitas Digital" required />
              </div>
              <div className="form-grid two">
                <div className="field">
                  <label className="field-label">TP terkait (opsional)</label>
                  <select className="input" name="tpId" defaultValue="">
                    <option value="">— tanpa TP —</option>
                    {assignment.learningTargets.map((tp) => (
                      <option key={String(tp.id)} value={String(tp.id)}>{tp.code} — {tp.content.slice(0, 50)}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Status</label>
                  <select className="input" name="status" defaultValue="TERBIT">
                    <option value="TERBIT">Terbit sekarang</option>
                    <option value="DRAF">Draf (belum tampil ke siswa)</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="field-label">Isi materi (teks; baris baru = paragraf)</label>
                <textarea className="input" name="body" rows={6} placeholder="Tulis penjelasan materi…" />
              </div>
              <button className="btn btn-primary" type="submit">Simpan</button>
            </form>
          </div>
        </div>
      )}

      {assignment.materials.map((m) => (
        <div className="card" key={String(m.id)}>
          <div className="card-head">
            <h2>{m.judul}</h2>
            <span className={`badge ${m.status === "TERBIT" ? "badge-green" : "badge-neutral"}`}>{m.status}</span>
          </div>
          <div className="card-body">
            <p className="muted" style={{ marginBottom: 6 }}>
              {m.tp && <span className="pill">{m.tp.code}</span>}{" "}
              Urutan {m.urutan} · terbit {fmt(m.publishAt)}
            </p>
            <p className="prose">{m.body}</p>
            <div style={{ margin: "8px 0" }}>
              {m.files.map((f) => (
                <span key={String(f.id)}>
                  <a className="filechip" href={`/api/file/${f.id}?k=m`}>📎 {f.nama} ({size(f.sizeBytes)})</a>
                  {!ro && (
                    <DangerSubmit
                      action={deleteMateriFile}
                      hidden={{ id: String(f.id), assignmentId: String(assignmentId) }}
                      confirmText={`Hapus lampiran "${f.nama}"?`}
                      btnClass="btn btn-sm"
                    >
                      ✕
                    </DangerSubmit>
                  )}
                </span>
              ))}
            </div>
            {!ro && (
              <div className="row-actions" style={{ marginTop: 8 }}>
                <form action={addMateriFile} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <input type="hidden" name="assignmentId" value={String(assignmentId)} />
                  <input type="hidden" name="materialId" value={String(m.id)} />
                  <input className="input" style={{ width: "auto", minWidth: 200 }} type="file" name="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" required />
                  <button className="btn btn-sm btn-primary" type="submit">Unggah</button>
                </form>
                <details>
                  <summary className="pill" style={{ cursor: "pointer" }}>✏️ ubah</summary>
                  <form action={updateMateri} style={{ marginTop: 8, maxWidth: 620 }}>
                    <input type="hidden" name="id" value={String(m.id)} />
                    <input type="hidden" name="assignmentId" value={String(assignmentId)} />
                    <div className="field"><label className="field-label">Judul</label>
                      <input className="input" name="judul" defaultValue={m.judul} required /></div>
                    <div className="form-grid two">
                      <div className="field"><label className="field-label">TP</label>
                        <select className="input" name="tpId" defaultValue={m.tpId ? String(m.tpId) : ""}>
                          <option value="">— tanpa TP —</option>
                          {assignment.learningTargets.map((tp) => (
                            <option key={String(tp.id)} value={String(tp.id)}>{tp.code}</option>
                          ))}
                        </select></div>
                      <div className="field"><label className="field-label">Status</label>
                        <select className="input" name="status" defaultValue={m.status}>
                          <option value="TERBIT">TERBIT</option><option value="DRAF">DRAF</option>
                        </select></div>
                    </div>
                    <div className="field"><label className="field-label">Isi</label>
                      <textarea className="input" name="body" rows={6} defaultValue={m.body} /></div>
                    <button className="btn btn-sm btn-primary" type="submit">Perbarui</button>
                  </form>
                </details>
                <DangerSubmit
                  action={deleteMateri}
                  hidden={{ id: String(m.id), assignmentId: String(assignmentId) }}
                  confirmText={`Hapus materi "${m.judul}"?`}
                >
                  🗑 Hapus
                </DangerSubmit>
              </div>
            )}
          </div>
        </div>
      ))}
      {assignment.materials.length === 0 && <div className="empty">Belum ada materi di rombel ini.</div>}
    </AppShell>
  );
}
