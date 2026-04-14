import { proxyToFastAPI } from "@/lib/fastapi";

export async function GET() {
  try {
    return await proxyToFastAPI("/api/health", { method: "GET" });
  } catch {
    return Response.json(
      { status: "error", message: "FastAPI backend unreachable" },
      { status: 503 }
    );
  }
}
