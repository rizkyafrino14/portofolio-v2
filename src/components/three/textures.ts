import * as THREE from 'three'

// Tekstur prosedural (digambar di <canvas>) agar ruangan terasa nyata
// tanpa harus mengunduh aset gambar tambahan.

function rng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function toTexture(c: HTMLCanvasElement, repeat?: [number, number]) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(...repeat)
  }
  t.needsUpdate = true
  return t
}

export function makeWood() {
  const c = document.createElement('canvas')
  c.width = c.height = 1024
  const g = c.getContext('2d')!
  const r = rng(7)
  const rows = 10
  const h = c.height / rows
  for (let row = 0; row < rows; row++) {
    let x = -r() * 420
    while (x < c.width) {
      const w = 360 + r() * 260
      const l = 36 + r() * 9
      g.fillStyle = `hsl(${27 + r() * 6} ${42 + r() * 10}% ${l}%)`
      g.fillRect(x, row * h, w, h)
      // serat kayu
      for (let i = 0; i < 26; i++) {
        const y = row * h + r() * h
        g.strokeStyle = `rgba(60,32,14,${0.05 + r() * 0.08})`
        g.lineWidth = 0.6 + r() * 1.2
        g.beginPath()
        g.moveTo(x, y)
        for (let k = 0; k <= w; k += 40) g.lineTo(x + k, y + Math.sin((k + i * 13) * 0.02) * 2)
        g.stroke()
      }
      // sambungan papan
      g.fillStyle = 'rgba(30,16,6,0.55)'
      g.fillRect(x, row * h, 2, h)
      x += w
    }
    g.fillStyle = 'rgba(30,16,6,0.5)'
    g.fillRect(0, row * h, c.width, 2)
  }
  return toTexture(c)
}

export function makeRug() {
  const c = document.createElement('canvas')
  c.width = 768
  c.height = 512
  const g = c.getContext('2d')!
  g.fillStyle = '#a9553a'
  g.fillRect(0, 0, c.width, c.height)
  const frame = (inset: number, color: string, lw: number) => {
    g.strokeStyle = color
    g.lineWidth = lw
    g.strokeRect(inset, inset, c.width - inset * 2, c.height - inset * 2)
  }
  frame(18, '#f1e3c6', 10)
  frame(44, '#2f4a3a', 6)
  // pola belah ketupat
  g.fillStyle = '#e9d8b4'
  for (let x = 110; x < c.width - 80; x += 78) {
    for (let y = 100; y < c.height - 80; y += 78) {
      g.beginPath()
      g.moveTo(x, y - 24)
      g.lineTo(x + 24, y)
      g.lineTo(x, y + 24)
      g.lineTo(x - 24, y)
      g.closePath()
      g.fill()
    }
  }
  // serat kain
  const r = rng(3)
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(0,0,0,${r() * 0.07})`
    g.fillRect(r() * c.width, r() * c.height, 2, 2)
  }
  return toTexture(c)
}

export function makeCode(seed = 1) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 384
  const g = c.getContext('2d')!
  g.fillStyle = '#1b1d27'
  g.fillRect(0, 0, c.width, c.height)
  g.fillStyle = '#252836'
  g.fillRect(0, 0, c.width, 26)
  ;['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
    g.fillStyle = col
    g.beginPath()
    g.arc(16 + i * 18, 13, 5, 0, Math.PI * 2)
    g.fill()
  })
  const r = rng(seed)
  const colors = ['#7aa2f7', '#bb9af7', '#9ece6a', '#e0af68', '#7dcfff', '#c0caf5']
  for (let line = 0; line < 22; line++) {
    let x = 20 + Math.floor(r() * 3) * 22
    const y = 52 + line * 15
    g.fillStyle = '#3b4261'
    g.fillRect(4, y - 8, 10, 3)
    for (let k = 0; k < 2 + Math.floor(r() * 4); k++) {
      const w = 22 + r() * 70
      g.fillStyle = colors[Math.floor(r() * colors.length)]
      g.fillRect(x, y - 8, w, 8)
      x += w + 8
    }
  }
  return toTexture(c)
}

export function makePaper() {
  const c = document.createElement('canvas')
  c.width = 420
  c.height = 594
  const g = c.getContext('2d')!
  g.fillStyle = '#fffdf8'
  g.fillRect(0, 0, c.width, c.height)
  g.fillStyle = '#22301f'
  g.fillRect(0, 0, c.width, 110)
  g.fillStyle = '#ffc94a'
  g.beginPath()
  g.arc(70, 55, 34, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = '#fffdf8'
  g.fillRect(124, 38, 190, 14)
  g.fillStyle = '#c9cfbf'
  g.fillRect(124, 62, 130, 9)
  const r = rng(11)
  for (let s = 0; s < 4; s++) {
    const y0 = 140 + s * 110
    g.fillStyle = '#ff7a3d'
    g.fillRect(32, y0, 96, 10)
    for (let l = 0; l < 4; l++) {
      g.fillStyle = '#c9cfbf'
      g.fillRect(32, y0 + 24 + l * 16, 250 + r() * 110, 6)
    }
  }
  return toTexture(c)
}

export function makeSky(dark: boolean) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 256)
  if (dark) {
    grad.addColorStop(0, '#04060f')
    grad.addColorStop(1, '#1b2a4a')
  } else {
    grad.addColorStop(0, '#6fb1f0')
    grad.addColorStop(1, '#e8f4ff')
  }
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  const r = rng(5)
  if (dark) {
    for (let i = 0; i < 70; i++) {
      g.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.7})`
      g.fillRect(r() * 256, r() * 190, 1.5, 1.5)
    }
    g.fillStyle = '#eef2ff'
    g.beginPath()
    g.arc(190, 60, 16, 0, Math.PI * 2)
    g.fill()
  } else {
    // awan
    g.fillStyle = 'rgba(255,255,255,0.85)'
    for (let i = 0; i < 6; i++) {
      const x = r() * 256
      const y = 40 + r() * 120
      for (let k = 0; k < 5; k++) {
        g.beginPath()
        g.arc(x + k * 14, y + Math.sin(k) * 6, 14 + r() * 8, 0, Math.PI * 2)
        g.fill()
      }
    }
  }
  return toTexture(c)
}

/** Tekstur bulu kucing tabby oranye (u = keliling badan, v = panjang badan). */
export function makeFur() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const g = c.getContext('2d')!
  const r = rng(21)

  // dasar: oranye hangat, perut putih krem (sekitar u = 0.25)
  g.fillStyle = '#e39a52'
  g.fillRect(0, 0, 512, 512)
  const belly = g.createLinearGradient(0, 0, 512, 0)
  belly.addColorStop(0, 'rgba(255,244,228,0)')
  belly.addColorStop(0.1, 'rgba(255,244,228,0.0)')
  belly.addColorStop(0.17, 'rgba(255,244,228,0.95)')
  belly.addColorStop(0.3, 'rgba(255,244,228,0.95)')
  belly.addColorStop(0.38, 'rgba(255,244,228,0)')
  belly.addColorStop(1, 'rgba(255,244,228,0)')
  g.fillStyle = belly
  g.fillRect(0, 0, 512, 512)

  // sedikit gradasi punggung lebih gelap
  const back = g.createLinearGradient(0, 0, 512, 0)
  back.addColorStop(0.45, 'rgba(160,80,20,0)')
  back.addColorStop(0.75, 'rgba(160,80,20,0.28)')
  back.addColorStop(0.95, 'rgba(160,80,20,0.05)')
  g.fillStyle = back
  g.fillRect(0, 0, 512, 512)

  // belang melintang di punggung & sisi
  for (let j = 0; j < 13; j++) {
    const y = 14 + j * 38 + r() * 10
    const th = 12 + r() * 10
    g.fillStyle = 'rgba(176,86,24,0.62)'
    g.beginPath()
    const x0 = 200
    const x1 = 478
    g.moveTo(x0, y)
    for (let x = x0; x <= x1; x += 18) g.lineTo(x, y + Math.sin(x * 0.05 + j) * 4)
    for (let x = x1; x >= x0; x -= 18) g.lineTo(x, y + th + Math.sin(x * 0.07 + j * 2) * 4)
    g.closePath()
    g.fill()
  }
  // garis tengah punggung
  g.fillStyle = 'rgba(140,64,16,0.4)'
  g.fillRect(372, 0, 22, 512)

  // serat bulu halus
  for (let i = 0; i < 4200; i++) {
    g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(90,40,10,0.06)'
    g.fillRect(r() * 512, r() * 512, 1.5, 6 + r() * 6)
  }

  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  t.needsUpdate = true
  return t
}
