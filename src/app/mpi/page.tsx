import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/app-shell";

const DEFAULT_GAMES = [
  { slug: "clash-of-champions", title: "Clash of Champions", desc: "Kompetisi adu cepat menjawab kuis pengetahuan.", icon: "🏆", file: "clash-of-champions.html" },
  { slug: "edu-racing", title: "Edu Racing", desc: "Balapan mobil edukatif menjawab pertanyaan cepat.", icon: "🏎️", file: "edu-racing.html" },
  { slug: "famili-100", title: "Famili 100", desc: "Tebak jawaban teratas dari survei kelas.", icon: "👨‍👩‍👧‍👦", file: "famili-100.html" },
  { slug: "gesture-battle", title: "Gesture Battle", desc: "Tantangan interaktif dengan respon gerakan.", icon: "✋", file: "gesture-battle.html" },
  { slug: "kamera-benar-salah", title: "Kamera Benar / Salah", desc: "Deteksi pilihan jawaban menggunakan gestur kamera.", icon: "📷", file: "kamera-benar-salah.html" },
  { slug: "millionaire", title: "Who Wants to Be a Millionaire", desc: "Kuis bertingkat dengan bantuan 50:50 dan voting.", icon: "💰", file: "millionaire.html" },
  { slug: "mystery-box", title: "Mystery Box", desc: "Pilih kotak misterius berisi pertanyaan dan hadiah skor.", icon: "🎁", file: "mystery-box.html" },
  { slug: "snake-quiz", title: "Snake Quiz", desc: "Game ular klasik memakan jawaban yang tepat.", icon: "🐍", file: "snake-quiz.html" },
  { slug: "xxo-edukasi", title: "XXO Edukasi", desc: "Tic-Tac-Toe dengan soal pemikiran kritis di setiap giliran.", icon: "⭕", file: "xxo-edukasi.html" },
];

export default async function MpiPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string }>;
}) {
  const user = await requireUser();
  const { game: activeGameSlug } = await searchParams;

  const activeGame = DEFAULT_GAMES.find((g) => g.slug === activeGameSlug);

  if (activeGame) {
    return (
      <AppShell user={user} active="/mpi">
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22 }}>
              {activeGame.icon} {activeGame.title}
            </h1>
            <p className="muted" style={{ margin: "4px 0 0 0" }}>{activeGame.desc}</p>
          </div>
          <a className="btn btn-ghost" href="/mpi">
            ← Kembali ke Arena Game
          </a>
        </div>

        <div
          className="card"
          style={{
            padding: 0,
            overflow: "hidden",
            height: "calc(100vh - 220px)",
            minHeight: 560,
            border: "3px solid var(--border)",
            boxShadow: "var(--shadow)",
          }}
        >
          <iframe
            src={`/game/${activeGame.file}`}
            style={{ width: "100%", height: "100%", border: "none" }}
            title={activeGame.title}
            allow="camera; microphone; fullscreen; autoplay"
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user} active="/mpi">
      <div className="page-head">
        <h1>Media Pembelajaran Interaktif (MPI) 🎮</h1>
        <p>Game edukasi interaktif berbasis web untuk pembelajaran aktif di kelas dan mandiri.</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {DEFAULT_GAMES.map((g) => (
          <div key={g.slug} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{g.icon}</div>
              <h2 style={{ fontSize: 18, marginBottom: 6 }}>{g.title}</h2>
              <p className="muted" style={{ fontSize: 14 }}>{g.desc}</p>
            </div>
            <div style={{ marginTop: 16 }}>
              <a className="btn btn-primary" style={{ width: "100%", textAlign: "center" }} href={`/mpi?game=${g.slug}`}>
                Mainkan Game →
              </a>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
