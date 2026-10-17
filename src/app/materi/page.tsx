import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  canManageAssignment, classAssignments, currentSemester,
  studentClassId, childrenOfClassIds, teacherAssignments,
} from "@/lib/academic";
import AppShell from "@/components/app-shell";
import DangerSubmit from "@/components/danger-submit";
import { createMateri, updateMateri, deleteMateri, uploadMateriFile, deleteMateriFile, markRead } from "./actions";

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
    const myReads = new Set(
      (await prisma.materialRead.findMany({
        where: { userId: user.id, materialId: { in: materials.map((m) => m.id) } },
        select: { materialId: true },
      })).map((r) => String(r.materialId)),
    );
    return (
      <AppShell user={user} active="/materi">
        <div className="breadcrumb">
          <a href="/dashboard">Beranda</a>
          <span className="sep">&gt;</span>
          <span className="current">Materi Belajar</span>
        </div>
        <div className="page-head">
          <h1>Materi Pembelajaran 📖</h1>
          <p>{materials.length} materi terbit untuk kelasmu.</p>
        </div>
        {materials.length === 0 && <div className="empty">Belum ada materi pembelajaran yang terbit.</div>}
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
              <div style={{ marginTop: 12 }}>
                {myReads.has(String(m.id)) ? (
                  <span className="badge badge-green">✓ Sudah Dibaca</span>
                ) : (
                  <form action={markRead} style={{ display: "inline" }}>
                    <input type="hidden" name="materialId" value={String(m.id)} />
                    <button className="btn btn-sm btn-primary" type="submit">✓ Tandai Selesai Dibaca</button>
                  </form>
                )}
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
          include: { subject: true, class: true, teacher: { select: { nama: true } } },
          orderBy: [{ class: { name: "asc" } }, { subject: { name: "asc" } }],
        });

  if (!a) {
    return (
      <AppShell user={user} active="/materi">
        <div className="breadcrumb">
          <a href="/dashboard">Beranda</a>
          <span className="sep">&gt;</span>
          <span className="current">Materi</span>
        </div>
        <div className="page-head">
          <h1>Kelola Materi Pembelajaran 📖</h1>
          <p>Pilih rombel × mapel untuk mengelola materi{user.role === "KEPSEK" ? " (mode pantau)" : ""}.</p>
        </div>
        {assigns.length === 0 && <div className="empty">Belum ada penugasan mengajar semester ini.</div>}
        {assigns.map((x) => (
          <a className="card" key={String(x.id)} href={`/materi?a=${x.id}`} style={{ textDecoration: "none" }}>
            <div className="card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <h2>{x.class.name} · {x.subject.name}</h2>
                <span className="muted">Guru Pengampu: {x.teacher?.nama ?? "—"}</span>
              </div>
              <span className="btn btn-sm btn-primary">Kelola Materi →</span>
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
        include: { tp: true, files: true, _count: { select: { reads: true } } },
        orderBy: { urutan: "asc" },
      },
    },
  });
  if (!assignment) notFound();
  const ro = user.role === "KEPSEK";
  const jmlSiswa = await prisma.user.count({ where: { classId: assignment.classId, role: "SISWA", isActive: true, deletedAt: null } });

  return (
    <AppShell user={user} active="/materi">
      <div className="breadcrumb">
        <a href="/dashboard">Beranda</a>
        <span className="sep">&gt;</span>
        <a href="/materi">Materi</a>
        <span className="sep">&gt;</span>
        <span className="current">{assignment.class.name} · {assignment.subject.name}</span>
      </div>
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Materi — {assignment.class.name} · {assignment.subject.name}</h1>
          <p className="muted">Kelola bahan ajar, modul PDF, dan keterkaitan TP kelas.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a className="btn btn-sm" href={`/tp/${assignmentId}`}>🎯 Atur TP</a>
          <a className="btn btn-sm" href={`/tugas?a=${assignmentId}`}>📝 Kelola Tugas</a>
        </div>
      </div>

      {!ro && (
        <div className="card">
          <div className="card-head"><h2>➕ Tambah Materi Baru</h2></div>
          <div className="card-body">
            <form action={createMateri}>
              <input type="hidden" name="assignmentId" value={String(assignmentId)} />
              <div className="field">
                <label className="field-label">Judul Materi</label>
                <input className="input" name="judul" placeholder="mis. Data Pribadi & Identitas Digital" required />
              </div>
              <div className="form-grid two">
                <div className="field">
                  <label className="field-label">Tujuan Pembelajaran (TP) Terkait</label>
                  <select className="input" name="tpId" defaultValue="">
                    <option value="">— Tanpa TP Terikat —</option>
                    {assignment.learningTargets.map((tp) => (
                      <option key={String(tp.id)} value={String(tp.id)}>{tp.code} — {tp.content.slice(0, 50)}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Status Publikasi</label>
                  <select className="input" name="status" defaultValue="TERBIT">
                    <option value="TERBIT">Terbitkan Sekarang (Terlihat Siswa)</option>
                    <option value="DRAF">Draf (Disimpan Dulu)</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="field-label">Isi Materi Pembelajaran</label>
                <textarea className="input" name="body" rows={6} placeholder="Tulis teks materi, rangkuman, atau instruksi belajar…" />
              </div>
              <button className="btn btn-primary" type="submit">Simpan &amp; Terbitkan Materi</button>
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
            <p className="muted" style={{ marginBottom: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {m.tp && <span className="pill">{m.tp.code}</span>}
              <span>Urutan {m.urutan}</span>
              <span>· Terbit {fmt(m.publishAt)}</span>
              <span className="badge badge-yellow">👁 Dibaca {m._count.reads} / {jmlSiswa} siswa</span>
            </p>
            <p className="prose">{m.body}</p>
            <div style={{ margin: "10px 0" }}>
              {m.files.map((f) => (
                <span key={String(f.id)} style={{ display: "inline-flex", alignItems: "center", gap: 4, marginRight: 8, marginBottom: 6 }}>
                  <a className="filechip" href={`/api/file/${f.id}?k=m`}>📎 {f.nama} ({size(f.sizeBytes)})</a>
                  {!ro && (
                    <DangerSubmit
                      action={deleteMateriFile}
                      hidden={{ id: String(f.id), assignmentId: String(assignmentId) }}
                      confirmText={`Hapus lampiran "${f.nama}"?`}
                      btnClass="btn btn-sm btn-danger"
                    >
                      ✕
                    </DangerSubmit>
                  )}
                </span>
              ))}
            </div>
            {!ro && (
              <div className="row-actions" style={{ marginTop: 12, paddingTop: 10, borderTop: "2px dashed var(--ink)" }}>
                <form action={uploadMateriFile} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <input type="hidden" name="assignmentId" value={String(assignmentId)} />
                  <input type="hidden" name="materialId" value={String(m.id)} />
                  <input className="input" style={{ width: "auto", minWidth: 220 }} type="file" name="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" required />
                  <button className="btn btn-sm btn-primary" type="submit">+ Unggah Berkas</button>
                </form>
                <details style={{ width: "100%", marginTop: 8 }}>
                  <summary className="btn btn-sm" style={{ cursor: "pointer", display: "inline-flex" }}>✏️ Ubah Materi</summary>
                  <form action={updateMateri} style={{ marginTop: 12, maxWidth: 640 }}>
                    <input type="hidden" name="id" value={String(m.id)} />
                    <input type="hidden" name="assignmentId" value={String(assignmentId)} />
                    <div className="field">
                      <label className="field-label">Judul Materi</label>
                      <input className="input" name="judul" defaultValue={m.judul} required />
                    </div>
                    <div className="form-grid two">
                      <div className="field">
                        <label className="field-label">TP Terkait</label>
                        <select className="input" name="tpId" defaultValue={m.tpId ? String(m.tpId) : ""}>
                          <option value="">— Tanpa TP —</option>
                          {assignment.learningTargets.map((tp) => (
                            <option key={String(tp.id)} value={String(tp.id)}>{tp.code}</option>
                          ))}
                        </select>
                      </div>
                      <div className="field">
                        <label className="field-label">Status</label>
                        <select className="input" name="status" defaultValue={m.status}>
                          <option value="TERBIT">TERBIT</option>
                          <option value="DRAF">DRAF</option>
                        </select>
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label">Isi Materi</label>
                      <textarea className="input" name="body" rows={6} defaultValue={m.body} />
                    </div>
                    <button className="btn btn-sm btn-primary" type="submit">Perbarui Materi</button>
                  </form>
                </details>
                <DangerSubmit
                  action={deleteMateri}
                  hidden={{ id: String(m.id), assignmentId: String(assignmentId) }}
                  confirmText={`Hapus materi "${m.judul}"?`}
                >
                  🗑 Hapus Materi
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
