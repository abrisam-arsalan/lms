"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser, logAudit } from "@/lib/auth";

export async function addSchedule(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") throw new Error("Hanya admin");
  const assignmentId = BigInt(String(formData.get("assignmentId") ?? "0"));
  const day = Number(formData.get("day"));
  const start = String(formData.get("start") ?? "").trim();
  const end = String(formData.get("end") ?? "").trim();
  const room = String(formData.get("room") ?? "").trim() || null;
  if (!assignmentId || day < 1 || day > 6 || !/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) {
    redirect(`/jadwal?a=${assignmentId}`);
  }
  const exists = await prisma.schedule.findFirst({ where: { assignmentId, day, start } });
  if (!exists) {
    await prisma.schedule.create({ data: { assignmentId, day, start, end, room } });
    await logAudit({ userId: user.id, action: "JADWAL_TAMBAH", entity: "schedules", entityId: String(assignmentId) });
  }
  revalidatePath("/jadwal");
  redirect(`/jadwal?a=${assignmentId}`);
}

export async function deleteSchedule(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") throw new Error("Hanya admin");
  const id = BigInt(String(formData.get("id") ?? "0"));
  const assignmentId = String(formData.get("assignmentId") ?? "");
  await prisma.schedule.deleteMany({ where: { id } });
  await logAudit({ userId: user.id, action: "JADWAL_HAPUS", entity: "schedules", entityId: String(id) });
  revalidatePath("/jadwal");
  redirect(`/jadwal?a=${assignmentId}`);
}
