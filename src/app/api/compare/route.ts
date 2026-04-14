import type { NextRequest } from "next/server";
import { proxyToFastAPI } from "@/lib/fastapi";

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyToFastAPI("/api/compare", { method: "POST", body });
}
