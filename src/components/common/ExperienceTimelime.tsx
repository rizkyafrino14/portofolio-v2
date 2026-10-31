'use client'

import { motion } from 'framer-motion'
import { LinkPreview } from './LinkPreview'
import { useBi } from '@/lib/i18n'
import type { IExperience } from '@/utils/constant/Experience'

export default function ExperienceTimeline({
  type,
  company,
  title,
  date,
  description,
  url,
}: IExperience) {
  const bi = useBi()
  return (
    <motion.li
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative pl-12 md:pl-16"
    >
      <LinkPreview url={url}>
        <span
          className="absolute left-0 top-1 grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-sun text-lg text-black shadow-pop-sm md:h-11 md:w-11"
          aria-hidden
        >
          {type === 'Work' ? '💼' : '🎓'}
        </span>
      </LinkPreview>

      <div className="panel p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-accent">{bi(date)}</p>
        <h3 className="mt-1 font-display text-xl font-bold text-ink md:text-2xl">{bi(title)}</h3>
        {company && <p className="text-sm font-semibold text-muted">{company}</p>}
        <p className="mt-2 leading-relaxed text-muted">{bi(description)}</p>
      </div>
    </motion.li>
  )
}
