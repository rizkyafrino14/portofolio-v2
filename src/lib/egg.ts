'use client'

import { useSyncExternalStore } from 'react'

// Store kecil yang dipakai bersama oleh scene 3D (telur) dan overlay HTML.
export const CRACKS_TO_HATCH = 10

let cracks = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const getCracks = () => cracks
export const crackEgg = () => {
  if (cracks >= CRACKS_TO_HATCH) return cracks
  cracks += 1
  emit()
  return cracks
}
export const resetEgg = () => {
  cracks = 0
  emit()
}

export function useCracks() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => cracks,
    () => 0,
  )
}
