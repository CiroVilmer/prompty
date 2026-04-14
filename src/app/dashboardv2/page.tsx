"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";

interface BackendHealth {
  status: string;
  mode: string;
  init_error: string | null;
  compiled_generator: string | null;
  endpoints: string[];
}

export default function DashboardPage() {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/backend-health")
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json() as Promise<BackendHealth>;
      })
      .then(setHealth)
      .catch((err) =>
        setHealthError(err instanceof Error ? err.message : "unreachable")
      );
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to Prompty — your MELI listing optimization pipeline.
        </p>
      </div>

      {/* Backend status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Backend</p>
            {healthError ? (
              <p className="mt-1 text-lg font-bold text-red-600">Offline</p>
            ) : health ? (
              <p className="mt-1 text-lg font-bold text-green-600">
                {health.mode === "real" ? "Real Mode" : "Mock Mode"}
              </p>
            ) : (
              <p className="mt-1 text-lg font-bold text-gray-400">
                Checking...
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Compiled Generator</p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {health?.compiled_generator ?? "---"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Endpoints</p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {health?.endpoints.length ?? "---"}
            </p>
          </CardContent>
        </Card>
      </div>

      {health?.init_error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>DSPy init error:</strong> {health.init_error}
          <p className="mt-1 text-xs text-amber-600">
            The API is running in mock fallback mode. Start the FastAPI
            server with DSPy dependencies to enable real mode.
          </p>
        </div>
      )}

      {healthError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>FastAPI backend unreachable.</strong> Make sure it is
          running:
          <code className="mt-1 block rounded bg-red-100 p-2 font-mono text-xs">
            make api-dev
          </code>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/optimize"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Optimize a listing
          </Link>
          <Link
            href="/dashboard/prompts/new"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            + New prompt
          </Link>
          <Link
            href="/dashboard/prompts"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View all prompts
          </Link>
        </div>
      </div>
    </div>
  );
}
