import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rizky Mustafa Afrino — Portofolio',
    short_name: 'Rizky',
    description: 'Portofolio Fullstack Web Developer dari Indonesia.',
    start_url: '/',
    display: 'standalone',
    background_color: '#efe4d2',
    theme_color: '#efe4d2',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
