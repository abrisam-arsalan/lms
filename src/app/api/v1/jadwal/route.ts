import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { currentSemester } from "@/lib/academic";

/**
 * GET /api/v1/jadwal[?tanggal=YYYY-MM-DD]      → jadwal aktif semester ini (semua rombel)
 *   + tanggal → difilter ke hari dari tanggal tsb (konvensi 0=Minggu, spt presensi).
 * Auth: Authorization: Bearer $API_TOKEN  ( utk presensi Fase 2: baca jadwal dr LMS )
 */
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
  if (!ctx) return NextResponse.json({ ok: false, error: "Semester aktif belum diset" }, { status: 500 });

  const tanggal = req.nextUrl.searchParams.get("tanggal");
  let dayFilter: number | null = null;
  if (tanggal) {
    const d = new Date(`${tanggal}T12:00:00`);
    if (Number.isNaN(d.getTime())) return NextResponse.json({ ok: false, error: "tanggal harus YYYY-MM-DD" }, { status: 400 });
    dayFilter = d.getDay(); // 0=Minggu…6=Sabtu (sama dgn presensi)
  }

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
          teacher: { include: { user: { select: { id: true, nama: true, nisn: true } } } },
        },
      },
    },
    orderBy: [{ day: "asc" }, { start: "asc" }],
  });

  return NextResponse.json({
    ok: true,
    semester: `${ctx.year.name}/${ctx.semester.name}`,
    total: rows.length,
    jadwal: rows.map((s) => ({
      hari: s.day,
      mulai: s.start,
      selesai: s.end,
      ruang: s.room,
      rombel: s.assignment.class.name,
      rombel_id: s.assignment.classId,
      mapel: s.assignment.subject.name,
      mapel_id: s.assignment.subjectId,
      guru: s.assignment.teacher?.user.nama ?? null,
      guru_user_id: s.assignment.teacher?.userId ?? null,
    })),
  });
}
