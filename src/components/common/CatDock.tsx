'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { feedCat, kickBall, setFollow, setLaser, useCatUi } from '@/lib/cat'
import { useT, type TKey } from '@/lib/i18n'
import { useMochi } from '@/lib/mochi'
import { useSettings } from '@/lib/settings'
import { cn } from '@/utils/styles/cn'

/**
 * Dock kecil untuk bermain dengan kucing di ruangan 3D.
 * Tetap terlihat di semua halaman; di HP berupa tombol ikon.
 */
export default function CatDock() {
  const t = useT()
  const { quality } = useSettings()
  const ui = useCatUi()
  const { name } = useMochi()
  const pathname = usePathname()
  const [open, setOpen] = useState(true)

  // halaman Mochi punya kontrol sendiri; dock disembunyikan di sana
  if (quality === 'off' || pathname.startsWith('/mochi')) return null

  const status = t(`cat.s.${ui.activity}` as TKey)

  const Btn = ({
    label,
    icon,
    active,
    disabled,
    onClick,
  }: {
    label: string
    icon: string
    active?: boolean
    disabled?: boolean
    onClick: () => void
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      title={label}
      className={cn(
        'flex items-center gap-1.5 rounded-full border border-line/30 px-3 py-2 text-sm font-bold transition-colors',
        'disabled:opacity-40',
        active ? 'bg-accent text-white' : 'bg-card text-ink hover:bg-sun',
      )}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  )

  return (
    <div
      data-ui
      className="pointer-events-none fixed inset-x-0 bottom-3 z-30 flex justify-center px-3 md:bottom-5"
    >
      <div className="pointer-events-auto max-w-full">
        <AnimatePresence initial={false} mode="wait">
          {open ? (
            <motion.div
              key="open"
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2 rounded-full border border-line/25 bg-card/85 p-1.5 pl-3 shadow-soft backdrop-blur-xl"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Hide"
                className="flex min-w-0 items-center gap-2 text-left"
              >
                <span className="text-xl">🐱</span>
                <span className="hidden min-w-0 leading-tight md:block">
                  <span className="block text-xs font-bold text-ink">{name}</span>
                  <span className="block max-w-[11rem] truncate text-[11px] text-muted">{status}</span>
                </span>
              </button>
              <Btn label={t('cat.laser')} icon="🔴" active={ui.laser} onClick={() => setLaser(!ui.laser)} />
              <Btn label={t('cat.yarn')} icon="🧶" onClick={() => kickBall()} />
              <Btn label={t('cat.feed')} icon="🐟" disabled={ui.food} onClick={feedCat} />
              <Btn label={t('cat.follow')} icon="🎥" active={ui.follow} onClick={() => setFollow(!ui.follow)} />
            </motion.div>
          ) : (
            <motion.button
              key="closed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setOpen(true)}
              aria-label={t('cat.open')}
              className="flex items-center gap-2 rounded-full border border-line/25 bg-card/90 px-4 py-2.5 text-sm font-bold text-ink shadow-soft backdrop-blur-xl"
            >
              <span className="text-xl">🐱</span>
              <span className="hidden sm:inline">{t('cat.open')}</span>
            </motion.button>
          )}
        </AnimatePresence>

        {open && (
          <p className="mt-1.5 hidden text-center text-[11px] text-ink/70 md:block" aria-live="polite">
            {ui.laser ? t('cat.laserHint') : t('cat.hint')}
          </p>
        )}
      </div>
    </div>
  )
}
