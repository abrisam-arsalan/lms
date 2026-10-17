import { prisma } from "@/lib/prisma";

export const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export async function createNotification(userId: bigint, kind: string, message: string, link?: string): Promise<void> {
  await prisma.notification.create({ data: { userId, kind, message, link } }).catch(() => {});
}

/** Kirim notifikasi ke semua siswa kelas tertentu beserta orang tuanya. */
export async function notifyClass(classId: bigint, kind: string, message: string, link?: string): Promise<void> {
  const students = await prisma.user.findMany({
    where: { classId, role: "SISWA", isActive: true, deletedAt: null },
    select: { id: true, parentLinksAsAnak: { select: { parentId: true } } },
  });
  const userIds: bigint[] = [];
  for (const s of students) {
    userIds.push(s.id);
    for (const p of s.parentLinksAsAnak) userIds.push(p.parentId);
  }
  if (!userIds.length) return;
  await prisma.notification.createMany({
    data: userIds.map((uid) => ({ userId: uid, kind, message, link })),
    skipDuplicates: true,
  }).catch(() => {});
}
