'use client'

import { useEffect, useRef } from 'react'
import { hydrateSettings, useSettings } from '@/lib/settings'
import { hydrateMochi } from '@/lib/mochi'

// Sumber musik sama seperti versi sebelumnya.
const MUSIC_URL =
  'https://aac.saavncdn.com/051/1fef3e907319879eda1e3934f2d21ff2_320.mp4'

/** Memuat pengaturan tersimpan & menyinkronkan musik latar dengan pengaturan. */
export default function AudioController() {
  const { music, musicVolume } = useSettings()
  const audio = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    hydrateSettings()
    hydrateMochi()
    return () => {
      audio.current?.pause()
    }
  }, [])

  useEffect(() => {
    if (!audio.current) {
      const a = new Audio(MUSIC_URL)
      a.loop = true
      audio.current = a
    }
    const a = audio.current
    a.volume = musicVolume
    if (music) a.play().catch(() => {})
    else a.pause()
  }, [music, musicVolume])

  return null
}
