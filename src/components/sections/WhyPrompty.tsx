'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Database, Layers, TrendingUp, Grid3x3, type LucideIcon } from 'lucide-react'
import { BorderGlow } from '@/components/ui/border-glow'

gsap.registerPlugin(ScrollTrigger)

interface Card {
  num: string
  icon: LucideIcon
  title: string
  body: string
}

const CARDS: Card[] = [
  {
    num: '01',
    icon: Database,
    title: 'Based on real data',
    body: "Every optimization is fueled by the top-ranked products in your category. We don't guess — we consult the market.",
  },
  {
    num: '02',
    icon: Layers,
    title: 'End-to-end',
    body: 'Text, attributes, keywords, and images. You enter with a mediocre listing and leave with a complete publication ready to compete.',
  },
  {
    num: '03',
    icon: TrendingUp,
    title: 'Measurable improvement',
    body: 'We show you the score before and after. You know exactly how much your listing improved and in which dimensions.',
  },
  {
    num: '04',
    icon: Grid3x3,
    title: 'Any category',
    body: 'Sneakers, electronics, apparel — the pipeline auto-calibrates with data from each vertical.',
  },
]

export default function WhyPrompty() {
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

      tl.fromTo(
          '[data-why="label"]',
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
        )
        .fromTo(
          '[data-why="title"]',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
          '-=0.3',
        )
        .fromTo(
          '[data-why="subtitle"]',
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
          '-=0.35',
        )
        .fromTo(
          '[data-why="card"]',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: 'power2.out' },
          '-=0.2',
        )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="why-prompty" ref={sectionRef} className="bg-[#F8F9FC] py-28">
      <div className="mx-auto max-w-6xl px-8">

        {/* Header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <span
            data-why="label"
            className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-purple-600"
          >
            / why us
          </span>

          <h2
            data-why="title"
            className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl"
          >
            Not just a title improver
          </h2>

          <p
            data-why="subtitle"
            className="max-w-2xl text-lg text-gray-500"
          >
            Four reasons Prompty is different from every other listing tool.
          </p>
        </div>

        {/* 2×2 card grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {CARDS.map(({ num, icon: Icon, title, body }) => (
            <div key={num} data-why="card" className="h-full">
              <BorderGlow
                backgroundColor="#FFFFFF"
                borderRadius={20}
                glowColor="270 60 70"
                glowIntensity={0.5}
                glowRadius={130}
                edgeSensitivity={25}
                animated={false}
                className="h-full"
              >
                <div className="flex h-full flex-col p-8 md:p-10">

                  {/* Icon */}
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-100 to-purple-50 shadow-sm">
                    <Icon className="h-7 w-7 text-purple-600" />
                  </div>

                  {/* Card number */}
                  <span className="mb-2 font-mono text-xs text-gray-300">{num}</span>

                  {/* Title */}
                  <h3 className="mb-3 text-xl font-bold text-gray-900 md:text-2xl">
                    {title}
                  </h3>

                  {/* Accent line */}
                  <div className="mb-4 h-0.5 w-8 rounded-full bg-purple-400" />

                  {/* Body */}
                  <p className="flex-grow text-base leading-relaxed text-gray-500">
                    {body}
                  </p>

                </div>
              </BorderGlow>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
