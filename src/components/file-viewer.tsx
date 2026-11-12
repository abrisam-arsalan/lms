"use client";

import { useEffect, useState } from "react";
import { previewKind } from "@/lib/fileview";

const sizeTxt = (b: number) =>
  b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

/**
 * Chip berkas ala portal Panglima: klik → pratinjau inline di portal (pdf/gambar/teks),
 * TIDAK memaksa unduh. Office/zip → modal berisi tombol unduh (browser tak bisa render).
 */
export default function FileViewer({
  kind,
  id,
  nama,
  mime,
  sizeBytes,
}: {
  kind: "m" | "t" | "s";
  id: string;
  nama: string;
  mime: string;
  sizeBytes: number;
}) {
  const [open, setOpen] = useState(false);
  const view = previewKind(nama, mime);
  const url = `/api/file/${kind}-${id}`;
  const viewUrl = `${url}?v=1`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="filechip"
        onClick={() => setOpen(true)}
        title={`${view === "pdf" || view === "image" || view === "text" ? "Lihat di portal" : "Unduh"} — ${nama}`}
      >
        {view === "image" ? "🖼️" : view === "pdf" ? "📄" : "📎"} {nama}
        <span className="filechip-size">{sizeTxt(sizeBytes)} · {view === "pdf" || view === "image" || view === "text" ? "lihat" : "unduh"}</span>
      </button>

      {open && (
        <div className="fv-overlay" onClick={() => setOpen(false)} role="presentation">
          <div className="fv-modal" role="dialog" aria-modal="true" aria-label={nama} onClick={(e) => e.stopPropagation()}>
            <div className="fv-head">
              <b className="fv-title">{nama}</b>
              <span className="fv-actions">
                <a className="btn btn-sm" href={url} download={nama}>⬇ Unduh</a>
                <button className="btn btn-sm btn-danger" onClick={() => setOpen(false)} aria-label="Tutup">✕</button>
              </span>
            </div>
            <div className="fv-body">
              {view === "pdf" && <iframe className="fv-frame" src={viewUrl} title={nama} />}
              {view === "image" && <img className="fv-img" src={viewUrl} alt={nama} loading="lazy" />}
              {view === "text" && <iframe className="fv-frame" src={viewUrl} title={nama} />}
              {(view === "office" || view === "other") && (
                <div className="fv-fallback">
                  <p style={{ fontSize: 34, margin: "0 0 8px" }}>🗂️</p>
                  <p>
                    Pratinjau <b>{nama.split(".").pop()?.toUpperCase()}</b> tidak tersedia di browser —
                    file tetap bisa <b>diunduh</b>, atau buka di aplikasi Office di HP/laptopmu.
                  </p>
                  <a className="btn btn-primary" href={url} download={nama}>⬇ Unduh sekarang ({sizeTxt(sizeBytes)})</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
