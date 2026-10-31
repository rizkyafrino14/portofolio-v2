import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Education',
  alternates: { canonical: '/education' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
