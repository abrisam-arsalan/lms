import fs from "node:fs/promises";
import path from "node:path";
import { requireRole } from "@/lib/auth";
import AppShell from "@/components/app-shell";
import { planSiswa, planGuru, type ImportKind } from "@/lib/importer";
import { uploadPreview, commitImport } from "./actions";

export const dynamic = "force-dynamic";

const IMPORT_DIR = path.resolve("storage/imports");
const TEMPLATE_SISWA = "nis,nisn,nama,rombel\n1001,0101306751,Andi Pratama,9F\n1002,0115115101,Bunga Citra,9F\n1003,,Cahyo Nugroho,8B";
const TEMPLATE_GURU = 'nip,nama\n198501012010011001,"Budi Santoso, S.Pd."\n2026001,"Siti Rahayu, S.Pd."';

export default async function AdminImportPage({
  searchParams,
}: {
  searchParams: Promise<{ rev?: string; kind?: string; done?: string; err?: string }>;
}) {
  const me = await requireRole(["ADMIN"]);
  const { rev, kind, done, err } = await searchParams;
  const k: ImportKind = kind === "guru" ? "guru" : "siswa";

  // ── hasil ──
  if (done) {
    let res: { created: number; skipped: number; existing: number; errors: string[]; rombelBaru: string[] } | null = null;
    try {
      const safe = done.replace(/[^0-9a-f]/g, "").slice(0, 32);
      res = JSON.parse(await fs.readFile(path.join(IMPORT_DIR, `${safe}.done.json`), "utf8"));
      await fs.rm(path.join(IMPORT_DIR, `${safe}.done.json`), { force: true });
    } catch { /* file hilang */ }
    return (
      <AppShell user={me} active="/admin/import">
        <div className="page-head"><h1>Hasil Impor 📥</h1>{err && <p className="error">{decodeURIComponent(err)}</p>}</div>
        {res ? (
          <div className="card"><div className="card-body">
            <p><span className="badge badge-green">dibuat {res.created}</span>{" "}
              <span className="badge badge-yellow">dilewati (sudah ada) {res.existing}</span>{" "}
              <span className="badge badge-red">gagal {res.skipped}</span></p>
            {res.rombelBaru.length > 0 && <p className="muted" style={{ marginTop: 8 }}>Rombel baru dibuat otomatis: {res.rombelBaru.join(", ")}</p>}
            {res.errors.length > 0 && (
              <ul className="muted" style={{ marginTop: 8, paddingLeft: 18 }}>
                {res.errors.slice(0, 30).map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
            <p style={{ marginTop: 10 }}><a className="btn btn-sm" href="/admin/users">Lihat akun →</a> {" "}
              <a className="btn btn-sm" href="/admin/master">Master →</a></p>
          </div></div>
        ) : <div className="empty">Catatan hasil tidak ditemukan (sudah dibuka/ kedaluarsa).</div>}
      </AppShell>
    );
  }

  // ── pratinjau ──
  if (rev) {
    const safe = rev.replace(/[^0-9a-f]/g, "").slice(0, 32);
    let text = "";
    try { text = await fs.readFile(path.join(IMPORT_DIR, `${safe}.csv`), "utf8"); } catch { /* fallthrough */ }
    if (!text) {
      return (
        <AppShell user={me} active="/admin/import">
          <div className="page-head"><h1>Import CSV 📥</h1></div>
          <div className="empty">Sesi preview hilang — unggah ulang file.</div>
        </AppShell>
      );
    }
    const { rows, problems } = k === "guru" ? planGuru(text) : planSiswa(text);
    const okCount = rows.filter((r) => r.status === "OK").length;
    return (
      <AppShell user={me} active="/admin/import">
        <div className="page-head">
          <h1>Pratinjau impor {k === "guru" ? "guru" : "siswa"} 📥</h1>
          <p>{rows.length} baris terbaca · <b style={{ color: "var(--green)" }}>{okCount} siap</b> · {rows.length - okCount} ada masalah{problems.length ? ` · ${problems.join(" · ")}` : ""}</p>
        </div>
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>#</th><th>Username</th><th>Nama</th>{k === "siswa" && <th>Rombel</th>}<th>Status</th></tr></thead>
              <tbody>
                {rows.slice(0, 60).map((r) => (
                  <tr key={r.line}>
                    <td>{r.line}</td><td>{r.username || "—"}</td><td>{r.nama}</td>
                    {k === "siswa" && <td>{r.rombel ?? "—"}</td>}
                    <td>
                      {r.status === "OK"
                        ? <span className="badge badge-green">OK</span>
                        : <span className="badge badge-red">{r.reason}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 60 && <p className="muted card-body">… {rows.length - 60} baris lainnya tak ditampilkan (akan tetap diproses).</p>}
        </div>
        <div className="card">
          <div className="card-body">
            <form action={commitImport} style={{ display: "flex", gap: 10, alignItems: "end", flexWrap: "wrap" }}>
              <input type="hidden" name="rev" value={safe} />
              <input type="hidden" name="kind" value={k} />
              <div className="field" style={{ margin: 0, width: 240 }}>
                <label className="field-label">Password sementara semua akun baru</label>
                <input className="input" name="tmpPass" defaultValue="Smp5Tegal!2026" minLength={6} required />
              </div>
              <button className="btn btn-primary" type="submit">✔ Konfirmasi impor ({okCount} akun)</button>
            </form>
            <p className="muted" style={{ marginTop: 8 }}>Akun yang sudah ada (username/NISN sama) tidak ditimpa. Rombel baru dibuat otomatis.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── form unggah ──
  return (
    <AppShell user={me} active="/admin/import">
      <div className="page-head">
        <h1>Import CSV 📥</h1>
        <p><a href="/admin/users">👥 Akun</a> · <a href="/admin/master">🗂 Master</a></p>
        {err && <p className="error">{decodeURIComponent(err)}</p>}
      </div>
      <div className="grid">
        <div className="card">
          <div className="card-head"><h2>Siswa</h2><span className="pill">multi-rombel ✓</span></div>
          <div className="card-body">
            <form action={uploadPreview} encType="multipart/form-data" style={{ display: "grid", gap: 10 }}>
              <input type="hidden" name="kind" value="siswa" />
              <input className="input" type="file" name="file" accept=".csv,text/csv" required />
              <button className="btn btn-primary" type="submit">Pratinjau →</button>
            </form>
            <details style={{ marginTop: 10 }}>
              <summary className="pill" style={{ cursor: "pointer" }}>format contoh (Excel → Save As CSV)</summary>
              <pre className="prose muted" style={{ fontSize: 12, marginTop: 6 }}>{TEMPLATE_SISWA}</pre>
              <p className="muted">nisn ATAU nis wajib ada (jadi username). Rombel contoh: 9F, 7A.</p>
            </details>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h2>Guru</h2></div>
          <div className="card-body">
            <form action={uploadPreview} encType="multipart/form-data" style={{ display: "grid", gap: 10 }}>
              <input type="hidden" name="kind" value="guru" />
              <input className="input" type="file" name="file" accept=".csv,text/csv" required />
              <button className="btn btn-primary" type="submit">Pratinjau →</button>
            </form>
            <details style={{ marginTop: 10 }}>
              <summary className="pill" style={{ cursor: "pointer" }}>format contoh</summary>
              <pre className="prose muted" style={{ fontSize: 12, marginTop: 6 }}>{TEMPLATE_GURU}</pre>
              <p className="muted">Catatan: nama berisi koma sebaiknya diapit tanda kutip &quot;...&quot; (standar CSV).</p>
            </details>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
