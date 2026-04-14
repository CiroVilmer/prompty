'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'

gsap.registerPlugin(useGSAP)

const NAV_LINKS = [
  { label: 'El Problema', href: '#el-problema' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Por qué Prompty', href: '#por-que-prompty' },
  { label: 'Nosotros', href: '#nosotros' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
          'flex items-center justify-between transition-all duration-300 ease-in-out',
          scrolled
            ? 'w-[min(760px,calc(100%-2rem))] rounded-full border border-gray-200 bg-white/90 px-6 py-2.5 shadow-lg shadow-black/5 backdrop-blur-md'
            : 'w-full max-w-7xl px-8 py-1',
        )}
      >
        {/* Left — nav links */}
        <div className="flex items-center gap-6">
          {scrolled ? (
            // Pill state: show only two links to save space
            NAV_LINKS.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))
          ) : (
            NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))
          )}
        </div>

        {/* Center — logo */}
        <Link
          href="/"
          className={cn(
            'absolute left-1/2 -translate-x-1/2 font-mono font-bold tracking-[0.3em] text-gray-900 transition-all duration-300',
            scrolled ? 'text-sm' : 'text-lg',
          )}
        >
          PROMPTY
        </Link>

        {/* Right — CTA */}
        <Link
          href="/demo"
          className={cn(
            'font-semibold transition-all duration-300',
            'bg-gray-900 text-white hover:bg-gray-700',
            scrolled
              ? 'rounded-full px-4 py-1.5 text-xs'
              : 'rounded-lg px-5 py-2 text-sm',
          )}
        >
          Probar demo
        </Link>
      </nav>
    </header>
  )
}
