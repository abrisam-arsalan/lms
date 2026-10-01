"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const next = new URLSearchParams(window.location.search).get("next") || "/dashboard";
        window.location.href = next;
        return;
      }
      setError(data.error ?? "Login gagal");
    } catch {
      setError("Tidak dapat menghubungi server. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, paddingTop: 48 }}>
      <div className="card">
        <h1 style={{ fontSize: "1.2rem", marginBottom: 4 }}>LMS SMPN 5 Tegal</h1>
        <p className="muted" style={{ marginBottom: 12 }}>
          Masuk dengan <strong>NISN</strong> (siswa), <strong>NIP/username</strong> (guru),
          atau username admin.
        </p>
        <form onSubmit={onSubmit}>
          <label htmlFor="username">Username / NISN</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            inputMode="numeric"
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button className="btn" type="submit" disabled={busy} style={{ marginTop: 14, width: "100%" }}>
            {busy ? "Memproses…" : "Masuk"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
      <p className="muted" style={{ textAlign: "center" }}>Lupa password? Hubungi admin / TU sekolah.</p>
    </main>
  );
}
