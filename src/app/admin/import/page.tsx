import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import AppShell from "@/components/app-shell";
import { planSiswa, planGuru, planJadwal, planOrtu, type ImportKind } from "@/lib/importer";
import { uploadPreview, commitImport } from "./actions";

export const dynamic = "force-dynamic";

const IMPORT_DIR = path.resolve("storage/imports");

const TEMPLATE_SISWA = "nisn,nama,rombel\n0101306751,Andi Pratama,9A\n0115115101,Bunga Citra Lestari,9A\n0101306752,Cahyo Nugroho,8B\n0115115102,Dewi Sartika,7A";
const TEMPLATE_GURU = 'nip,nama,username\n198501012010011001,"Budi Santoso, S.Pd.",198501012010011001\n198803152015022002,"Siti Rahayu, M.Pd.",198803152015022002\n2026001,"Ahmad Fauzi, S.Si.",guru_fauzi';
const TEMPLATE_JADWAL = "hari,jam_mulai,jam_selesai,rombel,mapel,guru,ruang\nSenin,07:30,08:50,9A,Matematika,198501012010011001,Ruang 9A\nSenin,09:05,10:25,9A,Bahasa Indonesia,2026001,Ruang 9A\nSelasa,07:30,08:50,9B,Bahasa Inggris,2026001,Lab Bahasa\nRabu,08:00,09:20,8A,IPA,198501012010011001,Lab IPA\nKamis,07:30,08:50,7B,Pendidikan Agama,guru,Ruang 7B\nJumat,07:30,08:50,9A,PJOK,guru,Lapangan";
const TEMPLATE_ORTU = 'nama,anak_nisn,username,hubungan\n"Bapak Pratama",0115300001,P0115300001,AYAH\n"Ibu Lestari",0115300002,P0115300002,IBU\n"Bapak Nugroho",0115300003,P0115300003,AYAH\n"Ibu Sartika",0115300004,P0115300004,IBU\n"Bapak Firmansyah",0115300005,P0115300005,AYAH';

export default async function AdminImportPage({
  searchParams,
}: {
  searchParams: Promise<{ rev?: string; kind?: string; done?: string; err?: string }>;
}) {
  const me = await requireRole(["ADMIN"]);
  const { rev, kind, done, err } = await searchParams;
  const k: ImportKind = kind === "guru" ? "guru" : kind === "jadwal" ? "jadwal" : kind === "ortu" ? "ortu" : "siswa";

  // ── 1. HASIL IMPOR ──
  if (done) {
    let res: { created: number; skipped: number; existing: number; errors: string[]; rombelBaru: string[] } | null = null;
    try {
      const safe = done.replace(/[^0-9a-f]/g, "").slice(0, 32);
      res = JSON.parse(await fs.readFile(path.join(IMPORT_DIR, `${safe}.done.json`), "utf8"));
      await fs.rm(path.join(IMPORT_DIR, `${safe}.done.json`), { force: true });
    } catch {
      /* file hilang */
    }
    return (
      <AppShell user={me} active="/admin/import">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">BERANDA</Link>
          <span className="separator">/</span>
          <Link href="/admin/users">ADMIN</Link>
          <span className="separator">/</span>
          <span className="current">HASIL IMPOR</span>
        </nav>

        <div className="page-head">
          <h1 style={{ textTransform: "uppercase" }}>Hasil Impor {k} 📥</h1>
          {err && <p className="error">{decodeURIComponent(err)}</p>}
        </div>

        {res ? (
          <div className="card">
            <div className="card-head">
              <h2>Ringkasan Eksekusi Impor</h2>
            </div>
            <div className="card-body">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                <span className="badge badge-green" style={{ fontSize: 14, padding: "6px 12px" }}>
                  ✓ Berhasil Ditambahkan: {res.created}
                </span>
                <span className="badge badge-yellow" style={{ fontSize: 14, padding: "6px 12px" }}>
                  ℹ Dilewati (Sudah Ada): {res.existing}
                </span>
                <span className="badge badge-red" style={{ fontSize: 14, padding: "6px 12px" }}>
                  ✕ Gagal / Ditolak: {res.skipped}
                </span>
              </div>

              {res.rombelBaru.length > 0 && (
                <div style={{ marginBottom: 12, padding: 12, background: "var(--teal-light, #e0f7fa)", border: "2px solid #000" }}>
                  <b>🏫 Rombel Baru Dibuat Otomatis:</b> {res.rombelBaru.join(", ")}
                </div>
              )}

              {res.errors.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <b style={{ color: "var(--red, #e53935)" }}>Daftar Kesalahan Baris Data:</b>
                  <ul className="muted" style={{ marginTop: 6, paddingLeft: 20 }}>
                    {res.errors.slice(0, 30).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                  {res.errors.length > 30 && <p className="muted" style={{ fontSize: 12 }}>...dan {res.errors.length - 30} kesalahan lainnya.</p>}
                </div>
              )}

              <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {k === "jadwal" ? (
                  <Link className="btn btn-primary" href="/jadwal">
                    🗓️ Lihat Jadwal Pelajaran →
                  </Link>
                ) : (
                  <Link className="btn btn-primary" href="/admin/users">
                    👥 Lihat Daftar Akun →
                  </Link>
                )}
                <Link className="btn btn-neutral" href="/admin/master">
                  🗂 Buka Master Data →
                </Link>
                <Link className="btn btn-yellow" href="/admin/import">
                  📥 Impor File Lain
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty">
            <p>Catatan hasil impor tidak ditemukan atau sudah kedaluwarsa.</p>
            <Link className="btn btn-sm" href="/admin/import" style={{ marginTop: 10 }}>
              ← Kembali ke Form Impor
            </Link>
          </div>
        )}
      </AppShell>
    );
  }

  // ── 2. PRATINJAU IMPOR ──
  if (rev) {
    const safe = rev.replace(/[^0-9a-f]/g, "").slice(0, 32);
    let text = "";
    try {
      text = await fs.readFile(path.join(IMPORT_DIR, `${safe}.csv`), "utf8");
    } catch {
      /* fallthrough */
    }
    if (!text) {
      return (
        <AppShell user={me} active="/admin/import">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/dashboard">BERANDA</Link>
            <span className="separator">/</span>
            <Link href="/admin/import">IMPOR DATA</Link>
            <span className="separator">/</span>
            <span className="current">SESI HILANG</span>
          </nav>
          <div className="page-head">
            <h1 style={{ textTransform: "uppercase" }}>Import CSV 📥</h1>
          </div>
          <div className="empty">
            <p>Sesi preview hilang atau file kedaluwarsa — silakan unggah ulang file CSV Anda.</p>
            <Link className="btn btn-sm" href="/admin/import" style={{ marginTop: 10 }}>
              ← Kembali ke Menu Impor
            </Link>
          </div>
        </AppShell>
      );
    }

    const { rows, problems } =
      k === "guru" ? planGuru(text) : k === "jadwal" ? planJadwal(text) : k === "ortu" ? planOrtu(text) : planSiswa(text);
    const okCount = rows.filter((r) => r.status === "OK").length;

    return (
      <AppShell user={me} active="/admin/import">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">BERANDA</Link>
          <span className="separator">/</span>
          <Link href="/admin/import">IMPOR CSV</Link>
          <span className="separator">/</span>
          <span className="current">PRATINJAU {k.toUpperCase()}</span>
        </nav>

        <div className="page-head">
          <h1 style={{ textTransform: "uppercase" }}>Pratinjau Impor {k} 📥</h1>
          <p>
            Total <b>{rows.length} baris</b> terbaca ·{" "}
            <b style={{ color: "var(--green, #2e7d32)" }}>{okCount} data siap</b> ·{" "}
            {rows.length - okCount} bermasalah
            {problems.length ? ` · Catatan: ${problems.join(" · ")}` : ""}
          </p>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Pratinjau Baris Data CSV</h2>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                {k === "jadwal" ? (
                  <tr>
                    <th>#</th>
                    <th>Hari</th>
                    <th>Jam</th>
                    <th>Rombel</th>
                    <th>Mata Pelajaran</th>
                    <th>Guru / NIP</th>
                    <th>Ruang</th>
                    <th>Status</th>
                  </tr>
                ) : k === "ortu" ? (
                  <tr>
                    <th>#</th>
                    <th>Username Ortu</th>
                    <th>Nama Orang Tua</th>
                    <th>NISN Anak</th>
                    <th>Hubungan</th>
                    <th>Status</th>
                  </tr>
                ) : (
                  <tr>
                    <th>#</th>
                    <th>Username / ID</th>
                    <th>Nama</th>
                    {k === "siswa" && <th>Rombel</th>}
                    <th>Status</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {rows.slice(0, 60).map((r) => (
                  <tr key={r.line}>
                    <td>{r.line}</td>
                    {k === "jadwal" ? (
                      <>
                        <td><b>{r.hariText}</b></td>
                        <td><span className="pill">{r.startTime} – {r.endTime}</span></td>
                        <td><b>{r.rombel}</b></td>
                        <td>{r.mapel}</td>
                        <td>{r.guru}</td>
                        <td>{r.ruang || "—"}</td>
                      </>
                    ) : k === "ortu" ? (
                      <>
                        <td><code>{r.username}</code></td>
                        <td><b>{r.nama}</b></td>
                        <td><span className="badge badge-yellow">{r.anakNisn}</span></td>
                        <td><span className="pill">{r.hubungan}</span></td>
                      </>
                    ) : (
                      <>
                        <td><code>{r.username || "—"}</code></td>
                        <td><b>{r.nama}</b></td>
                        {k === "siswa" && <td><span className="badge badge-yellow">{r.rombel ?? "—"}</span></td>}
                      </>
                    )}
                    <td>
                      {r.status === "OK" ? (
                        <span className="badge badge-green">✓ SIAP</span>
                      ) : (
                        <span className="badge badge-red">{r.reason}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 60 && (
            <p className="muted card-body">
              … {rows.length - 60} baris lainnya disembunyikan dalam pratinjau (semua akan tetap diproses saat konfirmasi).
            </p>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Konfirmasi & Eksekusi Simpan</h2>
          </div>
          <div className="card-body">
            <form action={commitImport} style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
              <input type="hidden" name="rev" value={safe} />
              <input type="hidden" name="kind" value={k} />

              {k !== "jadwal" && (
                <div className="field" style={{ margin: 0, width: 280 }}>
                  <label className="field-label">Password Default Akun Baru</label>
                  <input
                    className="input"
                    name="tmpPass"
                    defaultValue="Smp5Tegal!2026"
                    minLength={6}
                    required
                  />
                  <span className="muted" style={{ fontSize: 11 }}>Pengguna diwajibkan ganti PIN saat login perdana.</span>
                </div>
              )}

              <button className="btn btn-primary" type="submit" style={{ minHeight: 44 }}>
                ✔ Konfirmasi & Jalankan Impor ({okCount} Data)
              </button>
              <Link className="btn btn-neutral" href="/admin/import" style={{ minHeight: 44 }}>
                ✕ Batalkan
              </Link>
            </form>
            <p className="muted" style={{ marginTop: 12 }}>
              {k === "jadwal"
                ? "Sistem akan otomatis menyesuaikan rombel, mata pelajaran, penugasan (assignment), dan slot jam pelajaran."
                : "Akun yang sudah ada (username/NISN sama) tidak akan ditimpa. Rombel baru dibuat otomatis."}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── 3. FORM UNGGAH & TEMPLATE UTAMA ──
  return (
    <AppShell user={me} active="/admin/import">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/dashboard">BERANDA</Link>
        <span className="separator">/</span>
        <Link href="/admin/users">ADMIN</Link>
        <span className="separator">/</span>
        <span className="current">IMPOR DATA CSV</span>
      </nav>

      <div className="page-head">
        <h1 style={{ textTransform: "uppercase" }}>Impor Data Master & Pengguna 📥</h1>
        <p>
          Unduh format template CSV di bawah, sesuaikan datanya, lalu unggah untuk impor massal secara instan.
        </p>
        <p style={{ marginTop: 6 }}>
          <Link href="/admin/users" className="pill">👥 Kelola Akun</Link>{" "}
          <Link href="/admin/master" className="pill">🗂 Master Rombel & Mapel</Link>{" "}
          <Link href="/jadwal" className="pill">🗓️ Jadwal Pelajaran</Link>
        </p>
        {err && <p className="error" style={{ marginTop: 10 }}>⚠️ {decodeURIComponent(err)}</p>}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {/* KARTU 1: SISWA */}
        <div className="card">
          <div className="card-head">
            <h2>🎓 Impor Data Siswa</h2>
            <span className="badge badge-green">MULTI-ROMBEL ✓</span>
          </div>
          <div className="card-body">
            <p className="muted" style={{ marginBottom: 12 }}>
              Mendukung pembuatan akun siswa massal. NIS/NISN akan otomatis dijadikan username akun siswa.
            </p>

            <div style={{ marginBottom: 16 }}>
              <a
                href="/api/templates/siswa"
                download
                className="btn btn-yellow"
                style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}
              >
                📥 Unduh Template CSV Siswa
              </a>
            </div>

            <form action={uploadPreview} encType="multipart/form-data" style={{ display: "grid", gap: 12 }}>
              <input type="hidden" name="kind" value="siswa" />
              <div className="field" style={{ margin: 0 }}>
                <label className="field-label">Pilih Berkas CSV Siswa</label>
                <input className="input" type="file" name="file" accept=".csv,text/csv" required />
              </div>
              <button className="btn btn-primary" type="submit" style={{ minHeight: 44 }}>
                🔍 Pratinjau & Validasi Data Siswa →
              </button>
            </form>

            <details style={{ marginTop: 14 }}>
              <summary className="pill" style={{ cursor: "pointer", fontWeight: 700 }}>
                📋 Contoh Format Isi CSV Siswa
              </summary>
              <pre className="prose muted" style={{ fontSize: 12, marginTop: 8, padding: 10, background: "#fff", border: "2px solid #000" }}>
                {TEMPLATE_SISWA}
              </pre>
              <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                • Kolom wajib: <code>nama</code>, <code>rombel</code>.<br />
                • Kolom username: <code>nisn</code> atau <code>nis</code>.
              </p>
            </details>
          </div>
        </div>

        {/* KARTU 2: GURU */}
        <div className="card">
          <div className="card-head">
            <h2>👨‍🏫 Impor Data Guru</h2>
            <span className="badge badge-teal">AKUN GURU</span>
          </div>
          <div className="card-body">
            <p className="muted" style={{ marginBottom: 12 }}>
              Mendukung pendaftaran massal akun guru pengajar beserta NIP untuk presensi dan jurnal mengajar.
            </p>

            <div style={{ marginBottom: 16 }}>
              <a
                href="/api/templates/guru"
                download
                className="btn btn-yellow"
                style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}
              >
                📥 Unduh Template CSV Guru
              </a>
            </div>

            <form action={uploadPreview} encType="multipart/form-data" style={{ display: "grid", gap: 12 }}>
              <input type="hidden" name="kind" value="guru" />
              <div className="field" style={{ margin: 0 }}>
                <label className="field-label">Pilih Berkas CSV Guru</label>
                <input className="input" type="file" name="file" accept=".csv,text/csv" required />
              </div>
              <button className="btn btn-primary" type="submit" style={{ minHeight: 44 }}>
                🔍 Pratinjau & Validasi Data Guru →
              </button>
            </form>

            <details style={{ marginTop: 14 }}>
              <summary className="pill" style={{ cursor: "pointer", fontWeight: 700 }}>
                📋 Contoh Format Isi CSV Guru
              </summary>
              <pre className="prose muted" style={{ fontSize: 12, marginTop: 8, padding: 10, background: "#fff", border: "2px solid #000" }}>
                {TEMPLATE_GURU}
              </pre>
              <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                • Kolom wajib: <code>nama</code>, dan salah satu dari <code>nip</code> atau <code>username</code>.<br />
                • Jika nama mengandung koma/gelar (misal <i>Budi, S.Pd.</i>), apit dengan tanda kutip dua <code>&quot;...&quot;</code>.
              </p>
            </details>
          </div>
        </div>

        {/* KARTU 3: JADWAL PELAJARAN */}
        <div className="card">
          <div className="card-head">
            <h2>🗓️ Impor Jadwal Pelajaran</h2>
            <span className="badge badge-magenta">SINKRON PRESENSI & LMS</span>
          </div>
          <div className="card-body">
            <p className="muted" style={{ marginBottom: 12 }}>
              Otomatis memetakan jadwal mengajar mingguan guru, rombel, mapel, dan sesi presensi kelas.
            </p>

            <div style={{ marginBottom: 16 }}>
              <a
                href="/api/templates/jadwal"
                download
                className="btn btn-yellow"
                style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}
              >
                📥 Unduh Template CSV Jadwal
              </a>
            </div>

            <form action={uploadPreview} encType="multipart/form-data" style={{ display: "grid", gap: 12 }}>
              <input type="hidden" name="kind" value="jadwal" />
              <div className="field" style={{ margin: 0 }}>
                <label className="field-label">Pilih Berkas CSV Jadwal</label>
                <input className="input" type="file" name="file" accept=".csv,text/csv" required />
              </div>
              <button className="btn btn-primary" type="submit" style={{ minHeight: 44 }}>
                🔍 Pratinjau & Validasi Jadwal Pelajaran →
              </button>
            </form>

            <details style={{ marginTop: 14 }}>
              <summary className="pill" style={{ cursor: "pointer", fontWeight: 700 }}>
                📋 Contoh Format Isi CSV Jadwal
              </summary>
              <pre className="prose muted" style={{ fontSize: 12, marginTop: 8, padding: 10, background: "#fff", border: "2px solid #000" }}>
                {TEMPLATE_JADWAL}
              </pre>
              <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                • Kolom: <code>hari,jam_mulai,jam_selesai,rombel,mapel,guru,ruang</code>.<br />
                • Format jam: <code>07:30</code>, <code>09:00</code>.<br />
                • Kolom <code>guru</code> dapat berupa NIP, Username, atau Nama Guru.
              </p>
            </details>
          </div>
        </div>

        {/* KARTU 4: ORANG TUA */}
        <div className="card">
          <div className="card-head">
            <h2>👨‍👩‍👦 Impor Data Orang Tua</h2>
            <span className="badge badge-yellow">TAUTAN SISWA VIA NISN</span>
          </div>
          <div className="card-body">
            <p className="muted" style={{ marginBottom: 12 }}>
              Mendukung pembuatan akun orang tua massal dan otomatis menghubungkannya ke anak via NISN siswa.
            </p>

            <div style={{ marginBottom: 16 }}>
              <a
                href="/api/templates/ortu"
                download
                className="btn btn-yellow"
                style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}
              >
                📥 Unduh Template CSV Orang Tua
              </a>
            </div>

            <form action={uploadPreview} encType="multipart/form-data" style={{ display: "grid", gap: 12 }}>
              <input type="hidden" name="kind" value="ortu" />
              <div className="field" style={{ margin: 0 }}>
                <label className="field-label">Pilih Berkas CSV Orang Tua</label>
                <input className="input" type="file" name="file" accept=".csv,text/csv" required />
              </div>
              <button className="btn btn-primary" type="submit" style={{ minHeight: 44 }}>
                🔍 Pratinjau & Validasi Data Orang Tua →
              </button>
            </form>

            <details style={{ marginTop: 14 }}>
              <summary className="pill" style={{ cursor: "pointer", fontWeight: 700 }}>
                📋 Contoh Format Isi CSV Orang Tua
              </summary>
              <pre className="prose muted" style={{ fontSize: 12, marginTop: 8, padding: 10, background: "#fff", border: "2px solid #000" }}>
                {TEMPLATE_ORTU}
              </pre>
              <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                • Kolom wajib: <code>nama</code>, <code>anak_nisn</code>.<br />
                • Kolom opsional: <code>username</code> (otomatis <code>P[NISN]</code> jika kosong), <code>hubungan</code> (AYAH/IBU/WALI).
              </p>
            </details>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
