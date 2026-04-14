"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Prompt, CreatePromptBody } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

interface Props {
  /** When provided the form operates in edit mode */
  prompt?: Prompt;
}

const MODELS = [
  "claude-opus-4-6",
  "claude-sonnet-4-6",
  "claude-haiku-4-5",
  "gpt-4o",
  "gpt-4o-mini",
];

export default function PromptForm({ prompt }: Props) {
  const router = useRouter();
  const isEditing = Boolean(prompt);

  const [title, setTitle] = useState(prompt?.title ?? "");
  const [content, setContent] = useState(prompt?.content ?? "");
  const [model, setModel] = useState(prompt?.model ?? MODELS[0]);
  const [tagsInput, setTagsInput] = useState(prompt?.tags.join(", ") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [optimising, setOptimising] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const body: CreatePromptBody = {
      title,
      content,
      model,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const url = isEditing
        ? `/api/prompts/${prompt!.id}`
        : "/api/prompts";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        setError(json.error ?? "Failed to save prompt.");
        return;
      }

      router.push("/dashboard/prompts");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOptimise() {
    if (!prompt) return;
    setOptimising(true);
    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId: prompt.id, model }),
      });
      if (res.ok) {
        const json = (await res.json()) as { data?: { optimizedContent: string } };
        if (json.data?.optimizedContent) {
          setContent(json.data.optimizedContent);
        }
      }
    } finally {
      setOptimising(false);
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My awesome prompt"
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            required
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="You are a helpful assistant that…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="model"
            className="block text-sm font-medium text-gray-700"
          >
            Model
          </label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Tags (comma-separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="marketing, summarisation, rag"
        />

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : isEditing ? "Save changes" : "Create prompt"}
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="secondary"
                disabled={optimising}
                onClick={handleOptimise}
              >
                {optimising ? "Optimising…" : "Optimise"}
              </Button>
            )}
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
}
