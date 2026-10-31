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

  // Everything under /admin (including the login page itself) stays in
  // English for the admin, regardless of the public language cookie. The
  // x-force-locale header tells the root layout to override the locale.
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");

  const isProtectedApi =
    pathname.startsWith("/api/admin/") ||
    (pathname.startsWith("/api/schemes") && request.method !== "GET");

  if (isProtectedApi) {
    if (!authed) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    return withAdminLocale(NextResponse.next(), isAdminArea);
  }

  if (isAdminArea && pathname !== "/admin" && !authed) {
    const loginUrl = new URL("/admin", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return withAdminLocale(NextResponse.next(), isAdminArea);
}

function withAdminLocale(response, isAdminArea) {
  if (isAdminArea) {
    response.headers.set("x-force-locale", "en");
  }
  return response;
}

export const config = {
  matcher: [
    "/admin",
    "/admin/dashboard/:path*",
    "/admin/schemes/:path*",
    "/admin/pending/:path*",
    "/admin/sources/:path*",
    "/api/admin/:path*",
    "/api/schemes/:path*",
  ],
};
