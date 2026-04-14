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

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
  } catch (err) {
    // Backend unreachable (ECONNREFUSED, timeout, etc.) — return a clean 503
    const message =
      err instanceof Error ? err.message : "Backend unavailable";
    return new Response(JSON.stringify({ error: message }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Relay the FastAPI response as-is
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
