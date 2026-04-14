import { NextResponse } from "next/server";

interface HealthResponse {
  status: "ok";
  timestamp: string;
  version: string;
}

/**
 * GET /api/health
 *
 * Lightweight liveness probe — no auth required.
 * Vercel / load balancers can ping this to confirm the deployment is alive.
 */
export async function GET(): Promise<NextResponse<HealthResponse>> {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "0.1.0",
    },
    { status: 200 }
  );
}
