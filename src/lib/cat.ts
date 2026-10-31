'use client'

import { useSyncExternalStore } from 'react'

export type CatActivity =
  | 'sleep'
  | 'sit'
  | 'groom'
  | 'walk'
  | 'eat'
  | 'play'
  | 'pet'
  | 'chase'
  | 'stretch'
  | 'watch'

export const CAT_NAME = 'Mochi'

/* --- state reaktif (dipakai UI) ------------------------------------ */
interface CatUi {
  laser: boolean
  food: boolean
  follow: boolean
  activity: CatActivity
}

let ui: CatUi = { laser: false, food: false, follow: false, activity: 'sit' }
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const getCatUi = () => ui
export function patchCatUi(p: Partial<CatUi>) {
  const next = { ...ui, ...p }
  if (next.laser === ui.laser && next.food === ui.food && next.follow === ui.follow && next.activity === ui.activity) return
  ui = next
  emit()
}

export function useCatUi(): CatUi {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => ui,
    () => ui,
  )
}

/* --- kontrol & dunia mutable (dipakai scene tiap frame) ------------- */
export const catCtl = {
  /** Titik di lantai yang "dipanggil" oleh pengunjung. */
  call: null as null | { x: number; z: number },
  /** Dorongan ke bola benang yang belum diproses kucing. */
  kick: 0,
}

export const ball = { x: 0.9, z: -0.4, vx: 0, vz: 0 }
export const dot = { x: 0, z: 0, valid: false }

export function kickBall(dirX?: number, dirZ?: number) {
  const a = Math.random() * Math.PI * 2
  const x = dirX ?? Math.cos(a)
  const z = dirZ ?? Math.sin(a)
  const len = Math.hypot(x, z) || 1
  const sp = 2.4 + Math.random() * 0.8
  ball.vx = (x / len) * sp
  ball.vz = (z / len) * sp
  catCtl.kick++
}

export const setLaser = (laser: boolean) => patchCatUi({ laser })
export const feedCat = () => patchCatUi({ food: true })

/** Posisi kucing saat ini (ditulis oleh Cat tiap frame, dibaca kamera). */
export const catPos = { x: 0, y: 0, z: 0, yaw: 0 }
export const setFollow = (follow: boolean) => patchCatUi({ follow })
