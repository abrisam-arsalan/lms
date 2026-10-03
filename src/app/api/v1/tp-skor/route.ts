import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/auth";
import { currentSemester } from "@/lib/academic";
import { recomputeReports } from "@/lib/gradebook";

/**
 * Mesin-ke-mesin (Fase 2: push nilai CBT → LMS; juga utk app sekolah lain).
 * Header:  Authorization: Bearer $API_TOKEN  (env di server)
 * Body:    { "mapel": "Informatika", "rombel": "9F",
 *            "items": [ { "nisn": "0101306751", "kodeTp": "TP.9220", "skor": 85 } ] }
 * Skor ditulis sbagai nilai TP MANUAL; rapor ikut dihitung ulang.
 */
function deny(status: number, msg: string) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}
const tokenOk = (given: string) => {
  const want = process.env.API_TOKEN ?? "";
  if (!want || want.length < 16) return false;
  const a = Buffer.from(given.slice(0, 128));
  const b = Buffer.from(want.slice(0, 128));
  return a.length === b.length && timingSafeEqual(a, b);
};

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ") || !tokenOk(auth.slice(7))) return deny(401, "Token tidak valid");

  let body: { mapel?: string; rombel?: string; items?: { nisn?: string; kodeTp?: string; skor?: number }[] };
  try {
    body = await req.json();
  } catch {
    return deny(400, "JSON tidak valid");
  }
  const { mapel, rombel, items } = body;
  if (!mapel || !rombel || !Array.isArray(items) || !items.length) return deny(400, "mapel, rombel, items wajib");
  if (items.length > 500) return deny(400, "maks 500 item/permintaan");

  const ctx = await currentSemester();
  const assignment = await prisma.assignment.findFirst({
    where: { subject: { name: mapel }, class: { name: rombel }, ...(ctx ? { semesterId: ctx.semester.id } : {}) },
    include: { learningTargets: { select: { id: true, code: true } } },
  });
  if (!assignment) return deny(404, `Penugasan ${mapel} × ${rombel} tidak ada di semester aktif`);
  const tpByCode = new Map(assignment.learningTargets.map((t) => [t.code.toUpperCase(), t.id]));

  let ok = 0;
  const errors: string[] = [];
  for (const it of items) {
    const skor = Number(it.skor);
    if (!it.nisn || !it.kodeTp || Number.isNaN(skor) || skor < 0 || skor > 100) {
      errors.push(`${it.nisn ?? "?"}/${it.kodeTp ?? "?"}: input tidak valid`);
      continue;
    }
    const tpId = tpByCode.get(it.kodeTp.toUpperCase());
    if (!tpId) { errors.push(`${it.kodeTp}: TP tidak dikenal di ${rombel}`); continue; }
    const stu = await prisma.user.findFirst({ where: { nisn: it.nisn, role: "SISWA", deletedAt: null } });
    if (!stu) { errors.push(`NISN ${it.nisn}: tidak ada di LMS`); continue; }
    await prisma.tpScore.upsert({
      where: { tpId_studentId: { tpId, studentId: stu.id } },
      create: { tpId, studentId: stu.id, score: Math.round(skor * 100) / 100, source: "MANUAL" },
      update: { score: Math.round(skor * 100) / 100, source: "MANUAL" },
    });
    ok++;
  }
  await recomputeReports(assignment.id);
  await logAudit({ action: "API_TP_SKOR", entity: "assignments", entityId: String(assignment.id), detail: { ok, errors: errors.length, via: "api" } });
  return NextResponse.json({ ok: true, ditulis: ok, skip: errors, assignment: `${mapel}×${rombel}` });
}
