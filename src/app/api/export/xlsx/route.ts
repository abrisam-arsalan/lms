import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { currentSemester } from "@/lib/academic";

/**
 * GET /api/export/xlsx?subjectId=&tingkat=[&fmt=csv]
 * Workbook per JENJANG: 1 sheet per rombel, layout mengikuti template import
 * rapor kementerian (baris teks TP, baris kode TP, siswa urut alfabetis)
 * agar blok nilai bisa disalin-per-kolom. CSV fallback utk Excel lama.
 */
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !["GURU", "ADMIN", "KEPSEK"].includes(user.role)) {
    return NextResponse.json({ error: "Tidak berhak" }, { status: 403 });
  }
  const sp = req.nextUrl.searchParams;
  const subjectId = BigInt(sp.get("subjectId") ?? "0");
  const tingkat = Number(sp.get("tingkat") ?? "0");
  const fmt = sp.get("fmt") === "csv" ? "csv" : "xlsx";
  if (!subjectId || tingkat < 7 || tingkat > 9) {
    return NextResponse.json({ error: "Parameter subjectId & tingkat wajib" }, { status: 400 });
  }

  const ctx = await currentSemester();
  const semesterId = ctx?.semester.id;
  const roleFilter = user.role === "GURU" ? { teacher: { userId: user.id } } : {};
  const assignments = await prisma.assignment.findMany({
    where: {
      subjectId,
      class: { tingkat },
      ...(semesterId ? { semesterId } : {}),
      ...roleFilter,
    },
    include: {
      subject: true,
      class: true,
      learningTargets: { orderBy: { urutan: "asc" } },
      reportScores: true,
    },
    orderBy: { class: { name: "asc" } },
  });
  if (!assignments.length) {
    return NextResponse.json({ error: "Tidak ada rombel cocok — periksa penugasanmu" }, { status: 404 });
  }

  // tp_scores & tp_flags menempel ke TP (bukan assignment) → ambil terpisah
  const ids = assignments.map((a) => a.id);
  const [tpScoresAll, flagsAll] = await Promise.all([
    prisma.tpScore.findMany({ where: { tp: { assignmentId: { in: ids } } } }),
    prisma.tpFlag.findMany({ where: { tp: { assignmentId: { in: ids } } } }),
  ]);
  const tpOwner = new Map<string, bigint>();
  for (const a of assignments) for (const t of a.learningTargets) tpOwner.set(String(t.id), a.id);
  const skorBy = new Map<string, number>(); // `${assignmentId}|${tpId}|${studentId}`
  for (const s of tpScoresAll) {
    const aid = tpOwner.get(String(s.tpId));
    if (aid) skorBy.set(`${aid}|${s.tpId}|${s.studentId}`, Number(s.score));
  }
  const flagsBy = new Map<string, { tr: number; op: number }>(); // `${assignmentId}|${studentId}`
  for (const f of flagsAll) {
    const aid = tpOwner.get(String(f.tpId));
    if (!aid) continue;
    const k = `${aid}|${f.studentId}`;
    const c = flagsBy.get(k) ?? { tr: 0, op: 0 };
    if (f.type === "PERLU_PENINGKATAN") c.tr++; else c.op++;
    flagsBy.set(k, c);
  }

  // siswa tiap rombel, urut alfabetis mengikuti template kementerian
  const classIds = assignments.map((a) => a.classId);
  const students = await prisma.student.findMany({
    where: { classId: { in: classIds }, user: { isActive: true, deletedAt: null } },
    include: { user: { select: { nama: true, nisn: true } } },
    orderBy: { user: { nama: "asc" } },
  });

  const rowsFor = (a: (typeof assignments)[number]) => {
    const rapor = new Map(a.reportScores.map((r) => [String(r.studentId), Number(r.score)]));
    const list = students.filter((s) => s.classId === a.classId);
    return list.map((s, i) => {
      const fl = flagsBy.get(`${a.id}|${s.userId}`);
      return [
        String(i + 1),
        s.user.nisn ?? "",
        s.user.nama,
        rapor.has(String(s.userId)) ? String(rapor.get(String(s.userId))) : "",
        ...a.learningTargets.map((tp) => {
          const v = skorBy.get(`${a.id}|${tp.id}|${s.userId}`);
          return v === undefined ? "" : String(Math.round(v));
        }),
        String(fl?.tr ?? 0),
        String(fl?.op ?? 0),
      ];
    });
  };

  const semesterLabel = ctx ? `${ctx.year.name} / ${ctx.semester.name}` : "";
  const baseName = `nilai-${assignments[0].subject.name.toLowerCase().replace(/\s+/g, "-")}-kls${tingkat}`;

  if (fmt === "csv") {
    let csv = "";
    for (const a of assignments) {
      csv += `## ${a.class.name} — ${a.subject.name} (${semesterLabel})\n`;
      csv += `NO,NISN,NAMA SISWA,NILAI RAPOR,${a.learningTargets.map((t) => t.code).join(",")},TR,OP\n`;
      for (const r of rowsFor(a)) csv += r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",") + "\n";
      csv += "\n";
    }
    return new NextResponse("" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${baseName}.csv"`,
      },
    });
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = "LMS SMPN 5 Tegal";
  for (const a of assignments) {
    const ws = wb.addWorksheet(a.class.name);
    const head1 = ["NO", "NISN", "NAMA SISWA", "NILAI RAPOR", ...a.learningTargets.map((t) => t.content), "TR", "OP"];
    const head2 = ["", "", "", "", ...a.learningTargets.map((t) => t.code), "", ""];
    ws.addRow([`FORMAT NILAI ${a.subject.name.toUpperCase()} — KELAS ${a.class.name} — ${semesterLabel}`]);
    ws.addRow(head1);
    ws.addRow(head2);
    for (const r of rowsFor(a)) ws.addRow(r.map((c) => (c === "" ? null : Number(c) || c)));
    ws.getRow(1).font = { bold: true };
    ws.getRow(2).font = { bold: true };
    ws.getRow(3).font = { bold: true, color: { argb: "FF2B47E0" } };
    ws.getRow(2).alignment = { vertical: "top", wrapText: true };
    ws.getRow(2).height = 42;
    const widths = [5, 13, 26, 12, ...a.learningTargets.map(() => 10), 5, 5];
    widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));
  }
  const buf = await wb.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(buf as unknown as ArrayBuffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${baseName}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
