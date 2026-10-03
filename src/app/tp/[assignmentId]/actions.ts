"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser, logAudit } from "@/lib/auth";
import { canManageAssignment } from "@/lib/academic";

async function guardEdit(assignmentId: bigint) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!(await canManageAssignment(user, assignmentId))) {
    throw new Error("Bukan rombel/mapel-mu");
  }
  return user;
}

export async function createTp(formData: FormData) {
  const assignmentId = BigInt(String(formData.get("assignmentId") ?? "0"));
  const code = String(formData.get("code") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const user = await guardEdit(assignmentId);
  if (!code || !content) redirect(`/tp/${assignmentId}?err=1`);

  const max = await prisma.learningTarget.aggregate({
    where: { assignmentId },
    _max: { urutan: true },
  });
  await prisma.learningTarget.create({
    data: { assignmentId, code, content, urutan: (max._max.urutan ?? 0) + 1 },
  });
  await logAudit({ userId: user.id, action: "TP_BAU", entity: "learning_targets", entityId: code });
  revalidatePath(`/tp/${assignmentId}`);
  redirect(`/tp/${assignmentId}`);
}

export async function updateTp(formData: FormData) {
  const id = BigInt(String(formData.get("id") ?? "0"));
  const assignmentId = BigInt(String(formData.get("assignmentId") ?? "0"));
  const code = String(formData.get("code") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const urutan = Math.max(0, Number(formData.get("urutan") ?? 0) || 0);
  const user = await guardEdit(assignmentId);
  if (!code || !content) redirect(`/tp/${assignmentId}?err=1`);

  const tp = await prisma.learningTarget.findUnique({ where: { id } });
  if (!tp || tp.assignmentId !== assignmentId) redirect(`/tp/${assignmentId}`);
  await prisma.learningTarget.update({ where: { id }, data: { code, content, urutan } });
  await logAudit({
    userId: user.id, action: "TP_UBAH", entity: "learning_targets", entityId: String(id),
    detail: { lama: tp.code, baru: code },
  });
  revalidatePath(`/tp/${assignmentId}`);
  redirect(`/tp/${assignmentId}`);
}

export async function deleteTp(formData: FormData) {
  const id = BigInt(String(formData.get("id") ?? "0"));
  const assignmentId = BigInt(String(formData.get("assignmentId") ?? "0"));
  const user = await guardEdit(assignmentId);
  await prisma.learningTarget.deleteMany({ where: { id, assignmentId } });
  await logAudit({ userId: user.id, action: "TP_HAPUS", entity: "learning_targets", entityId: String(id) });
  revalidatePath(`/tp/${assignmentId}`);
}
