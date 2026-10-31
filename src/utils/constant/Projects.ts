import type { Bi } from '@/lib/i18n'

export interface IProject {
  title: string
  image: string // nama file di /public/project/
  deskripsi: Bi
  type: 'web' | 'api' | 'mobile' | 'android' | 'ios' | 'flutter'
  demo: string
  repo: string
  stack?: string[]
}

export const projects: IProject[] = [
  {
    title: 'Sampahku Hartaku',
    image: 'sampahku.png',
    deskripsi: {
      en: 'An educational platform on waste management, inspiring communities to turn trash into treasure.',
      id: 'Platform edukasi pengelolaan sampah yang mengajak masyarakat mengubah sampah menjadi harta.',
    },
    type: 'web',
    demo: 'https://kolaboratif11.vercel.app/',
    repo: 'https://github.com/Riz456/Sampahku-hartaku',
    stack: ['HTML', 'CSS', 'JavaScript'],
  },
  {
    title: 'Album X RPL 4',
    image: 'kenangan.png',
    deskripsi: {
      en: 'A digital space where every moment of laughter, struggle, and togetherness is neatly preserved. A place where our stories never gather dust with the passage of time—ready to be accessed and replayed whenever you wish.',
      id: 'Sebuah ruang digital tempat setiap momen tawa, perjuangan, dan kebersamaan tersimpan rapi. Tempat di mana kisah kita tak pernah berdebu oleh waktu—siap diakses kapan saja untuk diputar ulang..',
    },
    type: 'web',
    demo: 'https://pplgku.my.id/',
    repo: 'https://github.com/rizkyafrino14/album',
    stack: ['HTML', 'CSS', 'JavaScript'],
  },
  {
    title: 'Sekolah Digital',
    image: 'sd.png',
    deskripsi: {
      en: 'A smart student management system that streamlines academic and administrative processes.',
      id: 'Sistem manajemen siswa pintar yang memudahkan proses akademik dan administrasi.',
    },
    type: 'web',
    demo: 'https://rizkyafrino14.github.io/tugas1_bootstrap/tugas/tugas_bootstrap2.html',
    repo: 'https://github.com/rizkyafrino14/tugas1_bootstrap',
    stack: ['Bootstrap'],
  },
  {
    title: 'Environment Website',
    image: 'env.png',
    deskripsi: {
      en: 'A digital movement for reforestation, empowering people to take action in preserving the planet.',
      id: 'Gerakan digital untuk reboisasi yang mendorong orang bertindak menjaga bumi.',
    },
    type: 'web',
    demo: 'https://rizkyafrino14.github.io/environment/',
    repo: 'https://github.com/rizkyafrino14/environment',
    stack: ['HTML', 'CSS'],
  },
  {
    title: 'Travel Explore',
    image: 'travel.png',
    deskripsi: {
      en: 'A seamless travel booking website designed for effortless ticket reservations and trip planning.',
      id: 'Situs pemesanan perjalanan yang memudahkan reservasi tiket dan perencanaan liburan.',
    },
    type: 'web',
    demo: 'https://rizkyafrino14.github.io/tugas4_travelexplore/',
    repo: 'https://github.com/rizkyafrino14/tugas4_travelexplore',
    stack: ['Bootstrap'],
  },
  {
    title: 'PetMing',
    image: 'petmig.png',
    deskripsi: {
      en: 'An online marketplace for pet supplies and food, bringing quality products to animal lovers.',
      id: 'Toko online perlengkapan dan makanan hewan peliharaan untuk para pecinta hewan.',
    },
    type: 'web',
    demo: 'https://rizkyafrino14.github.io/tugas5_petshop/',
    repo: 'https://github.com/rizkyafrino14/tugas5_petshop',
    stack: ['HTML', 'CSS', 'JavaScript'],
  },
  {
    title: 'Portofolio Website',
    image: 'porto.png',
    deskripsi: {
      en: 'An immersive 3D personal portfolio built to showcase projects and personal branding.',
      id: 'Portofolio pribadi 3D yang imersif untuk menampilkan proyek dan personal branding.',
    },
    type: 'web',
    demo: 'https://rizky.pplgku.my.id/',
    repo: 'https://github.com/rizkyafrino14/portofolio-v2',
    stack: ['Next.js', 'TypeScript', 'Three.js'],
  },
  // ➕ Tambah proyek baru di sini
  // type yang valid: 'web' | 'api' | 'mobile' | 'android' | 'ios' | 'flutter'
]
