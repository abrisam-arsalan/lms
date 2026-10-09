// Parser CSV kecil (RFC4180-ish): kutip ganda, ; atau , auto, BOM, CRLF.

export function parseCsv(text: string): string[][] {
  text = text.replace(/^﻿/, "");
  const firstLine = text.split(/\r?\n/)[0] ?? "";
  const delim = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === delim) { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); field = ""; if (row.some((x) => x.trim())) rows.push(row); row = []; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  row.push(field);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

/** petakan header → index kolom (case-insensitive, alias | dipisah '/') */
export function headerIdx(header: string[]): Record<string, number> {
  const m: Record<string, number> = {};
  header.forEach((h, i) => (m[h.trim().toLowerCase()] = i));
  return m;
}

export const cell = (row: string[], m: Record<string, number>, key: string): string => {
  const i = m[key];
  return i === undefined || row[i] === undefined ? "" : String(row[i]).trim();
};
