import type { Metadata, Viewport } from 'next'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SceneLayer from '@/components/three/SceneLayer'
import AudioController from '@/components/common/AudioController'
import CatDock from '@/components/common/CatDock'
import { ThemeProvider } from '@/provider/themesProvider'
import GithubStar from '@/components/common/GithubStar'
import { SITE_URL, jsonLd } from '@/lib/seo'

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#efe4d2' },
    { media: '(prefers-color-scheme: dark)', color: '#171310' },
  ],
}

const TITLE = 'Rizky Mustafa Afrino — Fullstack Web Developer (Next.js, React, Laravel)'
const DESCRIPTION =
  'Portofolio Rizky Mustafa Afrino, Fullstack Web Developer dari Indonesia (siswa RPL SMK Negeri 1 Tengaran). Lihat proyek React, Next.js, TypeScript & Laravel, sertifikat, dan CV.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s | Rizky Mustafa Afrino',
  },
  description: DESCRIPTION,
  applicationName: 'Rizky Mustafa Afrino — Portofolio',
  keywords: [
    'Rizky Mustafa Afrino',
    'Rizky Afrino',
    'portofolio web developer',
    'fullstack web developer Indonesia',
    'web developer Indonesia',
    'Next.js developer',
    'React developer',
    'Laravel developer',
    'TypeScript',
    'SMK Negeri 1 Tengaran',
    'RPL',
  ],
  authors: [{ name: 'Rizky Mustafa Afrino', url: SITE_URL }],
  creator: 'Rizky Mustafa Afrino',
  publisher: 'Rizky Mustafa Afrino',
  category: 'technology',

  verification: {
    google: 'JZDm8fS_tvLpavVAgJxpWEk-hAzqgMCkJDurmHgBe48',
  },

  openGraph: {
    type: 'website',
    locale: 'id_ID',
    alternateLocale: ['en_US'],
    url: SITE_URL,
    siteName: 'Rizky Mustafa Afrino',
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Rizky Mustafa Afrino — Fullstack Web Developer',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png'],
    creator: '@riz_456d',
  },

  alternates: {
    canonical: '/',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} overflow-x-hidden`}>
        {/* Data terstruktur: membantu Google memahami siapa pemilik situs ini */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SceneLayer />
          <AudioController />
          <div className="relative z-20">
            <Navbar />
            <main className="mx-auto min-h-[70vh] w-full max-w-6xl px-5 pb-28 pt-6 md:px-8">
              {children}
            </main>
          </div>
          <Footer />
          <CatDock />
          <GithubStar />
        </ThemeProvider>
      </body>
    </html>
  )
}
