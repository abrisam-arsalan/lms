import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LMS SMPN 5 Tegal",
  description: "Belajar-mengajar: materi, tugas, nilai, jadwal",
  icons: { icon: "/assets/logo.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // utk env(safe-area-inset-bottom) di bottom-nav (iPhone X+)
  themeColor: "#3858F8", // selaras presensi
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
