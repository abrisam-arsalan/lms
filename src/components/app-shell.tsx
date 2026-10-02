import type { User } from "@prisma/client";
import { NAV, initials } from "@/lib/nav";
import LogoutButton from "./logout-button";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin / TU",
  GURU: "Guru",
  SISWA: "Siswa",
  ORTU: "Orang tua",
  KEPSEK: "Kepala sekolah",
};

/**
 * Kerangka halaman selaras Presensi: topbar (brand + avatar + keluar),
 * konten, dan bottom-nav mobile per peran. `active` = href rute saat ini.
 */
export default function AppShell({
  user,
  active,
  children,
}: {
  user: User;
  active: string;
  children: React.ReactNode;
}) {
  const nav = NAV[user.role] ?? [];
  const isAdmin = user.role === "ADMIN";

  return (
    <>
      <header className="topbar">
        <a className="brand" href="/dashboard">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-logo" src="/assets/logo.png" alt="Logo" />
          <span className="brand-text">
            LMS<small>SMPN 5 Tegal</small>
          </span>
        </a>
        <div className="topbar-right">
          <span className="userchip">
            <span className="avatar">{initials(user.nama)}</span>
            <span className="user-meta">
              <b>{user.nama}</b>
              <small>{ROLE_LABEL[user.role] ?? user.role}</small>
            </span>
          </span>
          <LogoutButton />
        </div>
      </header>

      <div className={`layout${isAdmin ? " layout-admin" : ""}`}>
        {isAdmin ? (
          <aside className="sidebar">
            <nav className="side-nav">
              {nav.map((n) => (
                <a key={n.href} className={`side-item ${active === n.href ? "active" : ""}`} href={n.href}>
                  <span className="ico">{n.icon}</span>
                  <span>{n.label}</span>
                </a>
              ))}
            </nav>
          </aside>
        ) : null}
        <main className="content">{children}</main>
      </div>

      {!isAdmin ? (
        <nav className="bottomnav">
          {nav.map((n) => (
            <a key={n.href} className={`bn-item ${active === n.href ? "active" : ""}`} href={n.href}>
              <span className="ico">{n.icon}</span>
              <span>{n.label}</span>
            </a>
          ))}
        </nav>
      ) : null}
    </>
  );
}
