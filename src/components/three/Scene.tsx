'use client'

import { isUiTarget } from '@/lib/ui'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor, RoundedBox, Sparkles, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { crackEgg, resetEgg, useCracks, CRACKS_TO_HATCH } from '@/lib/egg'
import { playSfx } from '@/lib/settings'
import { makeCode, makePaper, makeRug, makeSky, makeWood } from './textures'
import { catCtl, catPos, getCatUi } from '@/lib/cat'
import { useSceneLink } from '@/lib/sceneLink'
import Cat from './Cat'
import { Bowl, CatTree, LaserDot, YarnBall } from './Toys'

/* ------------------------------------------------------------------ */
/* Kamera per halaman                                                  */
/* ------------------------------------------------------------------ */
export type RouteKey = '/' | '/about' | '/education' | '/project' | '/resume' | '/contact'

type V3 = [number, number, number]
const CAM: Record<RouteKey, { pos: V3; look: V3 }> = {
  '/': { pos: [2.6, 1.8, 2.2], look: [-0.1, 1.0, -3.0] }, // seluruh meja
  '/about': { pos: [-0.9, 1.55, -0.1], look: [-4.8, 1.45, -1.4] }, // rak buku & foto
  '/education': { pos: [3.0, 1.75, 0.3], look: [3.3, 1.75, -4] }, // sertifikat di dinding
  '/project': { pos: [0.15, 1.35, -0.8], look: [0, 1.15, -3.4] }, // monitor
  '/resume': { pos: [1.7, 1.6, -1.1], look: [1.1, 0.85, -3.0] }, // kertas CV di meja
  '/contact': { pos: [2.0, 1.45, -0.2], look: [5, 1.2, -1.0] }, // jendela & telepon
}

const UP = new THREE.Vector3(0, 1, 0)

function CameraRig({ route }: { route: RouteKey }) {
  const look = useRef(new THREE.Vector3(...CAM['/'].look))
  const posT = useMemo(() => new THREE.Vector3(), [])
  const lookT = useMemo(() => new THREE.Vector3(), [])
  const fwd = useMemo(() => new THREE.Vector3(), [])
  const right = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    const { camera, pointer, size } = state
    const c = CAM[route]
    const mobile = size.width < 1024 // tablet & HP: konten di bawah, ruangan di atas
    const aspect = size.width / size.height

    posT.set(...c.pos)
    lookT.set(...c.look)
    fwd.copy(lookT).sub(posT)
    const dist = fwd.length()
    fwd.normalize()
    right.copy(fwd).cross(UP).normalize()

    // layar sempit → mundur sedikit agar objek tetap muat
    const fit = THREE.MathUtils.clamp(1.7 / aspect, 1, 2)
    posT.addScaledVector(fwd, -(fit - 1) * 2.2)

    // geser kamera ke samping supaya objek muncul di sisi kanan (teks di kiri)
    const halfW = Math.tan(THREE.MathUtils.degToRad(20)) * dist * aspect
    const wide = route === '/education' || route === '/contact' ? 0.5 : 0.38 // halaman dengan kartu lebar di kiri
    const shift = mobile ? 0 : halfW * wide
    posT.addScaledVector(right, -shift)
    lookT.addScaledVector(right, -shift)
    if (mobile) lookT.y -= 0.7

    // mode ikuti: kamera menyorot kucing dari dekat
    if (getCatUi().follow) {
      // dari depan-samping agar wajah terlihat
      const a = catPos.yaw + 0.55
      posT.set(catPos.x + Math.sin(a) * 1.9, catPos.y + 0.62, catPos.z + Math.cos(a) * 1.9)
      lookT.set(catPos.x, catPos.y + (mobile ? 0.1 : 0.3), catPos.z)
    }

    // parallax kursor + dolly scroll yang halus
    const scroll = typeof window !== 'undefined' ? Math.min(window.scrollY, 1400) : 0
    posT.addScaledVector(right, pointer.x * 0.14)
    posT.y += pointer.y * 0.06 - scroll * 0.0006

    const k = 1 - Math.exp(-dt * 2.2)
    camera.position.lerp(posT, k)
    look.current.lerp(lookT, k)
    camera.lookAt(look.current)
  })
  return null
}

/* ------------------------------------------------------------------ */
/* Helper bentuk                                                       */
/* ------------------------------------------------------------------ */
type BoxProps = {
  at: V3
  size: V3
  color?: string
  rough?: number
  metal?: number
  rot?: V3
  emissive?: string
  ei?: number
  cast?: boolean
  receive?: boolean
}

function Box({ at, size, color = '#ccc', rough = 0.7, metal = 0, rot, emissive, ei = 0, cast = true, receive = true }: BoxProps) {
  return (
    <mesh position={at} rotation={rot} castShadow={cast} receiveShadow={receive}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} emissive={emissive ?? '#000'} emissiveIntensity={ei} />
    </mesh>
  )
}

function Cyl({
  at,
  r,
  h,
  color = '#ccc',
  rough = 0.7,
  metal = 0,
  rot,
  seg = 20,
  r2,
}: {
  at: V3
  r: number
  h: number
  color?: string
  rough?: number
  metal?: number
  rot?: V3
  seg?: number
  r2?: number
}) {
  return (
    <mesh position={at} rotation={rot} castShadow receiveShadow>
      <cylinderGeometry args={[r2 ?? r, r, h, seg]} />
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/* Cangkang ruangan                                                    */
/* ------------------------------------------------------------------ */
const PAINT = '#e8ddca'
const SAGE = '#8fa88b'

function Shell({ dark, onToggleTheme }: { dark: boolean; onToggleTheme: () => void }) {
  const wood = useMemo(() => {
    const t = makeWood()
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(1, 0.8)
    return t
  }, [])
  const rug = useMemo(() => makeRug(), [])
  const sky = useMemo(() => makeSky(dark), [dark])

  const wall = (at: V3, size: V3, color = PAINT) => <Box at={at} size={size} color={color} rough={0.95} />

  return (
    <group>
      {/* lantai */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10.2, 8.2]} />
        <meshStandardMaterial map={wood} roughness={0.5} metalness={0.02} />
      </mesh>
      {/* karpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.1, 0.012, -2]} receiveShadow>
        <planeGeometry args={[3.6, 2.4]} />
        <meshStandardMaterial map={rug} roughness={1} />
      </mesh>

      {/* dinding belakang (hijau sage) */}
      {wall([0, 1.8, -4.1], [10.4, 3.6, 0.2], SAGE)}
      {/* dinding kiri */}
      {wall([-5.1, 1.8, 0], [0.2, 3.6, 8.2])}
      {/* dinding kanan: berlubang untuk jendela (z -2.2..0.4, y 0.9..2.9) */}
      {wall([5.1, 0.45, 0], [0.2, 0.9, 8.2])}
      {wall([5.1, 3.25, 0], [0.2, 0.7, 8.2])}
      {wall([5.1, 1.9, -3.1], [0.2, 2, 1.8])}
      {wall([5.1, 1.9, 2.2], [0.2, 2, 3.6])}
      {/* langit-langit */}
      <Box at={[0, 3.7, 0]} size={[10.4, 0.2, 8.2]} color="#f4efe6" rough={1} />

      {/* plint */}
      <Box at={[0, 0.07, -3.97]} size={[10, 0.14, 0.06]} color="#f6f1e8" />
      <Box at={[-4.97, 0.07, 0]} size={[0.06, 0.14, 8]} color="#f6f1e8" />
      <Box at={[4.97, 0.07, 2.2]} size={[0.06, 0.14, 3.6]} color="#f6f1e8" />
      <Box at={[4.97, 0.07, -3.1]} size={[0.06, 0.14, 1.8]} color="#f6f1e8" />

      {/* jendela: langit di luar, bingkai, kaca */}
      <mesh position={[8, 1.9, -0.9]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshBasicMaterial map={sky} toneMapped={false} />
      </mesh>
      <Box at={[4.98, 0.9, -0.9]} size={[0.16, 0.08, 2.7]} color="#fbf8f2" />
      <Box at={[4.98, 2.9, -0.9]} size={[0.1, 0.1, 2.7]} color="#fbf8f2" />
      <Box at={[4.98, 1.9, -2.2]} size={[0.1, 2, 0.08]} color="#fbf8f2" />
      <Box at={[4.98, 1.9, 0.4]} size={[0.1, 2, 0.08]} color="#fbf8f2" />
      <Box at={[4.98, 1.9, -0.9]} size={[0.07, 2, 0.05]} color="#fbf8f2" />
      <Box at={[4.98, 1.9, -0.9]} size={[0.07, 0.05, 2.6]} color="#fbf8f2" />
      <mesh
        position={[4.99, 1.9, -0.9]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={(e) => {
          if (isUiTarget(e.nativeEvent.target)) return
          e.stopPropagation()
          onToggleTheme()
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        <planeGeometry args={[2.6, 2]} />
        <meshPhysicalMaterial color="#cfe6f5" transparent opacity={0.1} roughness={0.05} transmission={0} />
      </mesh>

      {/* tirai */}
      {[-2.5, 0.7].map((z, i) => (
        <group key={i} position={[4.82, 0, z]}>
          {[0, 1, 2].map((k) => (
            <Box
              key={k}
              at={[0, 1.75, (i ? k : -k) * 0.11]}
              size={[0.07, 3.1, 0.1]}
              color="#f2e7d3"
              rough={1}
              rot={[0, 0, (k - 1) * 0.02]}
            />
          ))}
        </group>
      ))}
      <Cyl at={[4.8, 3.3, -0.9]} r={0.02} h={3.8} rot={[Math.PI / 2, 0, 0]} color="#3a3a3a" metal={0.6} rough={0.4} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Meja kerja                                                          */
/* ------------------------------------------------------------------ */
function Desk() {
  return (
    <group>
      <RoundedBox args={[2.7, 0.06, 1.15]} radius={0.015} smoothness={3} position={[0, 0.77, -3.2]} castShadow receiveShadow>
        <meshStandardMaterial color="#c99a68" roughness={0.55} />
      </RoundedBox>
      {[
        [-1.25, -2.72],
        [1.25, -2.72],
        [-1.25, -3.65],
        [1.25, -3.65],
      ].map(([x, z], i) => (
        <Box key={i} at={[x, 0.37, z]} size={[0.05, 0.74, 0.05]} color="#23252b" metal={0.7} rough={0.35} />
      ))}
      <Box at={[0, 0.7, -3.66]} size={[2.45, 0.1, 0.03]} color="#23252b" metal={0.6} rough={0.4} />
      {/* laci */}
      <Box at={[0.85, 0.55, -3.2]} size={[0.7, 0.35, 0.95]} color="#b88b5c" rough={0.6} />
      <Box at={[0.85, 0.55, -2.71]} size={[0.62, 0.28, 0.02]} color="#caa073" rough={0.5} />
      <Cyl at={[0.85, 0.55, -2.69]} r={0.015} h={0.06} rot={[Math.PI / 2, 0, 0]} color="#d9d9d9" metal={0.9} rough={0.2} />
    </group>
  )
}

/** Satu monitor; layar menampilkan tekstur (atau slideshow bila `maps` > 1). */
function Monitor({
  at,
  w,
  h,
  rotY = 0,
  maps,
  glow,
  forced,
}: {
  at: V3
  w: number
  h: number
  rotY?: number
  maps: THREE.Texture[]
  glow: boolean
  forced?: THREE.Texture | null
}) {
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const idx = useRef(0)
  const last = useRef(0)

  useFrame(({ clock }) => {
    if (!mat.current) return
    if (forced) {
      if (mat.current.map !== forced) {
        mat.current.map = forced
        mat.current.needsUpdate = true
      }
      last.current = clock.elapsedTime
      return
    }
    if (maps.length < 2) return
    if (mat.current.map !== maps[idx.current]) {
      mat.current.map = maps[idx.current]
      mat.current.needsUpdate = true
    }
    if (clock.elapsedTime - last.current > 3.6) {
      last.current = clock.elapsedTime
      idx.current = (idx.current + 1) % maps.length
      mat.current.map = maps[idx.current]
      mat.current.needsUpdate = true
    }
  })

  return (
    <group position={at} rotation={[0, rotY, 0]}>
      <RoundedBox args={[w + 0.05, h + 0.05, 0.035]} radius={0.012} smoothness={3} position={[0, h / 2 + 0.25, 0]} castShadow>
        <meshStandardMaterial color="#14151a" roughness={0.35} metalness={0.5} />
      </RoundedBox>
      <mesh position={[0, h / 2 + 0.25, 0.019]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial ref={mat} map={maps[0]} toneMapped={false} />
      </mesh>
      {/* penyangga */}
      <Box at={[0, 0.13, -0.03]} size={[0.07, 0.3, 0.03]} color="#2a2c33" metal={0.7} rough={0.3} />
      <Box at={[0, 0.0, 0.02]} size={[0.38, 0.015, 0.2]} color="#2a2c33" metal={0.7} rough={0.3} />
      {glow && <pointLight position={[0, h / 2 + 0.25, 0.5]} color="#8fc3ff" intensity={1.4} distance={2.6} />}
    </group>
  )
}

function Monitors({ dark }: { dark: boolean }) {
  const shots = useTexture([
    '/project/porto.png',
    '/project/sampahku.png',
    '/project/travel.png',
    '/project/petmig.png',
    '/project/env.png',
    '/project/sd.png',
    '/project/journey.jpg',
    '/project/kenangan.jpg',
  ])
  useEffect(() => {
    shots.forEach((t) => (t.colorSpace = THREE.SRGBColorSpace))
  }, [shots])
  const code = useMemo(() => makeCode(4), [])
  const code2 = useMemo(() => makeCode(9), [])
  const { project } = useSceneLink()
  const names = ['porto.png', 'sampahku.png', 'travel.png', 'petmig.png', 'env.png', 'sd.png', 'journey.jpg', 'kenangan.jpg']
  const hovered = project ? shots[names.indexOf(project)] ?? null : null

  return (
    <group position={[0, 0.8, 0]}>
      {/* utama (slideshow proyek) */}
      <Monitor at={[0.1, 0, -3.45]} w={1.15} h={0.66} maps={shots} glow={dark} forced={hovered} />
      {/* samping kiri (kode) */}
      <Monitor at={[-0.88, 0, -3.38]} w={0.55} h={0.74} rotY={0.28} maps={[code]} glow={false} />
      {/* samping kanan (kode) */}
      <Monitor at={[1.1, 0, -3.4]} w={0.55} h={0.42} rotY={-0.3} maps={[code2]} glow={false} />
    </group>
  )
}

function Keyboard() {
  const keys = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    let i = 0
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 14; c++) {
        m.setPosition(-0.205 + c * 0.0315, 0.014, -0.063 + r * 0.03)
        keys.current?.setMatrixAt(i++, m)
      }
    }
    if (keys.current) keys.current.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <group position={[0.1, 0.8, -2.85]}>
      <RoundedBox args={[0.47, 0.02, 0.19]} radius={0.006} smoothness={2} position={[0, 0.006, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#d9d6cf" roughness={0.6} />
      </RoundedBox>
      <instancedMesh ref={keys} args={[undefined, undefined, 70]} castShadow>
        <boxGeometry args={[0.027, 0.012, 0.025]} />
        <meshStandardMaterial color="#f4f1ea" roughness={0.55} />
      </instancedMesh>
      {/* mouse & alas */}
      <Box at={[0.43, 0.004, 0.02]} size={[0.24, 0.006, 0.2]} color="#2b2f3a" rough={0.9} />
      <RoundedBox args={[0.06, 0.03, 0.1]} radius={0.015} smoothness={3} position={[0.43, 0.022, 0.02]} castShadow>
        <meshStandardMaterial color="#e8e4dc" roughness={0.4} />
      </RoundedBox>
    </group>
  )
}

function DeskLamp({ on, onToggle, enabled, shadows }: { on: boolean; onToggle: () => void; enabled: boolean; shadows: boolean }) {
  const spot = useRef<THREE.SpotLight>(null)
  const target = useRef<THREE.Object3D>(null)
  useEffect(() => {
    if (spot.current && target.current) spot.current.target = target.current
  }, [])

  const click = (e: ThreeEvent<MouseEvent>) => {
    if (!enabled) return
    const t = e.nativeEvent.target as HTMLElement | null
    if (isUiTarget(t)) return
    e.stopPropagation()
    playSfx('/sounds/coin.mp3', 0.5)
    onToggle()
  }

  return (
    <group position={[-1.18, 0.8, -3.55]} onClick={click}>
      <Cyl at={[0, 0.015, 0]} r={0.1} h={0.03} color="#1f2126" metal={0.6} rough={0.4} />
      <Cyl at={[0.02, 0.22, 0]} r={0.012} h={0.42} rot={[0, 0, -0.2]} color="#2b2d34" metal={0.8} rough={0.3} />
      <Cyl at={[0.1, 0.5, 0]} r={0.012} h={0.36} rot={[0, 0, 0.9]} color="#2b2d34" metal={0.8} rough={0.3} />
      <group position={[0.27, 0.6, 0]} rotation={[0, 0, 0.5]}>
        <mesh castShadow>
          <coneGeometry args={[0.12, 0.16, 24, 1, true]} />
          <meshStandardMaterial color="#e0a23a" roughness={0.4} metalness={0.4} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.04, 0]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color={on ? '#fff1c8' : '#b9b1a0'} toneMapped={false} />
        </mesh>
      </group>
      <spotLight
        ref={spot}
        position={[0.3, 0.6, 0]}
        angle={0.9}
        penumbra={0.8}
        intensity={on ? 7 : 0}
        distance={5}
        color="#ffd9a0"
        castShadow={shadows && on}
        shadow-mapSize={[512, 512]}
      />
      <object3D ref={target} position={[0.55, -0.4, 0.25]} />
    </group>
  )
}

function Mug() {
  return (
    <group position={[1.12, 0.8, -3.0]}>
      <Cyl at={[0, 0.055, 0]} r={0.045} h={0.11} color="#f3efe6" rough={0.25} />
      <Cyl at={[0, 0.105, 0]} r={0.038} h={0.01} color="#3a2416" rough={0.2} />
      <mesh position={[0.05, 0.055, 0]} rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[0.025, 0.007, 8, 14, Math.PI]} />
        <meshStandardMaterial color="#f3efe6" roughness={0.25} />
      </mesh>
      <Sparkles count={6} scale={[0.06, 0.25, 0.06]} position={[0, 0.25, 0]} size={2.2} speed={0.4} opacity={0.5} color="#ffffff" />
    </group>
  )
}

function Plant({ at, scale = 1, pot = '#d9d2c3' }: { at: V3; scale?: number; pot?: string }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => ({
        a: (i / 11) * Math.PI * 2,
        tilt: 0.5 + ((i * 37) % 10) / 22,
        s: 0.75 + ((i * 53) % 10) / 22,
        y: 0.34 + (i % 3) * 0.09,
        c: i % 2 ? '#3f7d46' : '#4d9150',
      })),
    [],
  )
  return (
    <group position={at} scale={scale}>
      <Cyl at={[0, 0.12, 0]} r={0.11} r2={0.14} h={0.24} color={pot} rough={0.85} />
      <Cyl at={[0, 0.245, 0]} r={0.12} h={0.02} color="#3b2a1d" rough={1} />
      {leaves.map((l, i) => (
        <group key={i} rotation={[0, l.a, 0]} position={[0, l.y, 0]}>
          <mesh position={[0.12, 0.08, 0]} rotation={[0, 0, -l.tilt]} scale={[l.s, 1, 1]} castShadow>
            <sphereGeometry args={[0.13, 10, 8]} />
            <meshStandardMaterial color={l.c} roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Clipboard() {
  const paper = useMemo(() => makePaper(), [])
  return (
    <group position={[0.98, 0.805, -2.95]} rotation={[-Math.PI / 2, 0, -0.18]}>
      <RoundedBox args={[0.3, 0.42, 0.012]} radius={0.004} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color="#8b6240" roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, -0.01, 0.0075]}>
        <planeGeometry args={[0.26, 0.36]} />
        <meshStandardMaterial map={paper} roughness={0.9} />
      </mesh>
      <Box at={[0, 0.2, 0.012]} size={[0.1, 0.03, 0.012]} color="#c9ccd2" metal={0.9} rough={0.25} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Telur di meja (permainan menetas)                                   */
/* ------------------------------------------------------------------ */
function PlushChick() {
  return (
    <group>
      <mesh castShadow position={[0, 0.5, 0]} scale={[1, 0.9, 1]}>
        <sphereGeometry args={[0.5, 18, 14]} />
        <meshStandardMaterial color="#ffd84a" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0, 1.0, 0.3]}>
        <sphereGeometry args={[0.35, 16, 12]} />
        <meshStandardMaterial color="#ffd84a" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.97, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.1, 0.22, 8]} />
        <meshStandardMaterial color="#ff9d2e" roughness={0.6} />
      </mesh>
      {[-0.13, 0.13].map((x) => (
        <mesh key={x} position={[x, 1.06, 0.55]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#1d1d1d" roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function Egg({ enabled }: { enabled: boolean }) {
  const cracks = useCracks()
  const hatched = cracks >= CRACKS_TO_HATCH
  const egg = useRef<THREE.Group>(null)
  const top = useRef<THREE.Mesh>(null)
  const chick = useRef<THREE.Group>(null)
  const kick = useRef(0)
  const pop = useRef(0)

  const ok = (e: ThreeEvent<MouseEvent>) => {
    if (!enabled) return false
    const t = e.nativeEvent.target as HTMLElement | null
    return !isUiTarget(t)
  }

  const onEgg = (e: ThreeEvent<MouseEvent>) => {
    if (!ok(e)) return
    e.stopPropagation()
    const n = crackEgg()
    kick.current = 1
    playSfx(n >= CRACKS_TO_HATCH ? '/sounds/hatch.mp3' : '/sounds/crack.mp3')
  }
  const onChick = (e: ThreeEvent<MouseEvent>) => {
    if (!ok(e)) return
    e.stopPropagation()
    resetEgg()
    pop.current = 0
  }
  const hover = (on: boolean) => {
    if (enabled) document.body.style.cursor = on ? 'pointer' : ''
  }

  useFrame(({ clock }, dt) => {
    kick.current = Math.max(0, kick.current - dt * 2.2)
    const t = clock.elapsedTime
    if (egg.current && !hatched) {
      egg.current.rotation.z = Math.sin(t * 38) * 0.2 * kick.current
      egg.current.scale.setScalar(1 + kick.current * 0.06)
    }
    if (hatched) {
      pop.current = Math.min(1, pop.current + dt * 2.5)
      if (top.current) {
        top.current.position.set(0.3 * pop.current, 0.9 + 0.4 * pop.current, 0)
        top.current.rotation.z = -0.9 * pop.current
      }
      if (chick.current) chick.current.position.y = 0.25 + Math.abs(Math.sin(t * 5)) * 0.25 * pop.current
    }
  })

  const segs: [number, number, number][] = [
    [0.0, 0.95, 0.5],
    [0.14, 0.8, 0.5],
    [-0.12, 0.65, 0.52],
    [0.1, 0.5, 0.53],
    [-0.18, 0.9, 0.46],
    [0.2, 1.05, 0.44],
    [0.0, 0.38, 0.54],
    [-0.14, 0.25, 0.52],
  ]
  const shown = Math.max(0, Math.min(segs.length, cracks - 2))

  return (
    <group position={[-0.68, 0.8, -2.86]} scale={0.17}>
      {/* cangkir telur */}
      <Cyl at={[0, 0.1, 0]} r={0.5} r2={0.38} h={0.2} color="#e9e3d6" rough={0.3} />
      {/* area ketuk yang lebih besar */}
      <mesh position={[0, 0.9, 0]} onClick={hatched ? onChick : onEgg} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <sphereGeometry args={[1.1, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {!hatched && (
        <group ref={egg} position={[0, 0.2, 0]}>
          <mesh castShadow position={[0, 0.7, 0]} scale={[1, 1.28, 1]}>
            <sphereGeometry args={[0.5, 24, 20]} />
            <meshStandardMaterial color="#f7ead3" roughness={0.45} />
          </mesh>
          {segs.slice(0, shown).map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]} rotation={[0, 0, (i % 2 ? 0.6 : -0.5)]}>
              <boxGeometry args={[0.035, 0.18, 0.03]} />
              <meshBasicMaterial color="#4b3220" />
            </mesh>
          ))}
        </group>
      )}

      {hatched && (
        <group position={[0, 0.2, 0]}>
          <mesh castShadow position={[0, 0.7, 0]} scale={[1, 1.28, 1]}>
            <sphereGeometry args={[0.5, 20, 14, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45]} />
            <meshStandardMaterial color="#f7ead3" roughness={0.45} side={THREE.DoubleSide} />
          </mesh>
          <mesh ref={top} castShadow scale={[1, 1.28, 1]}>
            <sphereGeometry args={[0.5, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
            <meshStandardMaterial color="#f7ead3" roughness={0.45} side={THREE.DoubleSide} />
          </mesh>
          <group ref={chick} position={[0, 0.25, 0]} scale={0.55}>
            <PlushChick />
          </group>
        </group>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Kursi                                                               */
/* ------------------------------------------------------------------ */
function Chair() {
  return (
    <group position={[0.12, 0, -1.95]} rotation={[0, 0.3, 0]}>
      <RoundedBox args={[0.55, 0.09, 0.52]} radius={0.04} smoothness={3} position={[0, 0.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#2f4f46" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[0.52, 0.62, 0.07]} radius={0.03} smoothness={3} position={[0, 0.88, 0.27]} rotation={[-0.08, 0, 0]} castShadow>
        <meshStandardMaterial color="#2f4f46" roughness={0.9} />
      </RoundedBox>
      <Cyl at={[0, 0.27, 0]} r={0.03} h={0.4} color="#23252b" metal={0.8} rough={0.3} />
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]}>
          <Box at={[0.19, 0.05, 0]} size={[0.38, 0.03, 0.04]} color="#23252b" metal={0.8} rough={0.3} />
          <Cyl at={[0.36, 0.03, 0]} r={0.03} h={0.04} rot={[Math.PI / 2, 0, 0]} color="#111" rough={0.6} />
        </group>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Rak buku + isinya                                                   */
/* ------------------------------------------------------------------ */
function PlushFox() {
  return (
    <group scale={0.55}>
      <mesh castShadow position={[0, 0.3, 0]} scale={[1, 0.95, 1.1]}>
        <sphereGeometry args={[0.3, 16, 12]} />
        <meshStandardMaterial color="#e9792f" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0, 0.7, 0.04]}>
        <sphereGeometry args={[0.26, 16, 12]} />
        <meshStandardMaterial color="#e9792f" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.64, 0.27]} scale={[1, 0.8, 1]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshStandardMaterial color="#fff5e8" roughness={0.95} />
      </mesh>
      {[-0.14, 0.14].map((x) => (
        <mesh key={x} position={[x, 0.95, 0]}>
          <coneGeometry args={[0.08, 0.2, 4]} />
          <meshStandardMaterial color="#c45f1c" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.3, -0.35]} rotation={[-1.0, 0, 0]}>
        <coneGeometry args={[0.13, 0.5, 8]} />
        <meshStandardMaterial color="#e9792f" roughness={0.95} />
      </mesh>
    </group>
  )
}

function PlushTurtle() {
  return (
    <group scale={0.5}>
      <mesh castShadow position={[0, 0.2, 0]} scale={[1, 0.6, 1.2]}>
        <sphereGeometry args={[0.4, 16, 12]} />
        <meshStandardMaterial color="#4f9a64" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.17, 0.48]}>
        <sphereGeometry args={[0.15, 12, 10]} />
        <meshStandardMaterial color="#9bd19b" roughness={0.9} />
      </mesh>
      {[
        [-0.28, 0.26],
        [0.28, 0.26],
        [-0.28, -0.26],
        [0.28, -0.26],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.07, z]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#9bd19b" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function Books({ y, from, to, seed }: { y: number; from: number; to: number; seed: number }) {
  const list = useMemo(() => {
    const out: { x: number; w: number; h: number; c: string; lean: number }[] = []
    const palette = ['#c8553d', '#2f4a3a', '#e0b44a', '#3b5b8c', '#8c4a6b', '#e9dfcb', '#4a7c6f']
    let x = from
    let s = seed
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
    while (x < to - 0.06) {
      const w = 0.045 + r() * 0.04
      const h = 0.24 + r() * 0.12
      out.push({ x: x + w / 2, w, h, c: palette[Math.floor(r() * palette.length)], lean: r() > 0.93 ? 0.18 : 0 })
      x += w + 0.004
    }
    return out
  }, [from, to, seed])
  return (
    <>
      {list.map((b, i) => (
        <Box key={i} at={[b.x, y + b.h / 2, 0]} size={[b.w, b.h, 0.26]} color={b.c} rough={0.8} rot={[0, 0, b.lean]} />
      ))}
    </>
  )
}

function GradCap() {
  return (
    <group>
      <Box at={[0, 0.05, 0]} size={[0.3, 0.018, 0.3]} color="#1c1d23" rough={0.7} rot={[0, 0.6, 0]} />
      <Cyl at={[0, 0.02, 0]} r={0.09} h={0.07} color="#1c1d23" rough={0.8} />
      <mesh position={[0.1, 0.03, 0.1]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#e0b44a" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

function Shelf() {
  const me = useTexture('/me.png')
  useEffect(() => {
    me.colorSpace = THREE.SRGBColorSpace
  }, [me])

  const W = 1.9
  const levels = [0.0, 0.5, 1.0, 1.5, 2.0]
  return (
    <group position={[-4.78, 0, -1.4]} rotation={[0, Math.PI / 2, 0]}>
      {/* rangka */}
      <Box at={[-W / 2, 1.2, 0]} size={[0.04, 2.45, 0.34]} color="#9a6f46" rough={0.6} />
      <Box at={[W / 2, 1.2, 0]} size={[0.04, 2.45, 0.34]} color="#9a6f46" rough={0.6} />
      <Box at={[0, 1.2, -0.16]} size={[W, 2.45, 0.02]} color="#7f5a38" rough={0.8} />
      {levels.map((y, i) => (
        <Box key={i} at={[0, 0.06 + y, 0]} size={[W, 0.035, 0.34]} color="#a87a4e" rough={0.55} />
      ))}
      <Box at={[0, 2.45, 0]} size={[W + 0.04, 0.035, 0.36]} color="#a87a4e" rough={0.55} />

      {/* isi rak */}
      <Books y={0.08} from={-W / 2 + 0.04} to={-0.1} seed={3} />
      <Books y={0.58} from={0.0} to={W / 2 - 0.04} seed={8} />
      <Books y={1.08} from={-W / 2 + 0.04} to={0.35} seed={5} />
      <Books y={1.58} from={-0.35} to={0.3} seed={12} />
      <Books y={2.08} from={-0.5} to={W / 2 - 0.04} seed={21} />

      {/* foto berbingkai (About) */}
      <group position={[0.55, 0.08 + 0.0, 0.0]}>
        <group position={[0, 0.17, 0.02]} rotation={[-0.1, 0, 0]}>
          <Box at={[0, 0, 0]} size={[0.28, 0.34, 0.02]} color="#2a2018" rough={0.5} />
          <mesh position={[0, 0, 0.012]}>
            <planeGeometry args={[0.23, 0.29]} />
            <meshStandardMaterial color="#ffc94a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.014]}>
            <planeGeometry args={[0.23, 0.29]} />
            <meshStandardMaterial map={me} transparent roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* boneka hewan */}
      <group position={[-0.35, 0.58, 0.02]}>
        <PlushFox />
      </group>
      <group position={[0.65, 1.08, 0.02]} rotation={[0, -0.3, 0]}>
        <PlushTurtle />
      </group>
      <group position={[-0.6, 1.58, 0.02]}>
        <GradCap />
      </group>
      <group position={[0.5, 1.58, 0.0]}>
        <Plant at={[0, 0, 0]} scale={0.7} />
      </group>
      <group position={[-0.75, 2.08, 0.02]}>
        <Cyl at={[0, 0.06, 0]} r={0.07} r2={0.09} h={0.12} color="#3b5b8c" rough={0.5} />
        <mesh position={[0, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.11, 20, 16]} />
          <meshStandardMaterial color="#4f86c6" roughness={0.45} metalness={0.1} />
        </mesh>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Sertifikat di dinding belakang (Education)                          */
/* ------------------------------------------------------------------ */
function Certificates() {
  const files = ['/certificates/piagam (2).png', '/certificates/piagam.png', '/certificates/rpl.png']
  const maps = useTexture(files.map((f) => encodeURI(f)))
  useEffect(() => {
    maps.forEach((t) => (t.colorSpace = THREE.SRGBColorSpace))
  }, [maps])
  const { cert } = useSceneLink()
  const spots: { x: number; y: number; w: number; h: number }[] = [
    { x: 2.2, y: 2.0, w: 0.95, h: 0.68 },
    { x: 3.35, y: 2.0, w: 0.95, h: 0.68 },
    { x: 2.78, y: 1.2, w: 0.95, h: 0.68 },
  ]
  return (
    <group position={[0, 0, -3.99]}>
      {spots.map((s, i) => (
        <group key={i} position={[s.x, s.y, cert === i ? 0.06 : 0]} scale={cert === i ? 1.08 : 1}>
          <Box at={[0, 0, 0.012]} size={[s.w + 0.08, s.h + 0.08, 0.03]} color={cert === i ? '#ff7a3d' : '#1f1a15'} rough={0.45} />
          <mesh position={[0, 0, 0.03]}>
            <planeGeometry args={[s.w, s.h]} />
            <meshStandardMaterial map={maps[i]} roughness={0.6} emissive="#ffffff" emissiveMap={maps[i]} emissiveIntensity={cert === i ? 0.55 : 0} />
          </mesh>
        </group>
      ))}
      {/* jam dinding */}
      <group position={[-2.9, 2.55, 0.03]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 32]} />
          <meshStandardMaterial color="#f7f2e8" roughness={0.4} />
        </mesh>
        <Box at={[0, 0.07, 0.03]} size={[0.012, 0.14, 0.01]} color="#222" />
        <Box at={[0.05, -0.02, 0.03]} size={[0.1, 0.012, 0.01]} color="#222" rot={[0, 0, 0.5]} />
      </group>
      {/* rak apung di atas meja */}
      <Box at={[0, 2.35, 0.1]} size={[1.7, 0.04, 0.22]} color="#a87a4e" rough={0.55} />
      <group position={[-0.55, 2.37, 0.1]}>
        <Plant at={[0, 0, 0]} scale={0.7} pot="#c8553d" />
      </group>
      <Box at={[0.35, 2.55, 0.1]} size={[0.5, 0.35, 0.18]} color="#e0b44a" rough={0.8} />
      <Box at={[0.7, 2.5, 0.1]} size={[0.07, 0.26, 0.15]} color="#3b5b8c" rough={0.8} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Sisi jendela: meja konsol + telepon + surat (Contact)               */
/* ------------------------------------------------------------------ */
function Console() {
  const { phone } = useSceneLink()
  return (
    <group position={[4.55, 0, -0.9]} rotation={[0, -Math.PI / 2, 0]}>
      <RoundedBox args={[1.6, 0.05, 0.5]} radius={0.01} smoothness={3} position={[0, 0.74, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#c99a68" roughness={0.55} />
      </RoundedBox>
      {[-0.72, 0.72].map((x) => (
        <Box key={x} at={[x, 0.37, 0]} size={[0.05, 0.74, 0.4]} color="#b88b5c" rough={0.6} />
      ))}
      {/* ponsel */}
      <group position={[-0.35, phone ? 0.8 : 0.77, 0.05]} rotation={[0, 0.4, 0]} scale={phone ? 1.25 : 1}>
        <RoundedBox args={[0.075, 0.008, 0.15]} radius={0.01} smoothness={3} castShadow>
          <meshStandardMaterial color="#15161b" roughness={0.25} metalness={0.5} />
        </RoundedBox>
        <mesh position={[0, 0.0055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.066, 0.14]} />
          <meshBasicMaterial color={phone ? '#7dffa8' : '#25D366'} toneMapped={false} />
        </mesh>
        {phone && <pointLight position={[0, 0.2, 0]} color="#4dff8a" intensity={1.6} distance={1.6} />}
      </group>
      {/* surat */}
      <Box at={[0.05, 0.775, 0.0]} size={[0.2, 0.006, 0.13]} color="#fbf7ee" rough={0.9} rot={[0, 0.2, 0]} />
      <Box at={[0.05, 0.781, 0.0]} size={[0.04, 0.004, 0.025]} color="#e0463a" rough={0.6} rot={[0, 0.2, 0]} />
      {/* vas bunga */}
      <group position={[0.55, 0.77, 0]}>
        <Cyl at={[0, 0.1, 0]} r={0.05} r2={0.07} h={0.2} color="#d9e6ef" rough={0.1} />
        {[0, 1, 2, 3, 4].map((i) => (
          <group key={i} rotation={[0.35 * (i % 2 ? 1 : -1), i, 0.25 * (i - 2)]}>
            <Cyl at={[0, 0.3, 0]} r={0.004} h={0.28} color="#4d9150" />
            <mesh position={[0, 0.45, 0]}>
              <sphereGeometry args={[0.04, 10, 8]} />
              <meshStandardMaterial color={['#ff7a8a', '#ffd95a', '#ffffff', '#ff9d6e', '#ffc2d4'][i]} roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Cahaya                                                              */
/* ------------------------------------------------------------------ */
function Lights({ dark, shadows, lamp }: { dark: boolean; shadows: boolean; lamp: boolean }) {
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const pendant = useRef<THREE.PointLight>(null)
  const night = useRef(dark ? 1 : 0)
  const dayC = useMemo(() => new THREE.Color('#fff1d6'), [])
  const nightC = useMemo(() => new THREE.Color('#7f9cff'), [])

  useFrame((_, dt) => {
    night.current += ((dark ? 1 : 0) - night.current) * (1 - Math.exp(-dt * 3))
    const n = night.current
    if (sun.current) {
      sun.current.color.copy(dayC).lerp(nightC, n)
      sun.current.intensity = 4.2 - 3.5 * n
    }
    if (hemi.current) hemi.current.intensity = 0.75 - 0.45 * n
    if (pendant.current) pendant.current.intensity = 0.4 + 2.2 * n
  })

  return (
    <>
      <hemisphereLight ref={hemi} args={['#fff5e6', '#a07850', 0.75]} />
      {/* matahari/bulan yang masuk lewat jendela */}
      <directionalLight
        ref={sun}
        position={[9, 4.6, -0.7]}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
      />
      {/* lampu gantung */}
      <pointLight ref={pendant} position={[0, 3.0, -1.2]} color="#ffd9a8" distance={9} decay={1.6} />
    </>
  )
}

function Pendant({ dark }: { dark: boolean }) {
  return (
    <group position={[0, 3.6, -1.2]}>
      <Cyl at={[0, -0.25, 0]} r={0.006} h={0.5} color="#222" />
      <mesh position={[0, -0.55, 0]} castShadow>
        <coneGeometry args={[0.3, 0.26, 28, 1, true]} />
        <meshStandardMaterial color="#e0a23a" roughness={0.45} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.62, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color={dark ? '#fff0c8' : '#f2e6c8'} toneMapped={false} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Dunia + Canvas                                                      */
/* ------------------------------------------------------------------ */
function Room({ dark, route, low, onToggleTheme }: { dark: boolean; route: RouteKey; low: boolean; onToggleTheme: () => void }) {
  const [lamp, setLamp] = useState(dark)
  useEffect(() => setLamp(dark), [dark])

  return (
    <>
      <Environment key={dark ? 'night' : 'day'} resolution={low ? 64 : 128} frames={1}>
        <Lightformer form="rect" intensity={dark ? 0.35 : 2.2} color={dark ? '#7f9cff' : '#fff4dc'} position={[8, 2, -1]} rotation-y={-Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={dark ? 0.2 : 0.9} color="#ffe2b8" position={[0, 6, -1]} rotation-x={Math.PI / 2} scale={[8, 6, 1]} />
      </Environment>

      <Lights dark={dark} shadows={!low} lamp={lamp} />
      <Shell dark={dark} onToggleTheme={onToggleTheme} />
      <Pendant dark={dark} />
      <Desk />
      <Monitors dark={dark} />
      <Keyboard />
      <DeskLamp on={lamp} onToggle={() => setLamp((v) => !v)} enabled={route === '/'} shadows={!low} />
      <Mug />
      <Clipboard />
      <group position={[-1.22, 0.8, -2.85]}>
        <Plant at={[0, 0, 0]} scale={0.55} pot="#e9dfcb" />
      </group>
      <Egg enabled={route === '/'} />
      <Chair />
      <Shelf />
      <Certificates />
      <Console />
      <Plant at={[4.5, 0, -3.5]} scale={2.2} pot="#c8553d" />
      <Plant at={[-4.4, 0, 2.6]} scale={2.0} pot="#d9d2c3" />

      {/* kucing & perabotnya */}
      <Cat dark={dark} route={route} />
      <YarnBall enabled />
      <Bowl />
      <CatTree />
      <LaserDot />
      {/* klik lantai = memanggil kucing */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.004, 0]}
        onClick={(e) => {
          if (isUiTarget(e.nativeEvent.target) || getCatUi().laser) return
          catCtl.call = { x: e.point.x, z: e.point.z }
        }}
      >
        <planeGeometry args={[9.4, 7.6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  )
}

export default function Scene({
  dark,
  route,
  quality,
  onToggleTheme,
}: {
  dark: boolean
  route: RouteKey
  quality: 'high' | 'low'
  onToggleTheme: () => void
}) {
  const [degraded, setDegraded] = useState(false)
  const low = quality === 'low' || degraded

  return (
    <Canvas
      shadows={!low}
      dpr={low ? [1, 1.5] : [1, 1.75]}
      camera={{ fov: 40, position: CAM['/'].pos, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      eventSource={typeof document !== 'undefined' ? document.body : undefined}
      eventPrefix="client"
      style={{ pointerEvents: 'none' }}
    >
      <PerformanceMonitor onDecline={() => setDegraded(true)} />
      <Room dark={dark} route={route} low={low} onToggleTheme={onToggleTheme} />
      <CameraRig route={route} />
    </Canvas>
  )
}
