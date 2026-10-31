import type { Config } from 'tailwindcss'

const withMT = require('@material-tailwind/react/utils/withMT')

// Semua warna membaca CSS variable (lihat globals.css) sehingga light/dark
// cukup diatur di satu tempat, tanpa override !important.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      cursor: {
        pointer: 'url(/32.png), pointer',
        default: 'url(/32.png), default',
        hand: 'url(/hand.png), pointer',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        crack: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(var(--r, 0deg))' },
          '50%': { transform: 'translateY(-8px) rotate(var(--r, 0deg))' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'walk-chicken': {
          '0%, 100%': { transform: 'translateX(0%)' },
          '50%': { transform: 'translateX(90%)' },
        },
        'walk-cat': {
          '0%, 100%': { transform: 'translateX(90%)' },
          '50%': { transform: 'translateX(0%)' },
        },
        'run-dog': {
          '0%, 100%': { transform: 'translateX(90%)' },
          '50%': { transform: 'translateX(5%)' },
        },
        'walk-dog': {
          '0%, 100%': { transform: 'translateX(30%)' },
          '50%': { transform: 'translateX(90%)' },
        },
        'walk-snail': {
          '0%, 100%': { transform: 'translateX(0%)' },
          '50%': { transform: 'translateX(90%)' },
        },
        'walk-turle': {
          '0%, 100%': { transform: 'translateX(90%)' },
          '50%': { transform: 'translateX(10%)' },
        },
        flip: {
          '0%, 100%': { transform: 'scaleX(1)' },
          '50%': { transform: 'scaleX(-1)' },
        },
        'flip-reverse': {
          '0%, 100%': { transform: 'scaleX(-1)' },
          '50%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        wiggle: 'wiggle 0.3s ease-in-out',
        crack: 'crack 0.5s ease-in-out',
        float: 'float 5s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
        spin: 'spin 10s linear infinite',
        'walk-chicken': 'walk-chicken 130s linear infinite',
        'walk-cat': 'walk-cat 80s linear infinite',
        'walk-snail': 'walk-snail 500s linear infinite',
        'run-dog': 'run-dog 60s linear infinite',
        'walk-dog': 'walk-dog 100s linear infinite reverse',
        'walk-turle': 'walk-turle 2000s linear infinite',
        'flip-chicken': 'flip 130s step-end infinite',
        'flip-snail': 'flip 500s step-end infinite',
        'flip-dog-reverse': 'flip-reverse 60s step-end infinite',
        'flip-dog': 'flip 100s step-end infinite',
        'flip-turle': 'flip-reverse 2000s step-end infinite',
      },
      colors: {
        paper: token('paper'),
        card: token('card'),
        card2: token('card2'),
        ink: token('ink'),
        muted: token('muted'),
        line: token('line'),
        accent: token('accent'),
        sun: token('sun'),
        leaf: token('leaf'),
        berry: token('berry'),
        // Nama lama dipetakan ke token baru supaya komponen lama tidak rusak.
        background: token('paper'),
        'primary-text': token('ink'),
        'secondary-text': token('muted'),
        'black-primary': token('ink'),
        'yellow-primary': token('sun'),
        'orange-primary': token('accent'),
      },
      boxShadow: {
        // satu-satunya "hard shadow": dipakai hemat, hanya untuk CTA & sticker
        pop: '0 4px 0 0 rgb(var(--ink))',
        'pop-sm': '0 3px 0 0 rgb(var(--ink))',
        soft: '0 1px 2px rgb(var(--ink) / 0.06), 0 12px 32px -12px rgb(var(--ink) / 0.18)',
        // alias lama
        button: '0 4px 0 0 rgb(var(--ink))',
        'button-card': '0 1px 2px rgb(var(--ink) / 0.06), 0 12px 32px -12px rgb(var(--ink) / 0.18)',
        'image-card': '0 1px 2px rgb(var(--ink) / 0.06), 0 12px 32px -12px rgb(var(--ink) / 0.18)',
        'nav-card': '0 1px 2px rgb(var(--ink) / 0.06), 0 12px 32px -12px rgb(var(--ink) / 0.18)',
      },
      height: {
        fullscreen: '100dvh',
      },
      rotate: {
        120: '120deg',
      },
    },
  },
  plugins: [],
}
export default withMT(config)
