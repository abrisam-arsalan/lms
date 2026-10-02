import { requireUser } from "@/lib/auth";
import AppShell from "@/components/app-shell";
import Soon from "@/components/soon";

export default async function TugasPage() {
  const user = await requireUser();
  return (
    <AppShell user={user} active="/tugas">
      <Soon title="Tugas" milestone="M1" note="Kumpulkan tugas (file/teks/centang) & lihat nilai + feedback." />
    </AppShell>
  );
}
