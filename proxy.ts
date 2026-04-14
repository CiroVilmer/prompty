import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Protected route prefixes — any path starting with these requires authentication
const PROTECTED_PREFIXES = ["/dashboard"];

// Public paths that never require authentication
const PUBLIC_PATHS = ["/", "/login", "/register", "/api/health"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

/**
 * proxy — Next.js 16 route proxy (replaces middleware.ts).
 *
 * Runs on every request before it reaches a route handler or page.
 * Redirects unauthenticated users away from protected routes.
 */
export default function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Always allow static files and Next.js internals through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Public API routes (other than /api/health handled above)
  if (pathname.startsWith("/api/") && !isProtected(pathname)) {
    return NextResponse.next();
  }

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  if (isProtected(pathname)) {
    // Check for an auth token in cookies (cookie name matches AUTH_SECRET usage in lib/auth.ts)
    const token =
      request.cookies.get("auth-token")?.value ??
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match every request path except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
