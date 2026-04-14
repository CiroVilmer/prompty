'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { apiClient } from '@/lib/api-client'
import type { GenerateRequest, GenerateResponse } from '@/types'

/* ── Types ──────────────────────────────────────────────────────────────────── */

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  icon?: string
}

type Stage = 'idle' | 'thinking' | 'done' | 'publishing' | 'comparing'

/* ── Fake ML listing preview (mirrors the BeforeAfterSection "good" layout) ── */

function ListingPreview({ visible, result }: { visible: boolean; result?: GenerateResponse | null }) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-4 pt-5 shadow-sm transition-opacity duration-700 sm:p-5 sm:pt-6 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* ML yellow bar */}
      <div className="flex shrink-0 items-center gap-3 rounded-t-lg bg-[#fff159] px-4 py-2.5">
        <span className="shrink-0 text-sm font-extrabold text-[#333]">
          mercado<span style={{ color: '#3483fa' }}>libre</span>
        </span>
        <div className="flex flex-1 items-center gap-2 rounded-sm border border-[#e8d800] bg-white px-3 py-1.5">
          <span className="flex-1 truncate text-xs text-gray-400">
            apple macbook air m2 13&quot; 256gb
          </span>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-gray-50 px-5 py-2">
        <p className="text-xs text-[#3483fa]">
          Inicio &rsaquo; Computación &rsaquo; Laptops y Accesorios &rsaquo; Laptops &rsaquo; Apple
        </p>
      </div>

      {/* Product area */}
      <div className="flex flex-1">
        {/* Thumbnails */}
        <div className="flex w-14 shrink-0 flex-col gap-1.5 border-r border-gray-100 py-2 pl-3 pr-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square w-full overflow-hidden rounded border bg-gray-50"
              style={{ borderColor: i === 0 ? '#3483fa' : '#e5e7eb' }}
            >
              {i === 0 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/macbook-mock.png" alt="" className="h-full w-full object-contain" />
              )}
            </div>
          ))}
        </div>

        {/* Main image */}
        <div className="flex w-2/5 shrink-0 items-center justify-center border-r border-gray-100 bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/macbook-mock.png"
            alt="Apple MacBook Air M2"
            className="w-full object-contain"
          />
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-2.5 p-5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">Nuevo</span>
            <span className="text-xs text-gray-200">|</span>
            <span className="text-xs text-gray-500">+1.200 vendidos</span>
          </div>

          <h3 className="text-sm font-medium leading-snug text-[#333]">
            {result?.title ?? 'Apple MacBook Air 13.6" Chip M2 8 Núcleos — 8GB RAM 256GB SSD — Gris Espacial — macOS Sonoma — Teclado Español Latino'}
          </h3>

          {/* Stars */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg key={i} viewBox="0 0 10 10" className="size-3" fill="#3483fa">
                  <path d="M5 0l1.5 3.1 3.5.5-2.5 2.4.6 3.5L5 7.8 1.9 9.5l.6-3.5L0 3.6l3.5-.5z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-[#3483fa]">4.9</span>
            <span className="text-xs text-gray-400">(2.847)</span>
          </div>

          {/* Price */}
          <div className="mt-1">
            <p className="text-xs text-gray-400 line-through">$ 1.349.999</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-light text-[#333]">$ 949.999</p>
              <span className="text-sm font-semibold text-[#00a650]">30% OFF</span>
            </div>
            <p className="text-xs text-gray-500">en 12 cuotas de $ 79.166 sin interés</p>
          </div>

          {/* Shipping */}
          <div>
            <p className="text-xs font-medium text-[#00a650]">✓ Envío gratis · Full</p>
            <p className="text-xs text-[#00a650]">Llega mañana</p>
          </div>

          {/* Attributes */}
          <div className="mt-auto border-t border-gray-100 pt-3">
            <p className="mb-2 text-xs font-medium text-gray-500">Características principales</p>
            <div className="space-y-1.5">
              {(result?.attributes
                ? Object.entries(result.attributes).slice(0, 5)
                : [
                    ['Marca', 'Apple'],
                    ['Modelo', 'MacBook Air M2'],
                    ['Procesador', 'Apple M2'],
                    ['RAM', '8 GB'],
                    ['Almacenamiento', '256 GB SSD'],
                  ]
              ).map(([label, value]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-24 shrink-0 text-xs text-gray-400">{label}</span>
                  <span className="text-xs font-medium text-[#333]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Skeleton loader for the preview ────────────────────────────────────────── */

function PreviewSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Top bar skeleton */}
      <div className="h-8 w-full animate-pulse rounded bg-yellow-100" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />

      <div className="flex gap-4">
        {/* Image skeleton */}
        <div className="aspect-square w-2/5 shrink-0 animate-pulse rounded-lg bg-gray-100" />
        {/* Info skeleton */}
        <div className="flex flex-1 flex-col gap-3">
          <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-gray-100" />
          <div className="mt-2 h-6 w-2/5 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
          <div className="mt-auto space-y-2 border-t border-gray-100 pt-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-2">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-24 animate-pulse rounded bg-gray-50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Thinking dots animation ────────────────────────────────────────────────── */

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1.5 px-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-brand-400"
          style={{
            animation: 'pulse-dot 1.4s ease-in-out infinite',
            animationDelay: `${i * 200}ms`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes pulse-dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </span>
  )
}

/* ── Simulated AI steps ─────────────────────────────────────────────────────── */

const AI_STEPS: { role: 'user' | 'assistant'; content: string; icon: string }[] = [
  {
    role: 'assistant',
    content:
      'Reading your note exactly as you wrote it — no cleanup required on your side.',
    icon: '🔍',
  },
  {
    role: 'assistant',
    content:
      'Locking the right Mercado Libre category (Computación → Laptops → Apple). Wrong branch = you do not show up in search.',
    icon: '📂',
  },
  {
    role: 'assistant',
    content:
      'Building the title with live keyword signal from the Mercado Libre API — not a static hand-written prompt.',
    icon: '✏️',
  },
  {
    role: 'assistant',
    content:
      'Filling required attributes so filters work. One missing field and you disappear from filtered results.',
    icon: '📋',
  },
  {
    role: 'assistant',
    content:
      'Suggesting market price and buyer-friendly installments from category benchmarks.',
    icon: '💰',
  },
  {
    role: 'assistant',
    content:
      'DSPy-optimized program finishes the draft in under two minutes. Compare lists every change; one tap publishes to Mercado Libre.',
    icon: '✅',
  },
]

/* ── Suggestions ────────────────────────────────────────────────────────────── */

const SUGGESTIONS = [
  {
    icon: '💻',
    label:
      'Used MacBook, works perfectly, selling to upgrade, open to offers.',
  },
  { icon: '📱', label: 'iPhone 15 Pro Max 256GB' },
  { icon: '👟', label: 'Nike Air Jordan 1 Chicago' },
]

/* ── Idle view — hero input ─────────────────────────────────────────────────── */

function IdleView({
  prompt,
  setPrompt,
  images,
  setImages,
  onSubmit,
}: {
  prompt: string
  setPrompt: (v: string) => void
  images: File[]
  setImages: (v: File[] | ((prev: File[]) => File[])) => void
  onSubmit: (e: React.FormEvent) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const valid = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (valid.length) setImages((prev) => [...prev, ...valid])
    },
    [setImages],
  )

  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx))

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-4">
      {/* Icon + heading */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-3xl bg-linear-to-br from-brand-50 to-brand-100 text-3xl shadow-sm">
          ✦
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          What are you selling?
        </h2>
        <p className="max-w-lg text-sm leading-relaxed text-gray-400">
          Describe your product in natural language and attach photos.
          Prompty will generate a fully optimized Mercado Libre listing.
        </p>
      </div>

      <form onSubmit={onSubmit} className="w-full">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          {/* Textarea */}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your product and let Prompty do the rest"
            rows={4}
            className="w-full resize-none rounded-t-2xl border-0 bg-transparent px-5 pt-5 pb-2 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSubmit(e)
              }
            }}
          />

          {/* Image previews */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 px-5 pb-2">
              {images.map((file, i) => (
                <div key={i} className="group/thumb relative size-16 overflow-hidden rounded-lg border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover/thumb:opacity-100"
                  >
                    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-4 py-3">
            <TooltipProvider>
              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex size-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-foreground shadow-sm transition-colors hover:bg-gray-50"
                    >
                      <svg viewBox="0 0 20 20" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 13.5l4-4a1.5 1.5 0 012.1 0L13 13.5" />
                        <path d="M13 11.5l1.5-1.5a1.5 1.5 0 012.1 0L19 12.5" />
                        <rect x="1" y="3" width="18" height="14" rx="2" />
                        <circle cx="6.5" cy="7.5" r="1.5" />
                      </svg>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Adjuntar imágenes</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="flex size-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-foreground shadow-sm transition-colors hover:bg-gray-50"
                    >
                      <svg viewBox="0 0 20 20" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15.5 4.5l-11 11M15.5 4.5h-7M15.5 4.5v7" />
                      </svg>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Pegar URL</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            <button
              type="submit"
              disabled={!prompt.trim()}
              className="flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-gray-700 disabled:opacity-40"
            >
              <span>✦</span>
              Generate listing
            </button>
          </div>
        </div>
      </form>

      {/* Suggestion chips */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setPrompt(s.label)}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-md"
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────────── */

/* ── Improvements panel (compare view) ──────────────────────────────────────── */

const IMPROVEMENTS = [
  {
    category: 'Title & search keywords',
    severity: 'critical' as const,
    before:
      'Used MacBook, works perfectly, selling to upgrade, open to offers.',
    after:
      'Apple MacBook Air 13.6" Chip M2 8 Núcleos — 8GB RAM 256GB SSD — Gris Espacial — macOS Sonoma — Teclado Español Latino',
    explanation:
      'Your note had zero searchable structure. The optimized title adds brand, line, chip, RAM, storage, and screen size so buyers (and ML search) can actually find the listing.',
  },
  {
    category: 'Category',
    severity: 'critical' as const,
    before: 'Unclear from note — risk of wrong path or generic bucket',
    after: 'Computación → Laptops y Accesorios → Laptops → Apple (ML taxonomy)',
    explanation:
      "Script truth: one wrong category call and the product doesn't show up where buyers look. We lock the path to Mercado Libre's official tree.",
  },
  {
    category: 'Attributes',
    severity: 'critical' as const,
    before: 'None filled — listing invisible in filters',
    after: 'Marca, Modelo, Procesador, RAM, Almacenamiento (+ optional fields)',
    explanation:
      "Right title and category aren't enough: missing attributes mean you drop out of filtered results. Everything required is filled from the structured listing.",
  },
  {
    category: 'Market price',
    severity: 'high' as const,
    before: '"Open to offers" — no anchor, weak conversion',
    after: '$ 949.999 · 30% OFF badge · 12 cuotas sin interés',
    explanation:
      'Matches the demo: a credible anchor plus installments — the kind of offer electronics buyers expect on Mercado Libre.',
  },
  {
    category: 'DSPy vs hand-written prompts',
    severity: 'high' as const,
    before: "Single static prompt — someone's best guess",
    after:
      'DSPy program optimized on real top-selling listings; instruction combinations tested empirically',
    explanation:
      'Most AI tools ship hand-tuned prompts. Prompty treats prompts like optimizable code (Stanford DSPy) and learns what actually works on ML — measured jump from baseline 0.45 to optimized 0.87 on our judge.',
  },
  {
    category: 'Live Mercado Libre data',
    severity: 'medium' as const,
    before: 'No live trends or category rules',
    after: 'MELI API: keyword trends + category rules applied to title and fields',
    explanation:
      "Hits the platform in real time so keywords and constraints reflect what's moving now, not last month's guess.",
  },
  {
    category: 'Compare → one-tap publish',
    severity: 'medium' as const,
    before: 'Messy note in; you rebuild title, category, and fields by hand elsewhere',
    after: 'Generate → watch steps → Compare shows every diff → Publish to Mercado Libre',
    explanation:
      'Matches the demo flow: the landing reel (`/videos/logo_loading.mp4`) sets the brand beat, then this screen walks the same narrative — messy note in, optimized listing out, no extra headcount.',
  },
]

const SEVERITY_CONFIG = {
  critical: {
    label: 'Critical',
    border: 'border-l-rose-500',
    badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
    beforeBg: 'bg-rose-50/40',
    beforeRing: 'ring-1 ring-rose-100/80',
  },
  high: {
    label: 'High impact',
    border: 'border-l-amber-500',
    badge: 'bg-amber-50 text-amber-800 ring-1 ring-amber-100',
    beforeBg: 'bg-amber-50/35',
    beforeRing: 'ring-1 ring-amber-100/80',
  },
  medium: {
    label: 'Improvement',
    border: 'border-l-sky-500',
    badge: 'bg-sky-50 text-sky-800 ring-1 ring-sky-100',
    beforeBg: 'bg-sky-50/30',
    beforeRing: 'ring-1 ring-sky-100/80',
  },
}

function ImprovementsPanel({ userPrompt, result }: { userPrompt?: string; result?: GenerateResponse | null }) {
  return (
    <div className="flex flex-col gap-4 pb-1">
      {/* Score summary — compact, editorial */}
      <div className="improvement-card rounded-2xl border border-black/4 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-400">
              Listing quality score
            </p>
            <p className="mt-0.5 text-[10px] text-gray-400">
              DSPy-tuned judge · same metric cited in the product story
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0">
              <span className="text-lg font-semibold tabular-nums text-gray-400 line-through decoration-gray-300/80">
                0.45
              </span>
              <span className="text-gray-300" aria-hidden>
                →
              </span>
              <span className="text-2xl font-semibold tabular-nums tracking-tight text-emerald-600">
                0.87
              </span>
              <span className="text-sm font-normal text-gray-400">optimized</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
              +0.42 vs baseline
            </span>
            <span className="text-[11px] text-gray-400">
              {IMPROVEMENTS.length} improvements applied
            </span>
          </div>
        </div>
      </div>

      {/* Improvement cards — vertical before/after so nothing clips */}
      {IMPROVEMENTS.map((item, idx) => {
        const sev = SEVERITY_CONFIG[item.severity]
        // For the title card, show the actual user prompt and generated title
        const beforeText = idx === 0 && userPrompt ? userPrompt : item.before
        const afterText  = idx === 0 && result?.title ? result.title : item.after
        return (
          <article
            key={item.category}
            className={`improvement-card rounded-2xl border border-black/4 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${sev.border} border-l-4`}
          >
            <header className="flex items-start gap-3 border-b border-gray-100/80 px-4 py-3.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-xs font-semibold tabular-nums text-gray-500">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[13px] font-semibold tracking-tight text-gray-900">
                    {item.category}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${sev.badge}`}
                  >
                    {sev.label}
                  </span>
                </div>
              </div>
            </header>

            <div className="space-y-2.5 px-4 py-4">
              <div
                className={`rounded-xl px-3.5 py-3 ${sev.beforeBg} ${sev.beforeRing}`}
              >
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Before
                </p>
                <p className="text-[13px] leading-relaxed text-gray-700 wrap-break-word">
                  {beforeText}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50/50 px-3.5 py-3 ring-1 ring-emerald-100/90">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                  After
                </p>
                <p className="text-[13px] leading-relaxed text-gray-900 wrap-break-word">
                  {afterText}
                </p>
              </div>
            </div>

            <footer className="border-t border-gray-100/80 bg-gray-50/40 px-4 py-3">
              <p className="flex gap-2.5 text-[12px] leading-relaxed text-gray-600">
                <svg
                  viewBox="0 0 16 16"
                  className="mt-0.5 size-4 shrink-0 text-amber-500/90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M8 1.5a4 4 0 00-4 4c0 2 1 3 2 4v1.5h4V9.5c1-1 2-2 2-4a4 4 0 00-4-4z" />
                  <path d="M6 14.5h4" />
                </svg>
                <span>
                  <span className="font-medium text-gray-700">Why it matters. </span>
                  {item.explanation}
                </span>
              </p>
            </footer>
          </article>
        )
      })}
    </div>
  )
}

/* ── Publishing overlay ─────────────────────────────────────────────────────── */

const PUBLISH_STEPS = [
  'Connecting to Mercado Libre…',
  'Uploading images…',
  'Optimizing SEO metadata…',
  'Creating listing…',
  'Verifying publication…',
]

type OverlayPhase = 'hidden' | 'loading' | 'success'

function PublishOverlay({
  phase,
  stepIndex,
}: {
  phase: OverlayPhase
  stepIndex: number
}) {
  if (phase === 'hidden') return null

  const isSuccess = phase === 'success'
  const progress = isSuccess ? 100 : Math.min(((stepIndex + 1) / PUBLISH_STEPS.length) * 100, 95)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        {/* Icon area */}
        <div className="relative flex size-20 items-center justify-center">
          {/* Spinner ring — visible during loading */}
          <svg
            viewBox="0 0 64 64"
            className={`absolute inset-0 size-20 transition-opacity duration-500 ${isSuccess ? 'opacity-0' : 'opacity-100'}`}
          >
            <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="4" />
            <circle
              cx="32" cy="32" r="28"
              fill="none"
              stroke="#3483fa"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="176"
              strokeDashoffset="132"
              className="origin-center animate-spin animation-duration-[1s]"
            />
          </svg>

          {/* Success check — visible on success */}
          <div
            className={`flex size-20 items-center justify-center rounded-full bg-emerald-50 transition-all duration-500 ${
              isSuccess ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="size-10 text-emerald-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M5 13l4 4L19 7"
                style={{
                  strokeDasharray: 24,
                  strokeDashoffset: isSuccess ? 0 : 24,
                  transition: 'stroke-dashoffset 0.4s ease-out 0.2s',
                }}
              />
            </svg>
          </div>
        </div>

        {/* Status text */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-lg font-semibold text-gray-900">
            {isSuccess ? 'Published successfully!' : 'Publishing to Mercado Libre'}
          </p>
          <p
            className={`h-5 text-sm transition-all duration-300 ${
              isSuccess ? 'text-emerald-600' : 'text-gray-400'
            }`}
          >
            {isSuccess
              ? 'Redirecting…'
              : PUBLISH_STEPS[stepIndex] ?? PUBLISH_STEPS[0]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isSuccess ? 'bg-emerald-500' : 'bg-[#3483fa]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicators */}
        {!isSuccess && (
          <div className="flex flex-col gap-2 self-start pl-4">
            {PUBLISH_STEPS.map((label, i) => {
              const done = i < stepIndex
              const active = i === stepIndex
              return (
                <div
                  key={label}
                  className={`flex items-center gap-2.5 text-xs transition-all duration-300 ${
                    done
                      ? 'text-emerald-500'
                      : active
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-300'
                  }`}
                >
                  {done ? (
                    <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M3 8.5l3 3 7-7" />
                    </svg>
                  ) : active ? (
                    <div className="flex size-3.5 items-center justify-center">
                      <div className="size-2 animate-pulse rounded-full bg-[#3483fa]" />
                    </div>
                  ) : (
                    <div className="flex size-3.5 items-center justify-center">
                      <div className="size-1.5 rounded-full bg-gray-200" />
                    </div>
                  )}
                  {label}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────────── */

export default function NewProductPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [stage, setStage] = useState<Stage>('idle')
  const [currentStep, setCurrentStep] = useState(0)
  const [previewReady, setPreviewReady] = useState(false)
  const [overlayPhase, setOverlayPhase] = useState<OverlayPhase>('hidden')
  const [publishStep, setPublishStep] = useState(0)
  const [showSplit, setShowSplit] = useState(false)
  const [generatedListing, setGeneratedListing] = useState<GenerateResponse | null>(null)
  const [submittedPrompt, setSubmittedPrompt] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const idleRef = useRef<HTMLDivElement>(null)
  const splitRef = useRef<HTMLDivElement>(null)
  const compareRef = useRef<HTMLDivElement>(null)
  const animatedCount = useRef(0)

  useEffect(() => {
    setOverlayPhase('hidden')
    setStage('idle')
    setMessages([])
    setCurrentStep(0)
    setPreviewReady(false)
    setPublishStep(0)
    setShowSplit(false)
    setGeneratedListing(null)
    setSubmittedPrompt('')
    animatedCount.current = 0
  }, [])

  useEffect(() => {
    if (!chatMessagesRef.current) return

    const bubbles = chatMessagesRef.current.querySelectorAll('.msg-bubble')
    const newBubbles = Array.from(bubbles).slice(animatedCount.current)

    if (newBubbles.length > 0) {
      gsap.fromTo(
        newBubbles,
        { opacity: 0, y: 12, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          stagger: 0.05,
          ease: 'power2.out',
        },
      )
      animatedCount.current = bubbles.length
    }

    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, stage])

  function startGeneration(userPrompt: string) {
    setMessages([{ role: 'user', content: userPrompt }])
    setStage('thinking')
    setCurrentStep(0)
    setPreviewReady(false)
    setGeneratedListing(null)

    // Fire real API call immediately — runs in parallel with the animation
    const apiPromise = apiClient.post<GenerateResponse, GenerateRequest>(
      '/api/generate',
      {
        weak_title: userPrompt.split(/[.\n]/)[0].trim() || userPrompt,
        weak_description: userPrompt,
        weak_attributes: {},
        category: '',
        trending_keywords: [],
        audit_diagnosis: {},
      },
    )

    let step = 0
    let animationDone = false
    // Use a ref-like object so the interval callback and the promise both
    // read/write the same slot without stale-closure issues
    const shared = { apiResult: null as Awaited<typeof apiPromise> | null }

    const finalize = () => {
      if (!animationDone || shared.apiResult === null) return
      const res = shared.apiResult
      if (res.error || !res.data) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant' as const,
            content: `Something went wrong: ${res.error ?? 'No data returned'}. Please try again.`,
            icon: '⚠️',
          },
        ])
        setStage('idle')
        setShowSplit(false)
        return
      }
      setGeneratedListing(res.data)
      setStage('done')
    }

    const interval = setInterval(() => {
      const msg = AI_STEPS[step]
      if (!msg) { clearInterval(interval); return }

      setMessages((prev) => [...prev, msg])
      setCurrentStep(step + 1)

      if (step === AI_STEPS.length - 2) setPreviewReady(true)

      if (step === AI_STEPS.length - 1) {
        animationDone = true
        clearInterval(interval)
        finalize()
      }
      step++
    }, 1200)

    apiPromise.then((result) => {
      shared.apiResult = result
      finalize()
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim() || stage === 'thinking') return

    const savedPrompt = prompt
    setPrompt('')
    setSubmittedPrompt(savedPrompt)

    const tl = gsap.timeline()

    if (idleRef.current) {
      tl.to(idleRef.current, {
        opacity: 0,
        scale: 0.96,
        y: -20,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          setShowSplit(true)
          startGeneration(savedPrompt)
        },
      })
    }

    tl.call(() => {
      requestAnimationFrame(() => {
        if (!splitRef.current) return
        const chatPanel = splitRef.current.children[0] as HTMLElement
        const previewPanel = splitRef.current.children[1] as HTMLElement

        gsap.set(splitRef.current, { opacity: 1 })

        gsap.fromTo(
          chatPanel,
          { opacity: 0, y: 30, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' },
        )

        gsap.fromTo(
          previewPanel,
          { opacity: 0, y: 30, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, delay: 0.1, ease: 'power3.out' },
        )
      })
    })
  }

  function handleCompare() {
    setStage('comparing')
    requestAnimationFrame(() => {
      if (!compareRef.current) return
      const panels = compareRef.current.children
      gsap.fromTo(
        panels,
        { opacity: 0, y: 20, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.08, ease: 'power3.out' },
      )

      const cards = compareRef.current.querySelectorAll('.improvement-card')
      if (cards.length) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, delay: 0.25, ease: 'power2.out' },
        )
      }
    })
  }

  function handleBackToChat() {
    setStage('done')
  }

  function handlePublish() {
    setStage('publishing')
    setOverlayPhase('loading')
    setPublishStep(0)

    let step = 0
    const interval = setInterval(() => {
      step++
      if (step < PUBLISH_STEPS.length) {
        setPublishStep(step)
      } else {
        clearInterval(interval)
        setOverlayPhase('success')
        setTimeout(() => {
          if (generatedListing) {
            sessionStorage.setItem('prompty_listing', JSON.stringify(generatedListing))
          }
          router.push('/dashboard/products/success')
        }, 1200)
      }
    }, 800)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PublishOverlay phase={overlayPhase} stepIndex={publishStep} />

      {/* Idle view */}
      {!showSplit && (
        <div ref={idleRef} className="flex flex-1 flex-col">
          <IdleView
            prompt={prompt}
            setPrompt={setPrompt}
            images={images}
            setImages={setImages}
            onSubmit={handleSubmit}
          />
        </div>
      )}

      {/* Split view: chat + preview OR compare view */}
      {showSplit && stage !== 'comparing' && (
        <div
          ref={splitRef}
          className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden opacity-0 lg:grid-cols-2"
        >
          {/* Left — AI activity log */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-gray-900 text-xs text-white">
                ✦
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-[13px] font-semibold text-gray-900">Prompty AI</span>
                <span className="text-[11px] text-gray-400">
                  {stage === 'thinking'
                    ? 'Generating your listing…'
                    : stage === 'done' || stage === 'publishing'
                      ? 'Listing complete'
                      : 'Ready'}
                </span>
              </div>
              {stage === 'thinking' && (
                <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-600">
                  <span className="relative flex size-1.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" /><span className="relative inline-flex size-1.5 rounded-full bg-amber-500" /></span>
                  Working
                </span>
              )}
              {(stage === 'done' || stage === 'publishing') && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-600">
                  <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2.5 6.5l2 2 5-5" /></svg>
                  Complete
                </span>
              )}
            </div>

            {/* Messages */}
            <div ref={chatMessagesRef} className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  data-msg-index={i}
                  className="msg-bubble"
                >
                  {msg.role === 'user' ? (
                    <div className="flex justify-end px-2 pb-2">
                      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gray-900 px-4 py-2.5 text-[13px] leading-relaxed text-white shadow-sm">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5 rounded-xl px-2 py-2.5 transition-colors hover:bg-gray-50/60">
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs">
                        {msg.icon ?? '✦'}
                      </span>
                      <div className="flex flex-1 flex-col gap-0.5">
                        <p className="text-[13px] leading-relaxed text-gray-700">{msg.content}</p>
                        {i === messages.length - 1 && (stage === 'done' || stage === 'publishing') && msg.role === 'assistant' && (
                          <span className="mt-1 text-[11px] text-emerald-500">Completed</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {stage === 'thinking' && currentStep < AI_STEPS.length && (
                <div className="flex items-start gap-2.5 px-2 py-2.5">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs">
                    {AI_STEPS[currentStep]?.icon ?? '✦'}
                  </span>
                  <div className="flex items-center py-1">
                    <ThinkingDots />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Right — listing preview */}
          <div className="flex flex-col gap-4 overflow-y-auto pt-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Listing preview</span>
              {stage === 'thinking' && !previewReady && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  Building…
                </span>
              )}
            </div>

            {previewReady ? (
              <ListingPreview visible={previewReady} result={generatedListing} />
            ) : (
              <PreviewSkeleton />
            )}

            {/* Action buttons */}
            {(stage === 'done' || stage === 'publishing') && (
              <div className="mt-2 flex gap-3">
                <button
                  onClick={handleCompare}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:translate-y-px"
                >
                  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M8 2v12M2 8h4M10 8h4" />
                  </svg>
                  Compare
                </button>
                <button
                  onClick={handlePublish}
                  disabled={stage === 'publishing'}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3483fa] py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#2968c8] active:translate-y-px disabled:opacity-70"
                >
                  {stage === 'publishing' ? (
                    <>
                      <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                      </svg>
                      Publishing…
                    </>
                  ) : (
                    'Publish to Mercado Libre'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compare view: listing left + improvements right */}
      {showSplit && stage === 'comparing' && (
        <div
          ref={compareRef}
          className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-hidden lg:grid-cols-2 lg:gap-6"
        >
          {/* Left — optimized listing */}
          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-3.5">
              <span className="text-sm font-semibold text-gray-900">Optimized listing</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                Live preview
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-gray-50/40 px-3 py-4 sm:px-4 sm:py-5">
              <ListingPreview visible result={generatedListing} />
            </div>
          </div>

          {/* Right — improvements: header + scrollable list + fixed actions */}
          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="shrink-0 border-b border-gray-100 px-4 py-3.5 sm:px-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Improvements</span>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 ring-1 ring-brand-100">
                  {IMPROVEMENTS.length} changes
                </span>
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
                Full breakdown of what Prompty fixed versus a typical unoptimized listing.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-gray-50/30 px-3 py-3 sm:px-4">
              <ImprovementsPanel userPrompt={submittedPrompt} result={generatedListing} />
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-3 sm:px-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackToChat}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 active:translate-y-px"
                >
                  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M10 2L4 8l6 6" />
                  </svg>
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3483fa] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2968c8] active:translate-y-px"
                >
                  Publish to Mercado Libre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
