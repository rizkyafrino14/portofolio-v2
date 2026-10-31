<image src="landing.png"/>

# Rizky Mustafa Afrino — Personal Portfolio

Live: https://rizky.pplgku.my.id

An immersive 3D portfolio set on a floating low-poly animal island. Each page is
a place on the island and the camera flies between them. Includes a hatchable 3D
egg, walking pixel pets, a secret trivia game (type `6am3` on Projects), day/night
themes, Indonesian/English UI, and a settings panel (SFX, music, pets, 3D quality).

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Three.js** via **React Three Fiber** + **drei** (scene in `src/components/three/Scene.tsx`)
- **Tailwind CSS** with CSS-variable design tokens (`src/app/globals.css`)
- **Framer Motion** for UI animation

### Skills shown on the About page
JavaScript, TypeScript, React, Next.js, Tailwind, Bootstrap, **Laravel (50%)**, PHP, MySQL.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Editing content

| What | Where |
| --- | --- |
| Projects | `src/utils/constant/Projects.ts` |
| Experience | `src/utils/constant/Experience.ts` |
| Skills & percentages | `src/app/about/page.tsx` |
| Certificates | `src/app/education/page.tsx` |
| Social links | `src/utils/constant/LogoLinks.ts` |
| Colors (light/dark) | `:root` / `.dark` in `src/app/globals.css` |
