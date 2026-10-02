import { requireUser } from "@/lib/auth";
import AppShell from "@/components/app-shell";
import Soon from "@/components/soon";

export default async function MateriPage() {
  const user = await requireUser();
  return (
    <AppShell user={user} active="/materi">
      <Soon title="Materi" milestone="M1" note="Baca materi & unduh lampiran per rombel, terikat TP." />
    </AppShell>
  );
}
