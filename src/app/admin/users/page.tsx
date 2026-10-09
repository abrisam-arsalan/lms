import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentSemester } from "@/lib/academic";
import AppShell from "@/components/app-shell";
import DangerSubmit from "@/components/danger-submit";
import { addUser, resetPassword, toggleActive, editUser } from "./actions";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin", GURU: "Guru", SISWA: "Siswa", ORTU: "Orang tua", KEPSEK: "Kepsek",
};
const ROLE_BADGE: Record<string, string> = {
  ADMIN: "badge-red", GURU: "badge-blue", SISWA: "badge-green", ORTU: "badge-yellow", KEPSEK: "badge-neutral",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string; q?: string; role?: string }>;
}) {
  const me = await requireRole(["ADMIN"]);
  const { err, q, role } = await searchParams;
  const ctx = await currentSemester();

  const [users, classes, idents] = await Promise.all([
    prisma.user.findMany({
      where: {
        ...(role && ["ADMIN", "GURU", "SISWA", "ORTU", "KEPSEK"].includes(role) ? { role: role as never } : {}),
        ...(q ? { OR: [{ username: { contains: q } }, { nama: { contains: q } }, { nisn: { contains: q } }] } : {}),
      },
      orderBy: [{ role: "asc" }, { nama: "asc" }],
      take: 300,
      include: { student: { include: { class: { select: { name: true } } } } },
    }),
    ctx ? prisma.class.findMany({ where: { academicYearId: ctx.year.id }, orderBy: { name: "asc" } }) : Promise.resolve([]),
    prisma.identity.groupBy({ by: ["app"], _count: { _all: true } }),
  ]);

  return (
    <AppShell user={me} active="/admin/users">
      <div className="page-head">
        <h1>Kelola Akun 👥</h1>
        <p>
          <a href="/admin/master">🗂 Master &amp; assignmen</a> · <a href="/admin/import">📥 Import CSV</a>{" "}
          · identitas asal: {idents.map((i) => `${i.app}=${i._count._all}`).join(" · ") || "—"}
        </p>
        {err && <p className="error">{decodeURIComponent(err)}</p>}
      </div>

      <div className="card">
        <div className="card-head"><h2>➕ Tambah pengguna</h2></div>
        <div className="card-body">
          <form action={addUser}>
            <div className="form-grid two">
              <div className="field"><label className="field-label">Peran</label>
                <select className="input" name="role" defaultValue="SISWA">
                  <option>SISWA</option><option>GURU</option><option>ORTU</option><option>ADMIN</option><option>KEPSEK</option>
                </select></div>
              <div className="field"><label className="field-label">Username (NISN/NIP utk siswa/guru)</label>
                <input className="input" name="username" required maxLength={64} /></div>
              <div className="field"><label className="field-label">Nama lengkap</label>
                <input className="input" name="nama" required /></div>
              <div className="field"><label className="field-label">Password sementara</label>
                <input className="input" name="password" placeholder="Smp5Tegal!2026" /></div>
              <div className="field"><label className="field-label">NIS (siswa, opsional)</label>
                <input className="input" name="nis" /></div>
              <div className="field"><label className="field-label">NISN (siswa, opsional)</label>
                <input className="input" name="nisn" /></div>
              <div className="field"><label className="field-label">NIP (guru, opsional)</label>
                <input className="input" name="nip" /></div>
              <div className="field"><label className="field-label">Rombel (siswa)</label>
                <select className="input" name="classId" defaultValue="">
                  <option value="">— belum ada —</option>
                  {classes.map((k) => <option key={String(k.id)} value={String(k.id)}>{k.name}</option>)}
                </select></div>
              <div className="field"><label className="field-label">NISN anak (khusus peran ORTU)</label>
                <input className="input" name="anakNisn" /></div>
            </div>
            <button className="btn btn-primary" type="submit">Simpan pengguna</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Daftar ({users.length})</h2>
          <form method="get" style={{ display: "flex", gap: 6 }}>
            <input className="input" style={{ width: 180, minHeight: 34 }} name="q" defaultValue={q ?? ""} placeholder="cari nama/nisn…" />
            <select className="input" style={{ width: 120, minHeight: 34 }} name="role" defaultValue={role ?? ""}>
              <option value="">semua peran</option>
              {Object.keys(ROLE_LABEL).map((r) => <option key={r}>{r}</option>)}
            </select>
            <button className="btn btn-sm">↺</button>
          </form>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Username</th><th>Nama</th><th>NISN</th><th>Peran</th><th>Kelas</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={String(u.id)}>
                  <td>{u.username}</td>
                  <td>{u.nama}</td>
                  <td>{u.nisn ?? "—"}</td>
                  <td><span className={`badge ${ROLE_BADGE[u.role]}`}>{ROLE_LABEL[u.role]}</span></td>
                  <td>{u.student?.class?.name ?? "—"}</td>
                  <td>{u.isActive ? <span className="badge badge-green">aktif</span> : <span className="badge badge-red">nonaktif</span>}</td>
                  <td>
                    <div className="row-actions">
                      <details>
                        <summary className="pill" style={{ cursor: "pointer" }}>🔑</summary>
                        <form action={resetPassword} style={{ display: "flex", gap: 6, marginTop: 6 }}>
                          <input type="hidden" name="id" value={String(u.id)} />
                          <input className="input" style={{ width: 150, minHeight: 34 }} name="password" placeholder="password baru" required minLength={6} />
                          <button className="btn btn-sm">reset</button>
                        </form>
                      </details>
                      <details>
                        <summary className="pill" style={{ cursor: "pointer" }}>✏️</summary>
                        <form action={editUser} style={{ marginTop: 6, display: "grid", gap: 6, minWidth: 220 }}>
                          <input type="hidden" name="id" value={String(u.id)} />
                          <input className="input" style={{ minHeight: 34 }} name="nama" defaultValue={u.nama} required />
                          <input className="input" style={{ minHeight: 34 }} name="nis" defaultValue={u.nis ?? ""} placeholder="NIS" />
                          <input className="input" style={{ minHeight: 34 }} name="nisn" defaultValue={u.nisn ?? ""} placeholder="NISN" />
                          <select className="input" style={{ minHeight: 34 }} name="classId" defaultValue={u.student?.classId ? String(u.student.classId) : ""}>
                            <option value="">rombel tetap</option>
                            {classes.map((k) => <option key={String(k.id)} value={String(k.id)}>{k.name}</option>)}
                          </select>
                          <button className="btn btn-sm">simpan</button>
                        </form>
                      </details>
                      <DangerSubmit
                        action={toggleActive}
                        hidden={{ id: String(u.id) }}
                        confirmText={u.isActive ? `Nonaktifkan ${u.username}?` : `Aktifkan kembali ${u.username}?`}
                        btnClass="btn btn-sm"
                      >
                        {u.isActive ? "⏻" : "⏻ aktifkan"}
                      </DangerSubmit>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length >= 300 && <p className="muted card-body">Dibatasi 300 — pakai pencarian.</p>}
      </div>
    </AppShell>
  );
}
