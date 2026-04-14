'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center py-4">
      <nav
        className={cn(
          'flex items-center justify-between transition-all duration-300 ease-in-out',
          scrolled
            ? 'w-[min(680px,calc(100%-2rem))] rounded-full border border-white/10 bg-[#0a0f1c]/90 px-6 py-2.5 shadow-2xl shadow-black/40 backdrop-blur-md'
            : 'w-full max-w-7xl px-8 py-1',
        )}
      >
        {/* Left */}
        <div className={cn('flex items-center', scrolled ? 'w-auto' : 'w-36')}>
          <Link
            href="#nosotros"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            Nosotros
          </Link>
        </div>

        {/* Center — logo */}
        <Link
          href="/"
          className={cn(
            'font-mono font-bold tracking-[0.3em] text-white transition-all duration-300',
            scrolled ? 'text-base' : 'text-xl',
          )}
        >
          PROMPTY
        </Link>

        {/* Right */}
        <div
          className={cn(
            'flex items-center justify-end',
            scrolled ? 'w-auto' : 'w-36',
          )}
        >
          <Link
            href="/demo"
            className={cn(
              'font-semibold transition-all duration-300',
              'bg-cyan-400 text-slate-900 hover:bg-cyan-300',
              scrolled
                ? 'rounded-full px-4 py-1.5 text-xs'
                : 'rounded-lg px-5 py-2 text-sm',
            )}
          >
            Probar demo
          </Link>
        </div>
      </nav>
    </header>
  )
}
