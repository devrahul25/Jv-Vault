import { NextRequest, NextResponse } from "next/server";

// Lightweight guard: if the session cookie is missing, redirect /dashboard pages to /login.
// (Full validity is checked server-side in each API route and page.)
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.get("jv_session")?.value;

  if (pathname.startsWith("/dashboard") && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
