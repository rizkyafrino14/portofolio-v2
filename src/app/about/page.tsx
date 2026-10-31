'use client'

import TextSection from '@/components/common/TextSection'
import { twMerge } from 'tailwind-merge'
import { techIcons } from '@/utils/constant/TechIcons'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import ExperienceTimeline from '@/components/common/ExperienceTimelime'
import { experience } from '@/utils/constant/Experience'
import { useState, useEffect } from 'react'
import { useT, rich } from '@/lib/i18n'
import { playSfx } from '@/lib/settings'

// ✏️ Edit persentase skill di sini
const skillProficiency: Record<string, number> = {
  JavaScript: 90,
  Bootstrap: 90,
  Tailwinds: 85,
  TypeScript: 82,
  React: 80,
  NextJS: 75,
  Laravel: 50,
  Php: 20,
  MySQL: 20,
}

const level = (pct: number) =>
  pct >= 80
    ? { k: 'high', cls: 'bg-leaf/40 text-ink', bar: 'rgb(var(--leaf))' }
    : pct >= 60
    ? { k: 'mid', cls: 'bg-sun/50 text-ink', bar: 'rgb(var(--sun))' }
    : { k: 'low', cls: 'bg-accent/25 text-ink', bar: 'rgb(var(--accent))' }

const SOUND_URL = '/sounds/mario.mp3'

type SelectedTech = { name: string; pct: number } | null

export default function About() {
  const t = useT()
  const [selected, setSelected] = useState<SelectedTech>(null)

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  const pick = (name: string, pct: number) => {
    playSfx(SOUND_URL, 0.8)
    setSelected({ name, pct })
  }

  const SelectedIcon = selected && techIcons.find((x) => x.name === selected.name)?.icons
  const lvl = selected ? level(selected.pct) : null

  return (
    <section>
      <TextSection icon="😎" text={t('about.title')} eyebrow={`🦊 ${t('about.eyebrow')}`} />

      {/* Bio */}
      <div className="mt-8 grid gap-5 md:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, rotate: -3 }}
          whileInView={{ opacity: 1, rotate: -2 }}
          viewport={{ once: true }}
          className="relative mx-auto aspect-square w-64 overflow-hidden rounded-[2rem] border-2 border-ink bg-sun shadow-pop md:col-span-4 md:w-full"
        >
          <Image src="/me.png" alt="Rizky" width={800} height={800} className="h-full w-full object-cover" />
          <span className="sticker absolute bottom-3 left-3">☕ {t('about.coffee')}</span>
        </motion.div>

        <div className="panel flex flex-col justify-center gap-4 p-6 md:col-span-8 md:p-8">
          <p className="text-base leading-relaxed text-muted md:text-lg">{rich(t('about.p1'))}</p>
          <p className="text-base leading-relaxed text-muted md:text-lg">{rich(t('about.p2'))}</p>
        </div>
      </div>

      {/* Experience */}
      <TextSection icon="💼" text={t('about.experience')} classNames="mt-20" />
      <ol className="relative mt-8 flex flex-col gap-5 before:absolute before:bottom-4 before:left-[17px] before:top-4 before:w-0.5 before:bg-line/30 md:before:left-[21px]">
        {experience.map((data, i) => (
          <ExperienceTimeline key={i} {...data} />
        ))}
      </ol>

      {/* Tech Stack */}
      <TextSection icon="🎯" text={t('about.stack')} classNames="mt-20" />
      <p className="mt-3 text-sm text-muted">{t('about.stackHint')} 🔊</p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {techIcons.map((data, index) => {
          const Icons = data.icons
          const pct = skillProficiency[data.name]
          const clickable = pct !== undefined
          return (
            <motion.button
              key={data.name}
              type="button"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              whileHover={clickable ? { y: -4, rotate: index % 2 ? 1.5 : -1.5 } : undefined}
              onClick={() => clickable && pick(data.name, pct)}
              className={twMerge(
                'panel flex flex-col items-center justify-center gap-3 p-6',
                clickable ? 'cursor-pointer hover:border-ink' : 'cursor-default',
              )}
            >
              <Icons className="text-5xl text-ink md:text-6xl" />
              <span className="font-bold text-ink">{data.name}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && lvl && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            data-ui
            className="fixed inset-0 z-[9998] grid place-items-center bg-black/55 p-4 backdrop-blur-sm"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={selected.name}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs rounded-3xl border-2 border-ink bg-card p-6 shadow-pop"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {SelectedIcon && <SelectedIcon className="text-3xl text-ink" />}
                  <h2 className="font-display text-2xl font-bold text-ink">{selected.name}</h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-full border-2 border-ink text-sm font-bold text-ink hover:bg-sun"
                >
                  ✕
                </button>
              </div>

              <p className="mb-3 text-center font-display text-6xl font-bold text-ink">{selected.pct}%</p>

              <div className="mb-4 h-4 w-full overflow-hidden rounded-full border-2 border-ink bg-card2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${selected.pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ backgroundColor: lvl.bar, height: '100%' }}
                />
              </div>

              <div className="flex justify-center">
                <span className={twMerge('rounded-full px-4 py-1 text-sm font-bold', lvl.cls)}>
                  {t(`about.lvl.${lvl.k}` as 'about.lvl.high')}
                </span>
              </div>
              <p className="mt-3 text-center text-xs text-muted">
                {t(`about.lvl.${lvl.k}.d` as 'about.lvl.high.d')}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
