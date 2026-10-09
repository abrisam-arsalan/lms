"use server";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUser, logAudit } from "@/lib/auth";
import { currentSemester } from "@/lib/academic";
import { planSiswa, planGuru, type ImportKind } from "@/lib/importer";

const IMPORT_DIR = path.resolve("storage/imports");

async function guard() {
  const u = await requireUser();
  if (u.role !== "ADMIN") throw new Error("Hanya admin");
  return u;
}

export async function uploadPreview(formData: FormData) {
  await guard();
  const kind: ImportKind = formData.get("kind") === "guru" ? "guru" : "siswa";
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) redirect("/admin/import?err=Kosong");
  if (file.size > 2 * 1024 * 1024) redirect("/admin/import?err=Maksimum+2MB");
  const text = (await file.text()).replace(/^﻿/, "");
  const { rows, problems } = kind === "siswa" ? planSiswa(text) : planGuru(text);
  if (problems.length) redirect(`/admin/import?err=${encodeURIComponent(problems.join(" · "))}`);
  if (!rows.length) redirect("/admin/import?err=Tidak+ada+baris+data");

  await fs.mkdir(IMPORT_DIR, { recursive: true });
  const rev = crypto.randomBytes(8).toString("hex");
  await fs.writeFile(path.join(IMPORT_DIR, `${rev}.csv`), text);
  redirect(`/admin/import?rev=${rev}&kind=${kind}`);
}

export async function commitImport(formData: FormData) {
  const admin = await guard();
  const rev = String(formData.get("rev") ?? "").replace(/[^0-9a-f]/g, "").slice(0, 32);
  const kind: ImportKind = formData.get("kind") === "guru" ? "guru" : "siswa";
  const tmpPass = String(formData.get("tmpPass") ?? "").trim() || "Smp5Tegal!2026";
  const file = path.join(IMPORT_DIR, `${rev}.csv`);
  let text: string;
  try {
    text = await fs.readFile(file, "utf8");
  } catch {
    redirect("/admin/import?err=Sesi+preview+hilang+-+unggah+ulang");
  }
  const { rows } = kind === "siswa" ? planSiswa(text) : planGuru(text);
  const ctx = await currentSemester();
  if (!ctx) redirect("/admin/import?err=Set+tahun+ajaran+aktif+dulu");

  const hash = await bcrypt.hash(tmpPass, 10);
  const result: { created: number; skipped: number; existing: number; errors: string[]; rombelBaru: string[] } = {
    created: 0, skipped: 0, existing: 0, errors: [], rombelBaru: [],
  };
  const classCache = new Map<string, bigint>();
  const kelasAktif = await prisma.class.findMany({ where: { academicYearId: ctx.year.id }, select: { id: true, name: true } });
  for (const k of kelasAktif) classCache.set(k.name.toUpperCase(), k.id);

  for (const r of rows) {
    if (r.status === "ERR") { result.skipped++; result.errors.push(`baris ${r.line}: ${r.reason}`); continue; }
    const exist = await prisma.user.findUnique({ where: { username: r.username }, select: { id: true, nama: true, student: { select: { id: true } } } });
    if (exist) { result.existing++; continue; }

    if (kind === "guru") {
      await prisma.user.create({
        data: {
          username: r.username, nama: r.nama, role: "GURU", passwordHash: hash,
          teacher: { create: { nip: r.nip || null, nama: r.nama } },
        },
      });
    } else {
      let classId: bigint | undefined = classCache.get(r.rombel!.toUpperCase());
      if (classId === undefined) {
        const tingkat = Number(r.rombel!.match(/^\d/)?.[0] ?? 7);
        const created = await prisma.class.create({
          data: { name: r.rombel!, tingkat, academicYearId: ctx.year.id },
          select: { id: true, name: true },
        });
        classCache.set(created.name, created.id);
        classId = created.id;
        result.rombelBaru.push(r.rombel!);
      }
      await prisma.user.create({
        data: {
          username: r.username, nama: r.nama, role: "SISWA", passwordHash: hash,
          nis: r.nis || null, nisn: r.nisn || null,
          student: { create: { classId } },
        },
      });
    }
    result.created++;
  }

  await logAudit({ userId: admin.id, action: "IMPORT_CSV", entity: "users", entityId: rev, detail: { kind, ...result, created: result.created } });
  await fs.rm(file, { force: true });
  await fs.writeFile(path.join(IMPORT_DIR, `${rev}.done.json`), JSON.stringify(result));
  revalidatePath("/admin/users");
  redirect(`/admin/import?done=${rev}`);
}
