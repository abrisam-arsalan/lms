"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser, logAudit } from "@/lib/auth";
import { canManageAssignment } from "@/lib/academic";
import { saveUpload, removeStored } from "@/lib/storage";

async function guard(assignmentIdRaw: string | null) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const assignmentId = BigInt(assignmentIdRaw ?? "0");
  if (!assignmentId || !(await canManageAssignment(user, assignmentId))) {
    throw new Error("Aksi ditolak: bukan rombel/mapel-mu");
  }
  return { user, assignmentId };
}

function back(id: bigint): never {
  redirect(`/materi?a=${id}`);
}

export async function createMateri(formData: FormData) {
  const { user, assignmentId } = await guard(formData.get("assignmentId")?.toString() ?? null);
  const judul = String(formData.get("judul") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const tpId = String(formData.get("tpId") ?? "");
  const status = formData.get("status") === "TERBIT" ? "TERBIT" : "DRAF";
  if (!judul) back(assignmentId);

  const max = await prisma.material.aggregate({ where: { assignmentId }, _max: { urutan: true } });
  const m = await prisma.material.create({
    data: {
      assignmentId,
      judul,
      body,
      status,
      publishAt: status === "TERBIT" ? new Date() : null,
      urutan: (max._max.urutan ?? 0) + 1,
      createdById: user.id,
      ...(tpId ? { tpId: BigInt(tpId) } : {}),
    },
  });
  await logAudit({ userId: user.id, action: "MATERI_BAU", entity: "materials", entityId: String(m.id) });
  if (status === "TERBIT") await notifyMateri(assignmentId, judul);
  revalidatePath(`/materi`);
  back(assignmentId);
}

async function notifyMateri(assignmentId: bigint, judul: string) {
  const { notifyStudentsOfClass } = await import("@/lib/notify");
  const a = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { subject: true, class: true },
  });
  if (a) await notifyStudentsOfClass(a.classId, "materi_baru", `📖 Materi baru: ${judul} (${a.class.name} · ${a.subject.name})`, "/materi");
}

export async function updateMateri(formData: FormData) {
  const { assignmentId } = await guard(formData.get("assignmentId")?.toString() ?? null);
  const id = BigInt(String(formData.get("id") ?? "0"));
  const judul = String(formData.get("judul") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const tpId = String(formData.get("tpId") ?? "");
  const status = formData.get("status") === "TERBIT" ? "TERBIT" : "DRAF";
  const m = await prisma.material.findFirst({ where: { id, assignmentId, deletedAt: null } });
  if (!m || !judul) back(assignmentId);
  const jadiTerbit = status === "TERBIT" && m.status === "DRAF";

  await prisma.material.update({
    where: { id },
    data: {
      judul,
      body,
      status,
      publishAt: status === "TERBIT" ? m.publishAt ?? new Date() : null,
      tpId: tpId ? BigInt(tpId) : null,
    },
  });
  await logAudit({ action: "MATERI_UBAH", entity: "materials", entityId: String(id) });
  if (jadiTerbit) await notifyMateri(assignmentId, judul);
  revalidatePath(`/materi`);
  back(assignmentId);
}

export async function deleteMateri(formData: FormData) {
  const { user, assignmentId } = await guard(formData.get("assignmentId")?.toString() ?? null);
  const id = BigInt(String(formData.get("id") ?? "0"));
  await prisma.material.updateMany({ where: { id, assignmentId }, data: { deletedAt: new Date() } });
  await logAudit({ userId: user.id, action: "MATERI_HAPUS", entity: "materials", entityId: String(id) });
  revalidatePath(`/materi`);
}

export async function addMateriFile(formData: FormData) {
  const { assignmentId } = await guard(formData.get("assignmentId")?.toString() ?? null);
  const materialId = BigInt(String(formData.get("materialId") ?? "0"));
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) back(assignmentId);
  const m = await prisma.material.findFirst({ where: { id: materialId, assignmentId, deletedAt: null } });
  if (!m) throw new Error("Materi tidak ditemukan");

  const storedName = await saveUpload(file);
  await prisma.materialFile.create({
    data: {
      materialId,
      nama: file.name.slice(0, 250),
      storedName,
      mime: file.type || "application/octet-stream",
      sizeBytes: BigInt(file.size),
    },
  });
  revalidatePath(`/materi`);
  back(assignmentId);
}

/** Siswa menandai materi sudah dibaca (PRD M1: indikator dibaca). */
export async function markRead(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role !== "SISWA") throw new Error("Hanya siswa");
  const materialId = BigInt(String(formData.get("materialId") ?? "0"));
  const m = await prisma.material.findFirst({
    where: { id: materialId, deletedAt: null },
    include: { assignment: { select: { classId: true } } },
  });
  if (!m) throw new Error("Materi tidak ada");
  const stu = await prisma.student.findUnique({ where: { userId: user.id }, select: { classId: true } });
  if (stu?.classId !== m.assignment.classId) throw new Error("Bukan materi kelasmu");
  await prisma.materialRead.upsert({
    where: { materialId_userId: { materialId, userId: user.id } },
    create: { materialId, userId: user.id },
    update: {},
  });
  revalidatePath("/materi");
}

export async function deleteMateriFile(formData: FormData) {
  const { assignmentId } = await guard(formData.get("assignmentId")?.toString() ?? null);
  const id = BigInt(String(formData.get("id") ?? "0"));
  const f = await prisma.materialFile.findFirst({
    where: { id, material: { assignmentId } },
  });
  if (f) {
    await prisma.materialFile.delete({ where: { id } });
    await removeStored(f.storedName);
  }
  revalidatePath(`/materi`);
}
