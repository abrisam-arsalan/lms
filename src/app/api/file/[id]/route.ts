import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { readStored } from "@/lib/storage";

type Params = { params: Promise<{ id: string }> };

function deny(status: 401 | 403 | 404, msg: string) {
  return NextResponse.json({ error: msg }, { status });
}

/**
 * GET /api/file/:id?k=m|t|s   (m=materi, t=lampiran tugas, s=pengumpulan)
 * Otorisasi:
 *  m: TERBIT utk siswa/ortu sekelas; guru pemilik/admin/kepsek selalu.
 *  t: sama (lewat assignment tugas).
 *  s: hanya siswa pemilik, guru penilai, admin (ortu: anak).
 */
export async function GET(req: NextRequest, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return deny(401, "Login dulu");
  const { id } = await params;
  const k = req.nextUrl.searchParams.get("k") ?? "m";
  const bid = BigInt(id);

  let nama = "";
  let storedName = "";
  let mime = "application/octet-stream";
  let ok = false;

  if (k === "m") {
    const f = await prisma.materialFile.findUnique({
      where: { id: bid },
      include: { material: { include: { assignment: { include: { class: true, teacher: { include: { user: true } } } } } } },
    });
    if (!f) return deny(404, "Tidak ditemukan");
    ({ nama, storedName, mime } = f);
    const a = f.material.assignment;
    ok =
      user.role === "ADMIN" || user.role === "KEPSEK" ||
      (user.role === "GURU" && a.teacher?.userId === user.id) ||
      (f.material.status === "TERBIT" && await isOfClass(user.id, a.classId));
  } else if (k === "t") {
    const f = await prisma.taskFile.findUnique({
      where: { id: bid },
      include: { task: { include: { assignment: { include: { class: true, teacher: { include: { user: true } } } } } } },
    });
    if (!f) return deny(404, "Tidak ditemukan");
    ({ nama, storedName, mime } = f);
    const a = f.task.assignment;
    ok =
      user.role === "ADMIN" || user.role === "KEPSEK" ||
      (user.role === "GURU" && a.teacher?.userId === user.id) ||
      (f.task.status === "TERBIT" && await isOfClass(user.id, a.classId));
  } else {
    const f = await prisma.submissionFile.findUnique({
      where: { id: bid },
      include: {
        submission: {
          include: {
            student: { select: { id: true } },
            task: { include: { assignment: { include: { teacher: { include: { user: true } } } } } },
          },
        },
      },
    });
    if (!f) return deny(404, "Tidak ditemukan");
    ({ nama, storedName, mime } = f);
    ok =
      user.role === "ADMIN" ||
      (user.role === "GURU" && f.submission.task.assignment.teacher?.userId === user.id) ||
      f.submission.student.id === user.id ||
      (user.role === "ORTU" && (await isChild(user.id, f.submission.student.id)));
  }

  if (!ok) return deny(403, "Tidak berhak");

  try {
    const buf = await readStored(storedName);
    const ascii = nama.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "");
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(nama)}`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return deny(404, "Berkas di server tidak ditemukan");
  }
}

async function isOfClass(userId: bigint, classId: bigint | null): Promise<boolean> {
  if (!classId) return false;
  const stu = await prisma.student.findUnique({ where: { userId }, select: { classId: true } });
  if (stu?.classId === classId) return true;
  if ((await prisma.linkParentStudent.count({ where: { parentId: userId, studentRec: { classId } } })) > 0) return true;
  return (await prisma.class.count({ where: { id: classId, homeroomUserId: userId } })) > 0;
}

async function isChild(parentId: bigint, childUserId: bigint) {
  return (await prisma.linkParentStudent.count({ where: { parentId, studentRec: { userId: childUserId } } })) > 0;
}
