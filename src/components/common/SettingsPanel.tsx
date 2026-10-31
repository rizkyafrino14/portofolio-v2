'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { IoClose } from 'react-icons/io5'
import { setSettings, useSettings, type Quality } from '@/lib/settings'
import { useT } from '@/lib/i18n'
import { cn } from '@/utils/styles/cn'

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-xl bg-card2 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors',
            value === o.value ? 'bg-ink text-paper shadow-sm' : 'text-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-ink">
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border-2 border-ink transition-colors',
          checked ? 'bg-accent' : 'bg-card2',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-ink transition-all',
            checked ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </button>
    </label>
  )
}

function Slider({
  value,
  onChange,
  label,
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  label: string
  disabled?: boolean
}) {
  return (
    <label className={cn('flex items-center gap-3 text-xs font-semibold text-muted', disabled && 'opacity-40')}>
      <span className="w-24 shrink-0">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        disabled={disabled}
        onChange={(e) => onChange(parseInt(e.target.value, 10) / 100)}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full !bg-card2 accent-[rgb(var(--accent))]"
      />
    </label>
  )
}

export default function SettingsPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const t = useT()
  const s = useSettings()
  const { theme, setTheme } = useTheme()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />
          <motion.div
            ref={ref}
            role="dialog"
            aria-label={t('set.title')}
            data-ui
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="fixed right-4 top-20 z-50 max-h-[calc(100svh-6rem)] w-[min(92vw,22rem)] origin-top-right overflow-y-auto rounded-3xl border border-line/30 bg-card/95 p-5 shadow-soft backdrop-blur-xl md:right-8"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ink">{t('set.title')}</h2>
              <button
                onClick={onClose}
                aria-label={t('set.close')}
                className="grid h-8 w-8 place-items-center rounded-full text-ink hover:bg-card2"
              >
                <IoClose />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('set.theme')}</p>
                <Segmented
                  label={t('set.theme')}
                  value={(theme as 'light' | 'dark' | 'system') ?? 'system'}
                  onChange={setTheme}
                  options={[
                    { value: 'light', label: t('set.light') },
                    { value: 'dark', label: t('set.dark') },
                    { value: 'system', label: t('set.system') },
                  ]}
                />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('set.language')}</p>
                <Segmented
                  label={t('set.language')}
                  value={s.lang}
                  onChange={(lang) => setSettings({ lang })}
                  options={[
                    { value: 'id', label: 'Indonesia' },
                    { value: 'en', label: 'English' },
                  ]}
                />
              </div>

              <div className="flex flex-col gap-3">
                <Toggle label={t('set.sfx')} checked={s.sfx} onChange={(sfx) => setSettings({ sfx })} />
                <Slider
                  label={t('set.sfxVol')}
                  value={s.sfxVolume}
                  disabled={!s.sfx}
                  onChange={(sfxVolume) => setSettings({ sfxVolume })}
                />
              </div>

              <div className="flex flex-col gap-3">
                <Toggle label={t('set.music')} checked={s.music} onChange={(music) => setSettings({ music })} />
                <Slider
                  label={t('set.musicVol')}
                  value={s.musicVolume}
                  disabled={!s.music}
                  onChange={(musicVolume) => setSettings({ musicVolume })}
                />
              </div>

              <Toggle label={t('set.pets')} checked={s.pets} onChange={(pets) => setSettings({ pets })} />

              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('set.quality')}</p>
                <Segmented<Quality>
                  label={t('set.quality')}
                  value={s.quality}
                  onChange={(quality) => setSettings({ quality })}
                  options={[
                    { value: 'high', label: t('set.q.high') },
                    { value: 'low', label: t('set.q.low') },
                    { value: 'off', label: t('set.q.off') },
                  ]}
                />
                <p className="text-xs text-muted">{t('set.qHint')}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
