import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { currentSemester } from "@/lib/academic";

/**
 * GET /api/v1/siswa → daftar siswa AKTIF + rombelnya (sumber kebenaran: LMS).
 * Auth: Authorization: Bearer $API_TOKEN  ( utk presensi/CBT Fase 2 )
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
  const rows = await prisma.student.findMany({
    where: {
      user: { isActive: true, deletedAt: null, role: "SISWA" },
      ...(ctx ? { class: { academicYearId: ctx.year.id } } : {}),
    },
    include: {
      user: { select: { id: true, nama: true, nis: true, nisn: true, username: true } },
      class: { select: { id: true, name: true, tingkat: true } },
    },
    orderBy: { user: { nama: "asc" } },
  });
  return NextResponse.json({
    ok: true,
    total: rows.length,
    siswa: rows.map((s) => ({
      user_id: String(s.user.id),
      nama: s.user.nama,
      nis: s.user.nis,
      nisn: s.user.nisn,
      username: s.user.username,
      rombel: s.class?.name ?? null,
      rombel_id: s.class ? String(s.class.id) : null,
      tingkat: s.class?.tingkat ?? null,
    })),
  });
}
