import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  canManageAssignment, classAssignments, currentSemester,
  studentClassId, childrenOfClassIds, teacherAssignments,
} from "@/lib/academic";
import AppShell from "@/components/app-shell";
import DangerSubmit from "@/components/danger-submit";
import { createTask, deleteTask, addTaskFile, submitTask, gradeSubmission, markDone } from "./actions";

const fmt = (d: Date | null) =>
  d ? new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—";

const ERRP: Record<string, string> = {
  lewat: "Batas akhir sudah lewat — tidak bisa mengumpulkan.",
  kunci: "Tenggat lewat — pengumpulan terkunci, tidak bisa revisi.",
  berkas: "Wajib unggah berkas terlebih dahulu.",
  teks: "Jawaban teks wajib diisi.",
  nilai: "Nilai harus angka 0–100.",
};

export default async function TugasPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; t?: string; err?: string; ok?: string }>;
}) {
  const user = await requireUser();
  const { a, t, err, ok } = await searchParams;
  const ctx = await currentSemester();
  const semesterId = ctx?.semester.id;
  const errMsg = err ? ERRP[err] ?? "Terjadi kesalahan." : null;

  /* ════ GURU / ADMIN ════ */
  if (user.role === "GURU" || user.role === "ADMIN") {
    // — layar koreksi satu tugas —
    if (t) {
      const taskId = BigInt(t);
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          assignment: { include: { subject: true, class: true, teacher: { include: { user: { select: { id: true } } } } } },
          tp: true,
          files: true,
          submissions: {
            include: { student: { select: { nama: true, username: true } }, files: true, grade: true },
            orderBy: { student: { nama: "asc" } },
          },
        },
      });
      if (!task) notFound();
      if (task.assignment.teacher?.user.id !== user.id && user.role !== "ADMIN") redirect(`/tugas?a=${task.assignmentId}`);
      const sudah = new Set(task.submissions.map((s) => String(s.studentId)));
      const belum = await prisma.student.findMany({
        where: { classId: task.assignment.classId, user: { isActive: true, deletedAt: null } },
        include: { user: { select: { nama: true } } },
        orderBy: { user: { nama: "asc" } },
      });

      return (
        <AppShell user={user} active="/tugas">
          <div className="page-head">
            <h1>{task.judul}</h1>
            <p>
              {task.assignment.class.name} · {task.assignment.subject.name} — tenggat {fmt(task.dueAt)}
              {task.lateUntil && ` (toleransi s/d ${fmt(task.lateUntil)})`}
              {task.tp && <> · <span className="pill">{task.tp.code}</span></>}
            </p>
            {errMsg && <p className="error">{errMsg}</p>}
          </div>

          <div className="card">
            <div className="card-body">
              <p className="prose">{task.instruksi}</p>
              <div style={{ marginTop: 8 }}>
                {task.files.map((f) => (
                  <a key={String(f.id)} className="filechip" href={`/api/file/${f.id}?k=t`}>📎 {f.nama}</a>
                ))}
              </div>
              <form action={addTaskFile} style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <input type="hidden" name="assignmentId" value={String(task.assignmentId)} />
                <input type="hidden" name="taskId" value={String(task.id)} />
                <input className="input" style={{ width: "auto", minWidth: 220 }} type="file" name="file" required />
                <button className="btn btn-sm btn-primary">+ lampiran</button>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Pengumpulan ({task.submissions.length})</h2>
              <span className="badge badge-yellow">Tipe: {task.tipe}</span>
            </div>
            <div className="card-body">
              {task.submissions.length === 0 && <div className="empty">Belum ada yang mengumpulkan.</div>}
              {task.submissions.map((s) => (
                <div className="list-row" key={String(s.id)}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <b>{s.student.nama}</b>{" "}
                    <span className={`badge ${s.status === "LATE" ? "badge-red" : "badge-green"}`}>
                      {s.status === "LATE" ? "TERLAMBAT" : "TEPAT WAKTU"}
                    </span>
                    <div className="meta">{fmt(s.submittedAt)}{s.revisiCount > 0 && ` · revisi ${s.revisiCount}`}</div>
                    {s.text && <p className="prose" style={{ marginTop: 6, fontSize: 13.5 }}>{s.text.slice(0, 400)}</p>}
                    <div style={{ margin: "6px 0" }}>
                      {s.files.map((f) => (
                        <a key={String(f.id)} className="filechip" href={`/api/file/${f.id}?k=s`}>📎 {f.nama}</a>
                      ))}
                    </div>
                    <form action={gradeSubmission} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <input type="hidden" name="submissionId" value={String(s.id)} />
                      <input className="input" style={{ width: 90 }} type="number" name="score" min={0} max={100} step={1}
                        defaultValue={s.grade ? Number(s.grade.score).toString() : ""} placeholder="Nilai" required />
                      <input className="input" style={{ width: 220 }} name="feedback" defaultValue={s.grade?.feedback ?? ""} placeholder="Umpan balik (opsional)" />
                      <button className="btn btn-sm btn-primary">{s.grade ? "Perbarui nilai" : "Nilai"}</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {belum.length > 0 && (
            <div className="card">
              <div className="card-head"><h2>Belum mengumpulkan ({belum.length})</h2></div>
              <div className="card-body">
                {belum.filter((b) => !sudah.has(String(b.userId))).map((b) => (
                  <span key={String(b.id)} className="pill" style={{ margin: "2px 4px 2px 0", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {b.user.nama}
                    <form action={markDone} style={{ display: "inline" }}>
                      <input type="hidden" name="assignmentId" value={String(task.assignmentId)} />
                      <input type="hidden" name="taskId" value={String(task.id)} />
                      <input type="hidden" name="studentId" value={String(b.userId)} />
                      <button className="btn btn-sm" style={{ minHeight: 22, padding: "1px 8px" }} title="Tandai sudah mengerjakan (kerja buku)">✔</button>
                    </form>
                  </span>
                ))}
              </div>
            </div>
          )}
        </AppShell>
      );
    }

    // — pilih assignment —
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
        <AppShell user={user} active="/tugas">
          <div className="page-head">
            <h1>Tugas 📝</h1>
            <p>Pilih rombel × mapel untuk membuat & mengoreksi tugas.</p>
          </div>
          {assigns.length === 0 && <div className="empty">Belum ada penugasan semester ini.</div>}
          {assigns.map((x) => (
            <a className="card" key={String(x.id)} href={`/tugas?a=${x.id}`}>
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

    // — kelola tugas satu assignment —
    const assignmentId = BigInt(a);
    if (!(await canManageAssignment(user, assignmentId))) redirect("/tugas");
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        subject: true, class: true,
        learningTargets: { orderBy: { urutan: "asc" } },
        tasks: {
          where: { deletedAt: null },
          include: { _count: { select: { submissions: true } }, tp: true },
          orderBy: { dueAt: "desc" },
        },
      },
    });
    if (!assignment) notFound();

    return (
      <AppShell user={user} active="/tugas">
        <div className="page-head">
          <h1>Tugas — {assignment.class.name} · {assignment.subject.name}</h1>
          <p><a href={`/tp/${assignmentId}`}>🎯 TP</a> · <a href={`/materi?a=${assignmentId}`}>📖 Materi</a></p>
          {err === "1" && <p className="error">Judul tugas wajib diisi.</p>}
        </div>

        <div className="card">
          <div className="card-head"><h2>➕ Tugas baru</h2></div>
          <div className="card-body">
            <form action={createTask}>
              <input type="hidden" name="assignmentId" value={String(assignmentId)} />
              <div className="field">
                <label className="field-label">Judul</label>
                <input className="input" name="judul" placeholder="mis. Latihan 1 — Perlindungan Data" required />
              </div>
              <div className="field">
                <label className="field-label">Instruksi</label>
                <textarea className="input" name="instruksi" rows={3} placeholder="Apa yang harus dikerjakan & dikumpulkan…" />
              </div>
              <div className="form-grid two">
                <div className="field">
                  <label className="field-label">Cara mengumpulkan</label>
                  <select className="input" name="tipe" defaultValue="FILE">
                    <option value="FILE">Unggah berkas (foto/PDF)</option>
                    <option value="TEKS">Ketik jawaban</option>
                    <option value="CENTANG">Sudah dikerjakan di buku (guru centang)</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">TP terkait</label>
                  <select className="input" name="tpId" defaultValue="">
                    <option value="">— tanpa TP —</option>
                    {assignment.learningTargets.map((tp) => (
                      <option key={String(tp.id)} value={String(tp.id)}>{tp.code}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Tenggat</label>
                  <input className="input" type="datetime-local" name="dueAt" />
                </div>
                <div className="field">
                  <label className="field-label">Toleransi terlambat s/d</label>
                  <input className="input" type="datetime-local" name="lateUntil" />
                </div>
              </div>
              <div className="row-actions">
                <button className="btn btn-primary" name="status" value="TERBIT" type="submit">Simpan & terbitkan</button>
                <button className="btn" name="status" value="DRAF" type="submit">Simpan sebagai draf</button>
              </div>
            </form>
          </div>
        </div>

        {assignment.tasks.map((tk) => (
          <div className="list-row" key={String(tk.id)}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <a href={`/tugas?t=${tk.id}`}><b>{tk.judul}</b></a>
              {tk.tp && <> <span className="pill">{tk.tp.code}</span></>}
              <div className="meta">
                {tk._count.submissions} terkumpul · tenggat {fmt(tk.dueAt)} ·{" "}
                <span className={`badge ${tk.status === "TERBIT" ? "badge-green" : "badge-neutral"}`}>{tk.status}</span>
              </div>
            </div>
            <DangerSubmit
              action={deleteTask}
              hidden={{ id: String(tk.id), assignmentId: String(assignmentId) }}
              confirmText={`Hapus tugas "${tk.judul}" beserta pengumpulannya?`}
            >
              🗑
            </DangerSubmit>
          </div>
        ))}
        {assignment.tasks.length === 0 && <div className="empty">Belum ada tugas di rombel ini.</div>}
      </AppShell>
    );
  }

  /* ════ SISWA / ORTU (ortu: baca saja utk anak pertama) ════ */
  let siswaUserId = user.id;
  if (user.role === "ORTU") {
    const anak = await prisma.linkParentStudent.findFirst({
      where: { parentId: user.id },
      include: { studentRec: { include: { user: { select: { id: true } } } } },
    });
    if (!anak) {
      return (
        <AppShell user={user} active="/tugas">
          <div className="empty">Belum ada data anak terhubung — hubungi admin.</div>
        </AppShell>
      );
    }
    siswaUserId = anak.studentRec.user.id;
  }
  const clsId = await studentClassId(siswaUserId);
  const assigns = clsId ? await classAssignments([clsId], semesterId) : [];

  if (t) {
    const task = await prisma.task.findUnique({
      where: { id: BigInt(t) },
      include: {
        assignment: { include: { subject: true, class: true } },
        tp: true,
        files: true,
        submissions: { where: { studentId: siswaUserId }, include: { files: true, grade: true } },
      },
    });
    if (!task || task.status !== "TERBIT") notFound();
    const sub = task.submissions[0];
    const now = new Date();
    const open = !task.dueAt || now <= (task.lateUntil ?? task.dueAt);
    const bolehRevisi = !!sub && !!task.dueAt && now <= task.dueAt;

    return (
      <AppShell user={user} active="/tugas">
        <div className="page-head">
          <h1>{task.judul}</h1>
          <p>{task.assignment.class.name} · {task.assignment.subject.name} — tenggat {fmt(task.dueAt)}{task.lateUntil && ` (akhir ${fmt(task.lateUntil)})`}</p>
          {errMsg && <p className="error">{errMsg}</p>}
          {ok && <p className="badge badge-green">✔ Pengumpulan tersimpan</p>}
        </div>

        <div className="card">
          <div className="card-body">
            <p className="prose">{task.instruksi}</p>
            {task.files.map((f) => (
              <a key={String(f.id)} className="filechip" href={`/api/file/${f.id}?k=t`} style={{ marginTop: 6 }}>📎 {f.nama}</a>
            ))}
          </div>
        </div>

        {user.role === "SISWA" && (!sub || bolehRevisi) && open ? (
          <div className="card">
            <div className="card-head"><h2>{sub ? "✏️ Revisi pengumpulan" : "Kumpulkan tugas"}</h2></div>
            <div className="card-body">
              <form action={submitTask} encType="multipart/form-data">
                <input type="hidden" name="taskId" value={String(task.id)} />
                {(task.tipe === "TEKS" || task.tipe === "CENTANG") && (
                  <div className="field">
                    <label className="field-label">{task.tipe === "TEKS" ? "Jawaban" : "Catatan (opsional)"}</label>
                    <textarea className="input" name="text" rows={5} defaultValue={sub?.text ?? ""} required={task.tipe === "TEKS"} />
                  </div>
                )}
                {task.tipe === "FILE" && (
                  <div className="field">
                    <label className="field-label">Berkas (maks 3; foto/PDF — kompres dulu, hemat kuota 🙏)</label>
                    <input className="input" type="file" name="files" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx" required={!sub} />
                  </div>
                )}
                <button className="btn btn-primary" type="submit">{sub ? "Simpan revisi" : "Kirim"}</button>
              </form>
            </div>
          </div>
        ) : task.tipe === "CENTANG" && !sub ? (
          <div className="empty">Tugas dikerjakan di buku tulis — guru yang menandai & menilai.</div>
        ) : (
          <div className="card">
            <div className="card-head">
              <h2>Pengumpulanmu</h2>
              <span className={`badge ${sub?.status === "LATE" ? "badge-red" : "badge-green"}`}>
                {sub?.status === "LATE" ? "TERLAMBAT" : "TEPAT WAKTU"}
              </span>
            </div>
            <div className="card-body">
              <p className="muted">{fmt(sub?.submittedAt ?? null)}{sub && sub.revisiCount > 0 && ` · revisi ke-${sub.revisiCount}`}</p>
              {sub?.text && <p className="prose">{sub.text}</p>}
              {sub?.files.map((f) => (
                <a key={String(f.id)} className="filechip" href={`/api/file/${f.id}?k=s`}>📎 {f.nama}</a>
              ))}
              {sub?.grade ? (
                <div className="list-row warn" style={{ marginTop: 10 }}>
                  <div>
                    <b>Nilai: {Number(sub.grade.score)}</b> / 100
                    {sub.grade.feedback && <div className="meta">💬 {sub.grade.feedback}</div>}
                  </div>
                </div>
              ) : (
                <p className="muted" style={{ marginTop: 8 }}>Nilai belum dikeluarkan guru.</p>
              )}
            </div>
          </div>
        )}
      </AppShell>
    );
  }

  const tasks = await prisma.task.findMany({
    where: {
      assignmentId: { in: assigns.map((x) => x.id) },
      status: "TERBIT",
      deletedAt: null,
      OR: [{ publishAt: null }, { publishAt: { lte: new Date() } }],
    },
    include: {
      assignment: { include: { subject: true, class: true } },
      tp: true,
      submissions: { where: { studentId: siswaUserId }, include: { grade: true } },
    },
    orderBy: { dueAt: "desc" },
  });

  return (
    <AppShell user={user} active="/tugas">
      <div className="page-head">
        <h1>Tugas 📝</h1>
        <p>{user.role === "SISWA" ? "Tugasmu semester ini." : `Tugas ${tasks.some((x) => x.submissions[0]) ? "anak" : "anak"} semester ini (baca saja).`}</p>
      </div>
      {tasks.length === 0 && <div className="empty">Belum ada tugas.</div>}
      {tasks.map((tk) => {
        const sub = tk.submissions[0];
        const nilai = sub?.grade ? Number(sub.grade.score) : null;
        return (
          <a className="card" key={String(tk.id)} href={user.role === "SISWA" ? `/tugas?t=${tk.id}` : "#"} style={user.role !== "SISWA" ? { pointerEvents: "none" } : undefined}>
            <div className="card-body">
              <h2>{tk.judul}</h2>
              <div className="muted" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 2 }}>
                <span className="badge badge-blue">{tk.assignment.class.name} · {tk.assignment.subject.name}</span>
                {tk.tp && <span className="pill">{tk.tp.code}</span>}
                <span>tenggat {fmt(tk.dueAt)}</span>
                {sub ? (nilai !== null ? <span className="badge badge-green">nilai {nilai}</span> : <span className="badge badge-yellow">terkumpul</span>) : <span className="badge badge-red">belum</span>}
              </div>
            </div>
          </a>
        );
      })}
    </AppShell>
  );
}
