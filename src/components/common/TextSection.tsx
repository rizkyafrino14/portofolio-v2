'use client'

import { twMerge } from 'tailwind-merge'
import { motion } from 'framer-motion'

type TextSectionProps = {
  text: string
  icon: string
  classNames?: string
  eyebrow?: string
}

export default function TextSection({
  classNames,
  text,
  icon,
  eyebrow,
}: TextSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={twMerge('flex flex-col items-start gap-3', classNames)}
    >
      {eyebrow && <span className="sticker">{eyebrow}</span>}
      <h2 className="flex items-center gap-3 rounded-3xl border border-line/20 bg-card/75 py-2 pl-2 pr-5 font-display text-4xl font-bold text-ink shadow-soft backdrop-blur-xl md:text-6xl">
        <span
          aria-hidden
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 border-ink bg-sun text-2xl shadow-pop-sm md:h-16 md:w-16 md:text-4xl"
        >
          {icon}
        </span>
        <span>{text}</span>
      </h2>
    </motion.div>
  )
}
