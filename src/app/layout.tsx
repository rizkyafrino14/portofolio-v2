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
    { media: '(prefers-color-scheme: light)', color: '#bfe3f5' },
    { media: '(prefers-color-scheme: dark)', color: '#0e1512' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'Rizky Mustafa Afrino | Portofolio',
    template: '%s — Rizky Mustafa Afrino',
  },
  description:
    'Rizky Mustafa Afrino — Fullstack Developer from Indonesia specializing in React, Next.js, and TypeScript. Explore my projects, skills, and journey in web development.',
  keywords: [
    'Rizky Mustafa Afrino',
    'Fullstack Developer',
    'React',
    'Next.js',
    'TypeScript',
    'Web Developer Indonesia',
  ],
  authors: [{ name: 'Rizky Mustafa Afrino', url: 'https://afrino.vercel.app' }],
  creator: 'Rizky Mustafa Afrino',

  verification: {
    google: 'JZDm8fS_tvLpavVAgJxpWEk-hAzqgMCkJDurmHgBe48',
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://afrino.vercel.app',
    siteName: 'Rizky Mustafa Afrino',
    title: 'Rizky Mustafa Afrino | Fullstack Developer',
    description:
      'Fullstack Developer from Indonesia — React, Next.js, TypeScript. Check out my projects and skills.',
    images: [
      {
        url: 'https://afrino.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Rizky Mustafa Afrino — Fullstack Developer Portfolio',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Rizky Mustafa Afrino | Fullstack Developer',
    description:
      'Fullstack Developer from Indonesia — React, Next.js, TypeScript.',
    images: ['https://afrino.vercel.app/og-image.png'],
    creator: '@riz_456d',
  },

  metadataBase: new URL('https://afrino.vercel.app'),
  alternates: {
    canonical: '/',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} overflow-x-hidden`}>
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
