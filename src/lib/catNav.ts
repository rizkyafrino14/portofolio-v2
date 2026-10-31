// Navigasi lantai untuk kucing: rintangan, grid, A*, dan pengecekan garis lurus.
// Murni (tanpa three/react) supaya mudah diuji.

export const BOWL_AT: [number, number] = [-3.2, 2.6]
export const TREE_AT: [number, number] = [-3.9, 1.5]

export const BOUNDS = { x0: -4.55, x1: 4.55, z0: -3.55, z1: 3.7 }

// rintangan lantai: persegi [x0, x1, z0, z1] dan lingkaran [x, z, r]
export const RECTS: [number, number, number, number][] = [
  [-1.5, 1.5, -3.95, -2.45], // meja
  [4.1, 5, -1.8, -0.05], // meja konsol
]
export const CIRCLES: [number, number, number][] = [
  [0.12, -1.95, 0.42], // kursi
  [TREE_AT[0], TREE_AT[1], 0.42], // cat tree
  [4.5, -3.5, 0.4], // tanaman besar
  [-4.4, 2.6, 0.38], // tanaman besar
]

const CELL = 0.15
const PAD = 0.22 // jarak aman grid dari perabot
const PAD_LOS = 0.16 // jarak aman garis lurus (lebih kecil dari PAD)
const NX = Math.ceil((BOUNDS.x1 - BOUNDS.x0) / CELL)
const NZ = Math.ceil((BOUNDS.z1 - BOUNDS.z0) / CELL)

function blockedAt(x: number, z: number, pad: number): boolean {
  for (const [x0, x1, z0, z1] of RECTS) {
    if (x > x0 - pad && x < x1 + pad && z > z0 - pad && z < z1 + pad) return true
  }
  for (const [cx, cz, r] of CIRCLES) {
    if (Math.hypot(x - cx, z - cz) < r + pad) return true
  }
  return false
}

let grid: Uint8Array | null = null
function getGrid(): Uint8Array {
  if (grid) return grid
  const g = new Uint8Array(NX * NZ)
  for (let j = 0; j < NZ; j++) {
    for (let i = 0; i < NX; i++) {
      g[j * NX + i] = blockedAt(cx(i), cz(j), PAD) ? 1 : 0
    }
  }
  grid = g
  return g
}

const cx = (i: number) => BOUNDS.x0 + (i + 0.5) * CELL
const cz = (j: number) => BOUNDS.z0 + (j + 0.5) * CELL
const ci = (x: number) => Math.min(NX - 1, Math.max(0, Math.floor((x - BOUNDS.x0) / CELL)))
const cj = (z: number) => Math.min(NZ - 1, Math.max(0, Math.floor((z - BOUNDS.z0) / CELL)))

export function isFree(x: number, z: number): boolean {
  return getGrid()[cj(z) * NX + ci(x)] === 0
}

/** Titik bebas terdekat dari (x, z) — dipakai agar tidak mendarat/menuju ke dalam perabot. */
export function nearestFree(x: number, z: number): [number, number] {
  const g = getGrid()
  const i0 = ci(x)
  const j0 = cj(z)
  if (g[j0 * NX + i0] === 0) return [x, z]
  for (let r = 1; r < 40; r++) {
    let best: [number, number] | null = null
    let bestD = Infinity
    for (let dj = -r; dj <= r; dj++) {
      for (let di = -r; di <= r; di++) {
        if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue
        const i = i0 + di
        const j = j0 + dj
        if (i < 0 || j < 0 || i >= NX || j >= NZ || g[j * NX + i]) continue
        const d = Math.hypot(cx(i) - x, cz(j) - z)
        if (d < bestD) {
          bestD = d
          best = [cx(i), cz(j)]
        }
      }
    }
    if (best) return best
  }
  return [x, z]
}

/** Apakah garis lurus a→b bebas dari perabot (dengan jarak aman kecil)? */
export function losClear(ax: number, az: number, bx: number, bz: number): boolean {
  const d = Math.hypot(bx - ax, bz - az)
  const n = Math.max(1, Math.ceil(d / 0.06))
  for (let k = 0; k <= n; k++) {
    const t = k / n
    // di dekat titik awal cukup bebas dari perabot sungguhan, agar kucing yang
    // berdiri tepat di tepi perabot tetap bisa melangkah menjauh
    const pad = t * d < 0.3 ? 0.02 : PAD_LOS
    if (blockedAt(ax + (bx - ax) * t, az + (bz - az) * t, pad)) return false
  }
  return true
}

const DIRS: [number, number, number][] = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, Math.SQRT2],
  [1, -1, Math.SQRT2],
  [-1, 1, Math.SQRT2],
  [-1, -1, Math.SQRT2],
]

/**
 * Jalur terpendek di lantai dari (ax, az) ke (bx, bz), dihaluskan.
 * Mengembalikan titik-titik tujuan berurutan (tanpa titik awal), atau null.
 * Bila tujuan berada di dalam perabot, jalur berakhir di titik bebas terdekat.
 */
export function findPath(ax: number, az: number, bx: number, bz: number): [number, number][] | null {
  const g = getGrid()
  const [sx, sz] = nearestFree(ax, az)
  const [tx, tz] = nearestFree(bx, bz)
  const si = cj(sz) * NX + ci(sx)
  let ti = cj(tz) * NX + ci(tx)

  if (si === ti) return [[tx, tz]]

  const gScore = new Float32Array(NX * NZ).fill(Infinity)
  const fScore = new Float32Array(NX * NZ).fill(Infinity)
  const came = new Int32Array(NX * NZ).fill(-1)
  const closed = new Uint8Array(NX * NZ)
  const open: number[] = [si]
  gScore[si] = 0
  const h = (idx: number) => {
    const dx = Math.abs((idx % NX) - (ti % NX))
    const dz = Math.abs(Math.floor(idx / NX) - Math.floor(ti / NX))
    return (Math.max(dx, dz) + (Math.SQRT2 - 1) * Math.min(dx, dz)) * CELL
  }
  fScore[si] = h(si)

  let found = false
  while (open.length) {
    let bi = 0
    for (let k = 1; k < open.length; k++) if (fScore[open[k]] < fScore[open[bi]]) bi = k
    const cur = open[bi]
    open[bi] = open[open.length - 1]
    open.pop()
    if (cur === ti) {
      found = true
      break
    }
    if (closed[cur]) continue
    closed[cur] = 1
    const ci0 = cur % NX
    const cj0 = Math.floor(cur / NX)
    for (const [di, dj, cost] of DIRS) {
      const i = ci0 + di
      const j = cj0 + dj
      if (i < 0 || j < 0 || i >= NX || j >= NZ) continue
      const n = j * NX + i
      if (g[n] || closed[n]) continue
      // jangan memotong sudut perabot
      if (di !== 0 && dj !== 0 && (g[cj0 * NX + i] || g[j * NX + ci0])) continue
      const ng = gScore[cur] + cost * CELL
      if (ng < gScore[n]) {
        gScore[n] = ng
        fScore[n] = ng + h(n)
        came[n] = cur
        open.push(n)
      }
    }
  }
  if (!found) {
    // tujuan ada di kantong tertutup → menujulah ke titik terjangkau terdekat
    let best = -1
    let bestD = Infinity
    for (let n = 0; n < closed.length; n++) {
      if (!closed[n]) continue
      const d = Math.hypot(cx(n % NX) - tx, cz(Math.floor(n / NX)) - tz)
      if (d < bestD) {
        bestD = d
        best = n
      }
    }
    if (best < 0) return null
    ti = best
  }

  const cells: [number, number][] = []
  for (let n = ti; n !== -1 && n !== si; n = came[n]) cells.push([cx(n % NX), cz(Math.floor(n / NX))])
  cells.reverse()

  // haluskan: loncat ke titik terjauh yang masih terlihat lurus
  const out: [number, number][] = []
  let px = ax
  let pz = az
  let i = 0
  while (i < cells.length) {
    let j = cells.length - 1
    while (j > i && !losClear(px, pz, cells[j][0], cells[j][1])) j--
    out.push(cells[j])
    px = cells[j][0]
    pz = cells[j][1]
    i = j + 1
  }
  return out
}
