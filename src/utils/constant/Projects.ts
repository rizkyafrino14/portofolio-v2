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
    image: 'kenangan.jpg',
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
  {
    title: 'Journey of Us',
    image: 'journey.jpg',
    deskripsi: {
      en: 'A pixel-art adventure game built with Godot Engine and playable right in the browser. Start the journey and unlock the story chapter by chapter.',
      id: 'Game petualangan pixel yang dibuat dengan Godot Engine dan bisa dimainkan langsung di browser. Mulai petualangan dan buka ceritanya bab demi bab.',
    },
    type: 'web',
    demo: 'https://j0urney-of-us.netlify.app/',
    repo: '',
    stack: ['Godot Engine', 'Pixel Art', 'Game'],
  },
  {
    title: 'EcoWin',
    image: 'ecowin.png',
    deskripsi: {
      en: 'EcoWin is a digital waste bank Android app built with Kotlin and powered by a Laravel (PHP) backend. Sign in with Google to see your balance, deposits, and organic waste activity. Manage waste, protect the future.',
      id: 'EcoWin adalah aplikasi Android bank sampah digital yang dibuat dengan Kotlin dan didukung backend Laravel (PHP). Masuk dengan Google untuk melihat saldo, setoran, dan aktivitas organik. Kelola sampah, jaga masa depan.',
    },
    type: 'android',
    demo: 'none',
    repo: 'https://github.com/rizkyafrino-max/ecowin',
    stack: ['Kotlin', 'Android', 'Laravel', 'PHP', 'Google Sign-In'],
  },
  {
    title: 'HaditsKu',
    image: 'hadisku.png',
    deskripsi: {
      en: 'HaditsKu is a digital hadith portal: search hadith, browse by category (prayer, fasting, Ramadan, charity, character), and use handy tools like notes, Surah Yasin, and prayers.',
      id: 'HaditsKu adalah portal hadits digital: cari hadits, jelajahi per kategori (shalat, puasa, Ramadhan, sedekah, akhlak), dan gunakan fitur Catatan, Surah Yasin, serta Doa.',
    },
    type: 'web',
    demo: 'https://hadiskuweb.vercel.app/',
    repo: '',
  },
  {
    title: 'Yearbook IX A',
    image: 'yearbook.jpg',
    deskripsi: {
      en: 'A digital yearbook for class IX A of SMP 2 Kaliwungu with a timeline, gallery, quotes, achievements, and class structure, complete with background music.',
      id: 'Album kenangan digital Kelas IX A SMP 2 Kaliwungu dengan linimasa, galeri, kutipan, prestasi, dan struktur kelas, lengkap dengan musik latar.',
    },
    type: 'web',
    demo: 'https://yearbook-class-9a.vercel.app/halaman-utama.html',
    repo: '',
  },
  {
    title: 'Git & GitHub Kids Lab',
    image: 'belajar-git.jpg',
    deskripsi: {
      en: 'An interactive learning site for Git & GitHub: 11 beginner-friendly modules, a quiz, a command playground, XP and badges, with progress saved on your device.',
      id: 'Situs belajar Git & GitHub yang interaktif: 11 modul ramah pemula, kuis, playground perintah, XP dan badge, dengan progres tersimpan di perangkat.',
    },
    type: 'web',
    demo: 'https://belajar-git-plum.vercel.app/',
    repo: '',
  },
  // ➕ Tambah proyek baru di sini
  // type yang valid: 'web' | 'api' | 'mobile' | 'android' | 'ios' | 'flutter'
]
