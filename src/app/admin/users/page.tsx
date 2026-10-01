import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  GURU: "Guru",
  SISWA: "Siswa",
  ORTU: "Orang tua",
  KEPSEK: "Kepsek",
};

export default async function AdminUsersPage() {
  await requireRole(["ADMIN"]);

  const [users, idents] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ role: "asc" }, { nama: "asc" }],
      take: 200,
      select: {
        id: true, username: true, nama: true, nisn: true, role: true,
        isActive: true, lastLoginAt: true,
      },
    }),
    prisma.identity.groupBy({ by: ["app"], _count: { _all: true } }),
  ]);

  return (
    <>
      <div className="topbar">
        <a href="/dashboard" style={{ color: "#fff" }}>← Dashboard</a>
        <strong style={{ marginLeft: "auto" }}>Kelola Akun</strong>
      </div>
      <main>
        <div className="card">
          <p className="muted" style={{ marginBottom: 10 }}>
            Pemetaan identitas asal:{" "}
            {idents.map((i) => `${i.app}=${i._count._all}`).join(" · ") || "belum ada bootstrap migrasi"}{" "}
            · tampil 200 teratas.
          </p>
          <table>
            <thead>
              <tr>
                <th>Username</th><th>Nama</th><th>NISN</th><th>Peran</th><th>Aktif</th><th>Login terakhir</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={String(u.id)}>
                  <td>{u.username}</td>
                  <td>{u.nama}</td>
                  <td>{u.nisn ?? "—"}</td>
                  <td><span className="pill">{ROLE_LABEL[u.role]}</span></td>
                  <td>{u.isActive ? "✔" : "✘"}</td>
                  <td className="muted">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("id-ID") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
