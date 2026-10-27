import { NextResponse } from "next/server";
import { isValidSessionToken, SESSION_COOKIE_NAME } from "./lib/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authed = await isValidSessionToken(token);

  const isPublicAdminApi =
    pathname === "/api/admin/login" || pathname === "/api/admin/logout";

  if (isPublicAdminApi) {
    return NextResponse.next();
  }

  const isProtectedApi =
    pathname.startsWith("/api/admin/") ||
    (pathname.startsWith("/api/schemes") && request.method !== "GET");

  if (isProtectedApi) {
    if (!authed) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (!authed) {
    const loginUrl = new URL("/admin", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/schemes/:path*",
    "/admin/pending/:path*",
    "/admin/sources/:path*",
    "/api/admin/:path*",
    "/api/schemes/:path*",
  ],
};
