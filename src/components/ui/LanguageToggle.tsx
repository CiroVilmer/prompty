'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'
import { cn } from '@/lib/utils'

interface LanguageToggleProps {
  className?: string
  variant?: 'navbar' | 'floating'
}

export function LanguageToggle({ className, variant = 'navbar' }: LanguageToggleProps) {
  const { t, toggleLang } = useLanguage()

  if (variant === 'floating') {
    return (
      <button
        onClick={toggleLang}
        aria-label="Toggle language"
        className={cn(
          'fixed bottom-6 left-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-gray-200 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95',
          className,
        )}
      >
        {t.nav.toggleLang}
      </button>
    )
  }

  return (
    <button
      onClick={toggleLang}
      aria-label="Toggle language"
      className={cn(
        'rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 transition-all hover:border-gray-300 hover:text-gray-900',
        className,
      )}
    >
      {t.nav.toggleLang}
    </button>
  )
}
