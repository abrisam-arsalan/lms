"use client";

// Tombol submit dgn konfirmasi browser — utk aksi hapus/berdampak.
// Server action diteruskan sbg prop (serializable oleh Next).
export default function DangerSubmit({
  action,
  confirmText = "Yakin? Tindakan ini tidak bisa dibatalkan.",
  children,
  hidden,
  btnClass = "btn btn-danger btn-sm",
}: {
  action: (formData: FormData) => Promise<void> | void;
  confirmText?: string;
  children: React.ReactNode;
  hidden?: Record<string, string>;
  btnClass?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
      style={{ display: "inline" }}
    >
      {hidden &&
        Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <button className={btnClass} type="submit">
        {children}
      </button>
    </form>
  );
}
