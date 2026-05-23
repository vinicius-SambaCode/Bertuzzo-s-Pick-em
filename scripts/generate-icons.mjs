import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'icons')

await mkdir(outDir, { recursive: true })

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#0A0A0A"/>
      <stop offset="100%" stop-color="#0D1F10"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#g)"/>
  <rect y="0"   width="512" height="6" rx="0" fill="#009B3A"/>
  <rect y="506" width="512" height="6" rx="0" fill="#009B3A"/>
  <text x="256" y="195" font-size="230" font-weight="900" text-anchor="middle"
        dominant-baseline="middle" fill="white"
        font-family="Arial Black,Impact,sans-serif" letter-spacing="-10">26</text>
  <text x="256" y="330" font-size="58" font-weight="700" text-anchor="middle"
        fill="#009B3A" font-family="Arial,sans-serif" letter-spacing="12">FIFA</text>
  <text x="256" y="400" font-size="28" font-weight="400" text-anchor="middle"
        fill="#383838" font-family="Arial,sans-serif" letter-spacing="6">BERTUZZO</text>
</svg>`

const buf = Buffer.from(svg)

await sharp(buf).resize(512, 512).png().toFile(path.join(outDir, 'icon-512.png'))
await sharp(buf).resize(192, 192).png().toFile(path.join(outDir, 'icon-192.png'))
await sharp(buf).resize(180, 180).png().toFile(path.join(outDir, 'apple-touch-icon.png'))
await sharp(buf).resize(512, 512).png().toFile(path.join(outDir, 'icon-maskable-512.png'))

console.log('✅ PWA icons gerados com sucesso!')
