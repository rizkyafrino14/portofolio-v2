'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { RxHamburgerMenu } from 'react-icons/rx'
import { RiCloseFill, RiSettings3Fill } from 'react-icons/ri'
import { usePathname } from 'next/navigation'
import { twMerge } from 'tailwind-merge'
import { useT, type TKey } from '@/lib/i18n'
import SettingsPanel from './common/SettingsPanel'

export const navLinks: { key: TKey; href: string }[] = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.about', href: '/about' },
  { key: 'nav.education', href: '/education' },
  { key: 'nav.projects', href: '/project' },
  { key: 'nav.resume', href: '/resume' },
  { key: 'nav.contact', href: '/contact' },
]

export default function Navbar() {
  const t = useT()
  const [menu, setMenu] = useState(false)
  const [settings, setSettings] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY >= 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenu(false), [pathname])

  return (
    <header className="sticky top-0 z-30 px-4 pt-3 md:px-8" data-ui>
      <nav
        aria-label="Main"
        className={twMerge(
          'mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-line/25 bg-card/70 px-3 py-2 shadow-soft backdrop-blur-xl transition-colors',
          scrolled && 'bg-card/90',
        )}
      >
        <Link href="/" className="flex items-center gap-2 pl-1 font-display text-lg font-bold text-ink">
          <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-line/25 bg-white shadow-sm">
            <Image src="/logo.png" alt="Logo Rizky" width={40} height={40} priority className="h-full w-full object-contain p-0.5" />
          </span>
          <span className="hidden sm:inline">Rizky</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href)
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={twMerge(
                    'block rounded-full px-4 py-2 text-sm font-semibold text-muted transition-colors hover:text-ink',
                    active && 'bg-ink text-paper hover:text-paper',
                  )}
                >
                  {t(l.key)}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettings(!settings)}
            aria-label={t('nav.settings')}
            aria-expanded={settings}
            className="grid h-10 w-10 place-items-center rounded-full border border-line/30 bg-card text-xl text-ink transition-transform hover:rotate-45"
          >
            <RiSettings3Fill />
          </button>
          <button
            onClick={() => setMenu(!menu)}
            aria-label="Menu"
            aria-expanded={menu}
            className="grid h-10 w-10 place-items-center rounded-full border border-line/30 bg-card text-xl text-ink md:hidden"
          >
            {menu ? <RiCloseFill /> : <RxHamburgerMenu />}
          </button>
        </div>
      </nav>

      {menu && (
        <ul className="mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-3xl border border-line/25 bg-card/95 p-3 shadow-soft backdrop-blur-xl md:hidden">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={twMerge(
                  'block rounded-2xl px-4 py-3 font-semibold text-ink',
                  (l.href === '/' ? pathname === '/' : pathname.startsWith(l.href)) && 'bg-card2',
                )}
              >
                {t(l.key)}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <SettingsPanel open={settings} onClose={() => setSettings(false)} />
    </header>
  )
}
