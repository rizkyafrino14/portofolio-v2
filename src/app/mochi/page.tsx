'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TextSection from '@/components/common/TextSection'
import { catCtl, feedCat, kickBall, resetCam, rotateCam, setLaser, useCatUi, zoomCam } from '@/lib/cat'
import { ACHIEVEMENTS, mochiEvent, moodOf, renameMochi, tickMochi, useMochi, type LogItem, type MoodKey } from '@/lib/mochi'
import { useT, type TKey } from '@/lib/i18n'
import { cn } from '@/utils/styles/cn'

const MOOD_EMOJI: Record<MoodKey, string> = {
  hungry: '🍽️',
  sleepy: '😴',
  bored: '🥱',
  happy: '😻',
  chill: '😺',
}

function Meter({ label, value, icon, tone }: { label: string; value: number; icon: string; tone: string }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-bold text-ink">
        <span>
          {icon} {label}
        </span>
        <span className="tabular-nums text-muted">{Math.round(v)}%</span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-card2"
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(v)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className={cn('h-full rounded-full', tone, v < 25 && 'animate-pulse')}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  )
}

function ActionBtn({
  icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: string
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        'flex items-center gap-2 rounded-2xl border border-line/30 px-3 py-2.5 text-left text-sm font-bold transition-all',
        'hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-45 disabled:hover:translate-y-0',
        active ? 'bg-accent text-white' : 'bg-card text-ink hover:bg-sun',
      )}
    >
      <span className="text-xl leading-none">{icon}</span>
      <span className="leading-tight">{label}</span>
    </button>
  )
}

function CamBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-line/30 bg-card text-lg font-bold text-ink transition-colors hover:bg-sun"
    >
      {children}
    </button>
  )
}

const hhmm = (t: number) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function MochiPage() {
  const t = useT()
  const m = useMochi()
  const ui = useCatUi()
  const mood = moodOf(m)

  // kebutuhan Mochi berubah seiring waktu selama halaman terbuka
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') tickMochi(1)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // nama yang sedang diketik
  const [draft, setDraft] = useState(m.name)
  const editing = useRef(false)
  useEffect(() => {
    if (!editing.current) setDraft(m.name)
  }, [m.name])

  // toast pencapaian
  const [toast, setToast] = useState<{ id: string; at: number } | null>(null)
  const lastToast = useRef(0)
  useEffect(() => {
    if (m.toast && m.toast.at !== lastToast.current) {
      lastToast.current = m.toast.at
      setToast(m.toast)
      const id = setTimeout(() => setToast(null), 4200)
      return () => clearTimeout(id)
    }
  }, [m.toast])

  const logText = (l: LogItem) => {
    if (l.key === 'rename') return `${t('mochi.log.rename')} ${l.extra ?? ''}`
    if (l.key === 'ach') return `${t('mochi.log.ach')}: ${t(`ach.${l.extra}` as TKey)}`
    return t(`mochi.log.${l.key}` as TKey)
  }

  return (
    <div>
      <TextSection level={1} icon="🐱" text={t('mochi.title')} eyebrow={`🐾 ${t('mochi.eyebrow')}`} />
      <p className="mt-3 max-w-xl rounded-2xl bg-card/70 px-4 py-2 text-sm text-muted backdrop-blur-xl">{t('mochi.sub')}</p>

      {/* sisakan ruang di atas (HP) / di tengah (desktop) agar Mochi terlihat */}
      <div className="mt-6 grid gap-5 pt-[26svh] lg:grid-cols-[21rem_1fr_21rem] lg:pt-0">
        {/* KIRI: profil + aksi */}
        <div className="flex flex-col gap-5">
          <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="panel flex flex-col gap-4 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sun text-3xl text-black">{MOOD_EMOJI[mood]}</span>
              <div className="min-w-0 flex-1">
                <label className="sr-only" htmlFor="mochi-name">
                  {t('mochi.rename')}
                </label>
                <input
                  id="mochi-name"
                  value={draft}
                  maxLength={14}
                  placeholder={t('mochi.renamePh')}
                  onFocus={() => (editing.current = true)}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => {
                    editing.current = false
                    renameMochi(draft)
                    setDraft(draft.trim() || m.name)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                  className="w-full rounded-xl bg-transparent font-display text-2xl font-bold text-ink outline-none ring-0 focus:bg-card2"
                />
                <p className="truncate text-xs text-muted">
                  <b className="text-ink">{t(`mochi.mood.${mood}` as TKey)}</b> · {t(`cat.s.${ui.activity}` as TKey)}
                </p>
              </div>
            </div>

            <Meter label={t('mochi.need.hunger')} value={m.hunger} icon="🍗" tone="bg-accent" />
            <Meter label={t('mochi.need.energy')} value={m.energy} icon="⚡" tone="bg-sun" />
            <Meter label={t('mochi.need.happy')} value={m.happy} icon="💗" tone="bg-berry" />
          </motion.section>

          <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }} className="panel p-5">
            <h2 className="mb-3 font-sans text-xs font-bold uppercase tracking-wider text-muted">{t('mochi.actions')}</h2>
            <div className="grid grid-cols-2 gap-2">
              <ActionBtn icon="🐟" label={t('mochi.a.feed')} disabled={ui.food} onClick={feedCat} />
              <ActionBtn icon="🔴" label={ui.laser ? t('mochi.a.laserOff') : t('mochi.a.laser')} active={ui.laser} onClick={() => setLaser(!ui.laser)} />
              <ActionBtn icon="🧶" label={t('mochi.a.yarn')} onClick={() => kickBall()} />
              <ActionBtn
                icon="👋"
                label={t('mochi.a.call')}
                onClick={() => {
                  catCtl.comeHere = true
                  mochiEvent('call')
                }}
              />
              <ActionBtn
                icon="🛏️"
                label={t('mochi.a.nap')}
                onClick={() => {
                  catCtl.nap = true
                  mochiEvent('nap')
                }}
              />
              <ActionBtn icon="📸" label={t('mochi.a.photo')} onClick={() => (catCtl.photo = true)} />
            </div>
            <p className="mt-3 text-xs text-muted">{t('mochi.tip')}</p>
          </motion.section>
        </div>

        {/* TENGAH: dibiarkan kosong agar scene 3D terlihat */}
        <div className="hidden lg:block" aria-hidden />

        {/* KANAN: statistik, pencapaian, log */}
        <div className="flex flex-col gap-5">
          <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="panel p-5">
            <h2 className="mb-3 font-sans text-xs font-bold uppercase tracking-wider text-muted">{t('mochi.stats')}</h2>
            <div className="grid grid-cols-3 gap-2 text-center">
              {(
                [
                  ['🖐️', m.counts.pet, 'mochi.stat.pet'],
                  ['🐟', m.counts.fed, 'mochi.stat.fed'],
                  ['📸', m.counts.photo, 'mochi.stat.photo'],
                ] as const
              ).map(([icon, n, key]) => (
                <div key={key} className="rounded-2xl bg-card2 py-2">
                  <p className="text-lg">{icon}</p>
                  <p className="font-display text-2xl font-bold text-ink">{n}</p>
                  <p className="text-[11px] text-muted">{t(key)}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }} className="panel p-5">
            <h2 className="mb-3 font-sans text-xs font-bold uppercase tracking-wider text-muted">
              {t('mochi.achievements')} · {m.unlocked.length}/{ACHIEVEMENTS.length}
            </h2>
            <ul className="grid grid-cols-2 gap-2">
              {ACHIEVEMENTS.map((a) => {
                const got = m.unlocked.includes(a.id)
                return (
                  <li
                    key={a.id}
                    title={t(`ach.${a.id}.d` as TKey)}
                    className={cn(
                      'flex items-center gap-2 rounded-2xl border px-2.5 py-2 text-xs font-bold',
                      got ? 'border-line/30 bg-sun/50 text-ink' : 'border-transparent bg-card2 text-muted opacity-60',
                    )}
                  >
                    <span className={cn('text-lg leading-none', !got && 'grayscale')}>{got ? a.icon : '🔒'}</span>
                    <span className="leading-tight">{t(`ach.${a.id}` as TKey)}</span>
                  </li>
                )
              })}
            </ul>
          </motion.section>

          <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.16 }} className="panel p-5">
            <h2 className="mb-3 font-sans text-xs font-bold uppercase tracking-wider text-muted">{t('mochi.log')}</h2>
            {m.log.length === 0 ? (
              <p className="text-sm text-muted">{t('mochi.logEmpty')}</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-sm">
                {m.log.slice(0, 6).map((l, i) => (
                  <li key={`${l.t}-${i}`} className="flex gap-2 text-ink">
                    <span className="shrink-0 tabular-nums text-muted">{hhmm(l.t)}</span>
                    <span>{logText(l)}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.section>
        </div>
      </div>

      {/* kontrol kamera */}
      <div data-ui className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-3">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-line/25 bg-card/85 p-1.5 shadow-soft backdrop-blur-xl">
          <span className="hidden pl-3 pr-1 text-xs font-bold text-muted sm:inline">🎥 {t('mochi.camera')}</span>
          <CamBtn label={t('mochi.cam.left')} onClick={() => rotateCam(-0.45)}>
            ◀
          </CamBtn>
          <CamBtn label={t('mochi.cam.right')} onClick={() => rotateCam(0.45)}>
            ▶
          </CamBtn>
          <CamBtn label={t('mochi.cam.in')} onClick={() => zoomCam(-0.35)}>
            +
          </CamBtn>
          <CamBtn label={t('mochi.cam.out')} onClick={() => zoomCam(0.35)}>
            −
          </CamBtn>
          <CamBtn label={t('mochi.cam.reset')} onClick={resetCam}>
            ⟲
          </CamBtn>
        </div>
      </div>

      {/* toast pencapaian */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.at}
            role="status"
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            className="pointer-events-none fixed left-1/2 top-24 z-40 flex -translate-x-1/2 items-center gap-3 rounded-2xl border-2 border-ink bg-card px-5 py-3 shadow-pop"
          >
            <span className="text-2xl">{ACHIEVEMENTS.find((a) => a.id === toast.id)?.icon}</span>
            <span>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-accent">{t('mochi.unlocked')}</span>
              <span className="block text-sm font-bold text-ink">{t(`ach.${toast.id}` as TKey)}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
