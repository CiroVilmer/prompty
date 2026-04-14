'use cache';

import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight text-brand-600">
            Prompty
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Optimise your prompts.
          <br />
          <span className="text-brand-600">Ship better AI.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">
          Prompty helps you build, test, and automatically optimise prompts for
          any LLM — then distribute them across your team with full version
          control.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="rounded-xl bg-brand-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            Start for free
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-gray-200 px-8 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50"
          >
            Go to dashboard
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-gray-100 p-6 shadow-sm"
            >
              <div className="mb-3 text-2xl">{f.icon}</div>
              <h3 className="font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const FEATURES = [
  {
    icon: "⚡",
    title: "Automatic optimisation",
    description:
      "Run DSPy-powered optimisation pipelines to boost your prompt quality score with zero manual tuning.",
  },
  {
    icon: "🗂️",
    title: "Version control",
    description:
      "Track every iteration of your prompts, compare scores, and roll back instantly.",
  },
  {
    icon: "🚀",
    title: "One-click distribution",
    description:
      "Publish prompts to your team or embed them via a type-safe API — works with any model.",
  },
];
