import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Overview",
};

// Stub stats — replace with real DB queries
const STATS = [
  { label: "Total prompts", value: "—" },
  { label: "Optimised", value: "—" },
  { label: "Avg. score", value: "—" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back — here&apos;s a summary of your Prompty workspace.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map((s) => (
          <Card key={s.label} className="p-6">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/prompts/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
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
