"use client";

export default function LogoutButton() {
  async function onClick() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }
  return (
    <button className="btn btn-ghost btn-sm" onClick={onClick}>
      Keluar
    </button>
  );
}
