import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { currentSemester } from "@/lib/academic";

function tokenOk(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const want = process.env.API_TOKEN ?? "";
  if (!auth.startsWith("Bearer ") || !want || want.length < 16) return false;
  const a = Buffer.from(auth.slice(7).slice(0, 128));
  const b = Buffer.from(want.slice(0, 128));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!tokenOk(req)) return NextResponse.json({ ok: false, error: "Token tidak valid" }, { status: 401 });
  const ctx = await currentSemester();
  if (!ctx) return NextResponse.json({ ok: false, error: "Tahun/semester aktif belum ada" }, { status: 404 });

  const dayParam = req.nextUrl.searchParams.get("hari");
  const dayFilter = dayParam && /^[0-6]$/.test(dayParam) ? Number(dayParam) : null;

  const rows = await prisma.schedule.findMany({
    where: {
      assignment: { semesterId: ctx.semester.id },
      ...(dayFilter !== null ? { day: dayFilter } : {}),
    },
    include: {
      assignment: {
        include: {
          subject: true,
          class: { select: { id: true, name: true, tingkat: true } },
          teacher: { select: { id: true, nama: true, nip: true } },
        },
      },
    },
    orderBy: [{ day: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json({
    ok: true,
    semester: `${ctx.year.name}/${ctx.semester.name}`,
    total: rows.length,
    jadwal: rows.map((s) => ({
      hari: s.day,
      mulai: s.startTime,
      selesai: s.endTime,
      ruang: s.room,
      rombel: s.assignment.class.name,
      rombel_id: String(s.assignment.classId),
      mapel: s.assignment.subject.name,
      mapel_id: String(s.assignment.subjectId),
      guru: s.assignment.teacher?.nama ?? null,
      guru_user_id: s.assignment.teacher ? String(s.assignment.teacher.id) : null,
    })),
  });
}
