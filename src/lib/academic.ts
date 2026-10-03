import { prisma } from "@/lib/prisma";
import type { Role, User } from "@prisma/client";

/** Tahun ajaran aktif + semester (dari env SCHOOL_SEMESTER_NUMBER). */
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

/** Rombel×mapel yang diajar guru ini semester aktif. */
export async function teacherAssignments(userId: bigint, semesterId?: bigint) {
  return prisma.assignment.findMany({
    where: { teacher: { userId }, ...(semesterId ? { semesterId } : {}) },
    include: { subject: true, class: true, teacher: { include: { user: { select: { nama: true } } } } },
    orderBy: [{ class: { name: "asc" } }, { subject: { name: "asc" } }],
  });
}

/** Rombel milik siswa (lewat student record); null utk peran lain. */
export async function studentClassId(userId: bigint) {
  const s = await prisma.student.findUnique({ where: { userId }, select: { classId: true } });
  return s?.classId ?? null;
}

/** Anak-anak utk akun ortu. */
export async function childrenOfClassIds(userId: bigint) {
  const links = await prisma.linkParentStudent.findMany({
    where: { parentId: userId },
    include: { studentRec: { select: { classId: true } } },
  });
  return links.map((l) => l.studentRec.classId).filter((c): c is bigint => c !== null);
}

/** Assignment yg boleh dilihat user pada kelas2 tsb (siswa/ortu). */
export async function classAssignments(classIds: bigint[], semesterId?: bigint) {
  if (!classIds.length) return [];
  return prisma.assignment.findMany({
    where: { classId: { in: classIds }, ...(semesterId ? { semesterId } : {}) },
    include: { subject: true, class: true, teacher: { include: { user: { select: { nama: true } } } } },
    orderBy: [{ class: { name: "asc" } }, { subject: { name: "asc" } }],
  });
}

/** Cek kepemilikan assignment utk aksi guru; admin selalu boleh. */
export async function canManageAssignment(user: User, assignmentId: bigint): Promise<boolean> {
  if (user.role === "ADMIN") return true;
  if (user.role !== "GURU") return false;
  const a = await prisma.assignment.findFirst({
    where: { id: assignmentId, teacher: { userId: user.id } },
    select: { id: true },
  });
  return !!a;
}
