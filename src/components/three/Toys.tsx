'use client'

import { isUiTarget } from '@/lib/ui'
import { useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { ball, dot, kickBall, useCatUi } from '@/lib/cat'
import { BOWL_AT, CIRCLES, RECTS, TREE_AT } from '@/lib/catNav'

const sh = { castShadow: true, receiveShadow: true } as const

/* --- bola benang yang menggelinding ------------------------------------ */
export function YarnBall({ enabled }: { enabled: boolean }) {
  const g = useRef<THREE.Group>(null)

  useFrame(({ camera }, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    ball.x += ball.vx * dt
    ball.z += ball.vz * dt
    const f = Math.exp(-dt * 1.5)
    ball.vx *= f
    ball.vz *= f

    // memantul di dinding
    if (ball.x < -4.55) ((ball.x = -4.55), (ball.vx = Math.abs(ball.vx) * 0.6))
    if (ball.x > 4.55) ((ball.x = 4.55), (ball.vx = -Math.abs(ball.vx) * 0.6))
    if (ball.z < -3.55) ((ball.z = -3.55), (ball.vz = Math.abs(ball.vz) * 0.6))
    if (ball.z > 3.7) ((ball.z = 3.7), (ball.vz = -Math.abs(ball.vz) * 0.6))
    // perabot: dorong keluar & pantulkan
    const R_BALL = 0.08
    for (const [x0, x1, z0, z1] of RECTS) {
      if (ball.x > x0 - R_BALL && ball.x < x1 + R_BALL && ball.z > z0 - R_BALL && ball.z < z1 + R_BALL) {
        const dl = ball.x - (x0 - R_BALL)
        const dr = x1 + R_BALL - ball.x
        const dtp = ball.z - (z0 - R_BALL)
        const db = z1 + R_BALL - ball.z
        const mn = Math.min(dl, dr, dtp, db)
        if (mn === dl) ((ball.x = x0 - R_BALL), (ball.vx = -Math.abs(ball.vx) * 0.6))
        else if (mn === dr) ((ball.x = x1 + R_BALL), (ball.vx = Math.abs(ball.vx) * 0.6))
        else if (mn === dtp) ((ball.z = z0 - R_BALL), (ball.vz = -Math.abs(ball.vz) * 0.6))
        else ((ball.z = z1 + R_BALL), (ball.vz = Math.abs(ball.vz) * 0.6))
      }
    }
    for (const [cx, cz, r] of CIRCLES) {
      const dx = ball.x - cx
      const dz = ball.z - cz
      const d = Math.hypot(dx, dz)
      if (d < r + R_BALL) {
        const nx = d > 0.001 ? dx / d : 1
        const nz = d > 0.001 ? dz / d : 0
        ball.x = cx + nx * (r + R_BALL)
        ball.z = cz + nz * (r + R_BALL)
        const vn = ball.vx * nx + ball.vz * nz
        if (vn < 0) {
          ball.vx -= 1.6 * vn * nx
          ball.vz -= 1.6 * vn * nz
        }
      }
    }

    if (g.current) {
      g.current.position.set(ball.x, 0.075, ball.z)
      const sp = Math.hypot(ball.vx, ball.vz)
      g.current.rotation.x += ball.vz * dt * 9
      g.current.rotation.z -= ball.vx * dt * 9
      void sp
    }
    void camera
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!enabled) return
    const t = e.nativeEvent.target as HTMLElement | null
    if (isUiTarget(t)) return
    e.stopPropagation()
    // tendang menjauhi kamera
    const c = e.camera.position
    kickBall(ball.x - c.x + (Math.random() - 0.5), ball.z - c.z + (Math.random() - 0.5))
  }

  return (
    <group ref={g} onClick={onClick} onPointerOver={() => enabled && (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = '')}>
      <mesh {...sh}>
        <sphereGeometry args={[0.075, 18, 14]} />
        <meshStandardMaterial color="#e0463a" roughness={0.95} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[i * 1.05, i * 0.6, i * 0.9]}>
          <torusGeometry args={[0.076, 0.006, 6, 24]} />
          <meshStandardMaterial color="#f6c9c2" roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0.07, -0.02, 0.05]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshStandardMaterial color="#e0463a" />
      </mesh>
    </group>
  )
}

/* --- mangkuk makan + ikan ---------------------------------------------- */
export function Bowl() {
  const { food } = useCatUi()
  return (
    <group position={[BOWL_AT[0], 0, BOWL_AT[1]]}>
      <mesh {...sh} position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.13, 0.09, 0.08, 24]} />
        <meshStandardMaterial color="#6fa6c8" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.082, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.115, 24]} />
        <meshStandardMaterial color="#3f352c" roughness={0.9} />
      </mesh>
      {food && (
        <group position={[0, 0.1, 0]} rotation={[0, 0.5, 0]}>
          <mesh scale={[1.6, 0.8, 0.7]} castShadow>
            <sphereGeometry args={[0.04, 12, 10]} />
            <meshStandardMaterial color="#ff9d6e" roughness={0.5} />
          </mesh>
          <mesh position={[-0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.03, 0.05, 4]} />
            <meshStandardMaterial color="#ff7a3d" roughness={0.5} />
          </mesh>
        </group>
      )}
      {/* mangkuk air */}
      <group position={[0, 0, 0.36]}>
        <mesh {...sh} position={[0, 0.035, 0]}>
          <cylinderGeometry args={[0.12, 0.085, 0.07, 24]} />
          <meshStandardMaterial color="#f1e3c6" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.066, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.1, 24]} />
          <meshStandardMaterial color="#9fd8f0" roughness={0.05} metalness={0.1} />
        </mesh>
      </group>
    </group>
  )
}

/* --- cat tree ----------------------------------------------------------- */
export function CatTree() {
  const toy = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (toy.current) toy.current.rotation.z = Math.sin(clock.elapsedTime * 2) * 0.35
  })
  const sisal = '#c9a56a'
  const carpet = '#9db8a0'
  return (
    <group position={[TREE_AT[0], 0, TREE_AT[1]]}>
      <mesh {...sh} position={[0, 0.03, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.7]} />
        <meshStandardMaterial color={carpet} roughness={1} />
      </mesh>
      <mesh {...sh} position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 1.1, 14]} />
        <meshStandardMaterial color={sisal} roughness={1} />
      </mesh>
      <mesh {...sh} position={[0.15, 0.5, 0.05]}>
        <boxGeometry args={[0.5, 0.05, 0.4]} />
        <meshStandardMaterial color={carpet} roughness={1} />
      </mesh>
      <mesh {...sh} position={[0, 1.09, 0]}>
        <boxGeometry args={[0.62, 0.05, 0.62]} />
        <meshStandardMaterial color={carpet} roughness={1} />
      </mesh>
      {/* mainan gantung */}
      <group ref={toy} position={[0.28, 0.48, 0.05]}>
        <mesh position={[0, -0.14, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.28, 4]} />
          <meshStandardMaterial color="#888" />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color="#ffc94a" roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

/* --- titik laser: mengikuti kursor/jari di lantai ---------------------- */
export function LaserDot() {
  const { laser } = useCatUi()
  const m = useRef<THREE.Group>(null)

  useFrame((state) => {
    // proyeksikan kursor ke lantai (y = 0)
    const ray = state.raycaster
    ray.setFromCamera(state.pointer, state.camera)
    const { origin, direction } = ray.ray
    const t = -origin.y / direction.y
    if (t > 0 && Number.isFinite(t)) {
      const x = origin.x + direction.x * t
      const z = origin.z + direction.z * t
      dot.valid = x > -4.5 && x < 4.5 && z > -3.5 && z < 3.7
      if (dot.valid) {
        dot.x = x
        dot.z = z
      }
    } else dot.valid = false

    if (m.current) {
      m.current.visible = laser && dot.valid
      m.current.position.set(dot.x, 0.012, dot.z)
      m.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 18) * 0.15)
    }
  })

  return (
    <group ref={m} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.05, 16]} />
        <meshBasicMaterial color="#ff2a2a" toneMapped={false} />
      </mesh>
      <pointLight color="#ff3030" intensity={0.6} distance={1.2} position={[0, 0.1, 0]} />
    </group>
  )
}
