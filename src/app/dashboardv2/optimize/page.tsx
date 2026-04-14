"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type {
  AuditResponse,
  GenerateResponse,
  CompareResponse,
  GeneratorOutput,
} from "@/types";

type Step = "input" | "auditing" | "audited" | "generating" | "generated" | "comparing" | "compared";

const DEMO_KEYWORDS = [
  "asus zenbook 14",
  "ryzen 5 3500u",
  "8gb ram ddr4",
  "ssd 512gb",
  "pantalla 14 full hd",
  "ultrabook liviana",
  "notebook universidad",
  "zenbook um433da",
  "notebook portatil liviana",
  "radeon vega 8",
];

export default function OptimizePage() {
  const [step, setStep] = useState<Step>("input");
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [weakTitle, setWeakTitle] = useState("");
  const [weakDescription, setWeakDescription] = useState("");
  const [weakAttributes, setWeakAttributes] = useState("");
  const [category, setCategory] = useState("notebooks");
  const [trendingKeywords, setTrendingKeywords] = useState("");

  // Results
  const [audit, setAudit] = useState<AuditResponse | null>(null);
  const [generated, setGenerated] = useState<GenerateResponse | null>(null);
  const [comparison, setComparison] = useState<CompareResponse | null>(null);

  function parseAttributes(raw: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    for (const line of raw.split("\n")) {
      const sep = line.indexOf(":");
      if (sep > 0) {
        const key = line.slice(0, sep).trim();
        const val = line.slice(sep + 1).trim();
        if (key && val) attrs[key] = val;
      }
    }
    return attrs;
  }

  function parseKeywords(raw: string): string[] {
    return raw
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  }

  async function handleAudit() {
    setError(null);
    setStep("auditing");
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weak_title: weakTitle,
          weak_description: weakDescription,
          weak_attributes: parseAttributes(weakAttributes),
          category,
          trending_keywords: parseKeywords(trendingKeywords),
        }),
      });
      if (!res.ok) throw new Error(`Audit failed (${res.status})`);
      const data = (await res.json()) as AuditResponse;
      setAudit(data);
      setStep("audited");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit failed");
      setStep("input");
    }
  }

  async function handleGenerate() {
    if (!audit) return;
    setError(null);
    setStep("generating");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weak_title: weakTitle,
          weak_description: weakDescription,
          weak_attributes: parseAttributes(weakAttributes),
          category,
          trending_keywords: parseKeywords(trendingKeywords),
          audit_diagnosis: audit,
        }),
      });
      if (!res.ok) throw new Error(`Generate failed (${res.status})`);
      const data = (await res.json()) as GenerateResponse;
      setGenerated(data);
      setStep("generated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generate failed");
      setStep("audited");
    }
  }

  async function handleCompare() {
    setError(null);
    setStep("comparing");
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weak_title: weakTitle,
          weak_description: weakDescription,
          weak_attributes: parseAttributes(weakAttributes),
          category,
          trending_keywords: parseKeywords(trendingKeywords),
          audit_diagnosis: audit,
          include_scores: true,
        }),
      });
      if (!res.ok) throw new Error(`Compare failed (${res.status})`);
      const data = (await res.json()) as CompareResponse;
      setComparison(data);
      setStep("compared");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compare failed");
      setStep("generated");
    }
  }

  function handleLoadDemo() {
    setWeakTitle("Notebook Asus ZenBook 14 vendo");
    setWeakDescription(
      "Procesador AMD Ryzen 5 3500U 4 nucleos 8 hilos 3.7GHz boost. " +
      "Graficos Radeon Vega 8 integrados. Pantalla 14 pulgadas Full HD 1920x1080 NanoEdge anti-reflejo. " +
      "8GB RAM DDR4 2400MHz. 512GB SSD PCIe. " +
      "USB 3.1 Type-C, USB 3.1 Type-A, USB 2.0, HDMI, lector SD. " +
      "Teclado retroiluminado tamaño completo con sensor de huella. " +
      "Audio Harman Kardon. WiFi 5 dual-band, Bluetooth 5.0. " +
      "Bateria 47Wh hasta 12 horas. Peso 1.39kg."
    );
    setWeakAttributes("BRAND: Asus\nMODEL: UM433DA");
    setCategory("notebooks");
    setTrendingKeywords(DEMO_KEYWORDS.join(", "));
    setAudit(null);
    setGenerated(null);
    setComparison(null);
    setStep("input");
  }

  function handleReset() {
    setStep("input");
    setAudit(null);
    setGenerated(null);
    setComparison(null);
    setError(null);
  }

  const isLoading =
    step === "auditing" || step === "generating" || step === "comparing";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Optimize Listing
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Paste a weak Mercado Libre listing and let Prompty audit, generate,
          and compare optimized versions.
        </p>
      </div>

      {/* Demo loader */}
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-brand-300 bg-brand-50/40 p-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">
            Try it with a real product
          </p>
          <p className="text-xs text-gray-500">
            Loads an Asus ZenBook 14 with real specs as a user would paste them. Compare all three outputs to see the difference.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleLoadDemo}
          disabled={isLoading}
        >
          Load demo
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ─── Input form ─── */}
      <Card>
        <CardHeader>
          <CardTitle>Weak Listing Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Title"
            required
            value={weakTitle}
            onChange={(e) => setWeakTitle(e.target.value)}
            placeholder="HP A82ZVUA 16 GB 512 GB buen precio"
            disabled={isLoading}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={3}
              value={weakDescription}
              onChange={(e) => setWeakDescription(e.target.value)}
              placeholder="Producto en venta. Consultar disponibilidad."
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Attributes (one per line, KEY: value)
            </label>
            <textarea
              rows={3}
              value={weakAttributes}
              onChange={(e) => setWeakAttributes(e.target.value)}
              placeholder={"BRAND: HP\nMODEL: A82ZVUA"}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                <option value="notebooks">Notebooks / Laptops</option>
                <option value="zapatillas">Zapatillas</option>
              </select>
            </div>
            <Input
              label="Trending keywords (comma-sep)"
              value={trendingKeywords}
              onChange={(e) => setTrendingKeywords(e.target.value)}
              placeholder="notebook hp, ryzen 7, 16gb ssd"
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={handleAudit}
              disabled={!weakTitle.trim() || isLoading}
            >
              {step === "auditing" ? "Auditing..." : "1. Audit Listing"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleGenerate}
              disabled={!audit || isLoading}
            >
              {step === "generating"
                ? "Generating..."
                : "2. Generate Optimized"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCompare}
              disabled={!weakTitle.trim() || isLoading}
            >
              {step === "comparing" ? "Comparing..." : "3. Compare All"}
            </Button>
            {(audit || generated || comparison) && (
              <button
                type="button"
                onClick={handleReset}
                className="ml-auto text-sm text-gray-500 hover:text-gray-700"
              >
                Reset
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── Audit results ─── */}
      {audit && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Diagnosis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold text-red-700">
                  Missing Attributes ({audit.missing_critical_attributes.length})
                </h4>
                <ul className="mt-1 space-y-0.5 text-sm text-gray-700">
                  {audit.missing_critical_attributes.map((a) => (
                    <li key={a} className="font-mono text-xs">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-700">
                  Title Issues ({audit.title_issues.length})
                </h4>
                <ul className="mt-1 space-y-0.5 text-sm text-gray-700">
                  {audit.title_issues.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-700">
                  Description Issues ({audit.description_issues.length})
                </h4>
                <ul className="mt-1 space-y-0.5 text-sm text-gray-700">
                  {audit.description_issues.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-700">
                  Priority Fixes
                </h4>
                <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-sm text-gray-700">
                  {audit.priority_fixes.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Generated listing ─── */}
      {generated && (
        <Card>
          <CardHeader>
            <CardTitle>Optimized Listing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-500">Title</h4>
              <p className="mt-1 text-base font-medium text-gray-900">
                {generated.title}
              </p>
              <span className="text-xs text-gray-400">
                {generated.title.length} chars
              </span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500">
                Description
              </h4>
              <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-800">
                {generated.description}
              </pre>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500">
                Attributes ({Object.keys(generated.attributes).length})
              </h4>
              <div className="mt-1 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                {Object.entries(generated.attributes).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="font-mono text-xs text-gray-500">{k}:</span>
                    <span className="text-gray-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Three-way comparison ─── */}
      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle>Three-Way Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-3">
              <ComparisonColumn
                label="Original (sin optimizar)"
                output={comparison.raw_llm}
              />
              <ComparisonColumn
                label="Prompty Baseline"
                output={comparison.prompty_baseline}
              />
              <ComparisonColumn
                label="Prompty Optimized"
                output={comparison.prompty_optimized}
                highlight
              />
            </div>
            {comparison.judge_reasoning_optimized && (
              <div className="mt-4 rounded-lg bg-blue-50 p-4">
                <h4 className="text-sm font-semibold text-blue-800">
                  Judge Reasoning (Optimized)
                </h4>
                <p className="mt-1 text-sm text-blue-700">
                  {comparison.judge_reasoning_optimized}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ComparisonColumn({
  label,
  output,
  highlight = false,
}: {
  label: string;
  output: GeneratorOutput;
  highlight?: boolean;
}) {
  const borderColor = highlight
    ? "border-brand-300 bg-brand-50/30"
    : "border-gray-200";

  return (
    <div className={`rounded-lg border p-4 ${borderColor}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-900">{label}</h4>
        <div className="flex items-center gap-2">
          {output.score !== null && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                output.score >= 0.7
                  ? "bg-green-100 text-green-700"
                  : output.score >= 0.4
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {(output.score * 100).toFixed(0)}%
            </span>
          )}
          <span className="text-xs text-gray-400">
            {(output.latency_ms / 1000).toFixed(1)}s
          </span>
        </div>
      </div>
      {output.error ? (
        <p className="mt-2 text-sm text-red-600">{output.error}</p>
      ) : (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Title</p>
            <p className="mt-0.5 text-sm font-medium text-gray-900 line-clamp-3">
              {output.title}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Description</p>
            <p className="mt-0.5 text-xs text-gray-700 line-clamp-6">
              {output.description}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Attributes: {Object.keys(output.attributes).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
