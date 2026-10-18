"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createHandoffCode } from "@/lib/handoff";

export async function launchCbt() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const cbtBaseUrl = process.env.CBT_BASE_URL ?? "http://localhost:8000";
  const isStaff = user.role === "ADMIN" || user.role === "GURU" || user.role === "KEPSEK";
  redirect(isStaff ? `${cbtBaseUrl}/admin/login` : `${cbtBaseUrl}/login`);
}
