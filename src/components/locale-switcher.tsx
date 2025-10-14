'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { i18n, type Locale } from '@/i18n/i18n-config'

export function LocaleSwitcher() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const redirectedPathname = (locale: Locale) => {
    if (!pathname) return '/'
    const segments = pathname.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  return (
    <div className="relative">
      {/* Nút hiển thị ngôn ngữ hiện tại */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all backdrop-blur-sm text-sm flex items-center gap-1"
      >
        🌐 {pathname?.split('/')[1].toUpperCase() || 'EN'}
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menu xổ xuống */}
      {open && (
        <ul
          className="absolute right-0 mt-2 w-28 bg-white dark:bg-neutral-900 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
        >
          {i18n.locales.map((locale) => (
            <li key={locale}>
              <Link
                href={redirectedPathname(locale)}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {locale === 'en' ? 'English' : 'Tiếng Việt'}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
