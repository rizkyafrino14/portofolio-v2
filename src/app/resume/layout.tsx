import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta(
  "CV / Resume",
  "Unduh CV Rizky Mustafa Afrino, Fullstack Web Developer dari Indonesia: pendidikan, pengalaman, dan keahlian.",
  '/resume',
)

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
