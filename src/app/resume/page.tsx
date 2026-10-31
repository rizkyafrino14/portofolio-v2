'use client'

import TextSection from '@/components/common/TextSection'
import { FiDownload, FiExternalLink } from 'react-icons/fi'
import { useT } from '@/lib/i18n'

export default function Resume() {
  const t = useT()
  return (
    <div>
      <TextSection icon="📄" text={t('res.title')} eyebrow={`🐔 ${t('res.eyebrow')}`} />

      <div className="mt-8 flex flex-wrap gap-3">
        <a href="/cv.pdf" download className="btn-primary">
          <FiDownload /> {t('res.download')}
        </a>
        <a href="/cv.pdf" target="_blank" rel="noreferrer" className="btn-ghost">
          <FiExternalLink /> {t('res.open')}
        </a>
      </div>

      <iframe
        title="Resume Rizky Mustafa Afrino"
        src="/cv.pdf#toolbar=0"
        className="panel mt-6 h-[800px] w-full xl:h-[1135px]"
      />
    </div>
  )
}
