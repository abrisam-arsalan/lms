import type { Role } from "@prisma/client";

// Navigasi bawah mobile per peran — pola & ikon mengikuti ui.ts Presensi
// (🏠 beranda, 📖 materi, dst.) agar siswa/guru merasa satu aplikasi.
export interface NavItem {
  href: string;
  icon: string;
  label: string;
}

export const NAV: Record<Role, NavItem[]> = {
  ADMIN: [
    { href: "/dashboard", icon: "🏠", label: "Beranda" },
    { href: "/admin/users", icon: "👥", label: "Akun" },
    { href: "/admin/master", icon: "🗂", label: "Master" },
    { href: "/admin/import", icon: "📥", label: "Import" },
    { href: "/jadwal", icon: "🗓️", label: "Jadwal" },
    { href: "/pengumuman", icon: "📢", label: "Pengumuman" },
  ],
  KEPSEK: [
    { href: "/dashboard", icon: "🏠", label: "Beranda" },
    { href: "/nilai", icon: "📊", label: "Rekap Nilai" },
    { href: "/jadwal", icon: "🗓️", label: "Jadwal" },
  ],
  GURU: [
    { href: "/dashboard", icon: "🏠", label: "Beranda" },
    { href: "/tp", icon: "🎯", label: "TP" },
    { href: "/materi", icon: "📖", label: "Materi" },
    { href: "/tugas", icon: "📝", label: "Tugas" },
    { href: "/nilai", icon: "📊", label: "Nilai" },
    { href: "/jadwal", icon: "🗓️", label: "Jadwal" },
  ],
  SISWA: [
    { href: "/dashboard", icon: "🏠", label: "Beranda" },
    { href: "/materi", icon: "📖", label: "Materi" },
    { href: "/tugas", icon: "📝", label: "Tugas" },
    { href: "/nilai", icon: "📊", label: "Nilai" },
    { href: "/jadwal", icon: "🗓️", label: "Jadwal" },
  ],
  ORTU: [
    { href: "/dashboard", icon: "🏠", label: "Beranda" },
    { href: "/materi", icon: "📖", label: "Materi" },
    { href: "/nilai", icon: "📊", label: "Nilai" },
  ],
};

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase();
}
