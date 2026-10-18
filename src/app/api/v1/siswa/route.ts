import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { currentSemester } from "@/lib/academic";

/**
 * GET /api/v1/siswa → daftar siswa AKTIF + rombelnya.
 * Auth: Authorization: Bearer $API_TOKEN
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
  const rows = await prisma.user.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      role: "SISWA",
      ...(ctx ? { classRef: { academicYearId: ctx.year.id } } : {}),
    },
    select: {
      id: true,
      nama: true,
      nisn: true,
      username: true,
      classRef: { select: { id: true, name: true, tingkat: true } },
    },
    orderBy: { nama: "asc" },
  });
  return NextResponse.json({
    ok: true,
    total: rows.length,
    siswa: rows.map((s) => ({
      user_id: String(s.id),
      nama: s.nama,
      nisn: s.nisn,
      username: s.username,
      rombel: s.classRef?.name ?? null,
      rombel_id: s.classRef ? String(s.classRef.id) : null,
      tingkat: s.classRef?.tingkat ?? null,
    })),
  });
}
