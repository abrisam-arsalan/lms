import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

// Di server: /var/www/lms/storage/uploads (luar webroot nginx — pola mpi).
export const STORAGE_DIR = path.resolve(process.env.STORAGE_DIR ?? "storage/uploads");
export const MAX_FILE_MB = 20;

const SAFE_EXT = /\.(pdf|png|jpe?g|gif|webp|svg|zip|rar|7z|docx?|xlsx?|pptx?|odt|ods|txt)$/i;

export async function saveUpload(file: File, maxMb = MAX_FILE_MB): Promise<string> {
  if (file.size === 0) throw new Error("File kosong");
  if (file.size > maxMb * 1024 * 1024) throw new Error(`Ukuran file > ${maxMb} MB`);
  const nama = file.name || "file";
  const ext = path.extname(nama).toLowerCase();
  if (ext && !SAFE_EXT.test(ext)) throw new Error(`Jenis file ${ext} tidak diizinkan`);
  const storedName = `${Date.now()}-${crypto.randomUUID()}${ext || ""}`;
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  await fs.writeFile(path.join(STORAGE_DIR, storedName), Buffer.from(await file.arrayBuffer()));
  return storedName;
}

export async function readStored(storedName: string): Promise<Buffer> {
  // cegah path traversal
  const safe = path.basename(storedName);
  return fs.readFile(path.join(STORAGE_DIR, safe));
}

export async function removeStored(storedName: string): Promise<void> {
  await fs.unlink(path.join(STORAGE_DIR, path.basename(storedName))).catch(() => {});
}
