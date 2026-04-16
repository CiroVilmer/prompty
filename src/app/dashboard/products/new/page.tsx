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
import type {
  AuditRequest,
  AuditResponse,
  GenerateRequest,
  GenerateResponse,
} from '@/types'

/* ── Types ──────────────────────────────────────────────────────────────────── */

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  icon?: string
}

type Stage = 'idle' | 'thinking' | 'done' | 'publishing'

/* ── ML listing preview card — vertical layout for panel width ───────────────── */

const MOCK_ATTRS: [string, string][] = [
  ['BRAND', 'Apple'],
  ['MODEL', 'MacBook Air M2'],
  ['PROCESSOR_BRAND', 'Apple'],
  ['RAM_MEMORY_MODULE_TOTAL_CAPACITY', '8 GB'],
  ['SSD_DATA_STORAGE_CAPACITY', '256 GB'],
  ['DISPLAY_SIZE', '13.6"'],
]

function ListingPreview({ visible, result }: { visible: boolean; result?: GenerateResponse | null }) {
  const title = result?.title ?? 'Apple MacBook Air 13.6" Chip M2 8 Núcleos — 8 GB RAM 256 GB SSD — Gris Espacial'
  const description = result?.description
  const attrs: [string, string][] = result?.attributes
    ? (Object.entries(result.attributes) as [string, string][])
    : MOCK_ATTRS

  return (
    <div
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* ML yellow header */}
      <div className="flex items-center gap-2 bg-[#fff159] px-3 py-2">
        <span className="shrink-0 text-sm font-extrabold text-[#333]">
          mercado<span style={{ color: '#3483fa' }}>libre</span>
        </span>
        <div className="flex min-w-0 flex-1 items-center rounded-sm border border-[#e8d800] bg-white px-2.5 py-1">
          <span className="truncate text-[11px] text-gray-400">
            {title.toLowerCase().slice(0, 50)}
          </span>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-1.5">
        <p className="text-[11px] text-[#3483fa]">
          Inicio › Computación › Laptops › Apple
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Image + title row */}
        <div className="flex gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
            <img src="/macbook-mock.png" alt="" className="h-full w-full object-contain" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-500">Nuevo</span>
              <span className="text-[11px] text-gray-200">|</span>
              <span className="text-[11px] text-gray-500">+1.200 vendidos</span>
            </div>
            <h3 className="text-[13px] font-medium leading-snug text-[#333]">{title}</h3>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} viewBox="0 0 10 10" className="size-2.5" fill="#3483fa">
                  <path d="M5 0l1.5 3.1 3.5.5-2.5 2.4.6 3.5L5 7.8 1.9 9.5l.6-3.5L0 3.6l3.5-.5z" />
                </svg>
              ))}
              <span className="text-[11px] text-[#3483fa]">4.9</span>
              <span className="text-[11px] text-gray-400">(2.847)</span>
            </div>
          </div>
        </div>

        {/* Price block */}
        <div className="rounded-lg bg-gray-50 px-3 py-2.5">
          <p className="text-[11px] text-gray-400 line-through">$ 1.349.999</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-light text-[#333]">$ 949.999</span>
            <span className="text-xs font-semibold text-[#00a650]">30% OFF</span>
          </div>
          <p className="mt-0.5 text-[11px] text-gray-500">en 12 cuotas de $ 79.166 sin interés</p>
          <p className="mt-1.5 text-[11px] font-medium text-[#00a650]">✓ Envío gratis · Full · Llega mañana</p>
        </div>

        {/* Description — the real generated content */}
        {description && (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Descripción
            </p>
            <p className="text-[12px] leading-relaxed text-gray-600 whitespace-pre-line">
              {description}
            </p>
          </div>
        )}

        {/* Attributes — the real generated content */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Características principales
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {attrs.slice(0, 10).map(([k, v]) => (
              <div key={k} className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wide text-gray-400 truncate">
                  {k.replace(/_/g, ' ')}
                </span>
                <span className="text-[12px] font-medium text-[#333] truncate">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Generating preview skeleton with rotating messages ─────────────────────── */

const WAIT_MESSAGES = [
  'Running DSPy audit pipeline…',
  'Detecting category and keywords…',
  'Building your optimized title…',
  'Filling required MELI attributes…',
  'Structuring the description…',
  'Applying MIPROv2 optimizations…',
  'Almost ready…',
]

function GeneratingPreview() {
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % WAIT_MESSAGES.length), 2400)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* ML bar skeleton */}
      <div className="h-9 animate-pulse bg-yellow-100" />
      <div className="flex flex-col items-center gap-5 px-6 py-10">
        {/* Spinning brand ring */}
        <div className="relative size-12 shrink-0">
          <svg className="size-12 animate-spin" style={{ animationDuration: '1.4s' }} viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="#f3f4f6" strokeWidth="4" />
            <path d="M24 4a20 20 0 0 1 20 20" stroke="#7B2FF2" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-center text-[13px] text-gray-500 transition-all duration-500">
          {WAIT_MESSAGES[msgIdx]}
        </p>
        {/* Skeleton content */}
        <div className="w-full space-y-2.5">
          <div className="h-4 animate-pulse rounded-md bg-gray-100" />
          <div className="h-4 w-4/5 animate-pulse rounded-md bg-gray-100" />
          <div className="h-4 w-3/5 animate-pulse rounded-md bg-gray-100" />
          <div className="mt-3 h-3 w-1/3 animate-pulse rounded-md bg-gray-100" />
          <div className="h-12 animate-pulse rounded-lg bg-gray-100" />
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-md bg-gray-50" />
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

/* ── Category detection ─────────────────────────────────────────────────────── */

function detectCategory(text: string): string {
  const lower = text.toLowerCase()
  if (
    /notebook|laptop|macbook|lenovo|dell|asus|hp\s|ryzen|intel|core\s[i-]|thinkpad|ideapad|zenbook/.test(
      lower,
    )
  )
    return 'notebooks'
  if (
    /zapatilla|sneaker|nike|adidas|jordan|puma|new\s?balance|vans|converse/.test(lower)
  )
    return 'zapatillas'
  return 'notebooks'
}

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

function WhatsNewPanel({
  userPrompt,
  listing,
  audit,
}: {
  userPrompt: string
  listing: GenerateResponse
  audit: AuditResponse | null
}) {
  const trim = (s: string, n: number) => s.length > n ? s.slice(0, n) + '…' : s

  const cards: {
    category: string
    severity: 'critical' | 'high' | 'medium'
    before: string
    after: string
    explanation: string
  }[] = []

  // Title
  cards.push({
    category: 'Title & search visibility',
    severity: 'critical',
    before: trim(userPrompt.split(/[.\n]/)[0].trim() || userPrompt, 160),
    after: listing.title,
    explanation: audit?.title_issues?.length
      ? audit.title_issues.join('. ')
      : 'The title was rewritten with brand, model, key specs, and high-traffic MELI keywords to maximize search ranking.',
  })

  // Description
  cards.push({
    category: 'Description',
    severity: 'high',
    before: trim(userPrompt, 220),
    after: listing.description ? trim(listing.description, 320) : '—',
    explanation: audit?.description_issues?.length
      ? audit.description_issues.join('. ')
      : 'The description is now structured with three sections: specs, benefits, and why-buy — the format that converts best on Mercado Libre.',
  })

  // Attributes
  const attrs = Object.entries(listing.attributes ?? {})
  if (attrs.length > 0) {
    cards.push({
      category: 'Product attributes',
      severity: 'critical',
      before: audit?.missing_critical_attributes?.length
        ? `Missing: ${audit.missing_critical_attributes.slice(0, 4).join(', ')}`
        : 'Attributes not filled — invisible in filtered searches',
      after: attrs.slice(0, 5).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' · '),
      explanation: audit?.missing_critical_attributes?.length
        ? `${audit.missing_critical_attributes.length} required attribute${audit.missing_critical_attributes.length > 1 ? 's' : ''} were missing. Listings with incomplete attributes drop out of most filtered searches.`
        : 'All required MELI attributes filled — your listing now appears in every relevant filter.',
    })
  }

  // Keywords
  if (audit?.missing_keywords?.length) {
    cards.push({
      category: 'Search keywords',
      severity: 'medium',
      before: 'None targeted',
      after: audit.missing_keywords.slice(0, 8).join(', '),
      explanation: `${audit.missing_keywords.length} trending Mercado Libre keywords were injected into the title and description to boost discoverability.`,
    })
  }

  // Priority fixes
  if (audit?.priority_fixes?.length) {
    cards.push({
      category: 'Audit findings fixed',
      severity: 'high',
      before: audit.priority_fixes.slice(0, 3).map(f => `• ${f}`).join('\n'),
      after: 'All critical issues resolved by the DSPy pipeline',
      explanation: 'These were the top issues flagged by the Prompty auditor before generating your listing.',
    })
  }

  return (
    <div className="flex flex-col gap-4 pb-1">
      {/* Summary header */}
      <div className="rounded-2xl border border-black/4 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-400">
          What Prompty added
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
          Every change the AI pipeline made — from your original description to the optimized listing.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-100">
            {cards.length} improvements
          </span>
          {audit?.missing_keywords?.length ? (
            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 ring-1 ring-sky-100">
              {audit.missing_keywords.length} keywords added
            </span>
          ) : null}
          {attrs.length ? (
            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 ring-1 ring-purple-100">
              {attrs.length} attributes filled
            </span>
          ) : null}
        </div>
      </div>

      {/* Cards */}
      {cards.map((item, idx) => {
        const sev = SEVERITY_CONFIG[item.severity]
        return (
          <article
            key={item.category}
            className={`whats-new-card rounded-2xl border border-black/4 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${sev.border} border-l-4`}
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
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${sev.badge}`}>
                    {sev.label}
                  </span>
                </div>
              </div>
            </header>
            <div className="space-y-2.5 px-4 py-4">
              <div className={`rounded-xl px-3.5 py-3 ${sev.beforeBg} ${sev.beforeRing}`}>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Before</p>
                <p className="whitespace-pre-line text-[13px] leading-relaxed text-gray-700 wrap-break-word">{item.before}</p>
              </div>
              <div className="rounded-xl bg-emerald-50/50 px-3.5 py-3 ring-1 ring-emerald-100/90">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">After</p>
                <p className="text-[13px] leading-relaxed text-gray-900 wrap-break-word">{item.after}</p>
              </div>
            </div>
            <footer className="border-t border-gray-100/80 bg-gray-50/40 px-4 py-3">
              <p className="flex gap-2.5 text-[12px] leading-relaxed text-gray-600">
                <svg viewBox="0 0 16 16" className="mt-0.5 size-4 shrink-0 text-amber-500/90" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden>
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
  const [overlayPhase, setOverlayPhase] = useState<OverlayPhase>('hidden')
  const [publishStep, setPublishStep] = useState(0)
  const [showSplit, setShowSplit] = useState(false)
  const [generatedListing, setGeneratedListing] = useState<GenerateResponse | null>(null)
  const [submittedPrompt, setSubmittedPrompt] = useState('')
  const [auditResult, setAuditResult] = useState<AuditResponse | null>(null)
  const [showWhatsNew, setShowWhatsNew] = useState(false)
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const idleRef = useRef<HTMLDivElement>(null)
  const splitRef = useRef<HTMLDivElement>(null)
  const animatedCount = useRef(0)

  useEffect(() => {
    setOverlayPhase('hidden')
    setStage('idle')
    setMessages([])
    setCurrentStep(0)
    setPublishStep(0)
    setShowSplit(false)
    setGeneratedListing(null)
    setSubmittedPrompt('')
    setAuditResult(null)
    setShowWhatsNew(false)
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

    chatMessagesRef.current?.scrollTo({
      top: chatMessagesRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, stage])

  function startGeneration(userPrompt: string) {
    setMessages([{ role: 'user', content: userPrompt }])
    setStage('thinking')
    setCurrentStep(0)
    setGeneratedListing(null)
    setAuditResult(null)

    const category = detectCategory(userPrompt)
    const weakTitle = userPrompt.split(/[.\n]/)[0].trim() || userPrompt

    // Audit → generate chain; runs in parallel with the step animation
    const apiPromise = apiClient
      .post<AuditResponse, AuditRequest>('/api/audit', {
        weak_title: weakTitle,
        weak_description: userPrompt,
        weak_attributes: {},
        category,
        trending_keywords: [],
      })
      .then((auditRes) => {
        if (auditRes.data) setAuditResult(auditRes.data)
        return apiClient.post<GenerateResponse, GenerateRequest>('/api/generate', {
          weak_title: weakTitle,
          weak_description: userPrompt,
          weak_attributes: {},
          category,
          trending_keywords: auditRes.data?.missing_keywords ?? [],
          audit_diagnosis: auditRes.data
            ? {
                missing_critical_attributes: auditRes.data.missing_critical_attributes,
                title_issues: auditRes.data.title_issues,
                description_issues: auditRes.data.description_issues,
                missing_keywords: auditRes.data.missing_keywords,
                priority_fixes: auditRes.data.priority_fixes,
              }
            : {},
        })
      })

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
            content: `Something went wrong: ${res.error ?? 'No data returned'}. Check that the backend is running and try again.`,
            icon: '⚠️',
          },
        ])
        // Keep the split view visible so the user sees the error in context.
        // stage → 'done' so the retry button renders.
        setStage('done')
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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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

      {/* Split view: chat + preview / what's new */}
      {showSplit && (
        <div
          ref={splitRef}
          className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden opacity-0 lg:grid-cols-2"
        >
          {/* Left — AI activity log */}
          <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
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
            <div ref={chatMessagesRef} className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
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
            </div>
          </div>

          {/* Right — listing preview / what's new */}
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto overflow-x-hidden pt-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {showWhatsNew ? "What's new" : 'Listing preview'}
              </span>
              {stage === 'thinking' && !generatedListing && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  Building…
                </span>
              )}
            </div>

            {generatedListing ? (
              showWhatsNew ? (
                <WhatsNewPanel
                  userPrompt={submittedPrompt}
                  listing={generatedListing}
                  audit={auditResult}
                />
              ) : (
                <ListingPreview visible result={generatedListing} />
              )
            ) : (
              <GeneratingPreview />
            )}

            {/* Action buttons — only shown when there is a result */}
            {(stage === 'done' || stage === 'publishing') && generatedListing && (
              <div className="mt-2 flex gap-3">
                {showWhatsNew ? (
                  <button
                    onClick={() => setShowWhatsNew(false)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:translate-y-px"
                  >
                    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M10 2L4 8l6 6" />
                    </svg>
                    Back to preview
                  </button>
                ) : (
                  <button
                    onClick={() => setShowWhatsNew(true)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:translate-y-px"
                  >
                    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 2.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
                      <path d="M8 1v1M8 10v1M3.05 3.05l.7.7M11.25 11.25l.7.7M1 8h1M13 8h1M3.05 12.95l.7-.7M11.25 4.75l.7-.7" />
                    </svg>
                    What's new
                  </button>
                )}
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

            {/* Retry button — shown when generation failed */}
            {stage === 'done' && !generatedListing && (
              <div className="mt-2">
                <button
                  onClick={() => {
                    setShowSplit(false)
                    setStage('idle')
                    setMessages([])
                    setAuditResult(null)
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                >
                  ↩ Try again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
