'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Link from 'next/link'
import { WarpBackground } from '@/components/ui/warp-background'
import { Highlighter } from '@/components/ui/highlighter'

export interface HeroSectionProps {
  /** Set to true when the LoadingScreen exit starts — triggers the stagger. */
  loadingComplete: boolean
}

/* ── MacBook frame — reusable shell that overlays content on the laptop PNG ── */

function MacbookFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '3160 / 2512' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/macbook-mock.png"
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        style={{ objectFit: 'fill', zIndex: 1 }}
      />
      <div
        className="absolute overflow-hidden rounded-[3px]"
        style={{ left: '9.2%', top: '3.5%', width: '81.6%', height: '62%', zIndex: 2 }}
      >
        {children}
      </div>
    </div>
  )
}

/* ── Screen content for each MacBook ────────────────────────────────────────── */

function BadScreen() {
  return (
    <div className="flex h-full w-full flex-col bg-gray-50">
      {/* Browser chrome */}
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-100 px-2 py-1 shrink-0">
        <div className="flex gap-[3px]">
          <span className="h-1.5 w-1.5 rounded-full bg-red-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
        </div>
        <div className="ml-1 flex-1 truncate rounded bg-white border border-gray-200 px-1.5 py-px text-[6px] text-gray-400">
          mercadolibre.com.ar · zapatillas running
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-3 py-2 text-center">
        <div className="size-10 overflow-hidden rounded-lg border border-stone-300 bg-gradient-to-br from-stone-200 via-stone-300 to-amber-100/80 relative">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(-14deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-5 rounded-full bg-stone-400/40 blur-[3px]" />
          </div>
        </div>

        <p className="max-w-[85%] text-[7px] italic leading-tight text-gray-400 line-clamp-2">
          &ldquo;zapatilla deportiva varios talles envio gratis&rdquo;
        </p>

        <p className="text-2xl font-black leading-none text-red-400 sm:text-3xl">#287</p>
        <p className="text-[6px] text-gray-400">in search results</p>

        <div className="mt-0.5 w-4/5 space-y-0.5">
          <div className="flex justify-between text-[6px] font-mono text-gray-400">
            <span>SEO Score</span><span>23/100</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-gray-300" style={{ width: '23%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function GoodScreen() {
  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* Browser chrome */}
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-100 px-2 py-1 shrink-0">
        <div className="flex gap-[3px]">
          <span className="h-1.5 w-1.5 rounded-full bg-red-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
        </div>
        <div className="ml-1 flex-1 truncate rounded bg-white border border-gray-200 px-1.5 py-px text-[6px] text-gray-400">
          mercadolibre.com.ar · zapatillas running
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-3 py-2 text-center">
        <div className="size-10 rounded-lg border border-gray-100 bg-white shadow-sm flex items-center justify-center">
          <svg viewBox="0 0 80 56" fill="none" className="w-7" aria-hidden>
            <ellipse cx="40" cy="47" rx="31" ry="4.5" fill="#e5e7eb" />
            <path d="M11 40 Q10 27 21 25 L43 22 Q59 20 65 28 Q69 34 65 38 Q60 42 51 43 L17 44 Q11 44 11 40Z" fill="#dbeafe" />
            <path d="M51 43 Q61 42 65 38 Q69 34 65 28 L59 27 Q62 33 59 37 Q55 41 48 42Z" fill="#bfdbfe" />
            <path d="M21 25 Q23 18 30 16 Q37 14 43 18 L43 22Z" fill="#93c5fd" />
          </svg>
        </div>

        <p className="max-w-[85%] text-[7px] font-semibold leading-tight text-gray-800 line-clamp-2">
          &ldquo;Zapatillas Adidas Galaxy 6 Running Hombre&rdquo;
        </p>

        <p className="text-2xl font-black leading-none text-emerald-500 sm:text-3xl">#3</p>
        <p className="text-[6px] text-gray-400">in search results</p>

        <div className="mt-0.5 w-4/5 space-y-0.5">
          <div className="flex justify-between text-[6px] font-mono text-gray-500">
            <span>SEO Score</span><span>91/100</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-gray-800" style={{ width: '91%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Hero ──────────────────────────────────────────────────────────────── */

export default function HeroSection({ loadingComplete }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const badgeRef     = useRef<HTMLDivElement>(null)
  const titleRef     = useRef<HTMLHeadingElement>(null)
  const cardRef      = useRef<HTMLDivElement>(null)
  const ctasRef      = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const badge = badgeRef.current
    const title = titleRef.current
    const card  = cardRef.current
    const ctas  = ctasRef.current

    if (!badge || !title || !card || !ctas) return

    if (!loadingComplete) {
      gsap.set([badge, title, card, ctas], { opacity: 0 })
      gsap.set(badge, { y: 20 })
      gsap.set(title, { y: 30 })
      gsap.set(card,  { y: 40, scale: 0.97 })
      gsap.set(ctas,  { y: 20 })
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

      tl.to(badge, { opacity: 1, y: 0,           duration: 0.6 }, 0.00)
        .to(title, { opacity: 1, y: 0,           duration: 0.7 }, 0.10)
        .to(card,  { opacity: 1, y: 0, scale: 1, duration: 0.8 }, 0.25)
        .to(ctas,  { opacity: 1, y: 0,           duration: 0.5 }, 0.40)
    }, containerRef)

    return () => ctx.revert()
  }, [loadingComplete])

  useEffect(() => {
    queueMicrotask(() =>
      window.dispatchEvent(new CustomEvent('prompty:landing-hero-mounted')),
    )
  }, [])

  return (
    <WarpBackground
      id="landing-hero"
      className="w-full min-h-screen rounded-none border-0 p-0 flex items-center justify-center"
      perspective={100}
      beamsPerSide={3}
      beamDuration={4}
      beamDelayMax={3}
      beamDelayMin={0}
      beamSize={5}
      gridColor="var(--border)"
    >
      <div
        ref={containerRef}
        className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-20 pt-36 text-center"
      >
        {/* Badge */}
        <div ref={badgeRef} className="mb-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
            <span className="text-xs font-medium tracking-wide text-gray-500">
              Powered by Claude (Anthropic) + DSPy
            </span>
          </div>
        </div>

        {/* Title */}
        <h1
          ref={titleRef}
          className="max-w-3xl text-balance text-5xl font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-6xl lg:text-[4.5rem]"
        >
          Listings{' '}
          <Highlighter
            action="highlight"
            color="#f8f8f6"
            strokeWidth={2}
            animationDuration={700}
            isView
            multiline={false}
          >
            optimized
          </Highlighter>
          {' '}with AI and{' '}
          <Highlighter
            action="underline"
            color="#38bdf8"
            strokeWidth={1.75}
            animationDuration={950}
            iterations={3}
            padding={[1, 4, 5, 4]}
            isView
            multiline
          >
            real data
          </Highlighter>
        </h1>

        {/* CTAs */}
        <div
          ref={ctasRef}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/demo"
            className="rounded-lg bg-gray-900 px-7 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-700"
          >
            Try the demo
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-lg border border-gray-200 bg-white px-7 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            How it works
          </Link>
        </div>

        {/* ── Large showcase card with two MacBooks ── */}
        <div
          ref={cardRef}
          className="mt-14 w-full overflow-hidden rounded-3xl border border-gray-200 bg-[#f8f8f6] p-6 shadow-xl shadow-gray-900/5 sm:p-10"
        >
          {/* Card header */}
          <div className="mb-6 flex flex-col items-center gap-1 sm:mb-8">
            <p className="text-sm font-semibold text-gray-900">
              Before & After
            </p>
            <p className="text-xs text-gray-400">
              Same product, same category — different listing quality
            </p>
          </div>

          {/* Two MacBooks side by side */}
          <div className="grid grid-cols-2 items-end gap-4 sm:gap-8">
            {/* Left — bad listing */}
            <div className="flex flex-col items-center gap-3">
              <MacbookFrame>
                <BadScreen />
              </MacbookFrame>
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-red-400" />
                <span className="text-xs font-medium text-gray-500">Without Prompty</span>
              </div>
            </div>

            {/* Right — optimized listing */}
            <div className="flex flex-col items-center gap-3">
              <MacbookFrame>
                <GoodScreen />
              </MacbookFrame>
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-gray-500">With Prompty</span>
              </div>
            </div>
          </div>

          {/* Card footer */}
          <p className="mt-6 text-center font-mono text-[11px] text-gray-400 sm:mt-8">
            Trained on real category best sellers · DSPy MIPROv2
          </p>
        </div>
      </div>
    </WarpBackground>
  )
}
