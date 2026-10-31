'use client'

import { useSyncExternalStore } from 'react'

export type Lang = 'id' | 'en'
export type Quality = 'high' | 'low' | 'off'

export interface Settings {
  lang: Lang
  sfx: boolean
  sfxVolume: number // 0..1
  music: boolean
  musicVolume: number // 0..1
  pets: boolean
  quality: Quality // kualitas scene 3D
}

const KEY = 'portfolio-settings-v1'

const defaults: Settings = {
  lang: 'id',
  sfx: true,
  sfxVolume: 0.6,
  music: false, // musik tidak pernah auto-nyala (browser memblokir autoplay)
  musicVolume: 0.15,
  pets: true,
  quality: 'high',
}

let state: Settings = defaults
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

export const getSettings = () => state

export function setSettings(patch: Partial<Settings>) {
  state = { ...state, ...patch }
  try {
    const { music: _m, ...persist } = state
    localStorage.setItem(KEY, JSON.stringify(persist))
  } catch {}
  emit()
}

/** Dipanggil sekali setelah mount agar server & client render awal sama. */
export function hydrateSettings() {
  let stored: Partial<Settings> = {}
  try {
    stored = JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {}

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const browserLang: Lang =
    typeof navigator !== 'undefined' && navigator.language?.startsWith('id')
      ? 'id'
      : 'en'

  const nav = navigator as Navigator & { deviceMemory?: number }
  const weak =
    window.innerWidth < 768 ||
    (nav.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4

  state = {
    ...defaults,
    lang: browserLang,
    quality: reduced ? 'off' : weak ? 'low' : defaults.quality,
    ...stored,
    music: false,
  }
  emit()
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => state,
    () => defaults,
  )
}

/** Efek suara; otomatis menghormati pengaturan SFX. */
export function playSfx(src: string, volume = 1) {
  if (typeof window === 'undefined' || !state.sfx) return
  const audio = new Audio(src)
  audio.volume = Math.min(1, volume * state.sfxVolume)
  audio.play().catch(() => {})
}
