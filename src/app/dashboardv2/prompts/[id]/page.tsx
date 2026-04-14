import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Prompt } from "@/types";
import PromptForm from "../PromptForm";


interface Props {
  params: Promise<{ id: string }>;
}

// Stub — replace with a real DB lookup
async function getPrompt(id: string): Promise<Prompt | null> {
  void id;
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const prompt = await getPrompt(id);
  return { title: prompt ? `Edit: ${prompt.title}` : "Prompt not found" };
}

export default async function PromptDetailPage({ params }: Props) {
  const { id } = await params;
  const prompt = await getPrompt(id);

  if (!prompt) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{prompt.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Last updated{" "}
            {new Date(prompt.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {prompt.optimizationScore !== undefined && (
              <>
                {" · "}
                <span className="text-green-600 font-medium">
                  {prompt.optimizationScore}% score
                </span>
              </>
            )}
          </p>
        </div>
      </div>
      <PromptForm prompt={prompt} />
    </div>
  );
}
