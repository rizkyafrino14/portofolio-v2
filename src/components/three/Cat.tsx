'use client'

import { isUiTarget } from '@/lib/ui'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { ball, catCtl, catPos, dot, getCatUi, patchCatUi, type CatActivity } from '@/lib/cat'
import { makeFur } from './textures'
import { meow, purr } from '@/lib/audio'
import { BOUNDS, BOWL_AT, CIRCLES, RECTS, TREE_AT, findPath, losClear, nearestFree } from '@/lib/catNav'
import type { RouteKey } from './Scene'

export { BOWL_AT, TREE_AT }

/* ------------------------------------------------------------------ */
/* Dunia kucing: titik menarik, rintangan, batas ruangan                */
/* ------------------------------------------------------------------ */
interface Poi {
  id: string
  p: [number, number, number]
  yaw: number
  acts: CatActivity[]
  launch?: [number, number] // titik di lantai tempat kucing bersiap melompat
}

const POIS: Poi[] = [
  { id: 'chair', p: [0.12, 0.57, -1.95], yaw: 1.0, acts: ['sleep', 'sleep', 'sit'], launch: [0.75, -1.45] },
  { id: 'desk', p: [0.85, 0.82, -2.95], yaw: Math.PI - 0.4, acts: ['watch', 'sit', 'groom'], launch: [1.0, -2.1] },
  { id: 'tree', p: [TREE_AT[0], 1.13, TREE_AT[1]], yaw: 0.8, acts: ['sleep', 'watch'], launch: [-3.2, 1.95] },
  { id: 'console', p: [4.5, 0.77, -0.62], yaw: Math.PI / 2, acts: ['watch', 'sit'], launch: [3.7, -0.6] },
  { id: 'rug', p: [-0.9, 0, -1.3], yaw: 0.4, acts: ['sit', 'groom', 'stretch', 'sleep'] },
  { id: 'sun', p: [2.5, 0, -1.2], yaw: 2.0, acts: ['sleep', 'sit', 'groom'] },
  { id: 'shelf', p: [-3.95, 0, -1.4], yaw: -Math.PI / 2, acts: ['watch', 'sit'] },
  { id: 'wall', p: [3.0, 0, -3.3], yaw: Math.PI, acts: ['watch', 'sit'] },
  { id: 'free1', p: [-2.2, 0, 0.9], yaw: 1, acts: ['sit', 'groom', 'stretch'] },
  { id: 'free2', p: [1.8, 0, 1.5], yaw: -1, acts: ['sit', 'stretch', 'groom'] },
]

const ROUTE_POI: Partial<Record<RouteKey, string>> = {
  '/project': 'desk',
  '/contact': 'console',
  '/about': 'shelf',
  '/education': 'wall',
  '/resume': 'chair',
}

const DUR: Record<CatActivity, [number, number]> = {
  sleep: [22, 45],
  sit: [5, 10],
  groom: [5, 8],
  watch: [8, 14],
  eat: [4.5, 4.5],
  play: [12, 12],
  pet: [4, 4],
  chase: [1, 1],
  stretch: [3, 4],
  walk: [1, 1],
}

/* ------------------------------------------------------------------ */
/* Pose                                                                */
/* ------------------------------------------------------------------ */
interface Pose {
  by: number // tinggi badan
  bp: number // pitch badan (negatif = hidung naik)
  hp: number // pitch kepala relatif
  fl: number // sudut kaki depan
  hl: number // sudut kaki belakang
  eyes: number
  legS: number // skala kaki (kaki "terselip" saat tidur)
  tail: number // naik-turunnya ekor
  curl: number // ekor melingkar
}

const STAND: Pose = { by: 0.2, bp: 0, hp: 0, fl: 0, hl: 0, eyes: 1, legS: 1, tail: 0.5, curl: 0 }
const POSE: Record<CatActivity, Pose> = {
  walk: STAND,
  chase: { ...STAND, by: 0.19, hp: 0.1, tail: 0.9 },
  sit: { by: 0.21, bp: -0.85, hp: 0.85, fl: 0.85, hl: -1.55, eyes: 1, legS: 1, tail: -0.1, curl: 0.25 },
  watch: { by: 0.21, bp: -0.85, hp: 0.85, fl: 0.85, hl: -1.55, eyes: 1, legS: 1, tail: -0.1, curl: 0.1 },
  groom: { by: 0.21, bp: -0.85, hp: 1.25, fl: 0.85, hl: -1.55, eyes: 0.5, legS: 1, tail: -0.1, curl: 0.4 },
  pet: { by: 0.21, bp: -0.85, hp: 0.75, fl: 0.85, hl: -1.55, eyes: 0.08, legS: 1, tail: 0.2, curl: 0.2 },
  sleep: { by: 0.085, bp: 0, hp: 0.4, fl: -1.5, hl: -1.5, eyes: 0.05, legS: 0.35, tail: -0.2, curl: 1 },
  eat: { by: 0.18, bp: 0.35, hp: 0.9, fl: -0.1, hl: 0, eyes: 1, legS: 1, tail: 0.3, curl: 0 },
  play: { by: 0.14, bp: 0.4, hp: -0.1, fl: -0.4, hl: 0.2, eyes: 1, legS: 1, tail: 0.8, curl: 0 },
  stretch: { by: 0.2, bp: 0.55, hp: 0.25, fl: -0.95, hl: 0, eyes: 0.4, legS: 1, tail: 1.1, curl: 0 },
}

const lerp = THREE.MathUtils.lerp
const rand = (a: number, b: number) => a + Math.random() * (b - a)
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
const angleDiff = (a: number, b: number) => {
  let d = b - a
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}

/* ------------------------------------------------------------------ */
/* Komponen                                                            */
/* ------------------------------------------------------------------ */
const FUR = '#d98f4e'
const FUR_DARK = '#b86f33'
const WHITE = '#f6ecdf'

interface Goal {
  poi?: Poi
  x: number
  z: number
  y: number
  yaw: number
  then: CatActivity
}

export default function Cat({ dark, route }: { dark: boolean; route: RouteKey }) {
  const root = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const eyes = useRef<(THREE.Object3D | null)[]>([])
  const legs = useRef<(THREE.Group | null)[]>([])
  const tail = useRef<(THREE.Group | null)[]>([])
  const hearts = useRef<(THREE.Mesh | null)[]>([])

  const heartGeo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, -0.5)
    s.bezierCurveTo(-0.9, 0.1, -0.5, 0.9, 0, 0.45)
    s.bezierCurveTo(0.5, 0.9, 0.9, 0.1, 0, -0.5)
    return new THREE.ShapeGeometry(s)
  }, [])

  // keadaan hidup kucing (mutable; tidak memicu render ulang)
  const S = useRef({
    pos: new THREE.Vector3(0.9, 0, -0.6),
    yaw: 0.6,
    act: 'sit' as CatActivity,
    timer: 3,
    goal: null as Goal | null,
    poi: null as string | null,
    jump: null as null | { from: THREE.Vector3; to: THREE.Vector3; t: number; dur: number; arc: number; poiId?: string },
    pose: { ...POSE.sit } as Pose,
    phase: 0,
    speed: 0,
    walkAmp: 0,
    headYaw: 0,
    chase: null as null | 'laser' | 'ball',
    chaseUntil: 0,
    batAt: 0,
    petUntil: 0,
    eatUntil: 0,
    pendingRoute: null as RouteKey | null,
    foodHandled: false,
    path: null as [number, number][] | null,
    pathAt: 0,
    faceYaw: undefined as number | undefined,
    hearts: [] as { life: number; x: number; y: number; z: number }[],
    lastStatus: 'sit' as CatActivity,
    nextMeow: 8,
    dark,
  })

  useEffect(() => {
    S.current.dark = dark
  }, [dark])
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('follow')) patchCatUi({ follow: true })
  }, [])
  useEffect(() => {
    S.current.pendingRoute = route
  }, [route])

  /* --- pembantu perilaku ------------------------------------------- */
  const setAct = (act: CatActivity, dur?: number) => {
    const s = S.current
    s.act = act
    const d = DUR[act]
    s.timer = dur ?? rand(d[0], d[1])
    if (s.lastStatus !== act) {
      s.lastStatus = act
      patchCatUi({ activity: act })
    }
  }

  const goToPoi = (poi: Poi, then?: CatActivity) => {
    const s = S.current
    s.chase = null
    s.path = null
    s.goal = { poi, x: poi.p[0], z: poi.p[2], y: poi.p[1], yaw: poi.yaw, then: then ?? pick(poi.acts) }
    setAct('walk', 999)
  }

  const goToPoint = (x: number, z: number, then: CatActivity, yaw?: number) => {
    const s = S.current
    s.chase = null
    s.path = null
    s.goal = { x, z, y: 0, yaw: yaw ?? s.yaw, then }
    setAct('walk', 999)
  }

  const decide = () => {
    const s = S.current
    const ui = getCatUi()
    if (ui.food) {
      goToPoint(BOWL_AT[0] + 0.32, BOWL_AT[1], 'eat', -Math.PI / 2)
      return
    }
    const night = s.dark
    const r = Math.random()
    // main benang
    if (r < 0.16 && !night) {
      s.chase = 'ball'
      s.chaseUntil = performance.now() / 1000 + 12
      s.goal = null
      setAct('chase', 999)
      return
    }
    // malam hari lebih suka tidur di tempat nyaman
    const pool = POIS.filter((p) => (night ? ['chair', 'tree', 'rug', 'sun', 'desk'].includes(p.id) : true))
    let poi = pick(pool)
    if (poi.id === s.poi) poi = pick(pool)
    const sleepy = night ? 0.55 : 0.2
    goToPoi(poi, Math.random() < sleepy && poi.acts.includes('sleep') ? 'sleep' : undefined)
  }

  /**
   * Titik berikutnya menuju (tx, tz) tanpa menabrak perabot.
   * `exhausted` = jalur sudah habis (tujuan di dalam/di balik perabot, jadi
   * cukup mendekat), bukan "belum sampai".
   */
  const nextWaypoint = (tx: number, tz: number, now: number) => {
    const s = S.current
    const { pos } = s
    if (losClear(pos.x, pos.z, tx, tz)) {
      s.path = null
      return { x: tx, z: tz, exhausted: false }
    }
    if (!s.path || now - s.pathAt > 0.5) {
      s.path = findPath(pos.x, pos.z, tx, tz)
      s.pathAt = now
    }
    while (s.path && s.path.length && Math.hypot(s.path[0][0] - pos.x, s.path[0][1] - pos.z) < 0.1) s.path.shift()
    if (s.path && s.path.length) return { x: s.path[0][0], z: s.path[0][1], exhausted: false }
    return { x: tx, z: tz, exhausted: true }
  }

  /** Titik pendaratan yang aman di lantai, searah (dx, dz) dari posisi sekarang. */
  const landingSpot = (dx: number, dz: number) => {
    const { pos } = S.current
    const len = Math.hypot(dx, dz) || 1
    const x = THREE.MathUtils.clamp(pos.x + (dx / len) * 0.75, BOUNDS.x0, BOUNDS.x1)
    const z = THREE.MathUtils.clamp(pos.z + (dz / len) * 0.75, BOUNDS.z0, BOUNDS.z1)
    const [fx, fz] = nearestFree(x, z)
    return new THREE.Vector3(fx, 0, fz)
  }

  const startJump = (to: THREE.Vector3, arc: number, poiId?: string) => {
    const s = S.current
    s.jump = { from: s.pos.clone(), to, t: 0, dur: 0.55 + Math.abs(to.y - s.pos.y) * 0.25, arc, poiId }
  }

  const pet = () => {
    const s = S.current
    s.goal = null
    s.chase = null
    s.petUntil = performance.now() / 1000 + 4
    setAct('pet', 4)
    meow(0.9 + Math.random() * 0.3)
    purr(2.2)
    for (let i = 0; i < 4; i++) {
      s.hearts.push({ life: -i * 0.18, x: rand(-0.08, 0.08), y: 0.5, z: rand(-0.05, 0.05) })
    }
  }

  const onPet = (e: ThreeEvent<MouseEvent>) => {
    const t = e.nativeEvent.target as HTMLElement | null
    if (isUiTarget(t)) return
    e.stopPropagation()
    pet()
  }

  /* --- loop utama ---------------------------------------------------- */
  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const s = S.current
    const now = performance.now() / 1000
    const ui = getCatUi()
    const { pos } = s

    // reaksi terhadap perpindahan halaman
    if (s.pendingRoute && !s.jump && now > s.petUntil) {
      const id = ROUTE_POI[s.pendingRoute]
      s.pendingRoute = null
      const poi = POIS.find((p) => p.id === id)
      if (poi && !ui.laser && s.poi !== poi.id) goToPoi(poi, poi.id === 'chair' ? 'sleep' : 'watch')
    }

    // makanan baru → langsung menuju mangkuk
    if (!ui.food) s.foodHandled = false
    else if (!s.foodHandled && !s.jump && now > s.petUntil && s.act !== 'eat') {
      s.foodHandled = true
      goToPoint(BOWL_AT[0] + 0.32, BOWL_AT[1], 'eat', -Math.PI / 2)
      meow(1.05)
    }

    // panggilan dari klik lantai
    if (catCtl.call && !s.jump && now > s.petUntil) {
      const c = catCtl.call
      catCtl.call = null
      if (!ui.laser) {
        goToPoint(THREE.MathUtils.clamp(c.x, BOUNDS.x0, BOUNDS.x1), THREE.MathUtils.clamp(c.z, BOUNDS.z0, BOUNDS.z1), 'sit')
        meow(1.1)
      }
    }

    // laser menang atas segalanya
    if (ui.laser && dot.valid && s.chase !== 'laser' && now > s.petUntil) {
      s.chase = 'laser'
      s.goal = null
      setAct('chase', 999)
    }
    if (!ui.laser && s.chase === 'laser') {
      s.chase = null
      setAct('sit', 2)
    }
    // dorongan bola dari tombol/ klik
    if (catCtl.kick > 0 && !s.jump && !ui.laser) {
      catCtl.kick = 0
      s.chase = 'ball'
      s.chaseUntil = now + 12
      s.goal = null
      setAct('chase', 999)
    }

    /* ---- lompatan ---- */
    if (s.jump) {
      const j = s.jump
      j.t += dt / j.dur
      const u = Math.min(1, j.t)
      pos.lerpVectors(j.from, j.to, u)
      pos.y = lerp(j.from.y, j.to.y, u) + Math.sin(Math.PI * u) * j.arc
      const dx = j.to.x - j.from.x
      const dz = j.to.z - j.from.z
      if (Math.hypot(dx, dz) > 0.05) s.yaw += angleDiff(s.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 12)
      if (u >= 1) {
        pos.copy(j.to)
        s.jump = null
        // penting: tanpa ini kucing menyangka belum sampai, lalu melompat turun lagi
        if (j.poiId) s.poi = j.poiId
      }
    } else if (s.chase) {
      /* ---- mengejar laser / bola ---- */
      const tx = s.chase === 'laser' ? dot.x : ball.x
      const tz = s.chase === 'laser' ? dot.z : ball.z
      if (s.chase === 'ball' && now > s.chaseUntil) {
        s.chase = null
        setAct('sit', 3)
      } else if (pos.y > 0.3) {
        // turun dulu ke lantai
        startJump(landingSpot(tx - pos.x, tz - pos.z), 0.15)
        s.poi = null
      } else {
        const dx = tx - pos.x
        const dz = tz - pos.z
        const dist = Math.hypot(dx, dz)
        const wp = nextWaypoint(tx, tz, now)
        const want = Math.atan2(wp.x - pos.x, wp.z - pos.z)
        s.yaw += angleDiff(s.yaw, want) * Math.min(1, dt * 10)
        // bila target di balik/di dalam perabot, cukup mendekat lalu bermain
        const near = wp.exhausted ? 0.6 : s.chase === 'laser' ? 0.3 : 0.2
        if (dist > near) {
          const sp = dist > 0.7 ? 2.0 : 1.0
          s.speed = lerp(s.speed, sp, Math.min(1, dt * 8))
          pos.x += Math.sin(s.yaw) * s.speed * dt
          pos.z += Math.cos(s.yaw) * s.speed * dt
          if (s.act !== 'chase') setAct('chase', 999)
        } else {
          s.speed = lerp(s.speed, 0, Math.min(1, dt * 10))
          if (s.act !== 'play') setAct('play', 999)
          if (s.chase === 'ball' && now > s.batAt) {
            s.batAt = now + 0.9
            const a = s.yaw + rand(-0.6, 0.6)
            ball.vx = Math.sin(a) * rand(1.6, 2.6)
            ball.vz = Math.cos(a) * rand(1.6, 2.6)
          }
        }
      }
    } else if (s.goal) {
      /* ---- berjalan ke tujuan ---- */
      const g = s.goal
      const elevatedGoal = g.y > 0.3
      if (pos.y > 0.3 && !(elevatedGoal && s.poi === g.poi?.id)) {
        // sedang di tempat tinggi → turun dulu ke arah tujuan
        let dx = g.x - pos.x
        let dz = g.z - pos.z
        if (dx * dx + dz * dz < 0.01) {
          dx = Math.sin(s.yaw)
          dz = Math.cos(s.yaw)
        }
        startJump(landingSpot(dx, dz), 0.18)
        s.poi = null
      } else {
        const tx = elevatedGoal && pos.y < 0.3 ? g.poi?.launch?.[0] ?? g.x : g.x
        const tz = elevatedGoal && pos.y < 0.3 ? g.poi?.launch?.[1] ?? g.z : g.z
        const dx = tx - pos.x
        const dz = tz - pos.z
        const dist = Math.hypot(dx, dz)
        const wp = nextWaypoint(tx, tz, now)
        const arrived = dist <= 0.07 || (wp.exhausted && dist < 0.45)
        if (!arrived) {
          const want = Math.atan2(wp.x - pos.x, wp.z - pos.z)
          s.yaw += angleDiff(s.yaw, want) * Math.min(1, dt * 7)
          const sp = Math.abs(angleDiff(s.yaw, want)) > 1.0 ? 0.15 : 0.85
          s.speed = lerp(s.speed, sp, Math.min(1, dt * 6))
          pos.x += Math.sin(s.yaw) * s.speed * dt
          pos.z += Math.cos(s.yaw) * s.speed * dt
        } else if (elevatedGoal && pos.y < 0.3) {
          startJump(new THREE.Vector3(g.x, g.y, g.z), Math.max(0.3, g.y * 0.5), g.poi?.id)
        } else {
          // sampai
          s.speed = 0
          s.goal = null
          s.poi = g.poi?.id ?? null
          pos.y = g.y
          setAct(g.then)
          if (g.then === 'eat') s.eatUntil = now + 4.5
          s.timer = g.then === 'eat' ? 4.5 : s.timer
          s.headYaw = 0
          s.faceYaw = g.yaw
          if (Math.random() < 0.35) meow(rand(0.9, 1.2))
        }
      }
    } else {
      /* ---- diam: menjalankan aktivitas hingga timer habis ---- */
      s.speed = lerp(s.speed, 0, Math.min(1, dt * 8))
      const face = s.faceYaw
      if (face !== undefined) s.yaw += angleDiff(s.yaw, face) * Math.min(1, dt * 4)
      s.timer -= dt
      if (s.act === 'eat' && now > s.eatUntil && getCatUi().food) {
        patchCatUi({ food: false })
        s.hearts.push({ life: 0, x: 0, y: 0.5, z: 0 }, { life: -0.2, x: 0.05, y: 0.5, z: 0 })
        meow(1.15)
      }
      if (s.timer <= 0) {
        s.faceYaw = undefined
        decide()
      }
      // sesekali mengeong sendiri saat bosan
      s.nextMeow -= dt
      if (s.nextMeow <= 0) {
        s.nextMeow = rand(25, 55)
        if (s.act !== 'sleep' && Math.random() < 0.5) meow(rand(0.85, 1.2))
      }
    }

    // tidak menembus perabot / dinding saat di lantai
    if (pos.y < 0.3 && !s.jump) {
      for (const [x0, x1, z0, z1] of RECTS) {
        const m = 0.12
        if (pos.x > x0 - m && pos.x < x1 + m && pos.z > z0 - m && pos.z < z1 + m) {
          const dl = pos.x - (x0 - m)
          const dr = x1 + m - pos.x
          const dtp = pos.z - (z0 - m)
          const db = z1 + m - pos.z
          const mn = Math.min(dl, dr, dtp, db)
          if (mn === dl) pos.x = x0 - m
          else if (mn === dr) pos.x = x1 + m
          else if (mn === dtp) pos.z = z0 - m
          else pos.z = z1 + m
        }
      }
      for (const [cx, cz, r] of CIRCLES) {
        const dx = pos.x - cx
        const dz = pos.z - cz
        const d = Math.hypot(dx, dz)
        if (d < r && d > 0.001) {
          pos.x = cx + (dx / d) * r
          pos.z = cz + (dz / d) * r
        }
      }
      pos.x = THREE.MathUtils.clamp(pos.x, BOUNDS.x0, BOUNDS.x1)
      pos.z = THREE.MathUtils.clamp(pos.z, BOUNDS.z0, BOUNDS.z1)
    }

    /* ---- pose ---- */
    const tgt = POSE[s.act]
    const k = Math.min(1, dt * 9)
    const p = s.pose
    ;(Object.keys(tgt) as (keyof Pose)[]).forEach((key) => (p[key] = lerp(p[key], tgt[key], k)))
    s.walkAmp = lerp(s.walkAmp, s.speed > 0.1 ? Math.min(1, s.speed / 0.8) : 0, Math.min(1, dt * 10))
    s.phase += dt * (s.speed > 1.4 ? 16 : 9) * Math.min(1.4, s.speed / 0.7 + 0.2) * (s.walkAmp > 0.05 ? 1 : 0)
    const t = state.clock.elapsedTime

    // kepala mengikuti kursor saat duduk/menonton
    let lookTarget = 0
    if (['sit', 'watch', 'groom', 'pet'].includes(s.act) && dot.valid) {
      lookTarget = THREE.MathUtils.clamp(angleDiff(s.yaw, Math.atan2(dot.x - pos.x, dot.z - pos.z)), -0.9, 0.9)
    }
    s.headYaw = lerp(s.headYaw, lookTarget, Math.min(1, dt * 5))

    const purring = s.act === 'pet' ? Math.sin(t * 55) * 0.004 : 0
    const breathe = 1 + Math.sin(t * (s.act === 'sleep' ? 1.6 : 2.4)) * (s.act === 'sleep' ? 0.04 : 0.015)
    const wiggle = s.act === 'play' ? Math.sin(t * 22) * 0.12 : 0

    catPos.x = pos.x
    catPos.y = pos.y
    catPos.z = pos.z
    catPos.yaw = s.yaw
    if (root.current) {
      root.current.position.set(pos.x, pos.y, pos.z)
      root.current.rotation.y = s.yaw + wiggle
    }
    if (body.current) {
      body.current.position.set(purring, p.by + Math.abs(Math.sin(s.phase)) * 0.012 * s.walkAmp, 0)
      body.current.rotation.x = p.bp
      body.current.scale.set(1, breathe, 1)
    }
    if (head.current) {
      let hp = p.hp
      if (s.act === 'groom') hp += Math.sin(t * 7) * 0.25
      if (s.act === 'eat') hp += Math.sin(t * 9) * 0.12
      head.current.rotation.x = hp
      head.current.rotation.y = s.headYaw + (s.act === 'watch' ? Math.sin(t * 0.7) * 0.12 : 0)
    }
    eyes.current.forEach((e) => {
      if (e) e.scale.y = Math.max(0.08, p.eyes) * (Math.sin(t * 0.9 + 1) > 0.985 ? 0.1 : 1)
    })

    // kaki: FL, FR, HL, HR
    const sw = Math.sin(s.phase) * 0.7 * s.walkAmp
    const sw2 = Math.sin(s.phase + Math.PI) * 0.7 * s.walkAmp
    const L = legs.current
    if (L[0]) L[0].rotation.x = p.fl + sw
    if (L[1]) L[1].rotation.x = p.fl + sw2
    if (L[2]) L[2].rotation.x = p.hl + sw2
    if (L[3]) L[3].rotation.x = p.hl + sw
    L.forEach((l) => l?.scale.set(1, p.legS, 1))

    // ekor: ruas-ruas bergelombang + melingkar saat tidur
    tail.current.forEach((seg, i) => {
      if (!seg) return
      const wave = Math.sin(t * (s.act === 'chase' ? 6 : 1.7) + i * 0.7) * (0.12 + i * 0.05)
      seg.rotation.y = wave + p.curl * 0.4
      seg.rotation.x = i === 0 ? 0.1 + p.tail * 0.5 : 0.07 * p.tail + 0.04
    })

    // hati
    s.hearts = s.hearts.filter((h) => h.life < 1.4)
    for (let i = 0; i < 6; i++) {
      const m = hearts.current[i]
      const h = s.hearts[i]
      if (!m) continue
      if (!h) {
        m.visible = false
        continue
      }
      h.life += dt
      if (h.life < 0) {
        m.visible = false
        continue
      }
      m.visible = true
      m.position.set(pos.x + h.x, pos.y + h.y + h.life * 0.45, pos.z + h.z)
      const sc = 0.07 * Math.min(1, h.life * 6) * (1 - Math.max(0, h.life - 1) / 0.4)
      m.scale.setScalar(Math.max(0.0001, sc))
      m.rotation.z = Math.sin(h.life * 5) * 0.2
    }
  })

  /* --- model ---------------------------------------------------------- */
  const fur = useMemo(() => makeFur(), [])
  const M = useMemo(() => {
    const sheen = { sheen: 1, sheenColor: new THREE.Color('#ffd9b0'), sheenRoughness: 0.55 }
    return {
      body: new THREE.MeshPhysicalMaterial({ map: fur, roughness: 0.92, ...sheen }),
      orange: new THREE.MeshPhysicalMaterial({ color: '#e39a52', roughness: 0.92, ...sheen }),
      dark: new THREE.MeshPhysicalMaterial({ color: '#a8561a', roughness: 0.95, ...sheen }),
      white: new THREE.MeshPhysicalMaterial({ color: '#fff4e4', roughness: 0.92, ...sheen }),
      pink: new THREE.MeshStandardMaterial({ color: '#f2a1ad', roughness: 0.6 }),
      iris: new THREE.MeshStandardMaterial({ color: '#8fd14f', roughness: 0.25, emissive: '#3c7a12', emissiveIntensity: 0.25 }),
      pupil: new THREE.MeshBasicMaterial({ color: '#0d0907' }),
      shine: new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }),
      whisker: new THREE.MeshBasicMaterial({ color: '#fffaf0' }),
    }
  }, [fur])

  const legPos: [number, number, number][] = [
    [0.065, -0.03, 0.15],
    [-0.065, -0.03, 0.15],
    [0.07, -0.03, -0.15],
    [-0.07, -0.03, -0.15],
  ]

  return (
    <>
      <group ref={root} scale={1.25}>
        {/* area ketuk untuk mengelus */}
        <mesh
          position={[0, 0.2, 0]}
          onClick={onPet}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = '')}
        >
          <sphereGeometry args={[0.32, 10, 10]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        <group ref={body}>
          {/* badan: bola lonjong, kutub di sumbu panjang agar belang melintang */}
          <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} scale={[0.122, 0.235, 0.115]} material={M.body}>
            <sphereGeometry args={[1, 40, 28]} />
          </mesh>
          {/* dada putih */}
          <mesh position={[0, -0.025, 0.17]} scale={[0.085, 0.09, 0.085]} material={M.white}>
            <sphereGeometry args={[1, 24, 18]} />
          </mesh>
          {/* paha belakang */}
          {[-1, 1].map((sx) => (
            <mesh key={sx} castShadow position={[sx * 0.078, -0.005, -0.12]} scale={[0.07, 0.1, 0.105]} material={M.orange}>
              <sphereGeometry args={[1, 24, 18]} />
            </mesh>
          ))}

          {/* kepala */}
          <group ref={head} position={[0, 0.11, 0.265]}>
            <mesh castShadow scale={[0.098, 0.084, 0.09]} material={M.orange}>
              <sphereGeometry args={[1, 32, 24]} />
            </mesh>
            {/* pipi */}
            {[-1, 1].map((sx) => (
              <mesh key={sx} position={[sx * 0.055, -0.026, 0.04]} scale={[0.04, 0.034, 0.04]} material={M.orange}>
                <sphereGeometry args={[1, 18, 14]} />
              </mesh>
            ))}
            {/* moncong putih */}
            <mesh position={[0, -0.034, 0.075]} scale={[0.05, 0.034, 0.038]} material={M.white}>
              <sphereGeometry args={[1, 20, 16]} />
            </mesh>
            {/* hidung & mulut */}
            <mesh position={[0, -0.016, 0.108]} scale={[0.014, 0.01, 0.01]} material={M.pink}>
              <sphereGeometry args={[1, 12, 10]} />
            </mesh>
            <mesh position={[0, -0.034, 0.108]} material={M.pupil}>
              <boxGeometry args={[0.003, 0.02, 0.003]} />
            </mesh>
            {[-1, 1].map((sx) => (
              <mesh key={sx} position={[sx * 0.012, -0.043, 0.104]} rotation={[0, 0, sx * 0.9]} material={M.pupil}>
                <boxGeometry args={[0.003, 0.02, 0.003]} />
              </mesh>
            ))}
            {/* belang dahi */}
            {[-0.022, 0, 0.022].map((x, i) => (
              <mesh key={x} position={[x, 0.062, 0.04]} rotation={[0.5, 0, (i - 1) * 0.18]} scale={[0.005, 0.021, 0.005]} material={M.dark}>
                <sphereGeometry args={[1, 8, 6]} />
              </mesh>
            ))}

            {/* telinga */}
            {[-1, 1].map((sx) => (
              <group key={sx} position={[sx * 0.06, 0.078, -0.01]} rotation={[-0.15, sx * 0.22, -sx * 0.3]}>
                <mesh castShadow scale={[1, 1, 0.45]} material={M.orange}>
                  <coneGeometry args={[0.05, 0.12, 3]} />
                </mesh>
                <mesh position={[0, -0.008, 0.014]} scale={[0.62, 0.7, 0.4]} material={M.pink}>
                  <coneGeometry args={[0.05, 0.12, 3]} />
                </mesh>
              </group>
            ))}

            {/* mata */}
            {[-1, 1].map((sx, i) => (
              <group
                key={sx}
                ref={(el) => {
                  eyes.current[i] = el
                }}
                position={[sx * 0.04, 0.014, 0.072]}
                rotation={[0, sx * 0.4, 0]}
              >
                <mesh scale={[0.024, 0.028, 0.013]} material={M.iris}>
                  <sphereGeometry args={[1, 20, 16]} />
                </mesh>
                <mesh position={[0, 0, 0.01]} scale={[0.007, 0.023, 0.005]} material={M.pupil}>
                  <sphereGeometry args={[1, 12, 10]} />
                </mesh>
                <mesh position={[0.007, 0.009, 0.013]} scale={[0.0055, 0.0055, 0.0035]} material={M.shine}>
                  <sphereGeometry args={[1, 8, 6]} />
                </mesh>
              </group>
            ))}

            {/* kumis */}
            {[-1, 1].map((sx) =>
              [0.012, 0, -0.012].map((y, k) => (
                <mesh
                  key={`${sx}${k}`}
                  position={[sx * 0.075, -0.03 + y, 0.075]}
                  rotation={[0, sx * (0.35 + k * 0.1), sx * (0.15 - k * 0.12)]}
                  material={M.whisker}
                >
                  <boxGeometry args={[0.065, 0.0012, 0.0012]} />
                </mesh>
              )),
            )}
          </group>

          {/* ekor: 6 ruas meruncing dengan cincin */}
          <group position={[0, 0.03, -0.285]}>
            <TailSeg i={0} refs={tail} mats={[M.orange, M.dark]} />
          </group>

          {/* kaki */}
          {legPos.map((lp, i) => (
            <group
              key={i}
              position={lp}
              ref={(el) => {
                legs.current[i] = el
              }}
            >
              <mesh position={[0, -0.07, 0]} castShadow material={i < 2 ? M.orange : M.orange}>
                <cylinderGeometry args={[0.032, 0.024, 0.15, 14]} />
              </mesh>
              <mesh position={[0, -0.152, 0.014]} scale={[0.034, 0.024, 0.048]} castShadow material={M.white}>
                <sphereGeometry args={[1, 14, 12]} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* hati saat dielus */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Billboard key={i}>
          <mesh
            ref={(el) => {
              hearts.current[i] = el
            }}
            geometry={heartGeo}
            visible={false}
          >
            <meshBasicMaterial color="#ff5b7f" toneMapped={false} depthTest={false} transparent />
          </mesh>
        </Billboard>
      ))}
    </>
  )
}

/** Satu ruas ekor; ruas berikutnya bersarang di dalamnya. */
const TAIL_SEGS = 5
function TailSeg({
  i,
  refs,
  mats,
}: {
  i: number
  refs: React.MutableRefObject<(THREE.Group | null)[]>
  mats: THREE.Material[]
}) {
  const r = 0.025 - i * 0.0026
  const ring = i % 2 === 1 || i === TAIL_SEGS - 1
  return (
    <group
      ref={(el) => {
        refs.current[i] = el
      }}
      position={i === 0 ? [0, 0, 0] : [0, 0, -0.055]}
    >
      <mesh position={[0, 0, -0.027]} rotation={[Math.PI / 2, 0, 0]} castShadow material={ring ? mats[1] : mats[0]}>
        <capsuleGeometry args={[r, 0.045, 6, 12]} />
      </mesh>
      {i < TAIL_SEGS - 1 && <TailSeg i={i + 1} refs={refs} mats={mats} />}
    </group>
  )
}
