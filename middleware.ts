import { NextRequest, NextResponse } from "next/server";
export function middleware(request: NextRequest): NextResponse {
  if (!request.cookies.get("bookt_admin_session")?.value) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}
export const config = { matcher: ["/((?!login|api/health|_next/static|_next/image|favicon.ico).*)"] };
