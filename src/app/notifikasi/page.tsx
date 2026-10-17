import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/app-shell";
import { markRead, markAll } from "./actions";

export default async function NotifikasiPage() {
  const user = await requireUser();
  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 80,
  });
  const unread = rows.filter((r) => !r.readAt).length;

  return (
    <AppShell user={user} active="/notifikasi">
      <div className="breadcrumb">
        <a href="/dashboard">Beranda</a>
        <span className="sep">&gt;</span>
        <span className="current">Notifikasi</span>
      </div>
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Pemberitahuan &amp; Notifikasi 🔔</h1>
          <p className="muted">{unread ? `${unread} notifikasi belum dibaca` : "Semua notifikasi telah dibaca."}</p>
        </div>
        {unread > 0 && (
          <form action={markAll}>
            <button className="btn btn-sm btn-primary">✓ Tandai Semua Dibaca</button>
          </form>
        )}
      </div>
      {rows.map((n) => (
        <div key={String(n.id)} className="list-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...(n.readAt ? { opacity: 0.6 } : { borderLeft: "6px solid var(--teal)" }) }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            {n.link ? <a href={n.link} style={{ textDecoration: "none" }}><b style={{ fontSize: 15 }}>{n.message}</b></a> : <b style={{ fontSize: 15 }}>{n.message}</b>}
            <div className="meta" style={{ marginTop: 4 }}>{new Date(n.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</div>
          </div>
          {!n.readAt && (
            <form action={markRead}>
              <input type="hidden" name="id" value={String(n.id)} />
              <button className="btn btn-sm btn-primary" title="Tandai sudah dibaca">✓ Selesai</button>
            </form>
          )}
        </div>
      ))}
      {!rows.length && <div className="empty">Belum ada notifikasi baru untuk akun Anda.</div>}
    </AppShell>
  );
}
