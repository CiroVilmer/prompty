import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Overview",
};

// Stub stats — replace with real DB queries
const STATS = [
  { label: "Total products", value: "—" },
  { label: "Published", value: "—" },
  { label: "Avg. SEO score", value: "—" },
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
      <div className="flex flex-col items-center">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Quick actions
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard/products/new"
            className="rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white hover:bg-brand-700"
          >
            + New product
          </Link>
          <Link
            href="/dashboard/products"
            className="rounded-lg border border-gray-200 px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50"
          >
            View all products
          </Link>
        </div>
      </div>
    </div>
  );
}
