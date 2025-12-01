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
    // Check for Better Auth session cookie
    // Try multiple possible cookie names (with and without prefix)
    const possibleCookieNames = [
      "ledgermind.session_token",
      "better-auth.session_token",
      "session_token",
      "__Secure-ledgermind.session_token",
      "__Host-ledgermind.session_token"
    ];
    
    let hasSession = false;
    for (const cookieName of possibleCookieNames) {
      if (request.cookies.get(cookieName)) {
        hasSession = true;
        console.log("Found session cookie:", cookieName);
        break;
      }
    }

    // Also check for any cookie that contains "session"
    if (!hasSession) {
      const allCookies = request.cookies.getAll();
      console.log("All cookies:", allCookies.map(c => c.name));
      for (const cookie of allCookies) {
        if (cookie.name.toLowerCase().includes("session")) {
          hasSession = true;
          console.log("Found session-like cookie:", cookie.name);
          break;
        }
      }
    }

    if (!hasSession) {
      console.log("No session cookie found, redirecting to login");
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
