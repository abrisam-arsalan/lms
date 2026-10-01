import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Role, User } from "@prisma/client";

export const SESSION_COOKIE = "lms_session"; // PRD §2A B4 — nama host-only, anti-bentrok
const SESSION_TTL_DAYS = 30;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/** Cocokkan password — kompatibel dgn hash lama Laravel ($2y$, CBT) & Bun (presensi). */
export async function verifyCredentials(
  username: string,
  password: string
): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, nama: true, passwordHash: true, role: true, isActive: true, deletedAt: true },
  });
  if (!user || !user.isActive || user.deletedAt) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? (user as User) : null;
}

export async function startSession(userId: bigint, ip?: string | null): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // HTTPS via Cloudflare Tunnel
    path: "/",
    maxAge: SESSION_TTL_DAYS * 86_400,
  });
  void ip;
}

export async function getSessionUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
    return null;
  }
  const u = session.user;
  if (!u.isActive || u.deletedAt) return null;
  return u;
}

/** Wajib login (server component / handler). */
export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/** Wajib peran tertentu. */
export async function requireRole(roles: Role[]): Promise<User> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
    jar.delete(SESSION_COOKIE);
  }
}

export async function logAudit(params: {
  userId?: bigint | null;
  action: string;
  entity: string;
  entityId?: string;
  detail?: unknown;
  ip?: string | null;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        // Json field: valid JSON string → simpan sebagai objek
        detail: (params.detail ?? undefined) as object | undefined,
        ip: params.ip ?? null,
      },
    });
  } catch (e) {
    console.error("audit log gagal:", e); // audit jangan sampai menjatuhkan request
  }
}
