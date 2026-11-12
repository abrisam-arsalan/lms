// Klasifikasi jenis preview berkas utk "lihat di portal" (tanpa unduh).
export type PreviewKind = "pdf" | "image" | "text" | "office" | "other";

// Hanya jenis ini yang boleh disajikan inline (iframe) — svg/office dikecualikan
// demi keamanan (svg bisa berisi skrip; office tak bisa dirender browser).
export function previewKind(nama: string, mime: string): PreviewKind {
  const m = (mime || "").toLowerCase();
  const n = (nama || "").toLowerCase();
  if (m === "application/pdf" || n.endsWith(".pdf")) return "pdf";
  if (/^image\/(png|jpe?g|gif|webp|avif)$/.test(m) || /\.(png|jpe?g|gif|webp|avif)$/.test(n)) return "image";
  if (m === "text/plain" || m === "text/csv" || /\.(txt|csv|md)$/.test(n)) return "text";
  if (
    /officedocument|msword|ms-excel|mspowerpoint|opendocument|application\/(zip|vnd\.( rar|7z))|\.docx?$|\.xlsx?$|\.pptx?$|\.odt$|\.ods$|\.zip$|\.rar$|\.7z$/.test(m) ||
    /\.(docx?|xlsx?|pptx?|odt|ods|zip|rar|7z)$/.test(n)
  )
    return "office";
  return "other";
}

export function canInlineServe(kind: PreviewKind): boolean {
  return kind === "pdf" || kind === "image" || kind === "text";
}
