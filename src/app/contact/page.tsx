'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { MdPerson } from 'react-icons/md'
import TextSection from '@/components/common/TextSection'
import TiltCard from '@/components/common/TiltCard'
import { logoLinks } from '@/utils/constant/LogoLinks'
import { useT, type TKey } from '@/lib/i18n'
import { setLink } from '@/lib/sceneLink'
import { cn } from '@/utils/styles/cn'

const YOUR_WHATSAPP = '6282326744030'

// Hanya area umum (kabupaten), bukan koordinat presisi, demi privasi.
const AREA_NAME = 'Semarang Regency, Central Java'
const AREA_QUERY = encodeURIComponent('Kabupaten Semarang, Jawa Tengah')

const topics: { key: 'hire' | 'collab' | 'hello'; icon: string }[] = [
  { key: 'hire', icon: '💼' },
  { key: 'collab', icon: '🤝' },
  { key: 'hello', icon: '👋' },
]

export default function Contact() {
  const t = useT()
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [topic, setTopic] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const valid = name.trim() && message.trim()
  const text = `${t('con.greeting')} *${name.trim() || '…'}*.\n\n${message.trim() || '…'}`

  const pickTopic = (key: 'hire' | 'collab' | 'hello') => {
    setTopic(key)
    setMessage(t(`con.p.${key}` as TKey))
  }

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    const url = `https://wa.me/${YOUR_WHATSAPP}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setSent(true)
    setTimeout(() => setSent(false), 3500)
  }

  const phoneOn = () => setLink({ phone: true })
  const phoneOff = () => setLink({ phone: false })

  return (
    <div>
      <TextSection level={1} icon="📲" text={t('con.title')} eyebrow={`🐶 ${t('con.eyebrow')}`} />

      {/* satu kolom di kiri (lg+) supaya jendela & ponsel 3D tetap terlihat */}
      <div className="mt-8 flex flex-col gap-5 lg:max-w-lg">
        <motion.form
          onSubmit={send}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel flex flex-col gap-5 p-5 md:p-6"
        >
          <p className="text-sm text-muted">{t('con.sub')}</p>

          {/* topik cepat */}
          <fieldset>
            <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t('con.topics')}</legend>
            <div className="flex flex-wrap gap-2">
              {topics.map(({ key, icon }) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => pickTopic(key)}
                  aria-pressed={topic === key}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors',
                    topic === key
                      ? 'border-ink bg-ink text-paper'
                      : 'border-line/30 bg-card2 text-ink hover:bg-sun',
                  )}
                >
                  {icon} {t(`con.t.${key}` as TKey)}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
            {t('con.name')}
            <span className="flex items-center gap-2 rounded-2xl border-2 border-transparent bg-card2 px-3 py-2.5 focus-within:border-ink">
              <MdPerson className="shrink-0 text-xl text-muted" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={phoneOn}
                onBlur={phoneOff}
                placeholder={t('con.namePh')}
                className="w-full bg-transparent text-sm font-normal outline-none"
                required
              />
            </span>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
            {t('con.msg')}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={phoneOn}
              onBlur={phoneOff}
              placeholder={t('con.msgPh')}
              rows={4}
              className="resize-none rounded-2xl border-2 border-transparent bg-card2 px-3 py-2.5 text-sm font-normal outline-none focus:border-ink"
              required
            />
            <span className="text-right text-xs font-normal text-muted">
              {message.length} {t('con.chars')}
            </span>
          </label>

          {/* pratinjau gelembung WhatsApp */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t('con.preview')}</p>
            <div className="flex justify-end rounded-2xl bg-[#e7dfd2] p-3 dark:bg-[#1b2420]">
              <div className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-3.5 py-2 text-sm text-[#1f2c27] shadow-sm dark:bg-[#005c4b] dark:text-[#e9edef]">
                {t('con.greeting')} <b>{name.trim() || '…'}</b>.
                {'\n\n'}
                {message.trim() || '…'}
              </div>
            </div>
          </div>

          <button type="submit" disabled={!valid} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
            {sent ? (
              <>✅ {t('con.done')}</>
            ) : (
              <>
                <FaWhatsapp className="text-xl" /> {t('con.send')}
              </>
            )}
          </button>
          {sent && <p className="-mt-2 text-center text-xs text-muted">{t('con.doneSub')}</p>}
        </motion.form>

        {/* sosial + lokasi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel flex flex-col gap-4 p-5"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('con.social')}</p>
          <div className="flex flex-wrap gap-3">
            {logoLinks.map((l) => {
              const Icon = l.icon
              return (
                <TiltCard key={l.name} max={14}>
                  <a
                    href={l.href}
                    target={l.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    aria-label={l.name}
                    title={l.name}
                    className="grid h-12 w-12 place-items-center rounded-2xl bg-sun text-black transition-colors hover:bg-accent hover:text-white [&_svg]:!h-6 [&_svg]:!w-6"
                  >
                    <Icon />
                  </a>
                </TiltCard>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/20 pt-4 text-sm">
            <span className="text-muted">
              {t('con.located')} <b className="text-ink">📍 {AREA_NAME}</b>
            </span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${AREA_QUERY}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-accent hover:underline"
            >
              {t('con.maps')} →
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
