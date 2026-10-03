"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser, logAudit } from "@/lib/auth";
import { canManageAssignment } from "@/lib/academic";
import { saveUpload, removeStored } from "@/lib/storage";

async function guardManage(assignmentIdRaw: string | null) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const assignmentId = BigInt(assignmentIdRaw ?? "0");
  if (!assignmentId || !(await canManageAssignment(user, assignmentId))) {
    throw new Error("Aksi ditolak: bukan rombel/mapel-mu");
  }
  return { user, assignmentId };
}

const dt = (s: FormDataEntryValue | null) => {
  const v = String(s ?? "").trim();
  return v ? new Date(v) : null;
};

export async function createTask(formData: FormData) {
  const { user, assignmentId } = await guardManage(String(formData.get("assignmentId") ?? null));
  const judul = String(formData.get("judul") ?? "").trim();
  if (!judul) redirect(`/tugas?a=${assignmentId}&err=1`);
  const tipe = ["FILE", "TEKS", "CENTANG"].includes(String(formData.get("tipe")))
    ? String(formData.get("tipe")) : "FILE";
  const t = await prisma.task.create({
    data: {
      assignmentId,
      judul,
      instruksi: String(formData.get("instruksi") ?? ""),
      tipe: tipe as "FILE" | "TEKS" | "CENTANG",
      tpId: formData.get("tpId") ? BigInt(String(formData.get("tpId"))) : null,
      dueAt: dt(formData.get("dueAt")),
      lateUntil: dt(formData.get("lateUntil")),
      status: formData.get("status") === "TERBIT" ? "TERBIT" : "DRAF",
      publishAt: formData.get("status") === "TERBIT" ? new Date() : null,
      createdById: user.id,
    },
  });
  await logAudit({ userId: user.id, action: "TUGAS_BAU", entity: "tasks", entityId: String(t.id) });
  revalidatePath("/tugas");
  redirect(`/tugas?a=${assignmentId}`);
}

export async function deleteTask(formData: FormData) {
  const { user, assignmentId } = await guardManage(String(formData.get("assignmentId") ?? null));
  const id = BigInt(String(formData.get("id") ?? "0"));
  await prisma.task.updateMany({ where: { id, assignmentId }, data: { deletedAt: new Date() } });
  await logAudit({ userId: user.id, action: "TUGAS_HAPUS", entity: "tasks", entityId: String(id) });
  revalidatePath("/tugas");
}

export async function addTaskFile(formData: FormData) {
  const { assignmentId } = await guardManage(String(formData.get("assignmentId") ?? null));
  const taskId = BigInt(String(formData.get("taskId") ?? "0"));
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) redirect(`/tugas?t=${taskId}`);
  const t = await prisma.task.findFirst({ where: { id: taskId, assignmentId, deletedAt: null } });
  if (!t) throw new Error("Tugas tidak ditemukan");
  const storedName = await saveUpload(file);
  await prisma.taskFile.create({
    data: {
      taskId, nama: file.name.slice(0, 250), storedName,
      mime: file.type || "application/octet-stream", sizeBytes: BigInt(file.size),
    },
  });
  revalidatePath("/tugas");
  redirect(`/tugas?t=${taskId}`);
}

/* ── pengumpulan (siswa) ── */
export async function submitTask(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role !== "SISWA") throw new Error("Hanya siswa yang dapat mengumpulkan");
  const taskId = BigInt(String(formData.get("taskId") ?? "0"));
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignment: { include: { class: true } }, submissions: { where: { studentId: user.id } } },
  });
  if (!task || task.status !== "TERBIT" || task.deletedAt) throw new Error("Tugas tidak tersedia");

  const kelas = await prisma.student.findUnique({ where: { userId: user.id }, select: { classId: true } });
  if (kelas?.classId !== task.assignment.classId) throw new Error("Tugas bukan dari kelasmu");

  const now = new Date();
  if (task.dueAt && now > (task.lateUntil ?? task.dueAt)) {
    redirect(`/tugas?t=${taskId}&err=lewat`);
  }
  const lama = task.submissions[0];
  if (lama && task.dueAt && now > task.dueAt) {
    redirect(`/tugas?t=${taskId}&err=kunci`); // revisi hanya sebelum tenggat
  }

  const teks = String(formData.get("text") ?? "").trim();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (task.tipe === "FILE" && files.length === 0 && !lama) redirect(`/tugas?t=${taskId}&err=berkas`);
  if (task.tipe === "TEKS" && !teks) redirect(`/tugas?t=${taskId}&err=teks`);
  if (files.length > 3) throw new Error("Maksimal 3 berkas");
  const maxMb = task.maxFileMb || 20;

  const status = task.dueAt && now > task.dueAt ? "LATE" : "ONTIME";
  const sub =
    lama ??
    (await prisma.submission.create({ data: { taskId, studentId: user.id, text: teks || null, status } }));
  if (lama) {
    await prisma.submission.update({
      where: { id: lama.id },
      data: { text: teks || lama.text, status, revisiCount: { increment: 1 }, updatedAt: now },
    });
    // revisi FILE: ganti koleksi berkas lama
    if (task.tipe === "FILE" && files.length > 0) {
      const lamaFiles = await prisma.submissionFile.findMany({ where: { submissionId: lama.id } });
      for (const f of lamaFiles) await removeStored(f.storedName);
      await prisma.submissionFile.deleteMany({ where: { submissionId: lama.id } });
    }
  }
  for (const f of files.slice(0, 3)) {
    const storedName = await saveUpload(f, maxMb);
    await prisma.submissionFile.create({
      data: {
        submissionId: sub.id, nama: f.name.slice(0, 250), storedName,
        mime: f.type || "application/octet-stream", sizeBytes: BigInt(f.size),
      },
    });
  }
  await logAudit({ userId: user.id, action: "TUGAS_KUMPUL", entity: "submissions", entityId: String(sub.id) });
  revalidatePath("/tugas");
  redirect(`/tugas?t=${taskId}&ok=1`);
}

/** Guru menandai siswa "sudah mengerjakan" (tipe CENTANG / kerja buku). */
export async function markDone(formData: FormData) {
  const { user, assignmentId } = await guardManage(String(formData.get("assignmentId") ?? null));
  const taskId = BigInt(String(formData.get("taskId") ?? "0"));
  const studentId = BigInt(String(formData.get("studentId") ?? "0"));
  const task = await prisma.task.findFirst({ where: { id: taskId, assignmentId, deletedAt: null } });
  if (!task) throw new Error("Tugas tidak ditemukan");
  const now = new Date();
  await prisma.submission.upsert({
    where: { taskId_studentId: { taskId, studentId } },
    create: {
      taskId, studentId, text: "Ditandai selesai oleh guru",
      status: task.dueAt && now > task.dueAt ? "LATE" : "ONTIME",
    },
    update: {},
  });
  await logAudit({ userId: user.id, action: "TUGAS_TANDAI", entity: "submissions", entityId: `${taskId}:${studentId}` });
  revalidatePath("/tugas");
  redirect(`/tugas?t=${taskId}`);
}

/* ── koreksi nilai (guru) ── */
export async function gradeSubmission(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const submissionId = BigInt(String(formData.get("submissionId") ?? "0"));
  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { task: { include: { assignment: { include: { teacher: true } } } } },
  });
  if (!sub) throw new Error("Pengumpulan tidak ditemukan");
  const own = sub.task.assignment.teacher?.userId === user.id || user.role === "ADMIN";
  if (!own) throw new Error("Bukan tugasmu");

  const raw = String(formData.get("score") ?? "").trim();
  const score = Number(raw);
  if (raw === "" || Number.isNaN(score) || score < 0 || score > 100) {
    redirect(`/tugas?t=${sub.taskId}&err=nilai`);
  }
  const feedback = String(formData.get("feedback") ?? "").trim() || null;
  const lama = await prisma.grade.findUnique({ where: { submissionId } });
  await prisma.grade.upsert({
    where: { submissionId },
    create: {
      target: "TUGAS", submissionId, studentId: sub.studentId,
      score, feedback, gradedById: user.id,
    },
    update: { score, feedback, gradedAt: new Date() },
  });
  await logAudit({
    userId: user.id, action: "NILAI_SIMPAN", entity: "grades", entityId: String(sub.taskId),
    detail: { lama: lama ? Number(lama.score) : null, baru: score, siswa: String(sub.studentId) },
  });
  revalidatePath("/tugas");
  redirect(`/tugas?t=${sub.taskId}`);
}
