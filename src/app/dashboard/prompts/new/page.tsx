import type { Metadata } from "next";
import PromptForm from "../PromptForm";

export const metadata: Metadata = {
  title: "New prompt",
};

export default function NewPromptPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New prompt</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details below to create and save a new prompt.
        </p>
      </div>
      <PromptForm />
    </div>
  );
}
