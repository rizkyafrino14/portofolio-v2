'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import ImageViewer from 'react-simple-image-viewer'
import { motion } from 'framer-motion'
import { RiFileCopyLine } from 'react-icons/ri'
import { BiShow } from 'react-icons/bi'
import { IoLinkSharp } from 'react-icons/io5'
import { ICertificate } from '@/utils/interface/Certificate'
import TextSection from '@/components/common/TextSection'
import TiltCard from '@/components/common/TiltCard'
import { useT } from '@/lib/i18n'
import { setLink } from '@/lib/sceneLink'

// ✏️ EDIT DAFTAR SERTIFIKAT DI SINI
// Taruh file gambar di /public/certificates/ lalu isi "image" dengan nama filenya.
// Urutan ini juga menentukan bingkai mana yang menyala di dinding 3D (maks. 3).
const certificates: ICertificate[] = [
  {
    title: 'CSS Basic',
    company: 'HackerRank',
    image: 'piagam (2).png',
    href: 'https://www.hackerrank.com/features/certified-assessments',
    type: 'course',
  },
  {
    title: 'The Hour Of Code',
    company: 'Code.org',
    image: 'piagam.png',
    href: 'https://code.org',
    type: 'course',
  },
  {
    title: 'SMK Negeri 1 Tengaran',
    company: 'RPL — SMK Negeri 1 Tengaran',
    image: 'rpl.png',
    href: 'https://rplxsata.com/',
    type: 'course',
  },
  // ➕ Tambah sertifikat baru di sini
  // type yang valid: 'course' | 'competition' | 'competence'
]

const src = (image: string) => encodeURI(`/certificates/${image}`)
const images = certificates.map((c) => src(c.image))

const iconBtn =
  'grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line/30 bg-card2 p-2 text-ink transition-colors hover:bg-accent hover:text-white'

export default function Education() {
  const t = useT()
  const [current, setCurrent] = useState(0)
  const [viewer, setViewer] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)

  const open = useCallback((i: number) => {
    setCurrent(i)
    setViewer(true)
  }, [])

  const copy = (href: string, i: number) => {
    navigator.clipboard.writeText(href).catch(() => {})
    setCopied(i)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div>
      <TextSection icon="🎓" text={t('edu.title')} eyebrow={`🐌 ${t('edu.eyebrow')}`} />

      {/* satu kolom di kiri (lg+) supaya dinding sertifikat 3D tetap terlihat */}
      <div className="mt-8 flex flex-col gap-6 lg:max-w-lg">
        {/* sekolah */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel flex items-center gap-4 p-5"
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sun text-3xl">🏫</span>
          <div className="min-w-0">
            <p className="font-display text-xl font-bold text-ink md:text-2xl">{t('edu.school')}</p>
            <p className="text-sm text-muted">{t('edu.major')}</p>
            <span className="sticker mt-2">🟢 {t('edu.status')}</span>
          </div>
        </motion.div>

        <div>
          <h2 className="mb-1 font-sans text-xs font-bold uppercase tracking-wider text-ink">
            <span className="rounded-full bg-card/80 px-3 py-1 backdrop-blur">{t('edu.certs')}</span>
          </h2>
          <p className="mb-3 hidden pl-1 text-xs text-ink/70 lg:block">{t('edu.hover')}</p>

          <div className="flex flex-col gap-3">
            {certificates.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <TiltCard
                  className="panel relative flex items-center gap-4 p-3"
                  onEnter={() => setLink({ cert: i < 3 ? i : null })}
                  onLeave={() => setLink({ cert: null })}
                >
                  <button
                    onClick={() => open(i)}
                    aria-label={t('edu.view')}
                    className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-line/25 bg-card2"
                  >
                    <Image
                      src={src(c.image)}
                      alt={c.title}
                      fill
                      sizes="112px"
                      className="object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </button>

                  <div className="min-w-0 flex-1">
                    <span className="sticker uppercase">{c.type}</span>
                    <p className="mt-1.5 truncate font-display text-lg font-bold text-ink">{c.title}</p>
                    <p className="truncate text-sm text-muted">{c.company}</p>
                  </div>

                  <div className="flex shrink-0 flex-col items-center gap-1.5">
                    <button className={iconBtn} aria-label={t('edu.view')} onClick={() => open(i)}>
                      <BiShow className="h-full w-full" />
                    </button>
                    <button className={iconBtn} aria-label={t('edu.copy')} onClick={() => copy(c.href, i)}>
                      <RiFileCopyLine className="h-full w-full" />
                    </button>
                    <a className={iconBtn} aria-label={t('edu.open')} href={c.href} target="_blank" rel="noreferrer">
                      <IoLinkSharp className="h-full w-full" />
                    </a>
                  </div>

                  {copied === i && (
                    <span className="absolute right-4 top-2 text-xs font-bold text-accent">{t('edu.copied')}</span>
                  )}
                </TiltCard>
              </motion.div>
            ))}

            {certificates.length === 0 && <p className="text-muted">{t('edu.empty')}</p>}
          </div>
        </div>
      </div>

      {viewer && (
        <ImageViewer
          src={images}
          currentIndex={current}
          onClose={() => setViewer(false)}
          backgroundStyle={{ zIndex: 9999 }}
          closeOnClickOutside
        />
      )}
    </div>
  )
}
