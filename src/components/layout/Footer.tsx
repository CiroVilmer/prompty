'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="border-t border-gray-100 bg-white py-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-sm text-gray-400">
        <span>
          &copy; {new Date().getFullYear()} Prompty. {t.footer.rights}
        </span>
        <span>{t.footer.builtWith}</span>
      </div>
    </footer>
  )
}
