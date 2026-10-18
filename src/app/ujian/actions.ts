"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { broadcastNewCbtExams, syncStudentsToCbt } from "@/lib/cbt-sync";

export async function launchCbt() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const cbtBaseUrl = process.env.CBT_BASE_URL ?? "http://localhost:8000";
  const isStaff = user.role === "ADMIN" || user.role === "GURU" || user.role === "KEPSEK";
  redirect(isStaff ? `${cbtBaseUrl}/admin/login` : `${cbtBaseUrl}/login`);
}

export async function broadcastExamsAction() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "GURU")) redirect("/login");

  await broadcastNewCbtExams();
  revalidatePath("/ujian");
  revalidatePath("/dashboard");
  revalidatePath("/pengumuman");
  revalidatePath("/notifikasi");
}

export async function syncStudentsAction() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  await syncStudentsToCbt();
  revalidatePath("/ujian");
  revalidatePath("/admin/ujian");
}
