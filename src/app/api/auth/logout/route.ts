import { NextResponse } from "next/server";
import { endSession, getSessionUser, logAudit } from "@/lib/auth";

export async function POST() {
  const user = await getSessionUser();
  await endSession();
  if (user) {
    await logAudit({ userId: user.id, action: "LOGOUT", entity: "users", entityId: String(user.id) });
  }
  return NextResponse.json({ ok: true });
}
