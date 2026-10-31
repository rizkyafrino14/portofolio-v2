'use client'

import Link from 'next/link'
import Image from 'next/image'
import { logoLinks } from '@/utils/constant/LogoLinks'
import { useT } from '@/lib/i18n'
import { navLinks } from './Navbar'
import Pets from './common/Pets'

export default function Footer() {
  const t = useT()
  const year = new Date().getFullYear()

  return (
    <footer data-ui className="relative z-10 mt-10">
      <Pets />
      <div className="border-t border-line/20 bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 md:grid-cols-12 md:px-8">
          <div className="md:col-span-6">
            <Link href="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold text-ink">
              <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-line/25 bg-white"><Image src="/logo.png" alt="Logo Rizky" width={40} height={40} className="h-full w-full object-contain p-0.5" /></span>
              Rizky Mustafa Afrino
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{t('foot.tag')}</p>
          </div>

          <nav aria-label={t('foot.nav')} className="md:col-span-3">
            <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-muted">
              {t('foot.nav')}
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm font-semibold">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ink transition-colors hover:text-accent">
                    {t(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-muted">
              {t('foot.social')}
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm font-semibold">
              {logoLinks.map((l) => {
                const Icon = l.icon
                return (
                  <li key={l.name}>
                    <a
                      href={l.href}
                      target={l.href.startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-ink transition-colors hover:text-accent"
                    >
                      <span className="text-lg [&_svg]:!h-5 [&_svg]:!w-5">
                        <Icon />
                      </span>
                      {l.name}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="border-t border-line/15">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-muted md:flex-row md:items-center md:justify-between md:px-8">
            <p>
              © {year} Rizky Mustafa Afrino. {t('foot.rights')}
            </p>
            <p>{t('foot.built')}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
