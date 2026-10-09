"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, logAudit } from "@/lib/auth";
import { currentSemester } from "@/lib/academic";

async function guard() {
  const u = await requireUser();
  if (u.role !== "ADMIN") throw new Error("Hanya admin");
  return u;
}

export async function createAssignment(formData: FormData) {
  const admin = await guard();
  const teacherUserId = BigInt(String(formData.get("teacherUserId") ?? "0"));
  const subjectId = BigInt(String(formData.get("subjectId") ?? "0"));
  const classId = BigInt(String(formData.get("classId") ?? "0"));
  const ctx = await currentSemester();
  if (!ctx) redirect("/admin/master?err=Set+tahun+ajaran+aktif+dulu");
  if (!teacherUserId || !subjectId || !classId) redirect("/admin/master?err=Lengkapi+guru%2C+mapel%2C+rombel");

  const teacher = await prisma.teacher.findUnique({ where: { userId: teacherUserId } });
  if (!teacher) redirect("/admin/master?err=Akun+terpilih+belum+berperan+GURU");
  await prisma.assignment.upsert({
    where: { teacherId_subjectId_classId_semesterId: { teacherId: teacher.id, subjectId, classId, semesterId: ctx.semester.id } },
    create: { teacherId: teacher.id, subjectId, classId, semesterId: ctx.semester.id },
    update: {},
  });
  await logAudit({ userId: admin.id, action: "ASSIGN_BAU", entity: "assignments", entityId: `${teacherUserId}|${subjectId}|${classId}` });
  revalidatePath("/admin/master");
}

export async function deleteAssignment(formData: FormData) {
  const admin = await guard();
  const id = BigInt(String(formData.get("id") ?? "0"));
  const counts = await prisma.assignment.findUnique({
    where: { id },
    select: { _count: { select: { materials: true, tasks: true, learningTargets: true, schedules: true } } },
  });
  if (!counts) return;
  const c = counts._count;
  if (c.materials || c.tasks || c.learningTargets || c.schedules) {
    redirect(`/admin/master?err=Assignment%20masih%20dipakai%20(materi%3D${c.materials}%2C%20tugas%3D${c.tasks}%2C%20TP%3D${c.learningTargets}%2C%20jam%3D${c.schedules})`);
  }
  await prisma.assignment.delete({ where: { id } });
  await logAudit({ userId: admin.id, action: "ASSIGN_HAPUS", entity: "assignments", entityId: String(id) });
  revalidatePath("/admin/master");
}

export async function setHomeroom(formData: FormData) {
  const admin = await guard();
  const classId = BigInt(String(formData.get("classId") ?? "0"));
  const userId = BigInt(String(formData.get("homeroomUserId") ?? "0")) || null;
  if (!classId) return;
  await prisma.class.update({ where: { id: classId }, data: { homeroomUserId: userId } });
  await logAudit({ userId: admin.id, action: "WALI_SET", entity: "classes", entityId: String(classId), detail: { guru: userId?.toString() ?? null } });
  revalidatePath("/admin/master");
}

export async function addSubject(formData: FormData) {
  const admin = await guard();
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const code = String(formData.get("code") ?? "").trim().slice(0, 16) || null;
  if (!name) redirect("/admin/master?err=Nama+mapel+wajib");
  await prisma.subject.upsert({ where: { name }, create: { name, code }, update: { code: code ?? undefined } });
  await logAudit({ userId: admin.id, action: "MAPEL_BAU", entity: "subjects", entityId: name });
  revalidatePath("/admin/master");
}

export async function addClass(formData: FormData) {
  const admin = await guard();
  const name = String(formData.get("name") ?? "").trim().slice(0, 16).toUpperCase();
  const ctx = await currentSemester();
  if (!ctx) redirect("/admin/master?err=Set+tahun+ajaran+aktif+dulu");
  const m = name.match(/^(\d)/);
  if (!name || !m) redirect("/admin/master?err=Format+rombel%3A+7A%2C%209F");
  await prisma.class.upsert({
    where: { name_academicYearId: { name, academicYearId: ctx.year.id } },
    create: { name, tingkat: Number(m[1]), academicYearId: ctx.year.id },
    update: {},
  });
  await logAudit({ userId: admin.id, action: "ROMBEL_BAU", entity: "classes", entityId: name });
  revalidatePath("/admin/master");
}
