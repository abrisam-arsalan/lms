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
      <div className="page-head">
        <h1>Notifikasi 🔔</h1>
        <p>{unread ? `${unread} belum dibaca` : "Semua sudah dibaca."}</p>
        {unread > 0 && (
          <form action={markAll} style={{ marginTop: 8 }}>
            <button className="btn btn-sm">✓ Tandai semua dibaca</button>
          </form>
        )}
      </div>
      {rows.map((n) => (
        <div key={String(n.id)} className="list-row" style={n.readAt ? { opacity: 0.55 } : undefined}>
          <div style={{ flex: 1, minWidth: 220 }}>
            {n.link ? <a href={n.link}><b>{n.message}</b></a> : <b>{n.message}</b>}
            <div className="meta">{new Date(n.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</div>
          </div>
          {!n.readAt && (
            <form action={markRead}>
              <input type="hidden" name="id" value={String(n.id)} />
              <button className="btn btn-sm">✓</button>
            </form>
          )}
        </div>
      ))}
      {!rows.length && <div className="empty">Belum ada notifikasi.</div>}
    </AppShell>
  );
}
