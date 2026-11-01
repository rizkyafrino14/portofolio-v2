import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta(
  'Main dengan Mochi — Kucing Interaktif 3D',
  'Beri makan, elus, ajak main laser dan benang, serta foto Mochi, kucing virtual 3D di portofolio Rizky Mustafa Afrino.',
  '/mochi',
)

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
