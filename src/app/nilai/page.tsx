import { requireUser } from "@/lib/auth";
import AppShell from "@/components/app-shell";
import Soon from "@/components/soon";

export default async function NilaiPage() {
  const user = await requireUser();
  return (
    <AppShell user={user} active="/nilai">
      <Soon title="Tujuan Pembelajaran & Nilai" milestone="M2" note="Matriks siswa × TP, nilai rapor, dan unduh Excel per jenjang." />
    </AppShell>
  );
}
