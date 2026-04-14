import type { Metadata } from "next";
import Link from "next/link";
import type { Prompt } from "@/types";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Prompts",
};

// Stub — replace with a real DB query
async function getPrompts(): Promise<Prompt[]> {
  "use cache";
  return [];
}

export default async function PromptsPage() {
  const prompts = await getPrompts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prompts</h1>
          <p className="mt-1 text-sm text-gray-500">
            {prompts.length} prompt{prompts.length !== 1 ? "s" : ""} in your
            workspace
          </p>
        </div>
        <Link
          href="/dashboard/prompts/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + New prompt
        </Link>
      </div>

      {prompts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-16 text-center">
          <p className="text-4xl">✨</p>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            No prompts yet
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Create your first prompt to get started.
          </p>
          <Link
            href="/dashboard/prompts/new"
            className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Create prompt
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <Link key={prompt.id} href={`/dashboard/prompts/${prompt.id}`}>
              <Card className="h-full p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {prompt.title}
                  </h3>
                  {prompt.optimizationScore !== undefined && (
                    <span className="ml-2 shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      {prompt.optimizationScore}%
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                  {prompt.content}
                </p>
                <div className="mt-4 flex flex-wrap gap-1">
                  {prompt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
