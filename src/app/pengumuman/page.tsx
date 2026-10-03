import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentSemester, studentClassId, childrenOfClassIds, teacherAssignments } from "@/lib/academic";
import AppShell from "@/components/app-shell";
import DangerSubmit from "@/components/danger-submit";
import { createAnnouncement, deleteAnnouncement } from "./actions";

export default async function PengumumanPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const user = await requireUser();
  const { err } = await searchParams;

  // kelas yg relevan utk pembacaan
  let myClassIds: bigint[] = [];
  if (user.role === "SISWA") {
    const c = await studentClassId(user.id);
    myClassIds = c ? [c] : [];
  } else if (user.role === "ORTU") {
    myClassIds = await childrenOfClassIds(user.id);
  }

  const items = await prisma.announcement.findMany({
    where: {
      deletedAt: null,
      ...(user.role === "SISWA" || user.role === "ORTU"
        ? { OR: [{ target: "SEMUA" }, ...(myClassIds.length ? [{ classId: { in: myClassIds } }] : [])] }
        : {}),
    },
    include: { class: true, author: { select: { nama: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  // opsi kelas utk pembuat
  let kelasOptions: { id: bigint; name: string }[] = [];
  if (user.role === "ADMIN") {
    const ctx = await currentSemester();
    const cls = await prisma.class.findMany({
      where: { ...(ctx ? { academicYearId: ctx.year.id } : {}) },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    kelasOptions = cls;
  } else if (user.role === "GURU") {
    const ctx = await currentSemester();
    const my = await teacherAssignments(user.id, ctx?.semester.id);
    const seen = new Map<bigint, string>();
    for (const m of my) seen.set(m.classId, m.class.name);
    // + rombel yg ia wali
    const wali = await prisma.class.findMany({ where: { homeroomUserId: user.id }, select: { id: true, name: true } });
    for (const w of wali) seen.set(w.id, w.name);
    kelasOptions = [...seen.entries()].map(([id, name]) => ({ id, name }));
  }

  const canPost = ["ADMIN", "GURU"].includes(user.role);

  return (
    <AppShell user={user} active="/pengumuman">
      <div className="page-head">
        <h1>Pengumuman 📢</h1>
        <p>{user.role === "SISWA" || user.role === "ORTU" ? "Informasi sekolah & kelasmu." : "Pengumuman dipindah dari aplikasi Presensi ke sini."}</p>
      </div>

      {canPost && (
        <div className="card">
          <div className="card-head"><h2>➕ Buat pengumuman</h2></div>
          <div className="card-body">
            {err && <p className="error">Judul & isi wajib diisi.</p>}
            <form action={createAnnouncement}>
              <div className="field">
                <label className="field-label">Judul</label>
                <input className="input" name="judul" placeholder="mis. Jadwal Tengah Semester" required />
              </div>
              <div className="field">
                <label className="field-label">Isi</label>
                <textarea className="input" name="isi" rows={4} required />
              </div>
              <div className="field" style={{ maxWidth: 300 }}>
                <label className="field-label">
                  Sasaran {user.role === "GURU" ? "(guru: pilih rombel binaanmu)" : ""}
                </label>
                <select className="input" name="classId" defaultValue={user.role === "GURU" ? "" : "0"}>
                  {user.role === "ADMIN" && <option value="0">📣 Seluruh sekolah</option>}
                  {user.role === "GURU" && <option value="">— pilih rombel —</option>}
                  {kelasOptions.map((k) => (
                    <option key={String(k.id)} value={String(k.id)}>Kelas {k.name}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" type="submit">Publikasikan + kabari siswa/ortu</button>
            </form>
          </div>
        </div>
      )}

      {items.map((p) => (
        <div className="card" key={String(p.id)}>
          <div className="card-head">
            <h2>{p.judul}</h2>
            <span className={`badge ${p.target === "SEMUA" ? "badge-yellow" : "badge-blue"}`}>
              {p.target === "SEMUA" ? "SEMUA" : p.class?.name ?? "ROMBEL"}
            </span>
          </div>
          <div className="card-body">
            <p className="prose">{p.isi}</p>
            <p className="muted" style={{ marginTop: 8 }}>
              {p.author.nama} · {new Date(p.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            {(user.role === "ADMIN" || p.authorId === user.id) && (
              <div style={{ marginTop: 8 }}>
                <DangerSubmit action={deleteAnnouncement} hidden={{ id: String(p.id) }} confirmText={`Hapus "${p.judul}"?`}>🗑 hapus</DangerSubmit>
              </div>
            )}
          </div>
        </div>
      ))}
      {!items.length && <div className="empty">Belum ada pengumuman.</div>}
    </AppShell>
  );
}
