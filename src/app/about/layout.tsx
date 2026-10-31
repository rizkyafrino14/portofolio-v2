import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta(
  "Tentang Saya — Siswa RPL & Web Developer",
  "Kenali Rizky Mustafa Afrino: siswa Rekayasa Perangkat Lunak SMK Negeri 1 Tengaran yang membangun web dengan React, Next.js, TypeScript, Tailwind, dan belajar Laravel.",
  '/about',
)

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
