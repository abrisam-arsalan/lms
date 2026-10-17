import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export async function currentSemester() {
  const year =
    (await prisma.academicYear.findFirst({ where: { isActive: true }, orderBy: { id: "desc" } })) ??
    (await prisma.academicYear.findFirst({ orderBy: { id: "desc" } }));
  if (!year) return null;
  const number = Number(process.env.SCHOOL_SEMESTER_NUMBER ?? 1);
  const semester =
    (await prisma.semester.findUnique({ where: { yearId_number: { yearId: year.id, number } } })) ??
    (await prisma.semester.findFirst({ where: { yearId: year.id }, orderBy: { number: "asc" } }));
  return semester ? { year, semester } : null;
}

/** Rombel×mapel yang diajar guru ini (teacherId langsung di Assignment). */
export async function teacherAssignments(userId: bigint, semesterId?: bigint) {
  return prisma.assignment.findMany({
    where: { teacherId: userId, ...(semesterId ? { semesterId } : {}) },
    include: { subject: true, class: true, teacher: true },
    orderBy: [{ class: { name: "asc" } }, { subject: { name: "asc" } }],
  });
}

/** classId siswa dari users.classId langsung. */
export async function studentClassId(userId: bigint): Promise<bigint | null> {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { classId: true } });
  return u?.classId ?? null;
}

/** classId anak untuk akun ortu via parent_links. */
export async function childrenOfClassIds(userId: bigint): Promise<bigint[]> {
  const links = await prisma.parentLink.findMany({
    where: { parentId: userId },
    include: { child: { select: { classId: true } } },
  });
  return links.map((l) => l.child.classId).filter((c): c is bigint => c !== null);
}

/** childUserId dari akun ortu. */
export async function childrenUserIds(userId: bigint): Promise<bigint[]> {
  const links = await prisma.parentLink.findMany({ where: { parentId: userId }, select: { childId: true } });
  return links.map((l) => l.childId);
}

/** Assignment yang bisa dilihat per kelas. */
export async function classAssignments(classIds: bigint[], semesterId?: bigint) {
  if (!classIds.length) return [];
  return prisma.assignment.findMany({
    where: { classId: { in: classIds }, ...(semesterId ? { semesterId } : {}) },
    include: { subject: true, class: true },
    orderBy: [{ class: { name: "asc" } }, { subject: { name: "asc" } }],
  });
}

/** Cek apakah guru bisa kelola assignment ini. */
export async function canManageAssignment(user: User, assignmentId: bigint): Promise<boolean> {
  if (user.role === "ADMIN") return true;
  if (user.role !== "GURU") return false;
  const a = await prisma.assignment.findFirst({ where: { id: assignmentId, teacherId: user.id }, select: { id: true } });
  return !!a;
}

/** Wali kelas: classId yang dia ampu. */
export async function homeroomClassId(userId: bigint): Promise<bigint | null> {
  const cls = await prisma.class.findFirst({ where: { homeroomUserId: userId }, select: { id: true } });
  return cls?.id ?? null;
}
