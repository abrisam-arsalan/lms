import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Gerbang kasar: tanpa sesi → ke /login.
// /api/v1 = endpoint mesin (auth token sendiri)
// /api/handoff = verifikasi dari CBT (auth shared secret)
const PUBLIC_PATHS = [
  /^\/login$/,
  /^\/change-pin$/,
  /^\/api\/auth\//,
  /^\/api\/v1\//,
  /^\/api\/handoff\//,
  /^\/healthz$/,
  /^\/_next\//,
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((re) => re.test(pathname))) return NextResponse.next();
  const token = req.cookies.get("panglima_session")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/((?!favicon.ico|.*\\.(?:ico|png|svg|txt|webp)$).*)",
};
