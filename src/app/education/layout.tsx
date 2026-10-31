import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta(
  "Pendidikan & Sertifikat",
  "Pendidikan Rizky Mustafa Afrino di SMK Negeri 1 Tengaran (RPL) dan sertifikat yang diraih: HackerRank, Code.org, dan lainnya.",
  '/education',
)

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
