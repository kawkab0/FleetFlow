import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("fleetflow_token")?.value;

  const isLoginPage = request.nextUrl.pathname === "/login";

  // If the user is not logged in, send them to the login page.
  if (!token && !isLoginPage) {
    return NextResponse.redirect(
      new URL("/login", request.url),
    );
  }

  // If the user is already logged in and visits /login,
  // send them to the dashboard.
  if (token && isLoginPage) {
    return NextResponse.redirect(
      new URL("/", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Protect all application routes except
     * Next.js internals and static files.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
