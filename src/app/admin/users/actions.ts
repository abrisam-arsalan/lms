"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUser, logAudit } from "@/lib/auth";

async function guardAdmin() {
  const u = await requireUser();
  if (u.role !== "ADMIN") throw new Error("Hanya admin");
  return u;
}
const back = (q = "") => { revalidatePath("/admin/users"); redirect(`/admin/users${q}`); };

const clean = (v: FormDataEntryValue | null, max = 120) =>
  String(v ?? "").trim().slice(0, max);

export async function addUser(formData: FormData) {
  const admin = await guardAdmin();
  const role = clean(formData.get("role"), 10).toUpperCase();
  const username = clean(formData.get("username"), 64);
  const nama = clean(formData.get("nama"), 120);
  const pass = clean(formData.get("password"), 72) || "Smp5Tegal!2026";
  if (!["ADMIN", "GURU", "SISWA", "ORTU", "KEPSEK"].includes(role) || !username || !nama)
    back("?err=Role%2C%20username%20dan%20nama%20wajib%20valid");

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) back("?err=Username%20sudah%20dipakai");

  const hash = await bcrypt.hash(pass, 10);
  const nis = clean(formData.get("nis"), 32) || null;
  const nisn = clean(formData.get("nisn"), 32) || null;
  const nip = clean(formData.get("nip"), 32) || null;
  const classId = BigInt(clean(formData.get("classId"), 20) || "0") || null;

  const u = await prisma.user.create({
    data: {
      username, nama, role: role as never, passwordHash: hash,
      nis: nis || null, nisn: nisn || null,
      ...(role === "GURU" || role === "KEPSEK" || role === "ADMIN"
        ? { teacher: nip || role === "GURU" ? { create: { nip: nip || null, nama } } : undefined }
        : {}),
      ...(role === "SISWA" ? { student: { create: { classId } } } : {}),
    },
  });
  // ortu → tauti anak lewat NISN anak
  if (role === "ORTU") {
    const anakNisn = clean(formData.get("anakNisn"), 32);
    if (anakNisn) {
      const anak = await prisma.student.findFirst({ where: { user: { nisn: anakNisn } } });
      if (anak) await prisma.linkParentStudent.create({ data: { parentId: u.id, studentId: anak.id } });
    }
  }
  await logAudit({ userId: admin.id, action: "USER_BAU", entity: "users", entityId: String(u.id), detail: { role, username } });
  back("");
}

export async function resetPassword(formData: FormData) {
  const admin = await guardAdmin();
  const id = BigInt(clean(formData.get("id"), 20) || "0");
  const pass = clean(formData.get("password"), 72);
  if (!id || pass.length < 6) back("?err=Password%20baru%20minimal%206%20karakter");
  const hash = await bcrypt.hash(pass, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash: hash } });
  await logAudit({ userId: admin.id, action: "PASS_RESET", entity: "users", entityId: String(id) });
  back("");
}

export async function toggleActive(formData: FormData) {
  const admin = await guardAdmin();
  const id = BigInt(clean(formData.get("id"), 20) || "0");
  const u = await prisma.user.findUnique({ where: { id }, select: { isActive: true, username: true } });
  if (!u) return;
  await prisma.user.update({ where: { id }, data: { isActive: !u.isActive } });
  await logAudit({ userId: admin.id, action: u.isActive ? "USER_NONAKTIF" : "USER_AKTIF", entity: "users", entityId: String(id), detail: { username: u.username } });
  back("");
}

export async function editUser(formData: FormData) {
  const admin = await guardAdmin();
  const id = BigInt(clean(formData.get("id"), 20) || "0");
  const nama = clean(formData.get("nama"), 120);
  const nis = clean(formData.get("nis"), 32) || null;
  const nisn = clean(formData.get("nisn"), 32) || null;
  const classId = BigInt(clean(formData.get("classId"), 20) || "0") || null;
  if (!id || !nama) back("?err=Nama%20wajib%20diisi");
  const u = await prisma.user.findUnique({ where: { id }, include: { student: true } });
  if (!u) return;
  await prisma.user.update({ where: { id }, data: { nama, ...(nis ? { nis } : {}), ...(nisn ? { nisn } : {}) } });
  if (u.student) await prisma.student.update({ where: { userId: id }, data: { classId: classId ?? u.student.classId } });
  await logAudit({ userId: admin.id, action: "USER_UBAH", entity: "users", entityId: String(id), detail: { lama: u.nama, baru: nama } });
  back("");
}
