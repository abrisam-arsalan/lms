import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readStored } from "@/lib/storage";

const deny = (status: number, msg: string) => NextResponse.json({ ok: false, error: msg }, { status });

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return deny(401, "Wajib login");

  const { id } = await params;
  const m = id.match(/^([mts])-(\d+)$/);
  if (!m) return deny(400, "Format ID tidak valid");
  const [, k, num] = m;
  const bid = BigInt(num);

  let storedName = "";
  let nama = "";
  let mime = "application/octet-stream";
  let ok = false;

  if (k === "m") {
    const f = await prisma.materialFile.findUnique({
      where: { id: bid },
      include: { material: { include: { assignment: { include: { class: true, teacher: true } } } } },
    });
    if (!f) return deny(404, "Tidak ditemukan");
    ({ nama, storedName, mime } = f);
    const a = f.material.assignment;
    ok =
      user.role === "ADMIN" || user.role === "KEPSEK" ||
      (user.role === "GURU" && a.teacherId === user.id) ||
      (f.material.status === "TERBIT" && await isOfClass(user.id, a.classId));
  } else if (k === "t") {
    const f = await prisma.taskFile.findUnique({
      where: { id: bid },
      include: { task: { include: { assignment: { include: { class: true, teacher: true } } } } },
    });
    if (!f) return deny(404, "Tidak ditemukan");
    ({ nama, storedName, mime } = f);
    const a = f.task.assignment;
    ok =
      user.role === "ADMIN" || user.role === "KEPSEK" ||
      (user.role === "GURU" && a.teacherId === user.id) ||
      (f.task.status === "TERBIT" && await isOfClass(user.id, a.classId));
  } else {
    const f = await prisma.submissionFile.findUnique({
      where: { id: bid },
      include: {
        submission: {
          include: {
            student: { select: { id: true } },
            task: { include: { assignment: true } },
          },
        },
      },
    });
    if (!f) return deny(404, "Tidak ditemukan");
    ({ nama, storedName, mime } = f);
    ok =
      user.role === "ADMIN" ||
      (user.role === "GURU" && f.submission.task.assignment.teacherId === user.id) ||
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
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { classId: true } });
  if (user?.classId === classId) return true;
  if ((await prisma.parentLink.count({ where: { parentId: userId, child: { classId } } })) > 0) return true;
  return (await prisma.class.count({ where: { id: classId, homeroomUserId: userId } })) > 0;
}

async function isChild(parentId: bigint, childUserId: bigint) {
  return (await prisma.parentLink.count({ where: { parentId, childId: childUserId } })) > 0;
}
