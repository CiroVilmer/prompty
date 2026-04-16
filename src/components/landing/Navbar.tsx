'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'
import { StaggeredMenu } from '@/components/ui/StaggeredMenu'

gsap.registerPlugin(useGSAP)

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
]

const MOBILE_ITEMS = [
  { label: 'How it works', ariaLabel: 'Go to how it works section', link: '/#how-it-works' },
  { label: 'Before & After', ariaLabel: 'See before and after examples', link: '/#antes-despues' },
  { label: 'Why Prompty', ariaLabel: 'Why use Prompty', link: '/#why-prompty' },
  { label: 'Try demo', ariaLabel: 'Try the demo on the dashboard', link: '/dashboard' },
]

export function Navbar() {
  const [pastHero, setPastHero] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const update = () => {
      const hero = document.getElementById('landing-hero')
      if (!hero) {
        setPastHero(true)
        return
      }
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
    <>
      {/* Desktop navbar — hidden on mobile */}
      <header ref={headerRef} className="hidden md:flex fixed inset-x-0 top-0 z-50 justify-center px-4 py-4">
        <nav
          className={cn(
            'relative flex w-full max-w-5xl items-center justify-between transition-all duration-300 ease-in-out',
            pastHero
              ? 'rounded-full border border-gray-200 bg-white/90 px-6 py-3 shadow-lg shadow-black/5 backdrop-blur-md'
              : 'px-2 py-1',
          )}
        >
          {/* Left — nav links */}
          <div className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-medium text-gray-500 transition-colors hover:text-gray-900',
                  pastHero ? 'text-sm' : 'text-base',
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Center — logo, absolutely centered */}
          <Link
            href="/"
            aria-label="Prompty home"
            className="absolute left-1/2 -translate-x-1/2"
          >
            <Image
              src="/images/logo-header.png"
              alt="Prompty"
              width={2351}
              height={1348}
              className={cn(
                'w-auto object-contain transition-all duration-300',
                pastHero ? 'h-9' : 'h-12',
              )}
              priority
            />
          </Link>

          {/* Right — CTA */}
          <Link
            href="/dashboard"
            className={cn(
              'font-semibold transition-all duration-300',
              'bg-gray-900 text-white hover:bg-gray-700',
              pastHero
                ? 'rounded-full px-5 py-2 text-sm'
                : 'rounded-lg px-6 py-2.5 text-base',
            )}
          >
            Try demo
          </Link>
        </nav>
      </header>

      {/* Mobile nav — StaggeredMenu overlay, hidden on desktop */}
      <div className="md:hidden">
        <StaggeredMenu
          isFixed
          position="right"
          colors={['#c4b5fd', '#7B2FF2']}
          logoUrl="/images/logo-header.png"
          menuButtonColor="#1A1A2E"
          openMenuButtonColor="#1A1A2E"
          accentColor="#7B2FF2"
          changeMenuColorOnOpen={false}
          items={MOBILE_ITEMS}
          displaySocials={false}
          displayItemNumbering
          closeOnClickAway
        />
      </div>
    </>
  )
}
