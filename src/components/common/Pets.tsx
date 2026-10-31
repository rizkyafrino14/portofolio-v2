'use client'

import Image from 'next/image'
import chicken from '@/Assets/Pets/white_walk_8fps.gif'
import snail from '@/Assets/Pets/brown_walk_8fps.gif'
import whiteDog from '@/Assets/Pets/white_run_8fps.gif'
import brownDog from '@/Assets/Pets/brown_walk_dog_8fps.gif'
import lieFox from '@/Assets/Pets/red_lie_8fps.gif'
import akitaDog from '@/Assets/Pets/akita_swipe_8fps.gif'
import turle from '@/Assets/Pets/green_walk_8fps.gif'
import { useSettings } from '@/lib/settings'

/**
 * Jalur hewan pixel di atas footer. Berada di alur halaman (bukan fixed),
 * tingginya cukup sehingga seluruh GIF terlihat utuh.
 */
export default function Pets() {
  const { pets } = useSettings()
  if (!pets) return null

  const img = 'pointer-events-none select-none [image-rendering:pixelated]'

  return (
    <div
      aria-hidden
      className="relative h-24 w-full overflow-hidden border-b-4 border-leaf/70 bg-gradient-to-t from-leaf/25 to-transparent"
    >
      <div className="absolute bottom-0 w-full animate-walk-chicken">
        <Image src={chicken} unoptimized className={`h-12 w-12 -scale-x-100 animate-flip-chicken ${img}`} alt="" />
      </div>
      <div className="absolute bottom-0 w-full animate-walk-snail">
        <Image src={snail} unoptimized className={`h-14 w-14 -scale-x-100 animate-flip-snail ${img}`} alt="" />
      </div>
      <div className="absolute bottom-0 w-full animate-run-dog">
        <Image src={whiteDog} unoptimized className={`h-14 w-[4.5rem] -scale-x-100 animate-flip-dog-reverse ${img}`} alt="" />
      </div>
      <div className="absolute bottom-0 w-full animate-walk-dog">
        <Image src={brownDog} unoptimized className={`h-12 w-16 -scale-x-100 animate-flip-dog ${img}`} alt="" />
      </div>
      <div className="absolute bottom-0 w-full">
        <Image src={lieFox} unoptimized className={`h-16 w-16 translate-x-[20vw] -scale-x-100 ${img}`} alt="" />
      </div>
      <div className="absolute bottom-0 w-full">
        <Image src={akitaDog} unoptimized className={`h-14 w-[4.5rem] translate-x-[60vw] ${img}`} alt="" />
      </div>
      <div className="absolute bottom-0 w-full animate-walk-turle">
        <Image src={turle} unoptimized className={`h-14 w-[4.5rem] animate-flip-turle ${img}`} alt="" />
      </div>
    </div>
  )
}
