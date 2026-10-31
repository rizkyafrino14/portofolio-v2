import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta(
  "Proyek Web Developer",
  "Kumpulan proyek web Rizky Mustafa Afrino: platform edukasi sampah, sistem sekolah digital, toko hewan, situs travel, dan portofolio 3D interaktif.",
  '/project',
)

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
