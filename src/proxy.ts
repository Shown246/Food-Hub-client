import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token =
    request.cookies.get("better-auth.session_token")?.value ??
    request.cookies.get("__Secure-better-auth.session_token")?.value;
  const { pathname } = request.nextUrl;

  // This is only a fast navigation guard. Server layouts and the backend
  // validate the session and role before protected content or data is used.
  if (!token) {
    if (pathname.startsWith("/console")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return NextResponse.redirect(new URL("/console", request.url));
  }

  return NextResponse.next();
}

// Exclude static files, API endpoints, and internal Next.js assets
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
