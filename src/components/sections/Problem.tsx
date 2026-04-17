'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'

gsap.registerPlugin(ScrollTrigger)

const PAIN_LABEL_STYLES = [
  { size: 'text-2xl',  top: '0%',  left: '0%',   rotate: '-2deg',   opacity: 0.85 },
  { size: 'text-xl',   top: '3%',  right: '0%',  rotate: '1.5deg',  opacity: 0.65 },
  { size: 'text-lg',   top: '34%', left: '0%',   rotate: '-1deg',   opacity: 0.55 },
  { size: 'text-2xl',  top: '28%', right: '4%',  rotate: '2deg',    opacity: 0.75 },
  { size: 'text-base', top: '58%', left: '8%',   rotate: '-1.5deg', opacity: 0.45 },
  { size: 'text-base', top: '62%', right: '2%',  rotate: '1deg',    opacity: 0.38 },
  { size: 'text-sm',   top: '82%', left: '2%',   rotate: '-0.5deg', opacity: 0.30 },
  { size: 'text-sm',   top: '84%', right: '10%', rotate: '1.5deg',  opacity: 0.28 },
]

export default function Problem() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          once: true,
        },
      })

      tl.fromTo('[data-problem="label"]',
          { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' })
        .fromTo('[data-problem="title"]',
          { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2')
        .fromTo('[data-problem="body"]',
          { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.25')
        .fromTo('[data-problem="cards"]',
          { opacity: 0 }, { opacity: 1, duration: 0.1 }, '-=0.3')
        .fromTo('[data-problem="solution"]',
          { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.1')

      gsap.from('[data-pain-label]', {
        y: () => gsap.utils.random(-18, 18) as number,
        x: () => gsap.utils.random(-12, 12) as number,
        opacity: 0,
        duration: 0.6,
        stagger: 0.07,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          once: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="how-it-works" ref={sectionRef} className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">

        {/* ── Row 1: two-column ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_auto] md:gap-16 lg:grid-cols-[55fr_45fr]">

          {/* Left — label + title + body + "Until now." */}
          <div className="flex flex-col justify-center">
            <p
              data-problem="label"
              className="mb-4 text-xs font-semibold uppercase tracking-widest text-purple-600"
            >
              {t.problem.label}
            </p>

            <h2
              data-problem="title"
              className="mb-5 text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl"
            >
              {t.problem.title}
            </h2>

            <p
              data-problem="body"
              className="text-base leading-relaxed text-gray-500"
            >
              {t.problem.bodyPre}
              <span className="rounded bg-red-50 px-1 font-semibold text-red-500">
                {t.problem.bodyHighlight1}
              </span>
              {t.problem.bodyMid1}
              <span className="rounded bg-red-50 px-1 font-semibold text-red-500">
                {t.problem.bodyHighlight2}
              </span>
              {t.problem.bodyMid2}
              <span className="rounded bg-red-50 px-1 font-semibold text-red-500">
                {t.problem.bodyHighlight3}
              </span>
              {'.'}
            </p>

            <p className="mt-4 text-xl font-semibold text-purple-600">
              {t.problem.untilNow}
            </p>
          </div>

          {/* Right — floating typographic pain labels */}
          <div
            data-problem="cards"
            className="relative h-64 md:h-72 md:w-[340px] lg:w-[380px]"
          >
            {PAIN_LABEL_STYLES.map((style, i) => (
              <span
                key={i}
                data-pain-label
                className={`absolute select-none font-semibold text-gray-400 ${style.size}`}
                style={{
                  top:     style.top,
                  left:    'left' in style ? style.left : undefined,
                  right:   'right' in style ? style.right : undefined,
                  transform: `rotate(${style.rotate})`,
                  opacity: style.opacity,
                }}
              >
                {t.problem.painLabels[i]}
              </span>
            ))}
          </div>
        </div>

        {/* ── Row 2: solution banner ──────────────────────────────────────── */}
        <div
          data-problem="solution"
          className="mt-10 border-t border-gray-200 pt-8"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-widest text-purple-600">
                {t.problem.solutionLabel}
              </span>
              <p className="mt-1 text-lg text-gray-700">
                <span className="font-bold text-gray-900">{t.problem.solutionBodyBrand}</span>
                {t.problem.solutionBodyMid}
                <span className="font-bold text-purple-600">{t.problem.solutionBodyScore}</span>
                {t.problem.solutionBodyMid2}
                <span className="font-semibold text-gray-900">{t.problem.solutionBodyBestSellers}</span>
                {t.problem.solutionBodyEnd}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <Link
                href="/how-it-works"
                className="rounded-full bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700"
              >
                {t.problem.ctaHowItWorks}
              </Link>
              <Link
                href="/difference"
                className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400"
              >
                {t.problem.ctaWhatsDifferent}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
