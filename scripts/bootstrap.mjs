// ── BOOTSTRAP MIGRASI M0 ──────────────────────────────────────────
// Tarik data master + jadwal + materi(teks) + pengumuman dari aplikasi
// Presensi (SQLite sekolah.db) dan akun dari CBT (MariaDB cbt_tka) ke smp_lms.
// Idempoten: aman dijalankan ulang (upsert / cek-eksis).
//
// Jalankan DI SERVER (sumber data hidup di sana), dari checkout branch deploy:
//   node --env-file=/var/www/lms/.env scripts/bootstrap.mjs --dry-run   ← lihat rencana dulu
//   node --env-file=/var/www/lms/.env scripts/bootstrap.mjs
//
// Catatan RUNBOOK: selama bootstrap, lms_user butuh GRANT SELECT ON cbt_tka.*
// (dicabut lagi setelah selesai). Jika CBT_DATABASE_URL kosong → langkah CBT dilewati.
//
// ── Strategi pencocokan identitas ──
// 1) Presensi = basis (punya role terlengkap admin/kepsek/guru/siswa/ortu).
// 2) CBT dicocokkan: username sama → orang yang sama; lalu nama (normal) utk siswa;
//    sisanya dibuat sebagai akun baru (username = NISN) + warning utk dicocokkan manual.
// 3) Semua baris sumber dicatat di tabel `identities` (app, external_id) — kunci
//    rekonsiliasi & calon SSO (PRD §2A B7).

import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

// ── arg & env ──────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const only = args.find((a) => a.startsWith("--only="))?.split("=")[1]?.split(",");
const run = (sec) => !only || only.includes(sec);

const SQLITE_PATH = process.env.BOOTSTRAP_SQLITE_PATH ?? "data/sekolah.db";
const YEAR_NAME = process.env.SCHOOL_ACADEMIC_YEAR ?? "2026/2027";
const SEM_NUMBER = Number(process.env.SCHOOL_SEMESTER_NUMBER ?? 1);
const HAS_CBT = Boolean(process.env.CBT_DATABASE_URL);

const prisma = new PrismaClient();
const stats = { create: {}, skip: {}, warn: [] };
const bump = (k, n = 1) => (stats.create[k] = (stats.create[k] ?? 0) + n);
const warn = (msg) => stats.warn.push(msg);

// hash password sumber (Laravel $2y$ / Bun $2b$) disimpan apa adanya — diverifikasi app.
// Akun TANPA hash bcrypt valid → diisi hash konstanta untuk password default sekolah.
// bcryptjs sengaja TIDAK di-require: tak ada di node_modules standalone; hash di bawah
// diprecompute (bcrypt $2a$, kompatibel). Ganti dgn: node scripts/hashpw.mjs "<pass>"
const DEFAULT_PW = "Smp5Tegal!2026";
const FALLBACK_HASH = "$2a$10$81CBQrgfEtRa5Anf0z37bOaex1nO34bsIv7SWOT/T4BD4Oi47yvQ2";
function fallbackHash() {
  return FALLBACK_HASH;
}

const normName = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .trim();

function safeHash(h) {
  return typeof h === "string" && /^\$2[aby]\$/.test(h) ? h : null;
}

const ROLE_PRESENSI = {
  admin: "ADMIN",
  kepala_sekolah: "KEPSEK",
  guru: "GURU",
  siswa: "SISWA",
  orang_tua: "ORTU",
};
const ROLE_CBT = { admin: "ADMIN", guru: "GURU", siswa: "SISWA", kepsek: "KEPSEK", kepala_sekolah: "KEPSEK" };

// ── sumber 1: presensi (SQLite) ────────────────────────────────────
console.log(`Membuka ${SQLITE_PATH} …`);
let sqlite;
try {
  sqlite = new DatabaseSync(SQLITE_PATH, { readOnly: true });
} catch {
  sqlite = new DatabaseSync(SQLITE_PATH); // opsi readOnly tak didukung Node versi ini
}
const q = (sql, ...p) => sqlite.prepare(sql).all(...p);

const P = {
  users: q("SELECT * FROM users"),
  kelas: q("SELECT * FROM kelas"),
  mapel: q("SELECT * FROM mata_pelajaran"),
  guru: q("SELECT * FROM guru"),
  siswa: q("SELECT * FROM siswa"),
  ortu: q("SELECT * FROM orang_tua"),
  jadwal: q("SELECT * FROM jadwal"),
  sesi: q(`SELECT s.*, j.kelas_id, j.mata_pelajaran_id, j.guru_id
           FROM sesi_mengajar s JOIN jadwal j ON j.id = s.jadwal_id
           WHERE s.materi IS NOT NULL AND TRIM(s.materi) <> ''`),
  pengumuman: q("SELECT * FROM pengumuman"),
};

// peta id presensi → id lokal
const userByPresensi = new Map(); // presensiUserId → User
const kelasByPresensi = new Map(); // kelasId → Class
const mapelByPresensi = new Map();
const guruByPresensi = new Map(); // guruId → Teacher
const siswaByPresensi = new Map(); // siswaId → Student(user)
const jadwalToAssign = new Map();

// Catatan: TANPA transaksi global — bootstrap didesain idempoten & bisa
// dilanjutkan bila terputus (semua langkah upsert / cek-eksis).
async function tx(fn) {
  await fn(DRY);
}

// ── langkah 1: tahun ajaran & semester ─────────────────────────────
let yearId, semId;
await tx(async () => {
  if (!run("tahun")) return;
  const ay = DRY
    ? { id: 1n }
    : await prisma.academicYear.upsert({
        where: { name: YEAR_NAME },
        create: { name: YEAR_NAME, isActive: true },
        update: { isActive: true },
      });
  yearId = ay.id;
  const sem = DRY
    ? { id: 1n }
    : await prisma.semester.upsert({
        where: { yearId_number: { yearId: ay.id, number: SEM_NUMBER } },
        create: { yearId: ay.id, number: SEM_NUMBER, name: SEM_NUMBER === 1 ? "Ganjil" : "Genap" },
        update: {},
      });
  semId = sem.id;
  console.log(`Tahun ajaran ${YEAR_NAME} semester ${SEM_NUMBER}`);
});

// ── langkah 2: mapel ───────────────────────────────────────────────
await tx(async () => {
  if (!run("mapel")) return;
  for (const m of P.mapel) {
    const row = DRY
      ? { id: BigInt(m.id) }
      : await prisma.subject.upsert({
          where: { name: m.nama },
          create: { name: m.nama, code: m.kode ?? null },
          update: { code: m.kode ?? undefined },
        });
    mapelByPresensi.set(m.id, row);
    bump("subject");
  }
});

// ── langkah 3: kelas (+ wali) ──────────────────────────────────────
await tx(async () => {
  if (!run("kelas")) return;
  for (const k of P.kelas) {
    const tingkat = parseInt(String(k.tingkat ?? k.nama).match(/\d+/)?.[0] ?? "0", 10);
    const row = DRY
      ? { id: BigInt(k.id) }
      : await prisma.class.upsert({
          where: { name_academicYearId: { name: k.nama, academicYearId: yearId } },
          create: { name: k.nama, tingkat, academicYearId: yearId },
          update: { tingkat },
        });
    kelasByPresensi.set(k.id, row);
    bump("class");
  }
});

// ── langkah 4: users (presensi sbg basis) ──────────────────────────
await tx(async () => {
  if (!run("akun")) return;
  for (const u of P.users) {
    const role = ROLE_PRESENSI[u.role];
    if (!role) { warn(`user presensi #${u.id} role tak dikenal: ${u.role} — dilewati`); continue; }
    let row = DRY
      ? { id: BigInt(u.id), username: u.username }
      : await prisma.user.upsert({
          where: { username: u.username },
          create: {
            username: u.username,
            nama: u.nama,
            role,
            passwordHash: safeHash(u.password_hash) ?? fallbackHash(),
          },
          update: {}, // jangan menimpa password yang sudah diganti di LMS
        });
    if (!DRY) {
      await prisma.identity.upsert({
        where: { app_externalId: { app: "PRESENSI", externalId: String(u.id) } },
        create: { userId: row.id, app: "PRESENSI", externalId: String(u.id) },
        update: {},
      });
    }
    userByPresensi.set(u.id, row);
    bump("user");
  }
});

// ── langkah 5: guru & siswa records ────────────────────────────────
await tx(async () => {
  if (!run("guru") && !run("siswa")) return;
  if (run("guru")) {
    for (const g of P.guru) {
      const u = userByPresensi.get(g.user_id);
      if (!u) { warn(`guru #${g.id}: user presensi #${g.user_id} tak ditemukan`); continue; }
      const row = DRY
        ? { id: BigInt(g.id), userId: u.id, nama: g.nama }
        : await prisma.teacher.upsert({
            where: { userId: u.id },
            create: { userId: u.id, nip: g.nip || null, nama: g.nama },
            update: { nama: g.nama, ...(g.nip ? { nip: g.nip } : {}) },
          });
      guruByPresensi.set(g.id, row);
      bump("teacher");
    }
  }
  if (run("siswa")) {
    for (const s of P.siswa) {
      const u = userByPresensi.get(s.user_id);
      if (!u) { warn(`siswa #${s.id}: user presensi #${s.user_id} tak ditemukan`); continue; }
      const cls = s.kelas_id ? kelasByPresensi.get(s.kelas_id) : null;
      if (!DRY) {
        await prisma.user
          .update({ where: { id: u.id }, data: { nis: s.nis } })
          .catch(() => warn(`user ${u.username}: nis ${s.nis} bertabrakan unique — cek manual`));
        await prisma.student.upsert({
          where: { userId: u.id },
          create: { userId: u.id, classId: cls?.id ?? null },
          update: cls ? { classId: cls.id } : {},
        });
      }
      siswaByPresensi.set(s.id, { ...u, class: cls });
      bump("student");
    }
    // wali kelas: kolom TEXT nama → cari Teacher by nama unik
    for (const k of P.kelas) {
      if (!k.wali_kelas?.trim() || !kelasByPresensi.get(k.id)) continue;
      const kandidat = [...guruByPresensi.values()].filter(
        (t) => normName(t.nama) === normName(k.wali_kelas)
      );
      if (kandidat.length === 1 && !DRY) {
        const guruUser = await prisma.user.findUnique({ where: { id: kandidat[0].userId } });
        await prisma.class.update({
          where: { id: kelasByPresensi.get(k.id).id },
          data: { homeroomUserId: guruUser.id },
        });
      } else if (kandidat.length !== 1) {
        warn(`wali ${k.nama} "${k.wali_kelas}": ${kandidat.length} kecocokan guru — set manual`);
      }
    }
    // ortu → link
    for (const o of P.ortu) {
      const pu = userByPresensi.get(o.user_id);
      const su = siswaByPresensi.get(o.siswa_id);
      if (!pu || !su) { warn(`tautan ortu #${o.id}: sisi ${!pu ? "ortu" : "siswa"} hilang`); continue; }
      if (!DRY) {
        await prisma.linkParentStudent.upsert({
          where: { parentId_studentId: { parentId: pu.id, studentId: su.id } },
          create: { parentId: pu.id, studentId: su.id, hubungan: o.hubungan ?? null },
          update: {},
        });
      }
      bump("parent_link");
    }
  }
});

// ── langkah 6: jadwal → assignments + schedules ────────────────────
await tx(async () => {
  if (!run("jadwal")) return;
  for (const j of P.jadwal) {
    const cls = kelasByPresensi.get(j.kelas_id);
    const sub = mapelByPresensi.get(j.mata_pelajaran_id);
    const tch = guruByPresensi.get(j.guru_id);
    if (!cls || !sub || !tch) { warn(`jadwal #${j.id}: referensi tidak lengkap — dilewati`); continue; }
    const key = `${tch.id}|${sub.id}|${cls.id}|${semId}`;
    let assign = jadwalToAssign.get(j.id);
    if (assign) { /* reuse di sesi */ }
    if (!assign) {
      assign = DRY
        ? { id: BigInt(j.id) }
        : await prisma.assignment.upsert({
            where: {
              teacherId_subjectId_classId_semesterId: {
                teacherId: tch.id, subjectId: sub.id, classId: cls.id, semesterId: semId,
              },
            },
            create: { teacherId: tch.id, subjectId: sub.id, classId: cls.id, semesterId: semId },
            update: {},
          });
    }
    jadwalToAssign.set(j.id, assign);
    bump("assignment");
    if (!DRY) {
      const exists = await prisma.schedule.findFirst({
        where: { assignmentId: assign.id, day: j.hari, start: j.jam_mulai },
        select: { id: true },
      });
      if (!exists) {
        await prisma.schedule.create({
          data: {
            assignmentId: assign.id, day: j.hari,
            start: j.jam_mulai, end: j.jam_selesai,
          },
        });
        bump("schedule");
      } else bump("schedule:skip");
    } else bump("schedule");
  }
});

// ── langkah 7: materi teks dari sesi mengajar ──────────────────────
await tx(async () => {
  if (!run("materi")) return;
  const authorByGuru = new Map(); // guruId → userId
  for (const [gid, t] of guruByPresensi) authorByGuru.set(gid, t.userId);
  for (const s of P.sesi) {
    const assign = jadwalToAssign.get(s.jadwal_id);
    if (!assign) { warn(`sesi #${s.id}: jadwal tak terpetakan — materi "${s.tanggal}" dilewati`); continue; }
    const createdById = authorByGuru.get(s.guru_id) ?? [...authorByGuru.values()][0];
    const publishedAt = new Date(`${s.tanggal}T07:00:00`);
    const judul = `Materi ${s.tanggal} (${String(s.materi).slice(0, 40)}…)`;
    if (DRY) { bump("material(dari sesi)"); continue; }
    const exists = await prisma.material.findFirst({
      where: { assignmentId: assign.id, publishedAt, deletedAt: null },
      select: { id: true },
    });
    if (exists) { bump("material:skip"); continue; }
    await prisma.material.create({
      data: {
        assignmentId: assign.id,
        judul,
        body: `<p>${escapeHtml(String(s.materi)).replace(/\n/g, "</p><p>")}</p>`,
        status: "TERBIT",
        publishAt: publishedAt,
        createdById,
      },
    });
    bump("material(dari sesi)");
  }
});

// ── langkah 8: pengumuman ──────────────────────────────────────────
await tx(async () => {
  if (!run("pengumuman")) return;
  for (const p of P.pengumuman) {
    const author = userByPresensi.get(p.author_id);
    if (!author) { warn(`pengumuman #${p.id}: penulis tak terpetakan`); continue; }
    const cls = p.kelas_id ? kelasByPresensi.get(p.kelas_id) : null;
    if (DRY) { bump("announcement"); continue; }
    const exists = await prisma.announcement.findFirst({
      where: { judul: p.judul, authorId: author.id, createdAt: new Date(p.created_at) },
      select: { id: true },
    });
    if (exists) { bump("announcement:skip"); continue; }
    await prisma.announcement.create({
      data: {
        judul: p.judul, isi: p.isi,
        target: p.target === "kelas" && cls ? "KELAS" : "SEMUA",
        classId: p.target === "kelas" && cls ? cls.id : null,
        authorId: author.id,
        createdAt: new Date(p.created_at),
      },
    });
    bump("announcement");
  }
});

// ── langkah 9: akun CBT ────────────────────────────────────────────
if (run("cbt") && HAS_CBT) {
  const { PrismaClient: CbtClient } = await import("../src/generated/cbt-client/index.js");
  const cbt = new CbtClient();
  const byNormNameSiswa = new Map();
  for (const [pid, u] of userByPresensi) {
    const row = P.users.find((x) => x.id === pid);
    if (row?.role === "siswa") {
      const k = normName(u.nama);
      if (!byNormNameSiswa.has(k)) byNormNameSiswa.set(k, u);
      else byNormNameSiswa.set(k, null); // duplikat nama → jangan auto-match
    }
  }
  try {
    const cbtUsers = await cbt.cbtUser.findMany({ where: { deletedAt: null } });
    await tx(async () => {
      for (const c of cbtUsers) {
        if (!c.isActive) { bump("cbt:inactive-skip"); continue; }
        let target = (await findUserByUsername(c.username)) ?? null;
        if (!target && c.name) {
          const match = byNormNameSiswa.get(normName(c.name));
          if (match) target = match;
        }
        if (target) {
          if (!DRY && c.nisn) {
            const occupied = await prisma.user.findFirst({
              where: { nisn: c.nisn, id: { not: target.id } },
              select: { id: true },
            });
            if (occupied) warn(`CBT #${c.id}: NISN ${c.nisn} sudah dipakai user lain — tidak dipasang`);
            else if (!target.nisn)
              await prisma.user.update({ where: { id: target.id }, data: { nisn: c.nisn } });
          }
          if (!DRY) {
            await prisma.identity.upsert({
              where: { app_externalId: { app: "CBT", externalId: String(c.id) } },
              create: { userId: target.id, app: "CBT", externalId: String(c.id) },
              update: {},
            });
          }
          bump("cbt:matched");
        } else {
          const role = ROLE_CBT[c.role] ?? "SISWA";
          const uname = c.nisn || c.username || `cbt_${c.id}`;
          const taken = !DRY && (await findUserByUsername(uname));
          if (taken) { bump("cbt:username-taken-skip"); continue; }
          if (!DRY) {
            const created = await prisma.user.create({
              data: {
                username: uname, nama: c.name, role,
                nisn: c.nisn || null,
                passwordHash: safeHash(c.password) ?? fallbackHash(),
              },
            });
            await prisma.identity.create({
              data: { userId: created.id, app: "CBT", externalId: String(c.id) },
            });
          }
          bump("cbt:new-account");
          warn(`CBT #${c.id} "${c.name}" (${uname}): tak cocok dgn Presensi → akun baru, cocokkan manual`);
        }
      }
    });
    // kelas CBT → pastikan ada di tahun ajaran aktif (nama saja; tak merusak data)
    const cbtClasses = await cbt.cbtClass.findMany({ where: { isActive: true } });
    for (const cc of cbtClasses) {
      const known = [...kelasByPresensi.values()].some((k) => k.name === cc.name);
      if (!known) warn(`CBT class "${cc.name}" tidak ada di Presensi tahun ${YEAR_NAME} — lewati (admin bikin manual bila perlu)`);
    }
  } finally {
    await cbt.$disconnect();
  }
} else if (run("cbt") && !HAS_CBT) {
  console.log("CBT_DATABASE_URL kosong — langkah akun CBT DILEWATI.");
}

async function findUserByUsername(username) {
  if (DRY) return null;
  return prisma.user.findUnique({ where: { username } });
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── laporan ────────────────────────────────────────────────────────
console.log("\n═══ HASIL BOOTSTRAP" + (DRY ? " (DRY-RUN, tidak menulis)" : "") + " ═══");
for (const [k, v] of Object.entries(stats.create).sort()) console.log(`  ${k.padEnd(28)} ${v}`);
if (stats.warn.length) {
  console.log(`\n  ⚠️  ${stats.warn.length} peringatan:`);
  for (const w of stats.warn.slice(0, 40)) console.log("    - " + w);
  if (stats.warn.length > 40) console.log(`    … ${stats.warn.length - 40} lainnya`);
}
await prisma.$disconnect();
sqlite.close();
console.log(DRY ? "\nLanjut: hapus --dry-run utk menulis." : "\nSelesai ✅");
