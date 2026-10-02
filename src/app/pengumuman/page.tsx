import { requireUser } from "@/lib/auth";
import AppShell from "@/components/app-shell";
import Soon from "@/components/soon";

export default async function PengumumanPage() {
  const user = await requireUser();
  return (
    <AppShell user={user} active="/pengumuman">
      <Soon title="Pengumuman" milestone="M3" note="Informasi sekolah (dipindah dari Presensi) + notifikasi." />
    </AppShell>
  );
}
