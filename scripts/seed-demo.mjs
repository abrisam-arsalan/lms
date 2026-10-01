// Seed DEMO utk pengembangan lokal — JANGAN jalankan di server produksi.
// Isi: admin, guru demo, 1 rombel (9F), mapel, TP contoh, 1 materi, 1 tugas, 3 siswa.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const hash = (p) => bcrypt.hashSync(p, 10);

const year = process.env.SCHOOL_ACADEMIC_YEAR ?? "2026/2027";

async function main() {
  const ay = await prisma.academicYear.upsert({
    where: { name: year },
    create: { name: year, isActive: true },
    update: { isActive: true },
  });
  const sem1 = await prisma.semester.upsert({
    where: { yearId_number: { yearId: ay.id, number: 1 } },
    create: { yearId: ay.id, number: 1, name: "Ganjil" },
    update: {},
  });

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    create: { username: "admin", nama: "Administrator", role: "ADMIN", passwordHash: hash("admin123") },
    update: {},
  });

  const guruU = await prisma.user.upsert({
    where: { username: "198501012010011001" },
    create: {
      username: "198501012010011001", nama: "Budi Santoso, S.Pd.", nisn: null,
      role: "GURU", passwordHash: hash("guru123"),
      teacher: { create: { nip: "198501012010011001", nama: "Budi Santoso, S.Pd." } },
    },
    update: {},
  });
  const guru = await prisma.teacher.findUnique({ where: { userId: guruU.id } });

  const cls = await prisma.class.upsert({
    where: { name_academicYearId: { name: "9F", academicYearId: ay.id } },
    create: { name: "9F", tingkat: 9, academicYearId: ay.id, homeroomUserId: admin.id },
    update: {},
  });

  const inf = await prisma.subject.upsert({
    where: { name: "Informatika" },
    create: { name: "Informatika", code: "INF" },
    update: {},
  });

  const assign = await prisma.assignment.upsert({
    where: { teacherId_subjectId_classId_semesterId: {
      teacherId: guru.id, subjectId: inf.id, classId: cls.id, semesterId: sem1.id } },
    create: { teacherId: guru.id, subjectId: inf.id, classId: cls.id, semesterId: sem1.id },
    update: {},
  });

  const tps = [];
  for (const [i, [code, content]] of [
    ["TP.9220", "melindungi data pribadi dan identitas digital"],
    ["TP.9221", "memilah informasi yang bersifat privat dan publik"],
    ["TP.9222", "memiliki kesadaran penuh (mindfulness) dalam dunia digital"],
  ].entries()) {
    tps.push(
      await prisma.learningTarget.upsert({
        where: { assignmentId_code: { assignmentId: assign.id, code } },
        create: { assignmentId: assign.id, code, content, urutan: i + 1 },
        update: { content },
      })
    );
  }

  await prisma.material.upsert({
    where: { id: 0n }, // find-or-create sederhana
    create: {
      assignmentId: assign.id, tpId: tps[0].id, judul: "Data Pribadi & Identitas Digital",
      body: "<h2>Apa itu data pribadi?</h2><p>Data pribadi adalah informasi yang melekat pada dirimu…</p>",
      status: "TERBIT", publishAt: new Date(), createdById: guruU.id,
    },
    update: {},
  });

  const siswaNames = [
    ["0101306751", "ACHMAD RIO SYARIFULLOH"],
    ["0115115101", "AYU MANGGAR DWI SYAFA'AT"],
    ["0087208248", "AYU OKTAFIANA"],
  ];
  for (const [nisn, nama] of siswaNames) {
    const u = await prisma.user.upsert({
      where: { username: nisn },
      create: {
        username: nisn, nisn, nama, role: "SISWA", passwordHash: hash("siswa123"),
        student: { create: { classId: cls.id } },
      },
      update: {},
    });
    void u;
  }

  await prisma.task.upsert({
    where: { id: 0n },
    create: {
      assignmentId: assign.id, tpId: tps[0].id, judul: "Latihan 1 — Perlindungan Data Pribadi",
      instruksi: "Kerjakan di buku tulis. Foto halaman jawaban lalu unggah ke sini.",
      tipe: "FILE", dueAt: new Date(Date.now() + 5 * 86_400_000),
      lateUntil: new Date(Date.now() + 7 * 86_400_000),
      status: "TERBIT", publishAt: new Date(), createdById: guruU.id,
    },
    update: {},
  });

  console.log("Seed demo selesai. Login: admin/admin123 · guru (NIP)/guru123 · siswa (NISN)/siswa123");
}

main().finally(() => prisma.$disconnect());
