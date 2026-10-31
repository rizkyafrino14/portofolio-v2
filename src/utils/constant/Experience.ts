import type { Bi } from '@/lib/i18n'

export interface IExperience {
  title: Bi
  company: string
  type: string
  description: Bi
  date: Bi
  url: string
}

export const experience: IExperience[] = [
  {
    title: {
      en: 'Building My Portfolio: A Journey with JavaScript and React',
      id: 'Membangun Portofolio: Perjalanan bersama JavaScript dan React',
    },
    company: '',
    type: 'study',
    description: {
      en: 'Personal Recount by Rizky Mustafa Afrino — Student of Tengaran State Vocational High School, RPL Department',
      id: 'Catatan pribadi Rizky Mustafa Afrino — Siswa SMK Negeri 1 Tengaran, Jurusan RPL',
    },
    date: { en: 'April 2026 – May 2026', id: 'April 2026 – Mei 2026' },
    url: '/experience.pdf',
  },
  {
    title: {
      en: 'Foundational Programming & Logic',
      id: 'Dasar Pemrograman & Logika',
    },
    company: 'Scratch (MIT Media Lab)',
    type: 'study',
    description: {
      en: 'Developed core programming logic and algorithmic thinking through visual scripting. Built interactive projects focusing on event-driven programming, loops, and conditional logic.',
      id: 'Mengembangkan logika pemrograman dan berpikir algoritmik lewat visual scripting. Membuat proyek interaktif dengan fokus pada event, perulangan, dan kondisi.',
    },
    date: { en: 'June 2024 – August 2024', id: 'Juni 2024 – Agustus 2024' },
    url: 'https://scratch.mit.edu/',
  },
]
