import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, startSession, logAudit } from "@/lib/auth";

// Rate-limit sederhana in-memory (per proses): 10 percobaan / 15 menit / IP.
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 10;

function tooMany(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request tidak valid" }, { status: 400 });
  }
  const username = (body.username ?? "").trim();
  const password = body.password ?? "";
  if (!username || !password) {
    return NextResponse.json({ error: "Username & password wajib diisi" }, { status: 400 });
  }
  if (tooMany(ip)) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Tunggu 15 menit." },
      { status: 429 }
    );
  }
  const user = await verifyCredentials(username, password);
  if (!user) {
    await logAudit({ action: "LOGIN_GAGAL", entity: "users", entityId: username, ip });
    return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
  }
  await startSession(user.id, ip);
  await logAudit({ userId: user.id, action: "LOGIN", entity: "users", entityId: String(user.id), ip });
  attempts.delete(ip);
  return NextResponse.json({ ok: true, nama: user.nama, role: user.role });
}
