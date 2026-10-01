import path from "node:path";
import { fileURLToPath } from "node:url";

// Paksa root trace = folder proyek (bukan home — di Windows bisa ada package.json
// nyasar di folder ancestor, yang membuat output standalone jadi nested & deploy ambigu).
const PROJECT_ROOT = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: PROJECT_ROOT,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
