'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'

gsap.registerPlugin(useGSAP)

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
]

export function Navbar() {
  const [pastHero, setPastHero] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const update = () => {
      const hero = document.getElementById('landing-hero')
      if (!hero) {
        setPastHero(false)
        return
      }
      // Compact bar once the hero has fully left the viewport (scrolled past it)
      setPastHero(hero.getBoundingClientRect().bottom <= 0)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    window.addEventListener('prompty:landing-hero-mounted', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('prompty:landing-hero-mounted', update)
    }
  }, [])

  // Entrance animation
  useGSAP(
    () => {
      gsap.from(headerRef.current, {
        y: -72,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.05,
      })
    },
    { scope: headerRef },
  )

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 flex justify-center py-4">
      <nav
        className={cn(
          'grid w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 transition-all duration-300 ease-in-out',
          pastHero
            ? 'rounded-full border border-gray-200 bg-white/90 py-2.5 shadow-lg shadow-black/5 backdrop-blur-md'
            : 'py-1',
        )}
      >
        <div className="flex min-w-0 items-center justify-start gap-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'shrink-0 font-medium text-gray-500 transition-colors hover:text-gray-900',
                pastHero ? 'text-xs' : 'text-sm',
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className={cn(
            'justify-self-center font-mono font-bold tracking-[0.3em] text-gray-900 transition-all duration-300',
            pastHero ? 'text-sm' : 'text-lg',
          )}
        >
          PROMPTY
        </Link>

        <div className="flex justify-end">
          <Link
            href="/demo"
            className={cn(
              'font-semibold transition-all duration-300',
              'bg-gray-900 text-white hover:bg-gray-700',
              pastHero
                ? 'rounded-full px-4 py-1.5 text-xs'
                : 'rounded-lg px-5 py-2 text-sm',
            )}
          >
            Try demo
          </Link>
        </div>
      </nav>
    </header>
  )
}
