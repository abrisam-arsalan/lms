import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { updatePin } from "./actions";

export default async function ChangePinPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { err } = await searchParams;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "var(--bg, #FDF6EC)",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          border: "3px solid #141414",
          boxShadow: "6px 6px 0 #141414",
          padding: 24,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ margin: "0 0 8px 0", fontSize: 22, fontWeight: 900 }}>Ganti PIN Wajib 🔐</h1>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            Demi keamanan akun Anda (<b>{user.nama}</b>), silakan buat PIN baru berupa 6 digit angka sebelum melanjutkan.
          </p>
        </div>

        {err === "pin_invalid" && (
          <div className="badge badge-red" style={{ display: "block", marginBottom: 12 }}>
            PIN harus berupa tepat 6 digit angka!
          </div>
        )}

        {err === "pin_mismatch" && (
          <div className="badge badge-red" style={{ display: "block", marginBottom: 12 }}>
            Konfirmasi PIN tidak cocok!
          </div>
        )}

        <form action={updatePin}>
          <div style={{ marginBottom: 12 }}>
            <label className="field-label" style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>
              PIN Baru (6 Digit)
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              name="newPin"
              className="input"
              style={{ width: "100%", letterSpacing: 4, fontSize: 18 }}
              required
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="field-label" style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>
              Ulangi PIN Baru
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              name="confirmPin"
              className="input"
              style={{ width: "100%", letterSpacing: 4, fontSize: 18 }}
              required
            />
          </div>

          <button className="btn btn-primary" style={{ width: "100%", padding: 12, fontSize: 16 }} type="submit">
            Simpan PIN Baru →
          </button>
        </form>
      </div>
    </main>
  );
}
