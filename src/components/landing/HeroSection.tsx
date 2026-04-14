'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Link from 'next/link'
import { WarpBackground } from '@/components/ui/warp-background'
import { Highlighter } from '@/components/ui/highlighter'

gsap.registerPlugin(useGSAP)

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const comparisonRef = useRef<HTMLDivElement>(null)
  const ctasRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from(badgeRef.current, { opacity: 0, y: -20, duration: 0.55 })
        .from(titleRef.current, { opacity: 0, y: 36, duration: 0.75 }, '-=0.25')
        .from(comparisonRef.current, { opacity: 0, y: 56, duration: 0.85 }, '-=0.35')
        .from(ctasRef.current, { opacity: 0, y: 20, duration: 0.5 }, '-=0.45')
    },
    { scope: containerRef },
  )

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

        {/* Comparison widget */}
        <div
          ref={comparisonRef}
          className="mt-12 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/10"
        >
          {/* Window chrome */}
          <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/80 px-5 py-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <span className="font-mono text-xs text-gray-400">
              prompty · listing optimization · sneakers
            </span>
          </div>

          <div className="grid grid-cols-2 divide-x divide-gray-100">
            {/* WITHOUT PROMPTY */}
            <div className="p-7">
              <div className="mb-5 flex items-center gap-2">
                <span className="inline-flex h-5 items-center rounded-full bg-red-50 px-2 font-mono text-[10px] font-semibold tracking-widest text-red-500">
                  WITHOUT PROMPTY
                </span>
              </div>

              <div className="mb-5 rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-medium italic leading-relaxed text-gray-400">
                  &ldquo;comfortable athletic shoe good price many sizes free
                  shipping&rdquo;
                </p>
              </div>

              <div className="mb-5 space-y-2.5">
                {[
                  'Title missing relevant keywords',
                  'Incomplete or empty attributes',
                  'No product description',
                  'Photo with a messy background',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-500">
                      ✗
                    </span>
                    <span className="text-sm text-gray-400">{item}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-400">
                    Listing score
                  </span>
                  <span className="font-mono text-sm font-bold text-red-500">
                    0.23 / 1.0
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-red-400"
                    style={{ width: '23%' }}
                  />
                </div>
              </div>
            </div>

            {/* WITH PROMPTY */}
            <div className="bg-brand-500 p-7">
              <div className="mb-5 flex items-center gap-2">
                <span className="inline-flex h-5 items-center rounded-full bg-brand-200 px-2 font-mono text-[10px] font-semibold tracking-widest text-brand-800">
                  WITH PROMPTY
                </span>
              </div>

              <div className="mb-5 rounded-lg border border-brand-200/60 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold leading-relaxed text-gray-900">
                  &ldquo;Adidas Galaxy 6 Men&apos;s Running Shoes — Cloudfoam
                  Cushioning, Flexible Rubber Outsole&rdquo;
                </p>
              </div>

              <div className="mb-5 space-y-2.5">
                {[
                  'Title with trending keywords',
                  'Complete attributes (brand, size, model)',
                  'Sales-focused bullet description',
                  'White-background image with specs',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-600">
                      ✓
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-400">
                    Listing score
                  </span>
                  <span className="font-mono text-sm font-bold text-emerald-600">
                    0.87 / 1.0
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: '87%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-3 text-center">
            <span className="font-mono text-[11px] text-gray-400">
              Trained on real category best sellers · DSPy MIPROv2
            </span>
          </div>
        </div>

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
      </div>
    </WarpBackground>
  )
}
