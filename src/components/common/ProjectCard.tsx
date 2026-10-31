'use client'

import Image from 'next/image'
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa'
import { motion } from 'framer-motion'
import TiltCard from './TiltCard'
import { setLink } from '@/lib/sceneLink'
import { useBi, useT, type Bi } from '@/lib/i18n'

export default function ProjectCard({
  image,
  title,
  deskripsi,
  repo,
  demo,
  type,
  stack,
}: {
  image: string
  title: string
  deskripsi: Bi
  repo?: string
  demo?: string
  type: string
  stack?: string[]
}) {
  const t = useT()
  const bi = useBi()
  const hasDemo = !!demo && demo !== 'none'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
    >
    <TiltCard
      className="h-full"
      onEnter={() => setLink({ project: image })}
      onLeave={() => setLink({ project: null })}
    >
    <article className="panel group flex h-full w-full flex-col overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-line/20 bg-card2">
        <Image
          src={`/project/${image}`}
          width={800}
          height={500}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          alt={`Screenshot ${title}`}
        />
        <span className="sticker absolute left-3 top-3 uppercase">{type}</span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-2xl font-bold text-ink">{title}</h3>
        <p className="flex-1 text-sm leading-relaxed text-muted">{bi(deskripsi)}</p>

        {stack && stack.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {stack.map((s) => (
              <li key={s} className="rounded-full bg-card2 px-2.5 py-1 text-xs font-semibold text-ink">
                {s}
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2 pt-1">
          {hasDemo && (
            <a href={demo} target="_blank" rel="noreferrer" className="btn-primary !px-4 !py-2 !text-sm">
              <FaExternalLinkAlt /> {t('proj.live')}
            </a>
          )}
          {repo && (
            <a href={repo} target="_blank" rel="noreferrer" className="btn-ghost !px-4 !py-2 !text-sm">
              <FaGithub /> {t('proj.code')}
            </a>
          )}
        </div>
      </div>
    </article>
    </TiltCard>
    </motion.div>
  )
}
