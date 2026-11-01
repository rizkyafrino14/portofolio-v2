'use client'

import { useSyncExternalStore } from 'react'

// Kondisi Mochi (kenyang, energi, bahagia), statistik, dan pencapaian.
// Tersimpan di localStorage; saat pengunjung kembali, kebutuhan Mochi sudah
// berubah sesuai lamanya ia pergi.

export type MoodKey = 'hungry' | 'sleepy' | 'bored' | 'happy' | 'chill'

export interface Counts {
  pet: number
  fed: number
  bat: number
  photo: number
  laserSec: number
  sleepSec: number
  renamed: number
}

export interface LogItem {
  t: number
  key: 'pet' | 'fed' | 'photo' | 'rename' | 'call' | 'nap' | 'bat' | 'ach'
  extra?: string
}

export interface MochiState {
  name: string
  hunger: number // 100 = kenyang
  energy: number
  happy: number
  counts: Counts
  unlocked: string[]
  log: LogItem[]
  updated: number
  toast: { id: string; at: number } | null
}

export const DEFAULT_NAME = 'Mochi'
const KEY = 'mochi-v1'

export const ACHIEVEMENTS: { id: string; icon: string; test: (s: MochiState) => boolean }[] = [
  { id: 'first_pet', icon: '🖐️', test: (s) => s.counts.pet >= 1 },
  { id: 'pet10', icon: '💞', test: (s) => s.counts.pet >= 10 },
  { id: 'fed', icon: '🐟', test: (s) => s.counts.fed >= 1 },
  { id: 'feed5', icon: '👨‍🍳', test: (s) => s.counts.fed >= 5 },
  { id: 'yarn', icon: '🧶', test: (s) => s.counts.bat >= 8 },
  { id: 'laser', icon: '🔴', test: (s) => s.counts.laserSec >= 30 },
  { id: 'nap', icon: '😴', test: (s) => s.counts.sleepSec >= 60 },
  { id: 'photo', icon: '📸', test: (s) => s.counts.photo >= 1 },
  { id: 'rename', icon: '✏️', test: (s) => s.counts.renamed >= 1 },
  { id: 'bestie', icon: '🏆', test: (s) => s.happy >= 95 },
]

const fresh = (): MochiState => ({
  name: DEFAULT_NAME,
  hunger: 70,
  energy: 80,
  happy: 60,
  counts: { pet: 0, fed: 0, bat: 0, photo: 0, laserSec: 0, sleepSec: 0, renamed: 0 },
  unlocked: [],
  log: [],
  updated: Date.now(),
  toast: null,
})

let state: MochiState = fresh()
let hydrated = false
let lastSave = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

const clamp = (v: number) => Math.max(0, Math.min(100, v))

function save(force = false) {
  const now = Date.now()
  if (!force && now - lastSave < 4000) return
  lastSave = now
  try {
    const { toast: _t, ...persist } = state
    localStorage.setItem(KEY, JSON.stringify({ ...persist, updated: now }))
  } catch {}
}

function checkAchievements(next: MochiState): MochiState {
  let out = next
  for (const a of ACHIEVEMENTS) {
    if (!out.unlocked.includes(a.id) && a.test(out)) {
      out = {
        ...out,
        unlocked: [...out.unlocked, a.id],
        toast: { id: a.id, at: Date.now() },
        log: [{ t: Date.now(), key: 'ach' as const, extra: a.id }, ...out.log].slice(0, 12),
      }
    }
  }
  return out
}

function set(patch: Partial<MochiState> | ((s: MochiState) => Partial<MochiState>), force = false) {
  const p = typeof patch === 'function' ? patch(state) : patch
  state = checkAchievements({ ...state, ...p })
  save(force)
  emit()
}

const pushLog = (s: MochiState, item: Omit<LogItem, 't'>) => [{ ...item, t: Date.now() }, ...s.log].slice(0, 12)

/** Dipanggil sekali setelah mount (server & client render awal harus sama). */
export function hydrateMochi() {
  if (hydrated) return
  hydrated = true
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const stored = JSON.parse(raw) as MochiState
      const base = fresh()
      const mins = Math.min(240, Math.max(0, (Date.now() - (stored.updated || Date.now())) / 60000))
      state = {
        ...base,
        ...stored,
        counts: { ...base.counts, ...stored.counts },
        // selama pengunjung pergi: Mochi lapar & agak kesepian, tapi cukup tidur
        hunger: clamp(Math.max(15, (stored.hunger ?? base.hunger) - mins * 0.5)),
        happy: clamp(Math.max(20, (stored.happy ?? base.happy) - mins * 0.25)),
        energy: clamp((stored.energy ?? base.energy) + mins * 0.6),
        toast: null,
      }
    }
  } catch {}
  emit()
}

/** Dipanggil tiap detik saat halaman Mochi terbuka. */
export function tickMochi(dt = 1) {
  set((s) => ({
    hunger: clamp(s.hunger - dt / 30),
    happy: clamp(s.happy - dt / 60),
    energy: clamp(s.energy - dt / 45),
  }))
}

export type MochiEventKind = 'pet' | 'fed' | 'bat' | 'photo' | 'call' | 'nap'

export function mochiEvent(kind: MochiEventKind) {
  set((s) => {
    const c = { ...s.counts }
    switch (kind) {
      case 'pet':
        c.pet++
        return { counts: c, happy: clamp(s.happy + 6), log: pushLog(s, { key: 'pet' }) }
      case 'fed':
        c.fed++
        return { counts: c, hunger: clamp(s.hunger + 45), happy: clamp(s.happy + 4), log: pushLog(s, { key: 'fed' }) }
      case 'bat':
        c.bat++
        return { counts: c, happy: clamp(s.happy + 0.8), log: c.bat % 5 === 1 ? pushLog(s, { key: 'bat' }) : s.log }
      case 'photo':
        c.photo++
        return { counts: c, happy: clamp(s.happy + 3), log: pushLog(s, { key: 'photo' }) }
      case 'call':
        return { log: pushLog(s, { key: 'call' }) }
      case 'nap':
        return { log: pushLog(s, { key: 'nap' }) }
    }
  })
}

/** Waktu yang dihabiskan untuk suatu aktivitas (detik). */
export function mochiTime(kind: 'sleep' | 'laser', dt: number) {
  set((s) => {
    const c = { ...s.counts }
    if (kind === 'sleep') {
      c.sleepSec += dt
      return { counts: c, energy: clamp(s.energy + dt * 1.6) }
    }
    c.laserSec += dt
    return { counts: c, happy: clamp(s.happy + dt * 0.4), energy: clamp(s.energy - dt * 0.2) }
  })
}

export function renameMochi(raw: string) {
  const name = raw.trim().slice(0, 14) || DEFAULT_NAME
  if (name === state.name) return
  set(
    (s) => ({
      name,
      counts: { ...s.counts, renamed: s.counts.renamed + 1 },
      log: pushLog(s, { key: 'rename', extra: name }),
    }),
    true,
  )
}

export const getMochi = () => state

export function moodOf(s: MochiState): MoodKey {
  if (s.hunger < 25) return 'hungry'
  if (s.energy < 25) return 'sleepy'
  if (s.happy < 35) return 'bored'
  if (s.happy > 75) return 'happy'
  return 'chill'
}

export function useMochi(): MochiState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => state,
    () => state,
  )
}
