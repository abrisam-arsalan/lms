import { requireUser } from "@/lib/auth";
import AppShell from "@/components/app-shell";
import Soon from "@/components/soon";

export default async function JadwalPage() {
  const user = await requireUser();
  return (
    <AppShell user={user} active="/jadwal">
      <Soon title="Jadwal" milestone="M3" note="Jadwal hari ini & minggu ini per rombel (diimpor dari Presensi)." />
    </AppShell>
  );
}
