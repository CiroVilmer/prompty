'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Link from 'next/link'
import { WarpBackground } from '@/components/ui/warp-background'
import { Highlighter } from '@/components/ui/highlighter'

export interface HeroSectionProps {
  loadingComplete: boolean
}

export default function HeroSection({ loadingComplete }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const badgeRef     = useRef<HTMLDivElement>(null)
  const titleRef     = useRef<HTMLHeadingElement>(null)
  const ctasRef      = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const badge = badgeRef.current
    const title = titleRef.current
    const ctas  = ctasRef.current

    if (!badge || !title || !ctas) return

    if (!loadingComplete) {
      gsap.set([badge, title, ctas], { opacity: 0 })
      gsap.set(badge, { y: 20 })
      gsap.set(title, { y: 30 })
      gsap.set(ctas,  { y: 20 })
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      tl.to(badge, { opacity: 1, y: 0, duration: 0.6 }, 0.00)
        .to(title, { opacity: 1, y: 0, duration: 0.7 }, 0.10)
        .to(ctas,  { opacity: 1, y: 0, duration: 0.5 }, 0.25)
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
            optimizados
          </Highlighter>
          {' '}con IA y{' '}
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
            datos reales
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
            Probá la demo
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-lg border border-gray-200 bg-white px-7 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            Cómo funciona
          </Link>
        </div>
      </div>
    </WarpBackground>
  )
}
