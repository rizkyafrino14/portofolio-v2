'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useSettings } from '@/lib/settings'
import type { RouteKey } from './Scene'

// Three.js menyentuh API browser saat import, jadi hanya dimuat di client.
const Scene = dynamic(() => import('./Scene'), { ssr: false, loading: () => null })

const ROUTES: RouteKey[] = ['/about', '/education', '/project', '/resume', '/contact', '/mochi']

function toRoute(pathname: string): RouteKey {
  return ROUTES.find((r) => pathname.startsWith(r)) ?? '/'
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Latar 3D persisten. Gradien langit CSS selalu ada (juga sebagai fallback
 * bila WebGL tidak tersedia / kualitas "Off"); canvas ditumpuk di atasnya.
 */
export default function SceneLayer() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const { quality } = useSettings()
  const [webgl, setWebgl] = useState(false)

  useEffect(() => setWebgl(hasWebGL()), [])

  const show = webgl && quality !== 'off'

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      {show && (
        <Scene
          dark={resolvedTheme === 'dark'}
          route={toRoute(pathname)}
          quality={quality === 'low' ? 'low' : 'high'}
          onToggleTheme={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        />
      )}
    </div>
  )
}
