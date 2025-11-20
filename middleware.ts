import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Use Node.js runtime instead of Edge to support MongoDB/crypto
export const runtime = "nodejs";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => route === pathname)) {
    return NextResponse.next();
  }

  // Check authentication for /app routes
  if (pathname.startsWith("/app")) {
    // Check for Better Auth session cookie (using "ledgermind" prefix from config)
    const sessionCookie = request.cookies.get("ledgermind.session_token");

    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
