'use client'

import { getSettings } from './settings'

// Suara kucing disintesis dengan Web Audio sehingga tidak butuh file audio.
let ctx: AudioContext | null = null

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || (window as any).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  if (ctx!.state === 'suspended') ctx!.resume().catch(() => {})
  return ctx
}

export function meow(pitch = 1) {
  const s = getSettings()
  if (!s.sfx) return
  const c = ac()
  if (!c) return
  const t = c.currentTime
  const dur = 0.55

  const osc = c.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(520 * pitch, t)
  osc.frequency.linearRampToValueAtTime(840 * pitch, t + 0.18)
  osc.frequency.exponentialRampToValueAtTime(430 * pitch, t + dur)

  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 3
  filter.frequency.setValueAtTime(900, t)
  filter.frequency.linearRampToValueAtTime(1700, t + 0.2)
  filter.frequency.linearRampToValueAtTime(800, t + dur)

  const gain = c.createGain()
  const peak = Math.max(0.0002, 0.45 * s.sfxVolume)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.06)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)

  osc.connect(filter).connect(gain).connect(c.destination)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

export function purr(seconds = 1.6) {
  const s = getSettings()
  if (!s.sfx) return
  const c = ac()
  if (!c) return
  const t = c.currentTime

  const osc = c.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.value = 26

  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 220

  const gain = c.createGain()
  const peak = Math.max(0.0002, 0.35 * s.sfxVolume)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.linearRampToValueAtTime(peak, t + 0.3)
  gain.gain.linearRampToValueAtTime(0.0001, t + seconds)

  osc.connect(lp).connect(gain).connect(c.destination)
  osc.start(t)
  osc.stop(t + seconds + 0.05)
}
