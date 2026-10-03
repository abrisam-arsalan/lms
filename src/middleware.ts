import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Gerbang kasar: tanpa sesi → ke /login. Verifikasi sesungguhnya (DB) terjadi
// di server component/route lewat requireUser — middleware edge tak bisa akses Prisma.
// /api/v1 = endpoint mesin (auth token sendiri, bukan cookie sesi)
const PUBLIC_PATHS = [/^\/login$/, /^\/api\/auth\//, /^\/api\/v1\//, /^\/healthz$/, /^\/_next\//];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((re) => re.test(pathname))) return NextResponse.next();
  const token = req.cookies.get("lms_session")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/((?!favicon.ico|.*\\.(?:ico|png|svg|txt)$).*)",
};
