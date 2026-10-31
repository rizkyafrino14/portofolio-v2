'use client'

import { useSyncExternalStore } from 'react'

// Penghubung kecil antara halaman (HTML) dan scene 3D:
// mis. mengarahkan kursor ke kartu proyek → monitor menampilkan proyek itu.
interface Link {
  project: string | null // nama file gambar proyek yang sedang di-hover
  cert: number | null // indeks sertifikat yang di-hover
  phone: boolean // true saat form kontak aktif
}

let state: Link = { project: null, cert: null, phone: false }
const listeners = new Set<() => void>()

export const getLink = () => state
export function setLink(p: Partial<Link>) {
  state = { ...state, ...p }
  listeners.forEach((l) => l())
}

export function useSceneLink(): Link {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => state,
    () => state,
  )
}
