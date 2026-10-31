// Satu sumber kebenaran untuk SEO: URL situs, data terstruktur, dan helper metadata halaman.
import type { Metadata } from 'next'

export const SITE_URL = 'https://rizky.pplgku.my.id'
export const SITE_NAME = 'Rizky Mustafa Afrino'

export const routes = ['', '/about', '/education', '/project', '/resume', '/contact'] as const

/** JSON-LD (schema.org): orang + situs web. */
export const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: SITE_NAME,
      alternateName: ['Rizky Afrino', 'Rizky M. Afrino'],
      url: SITE_URL,
      image: `${SITE_URL}/me.png`,
      jobTitle: 'Fullstack Web Developer',
      description:
        'Fullstack Web Developer dari Indonesia, siswa Rekayasa Perangkat Lunak (RPL) di SMK Negeri 1 Tengaran.',
      knowsAbout: ['Next.js', 'React', 'TypeScript', 'JavaScript', 'Laravel', 'Tailwind CSS', 'Bootstrap', 'PHP', 'MySQL', 'Three.js'],
      affiliation: { '@type': 'EducationalOrganization', name: 'SMK Negeri 1 Tengaran' },
      address: { '@type': 'PostalAddress', addressRegion: 'Jawa Tengah', addressCountry: 'ID' },
      sameAs: [
        'https://github.com/rizkyafrino14',
        'https://x.com/AfrinoRizky/',
        'https://www.instagram.com/riz_456d/',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: `${SITE_NAME} — Portofolio`,
      inLanguage: ['id', 'en'],
      publisher: { '@id': `${SITE_URL}/#person` },
    },
  ],
}

/** Metadata per halaman: judul, deskripsi, canonical, dan Open Graph yang konsisten. */
export function pageMeta(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${SITE_NAME} — ${title}` }],
    },
    twitter: { card: 'summary_large_image', title: `${title} | ${SITE_NAME}`, description, images: ['/og-image.png'] },
  }
}
