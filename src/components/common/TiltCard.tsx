'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/** Kartu yang miring mengikuti kursor (efek kedalaman 3D). Mati di layar sentuh. */
export default function TiltCard({
  children,
  className,
  max = 7,
  onEnter,
  onLeave,
}: {
  children: React.ReactNode
  className?: string
  max?: number
  onEnter?: () => void
  onLeave?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const spring = { stiffness: 220, damping: 20 }
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), spring)
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), spring)

  const move = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top) / r.height - 0.5)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={move}
      onPointerEnter={onEnter}
      onPointerLeave={() => {
        reset()
        onLeave?.()
      }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      whileHover={{ scale: 1.015 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
