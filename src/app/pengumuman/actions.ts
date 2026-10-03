"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser, logAudit } from "@/lib/auth";
import { notify, notifyStudentsOfClass, ortuIdsOfClass, allSiswaOrtuIds } from "@/lib/notify";

export async function createAnnouncement(formData: FormData) {
  const user = await getSessionUser();
  if (!user || !["ADMIN", "GURU"].includes(user.role)) throw new Error("Tidak berhak");
  const judul = String(formData.get("judul") ?? "").trim();
  const isi = String(formData.get("isi") ?? "").trim();
  if (!judul || !isi) redirect("/pengumuman?err=1");

  const cidStr = String(formData.get("classId") ?? "").trim();
  const classIdRaw = BigInt(/^\d+$/.test(cidStr) ? cidStr : "0");
  let classId: bigint | null = classIdRaw || null;
  if (classId) {
    if (user.role === "GURU") {
      // guru hanya boleh ke rombel yang ia ajar / ia wali
      const boleh =
        (await prisma.assignment.count({ where: { classId, teacher: { userId: user.id } } })) > 0 ||
        (await prisma.class.count({ where: { id: classId, homeroomUserId: user.id } })) > 0;
      if (!boleh) throw new Error("Bukan rombel-mu");
    }
  } else if (user.role !== "ADMIN") {
    throw new Error("Hanya admin yang bisa pengumuman seluruh sekolah");
  }

  const p = await prisma.announcement.create({
    data: { judul, isi, target: classId ? "KELAS" : "SEMUA", classId, authorId: user.id },
  });
  await logAudit({ userId: user.id, action: "PENGUMUMAN_BAU", entity: "announcements", entityId: String(p.id) });

  if (classId) {
    await notifyStudentsOfClass(classId, "pengumuman", `📢 ${judul}`, "/pengumuman");
    await notify(await ortuIdsOfClass(classId), "pengumuman", `📢 ${judul}`, "/pengumuman");
  } else {
    await notify(await allSiswaOrtuIds(), "pengumuman", `📢 ${judul}`, "/pengumuman");
  }
  revalidatePath("/pengumuman");
  redirect("/pengumuman");
}

export async function deleteAnnouncement(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const id = BigInt(String(formData.get("id") ?? "0"));
  const p = await prisma.announcement.findUnique({ where: { id } });
  if (!p) return;
  if (user.role !== "ADMIN" && p.authorId !== user.id) throw new Error("Bukan punyamu");
  await prisma.announcement.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAudit({ userId: user.id, action: "PENGUMUMAN_HAPUS", entity: "announcements", entityId: String(id) });
  revalidatePath("/pengumuman");
}
