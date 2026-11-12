import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdminRequest, adminChallenge } from "@/lib/adminAuth";

// Asks for the admin password before the knowledge-base area is served.
// The /api/documents route handlers check the password again themselves,
// so the API stays protected even if this matcher is ever changed.
export function proxy(request: NextRequest) {
  if (!isAdminRequest(request)) return adminChallenge();
  return NextResponse.next();
}

export const config = {
  matcher: ["/knowledge", "/knowledge/:path*", "/api/documents", "/api/documents/:path*"],
};
