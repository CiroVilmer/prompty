/**
 * Proxy helper: forwards requests from Next.js API routes to the
 * FastAPI backend. The FastAPI server runs on FASTAPI_URL (default
 * http://localhost:8000).
 */

const FASTAPI_URL =
  process.env.FASTAPI_URL ?? "http://localhost:8000";

export async function proxyToFastAPI(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = `${FASTAPI_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  // Return the FastAPI response as-is so the Next.js route can relay it
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
