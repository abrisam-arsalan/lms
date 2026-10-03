import { prisma } from "@/lib/prisma";

/** Kirim notifikasi dalam-app ke sekumpulan user (batch, aman utk ribuan). */
export async function notify(userIds: bigint[], kind: string, message: string, link?: string) {
  if (!userIds.length) return;
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, kind, message, link: link ?? null })),
  });
}

export async function siswaIdsOfClass(classId: bigint): Promise<bigint[]> {
  const rows = await prisma.student.findMany({
    where: { classId, user: { isActive: true, deletedAt: null } },
    select: { userId: true },
  });
  return rows.map((r) => r.userId);
}

export async function ortuIdsOfClass(classId: bigint): Promise<bigint[]> {
  const rows = await prisma.linkParentStudent.findMany({
    where: { studentRec: { classId, user: { isActive: true, deletedAt: null } } },
    select: { parentId: true },
  });
  return [...new Set(rows.map((r) => r.parentId))];
}

export async function notifyStudentsOfClass(classId: bigint, kind: string, message: string, link?: string) {
  await notify(await siswaIdsOfClass(classId), kind, message, link);
}

/** utk pengumuman SEMUA — hemat: cukup siswa + ortu */
export async function allSiswaOrtuIds(): Promise<bigint[]> {
  const rows = await prisma.user.findMany({
    where: { role: { in: ["SISWA", "ORTU"] }, isActive: true, deletedAt: null },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

export const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
