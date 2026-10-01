"use client";

export default function LogoutButton() {
  async function onClick() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }
  return (
    <button
      className="btn btn-secondary"
      style={{ padding: "6px 12px", fontSize: "0.85rem" }}
      onClick={onClick}
    >
      Keluar
    </button>
  );
}
