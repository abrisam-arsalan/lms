import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/app-shell";

export const dynamic = "force-dynamic";

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "badge-red",
  GURU: "badge-blue",
  SISWA: "badge-green",
  ORTU: "badge-yellow",
  KEPSEK: "badge-neutral",
};
const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin", GURU: "Guru", SISWA: "Siswa", ORTU: "Orang tua", KEPSEK: "Kepsek",
};

export default async function AdminUsersPage() {
  const user = await requireRole(["ADMIN"]);

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
    <AppShell user={user} active="/admin/users">
      <div className="page-head">
        <h1>Kelola Akun</h1>
        <p>
          Pemetaan identitas asal:{" "}
          {idents.map((i) => `${i.app}=${i._count._all}`).join(" · ") || "belum ada bootstrap migrasi"}{" "}
          · tampil 200 teratas.
        </p>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="table">
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
                  <td><span className={`badge ${ROLE_BADGE[u.role] ?? "badge-neutral"}`}>{ROLE_LABEL[u.role]}</span></td>
                  <td>{u.isActive ? "✔" : "✘"}</td>
                  <td className="muted">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("id-ID") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
