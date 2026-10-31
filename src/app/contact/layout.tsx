import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta(
  "Hubungi Saya",
  "Hubungi Rizky Mustafa Afrino untuk peluang kerja, magang, atau kolaborasi proyek web melalui WhatsApp, GitHub, Instagram, atau email.",
  '/contact',
)

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
