'use client'

import { TypeAnimation } from 'react-type-animation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

import ScrambleText from '@/components/common/ScrambleText'
import { projects } from '@/utils/constant/Projects'
import { techIcons } from '@/utils/constant/TechIcons'
import { CRACKS_TO_HATCH, useCracks } from '@/lib/egg'
import { useT } from '@/lib/i18n'
import { useSettings } from '@/lib/settings'
import { cn } from '@/utils/styles/cn'

export default function Home() {
  const t = useT()
  const { lang } = useSettings()
  const cracks = useCracks()
  const hatched = cracks >= CRACKS_TO_HATCH

  const roles = t('home.roles').split('|')
  const sequence = roles.flatMap((r) => [r, 4000])

  return (
    <div>
      {/* HERO — wrapper tembus klik supaya telur 3D di belakang bisa diketuk */}
      <section className="pointer-events-none relative flex min-h-[calc(100svh-8rem)] flex-col justify-end pb-24 pt-[30svh] lg:justify-center lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className={cn(
            // alas kaca supaya teks selalu terbaca di atas scene 3D
            'pointer-events-auto flex max-w-xl flex-col gap-4 rounded-3xl border border-line/20 bg-card/75 p-5 shadow-soft backdrop-blur-xl md:gap-5 md:p-8',
          )}
        >
          <span className="sticker w-fit">📍 {t('home.location')}</span>

          <div>
            <p className="mb-1 flex items-center gap-2 text-lg font-semibold text-muted md:text-xl">
              {t('home.hi')}
              <Image src="/wave.gif" alt="" width={28} height={28} unoptimized className="h-7 w-7" />
            </p>
            <ScrambleText>Rizky Mustafa Afrino</ScrambleText>
          </div>

          <p className="font-display text-2xl font-semibold text-ink md:text-3xl">
            {t('home.a')}{' '}
            <TypeAnimation
              key={lang}
              sequence={sequence}
              wrapper="span"
              speed={40}
              cursor
              repeat={Infinity}
              className="italic text-accent"
            />
          </p>

          <p className="text-base leading-relaxed text-muted md:text-lg">{t('home.intro')}</p>

          <div className="flex flex-wrap gap-3">
            <Link href="/project" className="btn-primary">
              {t('home.cta.projects')} →
            </Link>
            <Link href="/about" className="btn-ghost">
              {t('home.cta.about')}
            </Link>
          </div>
        </motion.div>

      </section>

      {hatched && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          role="status"
          className="pointer-events-none fixed left-1/2 top-24 z-30 -translate-x-1/2 rounded-full border-2 border-ink bg-card px-5 py-2.5 text-sm font-bold text-ink shadow-pop"
        >
          {t('home.egg.hatched')}
        </motion.div>
      )}

      {/* TILES */}
      <section className="grid gap-4 md:grid-cols-12 md:gap-5">
        <Tile className="md:col-span-4" href="/project">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('home.built')}</p>
          <p className="font-display text-6xl font-bold text-ink">
            {projects.length}
            <span className="text-accent">+</span>
          </p>
          <p className="text-muted">{t('home.builtSub')} 🐢</p>
        </Tile>

        <Tile className="md:col-span-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('home.toolbox')}</p>
          <div className="flex flex-wrap gap-2">
            {techIcons.map(({ name, icons: Icon }) => (
              <span
                key={name}
                className="flex items-center gap-1.5 rounded-full border border-line/30 bg-card2/80 px-3 py-1.5 text-sm font-semibold text-ink"
              >
                <Icon className="text-lg" /> {name}
              </span>
            ))}
          </div>
        </Tile>

        <Tile className="border-ink bg-accent text-white md:col-span-3" href="/contact" accent>
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">{t('home.sayhi')}</p>
          <p className="font-display text-3xl font-bold leading-tight">{t('home.sayhiText')}</p>
          <p className="text-2xl">🦊 →</p>
        </Tile>
      </section>
    </div>
  )
}

function Tile({
  children,
  className,
  href,
  accent,
}: {
  children: React.ReactNode
  className?: string
  href?: string
  accent?: boolean
}) {
  const cls = cn(
    'flex flex-col justify-between gap-4 rounded-3xl p-6 transition-transform',
    accent ? 'border-2' : 'panel',
    href && 'hover:-translate-y-1',
    className,
  )
  const motionProps = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.45 },
  }
  return href ? (
    <motion.div {...motionProps} className="contents">
      <Link href={href} className={cls}>
        {children}
      </Link>
    </motion.div>
  ) : (
    <motion.div {...motionProps} className={cls}>
      {children}
    </motion.div>
  )
}
