/**
 * Auth helpers placeholder.
 *
 * Wire these up to your chosen auth library (e.g. Auth.js / next-auth v5,
 * Lucia, Clerk, or a custom JWT implementation).
 *
 * The proxy.ts file expects an "auth-token" cookie to be set on sign-in and
 * cleared on sign-out.
 */

import type { User } from "@/types";

const AUTH_SECRET = process.env.AUTH_SECRET;
const COOKIE_NAME = "auth-token";

if (!AUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("AUTH_SECRET environment variable is not set.");
}

// ─── Token helpers ────────────────────────────────────────────────────────────

/**
 * Stub: create a signed session token for the given user.
 * Replace with a real JWT / encrypted token implementation.
 */
export function createToken(user: Pick<User, "id" | "email">): string {
  // TODO: sign a JWT using AUTH_SECRET
  return Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString(
    "base64"
  );
}

/**
 * Stub: verify and decode a session token.
 * Returns null if the token is invalid.
 */
export function verifyToken(
  token: string
): Pick<User, "id" | "email"> | null {
  try {
    // TODO: verify JWT signature using AUTH_SECRET
    const payload = JSON.parse(Buffer.from(token, "base64").toString("utf8")) as unknown;
    if (
      typeof payload === "object" &&
      payload !== null &&
      "id" in payload &&
      "email" in payload
    ) {
      return payload as Pick<User, "id" | "email">;
    }
    return null;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
