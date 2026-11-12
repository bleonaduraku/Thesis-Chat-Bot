/**
 * Minimal admin protection for the knowledge-base management area
 * (/knowledge and /api/documents). Uses HTTP Basic Auth: the browser shows
 * a login prompt, then sends the credentials with every same-origin request,
 * including the page's own fetch() calls to /api/documents.
 *
 * Username: "admin". Password: the ADMIN_PASSWORD environment variable.
 * If ADMIN_PASSWORD is not set, access is denied (fail closed), so a
 * deployment without it can never expose the admin area by accident.
 */
export const ADMIN_USER = "admin";

export function isAdminRequest(request: Request): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  let decoded: string;
  try {
    decoded = atob(header.slice("Basic ".length));
  } catch {
    return false;
  }
  const sep = decoded.indexOf(":");
  if (sep === -1) return false;

  return (
    safeEqual(decoded.slice(0, sep), ADMIN_USER) &&
    safeEqual(decoded.slice(sep + 1), password)
  );
}

/** Response that makes the browser show its login prompt. */
export function adminChallenge(): Response {
  return new Response("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="UBT Assistant admin", charset="UTF-8"' },
  });
}

// Constant-time string comparison, so response timing doesn't reveal how
// many leading characters of a guessed password were correct.
function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}
