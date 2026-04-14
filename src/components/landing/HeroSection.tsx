'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Link from 'next/link'
import { WarpBackground } from '@/components/ui/warp-background'
import { Highlighter } from '@/components/ui/highlighter'
import { AnimatedTooltip } from '@/components/ui/animated-tooltip'

const TEAM = [
  {
    id: 1,
    name: "Ciro Vilmer",
    designation: "Fullstack Developer",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQEg2vjW01SAfA/profile-displayphoto-scale_200_200/B4DZ0.dbBuKUAc-/0/1774869398829?e=1777507200&v=beta&t=Rvgmw4KvMuSHKKLSougdplhdQMmy7MKrRsJGuKSHybo",
    link: "https://www.linkedin.com/in/ciro-vilmer-b4727a174/",
  },
  {
    id: 2,
    name: "Luis Embon",
    designation: "Backend Developer",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQHDQhChM8M6rA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1689722079097?e=1777507200&v=beta&t=CPL5G4686soOa3PvXxI_gkS0KmIuSBQIjYKxoGwsenk",
    link: "https://www.linkedin.com/in/luis-embon-strizzi/",
  },
  {
    id: 3,
    name: "Valentin GonzaleZ",
    designation: "Frontend Developer",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQEOCZfpgAFCPQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1709020529983?e=1777507200&v=beta&t=PMSnaQsoQA79SzgiimiOsiQL7H0XnUsXjEVbAzjl3HM",
    link: "https://www.linkedin.com/in/valentin-gonzalez-6a1805276/",
  },
  {
    id: 4,
    name: "Martina Chiappa",
    designation: "UX Designer",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQHuMIv_o0RE9w/profile-displayphoto-shrink_400_400/B4DZcTHho3GYAk-/0/1748372430039?e=1777507200&v=beta&t=uyhh71ayB4WQN3Sa9KcraOCcmNrHkM32Udw5-Q3j8Uc",
    link: "https://linkedin.com/in/martinachiappa/",
  },
]

export interface HeroSectionProps {
  loadingComplete: boolean
}

export default function HeroSection({ loadingComplete }: HeroSectionProps) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const badgeRef      = useRef<HTMLDivElement>(null)
  const titleRef      = useRef<HTMLHeadingElement>(null)
  const subtitleRef   = useRef<HTMLParagraphElement>(null)
  const ctasRef       = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const badge    = badgeRef.current
    const title    = titleRef.current
    const subtitle = subtitleRef.current
    const ctas     = ctasRef.current

    if (!badge || !title || !subtitle || !ctas) return

    if (!loadingComplete) {
      gsap.set([badge, title, subtitle, ctas], { opacity: 0 })
      gsap.set(badge,    { y: 20 })
      gsap.set(title,    { y: 30 })
      gsap.set(subtitle, { y: 16 })
      gsap.set(ctas,     { y: 20 })
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      tl.to(badge,    { opacity: 1, y: 0, duration: 0.6 }, 0.00)
        .to(title,    { opacity: 1, y: 0, duration: 0.7 }, 0.10)
        .to(subtitle, { opacity: 1, y: 0, duration: 0.5 }, 0.22)
        .to(ctas,     { opacity: 1, y: 0, duration: 0.5 }, 0.35)
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

        {/* Team avatars with animated tooltips */}
        <div className="mb-7 flex flex-row items-center justify-center pl-4">
          <AnimatedTooltip items={TEAM} />
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

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="mt-5 max-w-xl text-lg text-gray-500"
        >
          Faster, better, and completely optimized listings.
        </p>

        {/* CTAs */}
        <div
          ref={ctasRef}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/dashboard"
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
