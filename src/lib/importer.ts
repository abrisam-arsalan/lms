import { parseCsv, headerIdx, cell } from "@/lib/csv";

export type ImportKind = "siswa" | "guru";

export interface RowPlan {
  line: number;      // nomor baris di file ( utk laporan )
  username: string;
  nama: string;
  nis?: string;
  nisn?: string;
  nip?: string;
  rombel?: string;   // siswa — boleh campur banyak rombel dalam 1 file
  status: "OK" | "ERR";
  reason?: string;
}

const clean = (s: string, max = 120) => s.trim().slice(0, max);

/** CSV siswa — header minimal: nama, rombel; identitas: nisn atau nis (dipakai sbg username). */
export function planSiswa(text: string): { rows: RowPlan[]; problems: string[] } {
  const problems: string[] = [];
  const grid = parseCsv(text);
  if (!grid.length) return { rows: [], problems: ["File kosong."] };
  const h = headerIdx(grid[0]);
  for (const k of ["nama", "rombel"]) {
    if (h[k] === undefined && !(k === "nama" && h["nama siswa"] !== undefined)) problems.push(`Kolom '${k}' wajib ada di header.`);
  }
  if (problems.length) return { rows: [], problems };
  const namaCol = h["nama"] ?? h["nama siswa"];
  const rombelCol = h["rombel"] ?? h["kelas"];
  const seen = new Set<string>();
  const rows: RowPlan[] = [];
  for (let i = 1; i < grid.length; i++) {
    const r = grid[i];
    const nama = clean(r[namaCol] ?? "");
    const rombel = clean(r[rombelCol ?? -1] ?? "", 16).toUpperCase();
    const nisn = clean(r[h["nisn"] ?? -1] ?? "", 32);
    const nis = clean(r[h["nis"] ?? -1] ?? "", 32);
    const username = clean(r[h["username"] ?? -1] ?? "") || nisn || (nis ? `nis${nis}` : "");
    let status: RowPlan["status"] = "OK";
    let reason = "";
    if (!nama) { status = "ERR"; reason = "nama kosong"; }
    else if (!rombel || !/^\d[A-Z]?$/.test(rombel)) { status = "ERR"; reason = `rombel '${rombel || "-"}' tidak valid (contoh: 9F)`; }
    else if (!username) { status = "ERR"; reason = "butuh NISN atau NIS (dipakai sbg username)"; }
    else if (seen.has(username)) { status = "ERR"; reason = "duplikat dalam file"; }
    if (status === "OK") seen.add(username);
    rows.push({ line: i + 1, username, nama, nis: nis || undefined, nisn: nisn || undefined, rombel, status, reason: reason || undefined });
  }
  return { rows, problems };
}

/** CSV guru — header minimal: nama; username dari nip/kolom username. */
export function planGuru(text: string): { rows: RowPlan[]; problems: string[] } {
  const problems: string[] = [];
  const grid = parseCsv(text);
  if (!grid.length) return { rows: [], problems: ["File kosong."] };
  const h = headerIdx(grid[0]);
  if (h["nama"] === undefined) problems.push("Kolom 'nama' wajib ada di header.");
  if (problems.length) return { rows: [], problems };
  const seen = new Set<string>();
  const rows: RowPlan[] = [];
  for (let i = 1; i < grid.length; i++) {
    const r = grid[i];
    const nama = clean(r[h["nama"]] ?? "");
    const nip = clean(r[h["nip"] ?? -1] ?? "", 32);
    const username = clean(r[h["username"] ?? -1] ?? "") || nip;
    let status: RowPlan["status"] = "OK";
    let reason = "";
    if (!nama) { status = "ERR"; reason = "nama kosong"; }
    else if (!username) { status = "ERR"; reason = "butuh NIP atau kolom username"; }
    else if (seen.has(username)) { status = "ERR"; reason = "duplikat dalam file"; }
    if (status === "OK") seen.add(username);
    rows.push({ line: i + 1, username, nama, nip: nip || undefined, status, reason: reason || undefined });
  }
  return { rows, problems };
}

export interface ImportResult {
  created: number;
  skipped: number;
  errors: string[];
  rombelBaru: string[];
}
