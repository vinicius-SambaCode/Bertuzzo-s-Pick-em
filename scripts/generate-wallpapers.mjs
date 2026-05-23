/**
 * Gera wallpapers Copa 2026 com a identidade visual oficial:
 * raios coloridos giratórios + fundo escuro, idêntico ao brand oficial FIFA 2026.
 */
import sharp from 'sharp'
import path from 'path'
import { mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'images')
await mkdir(outDir, { recursive: true })

// Cores oficiais da Copa 2026
const COLORS = [
  '#D52B1E', // Vermelho
  '#F5690C', // Laranja
  '#FFCD00', // Amarelo
  '#96C123', // Lima
  '#009B3A', // Verde
  '#00B5AD', // Ciano
  '#003DA5', // Azul
  '#7B2FA0', // Roxo
  '#E91E8C', // Rosa
]
const DARK = '#080808'

function deg2rad(d) { return (d - 90) * Math.PI / 180 }

function polar(cx, cy, r, angleDeg) {
  const rad = deg2rad(angleDeg)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function wedge(cx, cy, r, startDeg, endDeg, color) {
  const s = polar(cx, cy, r, startDeg)
  const e = polar(cx, cy, r, endDeg)
  const large = (endDeg - startDeg) > 180 ? 1 : 0
  return `<path d="M${cx},${cy} L${s.x},${s.y} A${r},${r} 0 ${large},1 ${e.x},${e.y} Z" fill="${color}"/>`
}

function buildRaysSVG(w, h, rotationDeg = 0) {
  const cx = w / 2, cy = h / 2
  const maxR = Math.sqrt(w * w + h * h)  // cobre os cantos

  // 9 cores × 40° cada = 360° total | Ray = 25°, Gap = 15°
  const RAY = 25, GAP = 15, TOTAL = RAY + GAP  // 40° por ciclo

  let paths = ''

  // Fundo escuro
  paths += `<rect width="${w}" height="${h}" fill="${DARK}"/>`

  // Raios coloridos (do centro ao infinito)
  for (let i = 0; i < COLORS.length; i++) {
    const start = i * TOTAL + rotationDeg
    const end   = start + RAY
    paths += wedge(cx, cy, maxR, start, end, COLORS[i])
  }

  // Círculo escuro central (para o card de login pousar sobre)
  const cR = Math.min(w, h) * 0.22
  paths += `<circle cx="${cx}" cy="${cy}" r="${cR}" fill="${DARK}"/>`

  // Gradiente radial sobre tudo — escurece bordas, clareia centro
  paths += `
    <defs>
      <radialGradient id="fade" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="${DARK}" stop-opacity="0.00"/>
        <stop offset="45%"  stop-color="${DARK}" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="${DARK}" stop-opacity="0.72"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#fade)"/>
  `

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${paths}</svg>`
}

// ── Login wallpaper (1920×1080) — raios cheios, versão colorida ───────────
console.log('Gerando copa-login-bg.jpg …')
const loginSvg = buildRaysSVG(1920, 1080, 0)
await sharp(Buffer.from(loginSvg))
  .resize(1920, 1080)
  .jpeg({ quality: 92 })
  .toFile(path.join(outDir, 'copa-login-bg.jpg'))

// ── Dashboard wallpaper — mesma base, rotação diferente + overlay verde ──
console.log('Gerando copa-dashboard-bg.jpg …')
const dashSvg = buildRaysSVG(1920, 1080, 18)  // leve rotação diferente
await sharp(Buffer.from(dashSvg))
  .resize(1920, 1080)
  .jpeg({ quality: 90 })
  .toFile(path.join(outDir, 'copa-dashboard-bg.jpg'))

// ── Mobile versions (portrait) ────────────────────────────────────────────
console.log('Gerando copa-login-mobile.jpg …')
const mobileSvg = buildRaysSVG(1080, 1920, 0)
await sharp(Buffer.from(mobileSvg))
  .resize(1080, 1920)
  .jpeg({ quality: 88 })
  .toFile(path.join(outDir, 'copa-login-mobile.jpg'))

console.log('✅ Wallpapers Copa 2026 gerados com sucesso!')
