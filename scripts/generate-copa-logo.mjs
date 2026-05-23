/**
 * Gera logo Copa 2026 fiel ao design oficial FIFA:
 * "2" e "6" em tipografia bold + troféu dourado central
 */
import sharp from 'sharp'
import path from 'path'
import { mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'images')
await mkdir(outDir, { recursive: true })

// Logo compacto — fundo transparente, "26" bold + troféu central
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="400" height="260">
  <defs>
    <linearGradient id="trophy" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#F5D060"/>
      <stop offset="40%"  stop-color="#C8900A"/>
      <stop offset="70%"  stop-color="#A87008"/>
      <stop offset="100%" stop-color="#7A5200"/>
    </linearGradient>
    <linearGradient id="base" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#00633A"/>
      <stop offset="100%" stop-color="#003A22"/>
    </linearGradient>
  </defs>

  <!-- "2" -->
  <text x="0" y="210" font-family="Arial Black,Impact,sans-serif"
        font-weight="900" font-size="220" fill="white" letter-spacing="-8">2</text>

  <!-- "6" (deslocado para direita e ligeiramente abaixo) -->
  <text x="270" y="250" font-family="Arial Black,Impact,sans-serif"
        font-weight="900" font-size="220" fill="white" letter-spacing="-8">6</text>

  <!-- Troféu FIFA WC (corpo) -->
  <ellipse cx="200" cy="72" rx="38" ry="52" fill="url(#trophy)"/>
  <!-- Alças -->
  <path d="M163 58 Q140 38 148 18 Q156 2 172 8 Q168 22 175 38 Z"
        fill="url(#trophy)" opacity="0.9"/>
  <path d="M237 58 Q260 38 252 18 Q244 2 228 8 Q232 22 225 38 Z"
        fill="url(#trophy)" opacity="0.9"/>
  <!-- Corpo central mais detalhado -->
  <path d="M168 120 Q175 105 200 108 Q225 105 232 120 L228 136 Q214 130 200 131 Q186 130 172 136 Z"
        fill="url(#trophy)"/>
  <!-- Pescoço -->
  <rect x="186" y="118" width="28" height="22" rx="4" fill="url(#trophy)"/>
  <!-- Base -->
  <rect x="165" y="138" width="70" height="12" rx="6" fill="url(#base)"/>
  <rect x="155" y="148" width="90" height="10" rx="5" fill="url(#base)"/>
  <!-- Brilho no troféu -->
  <ellipse cx="186" cy="50" rx="10" ry="16" fill="white" opacity="0.15" transform="rotate(-25 186 50)"/>

  <!-- "FIFA" embaixo -->
  <text x="200" y="248" font-family="Arial,sans-serif" font-weight="800"
        font-size="36" fill="white" text-anchor="middle" letter-spacing="6">FIFA</text>

  <!-- TM -->
  <text x="358" y="220" font-family="Arial,sans-serif" font-size="16"
        fill="white" opacity="0.8">™</text>
</svg>`

// Logo principal 400×260 (PNG transparente)
await sharp(Buffer.from(logoSvg))
  .resize(400, 260)
  .png()
  .toFile(path.join(outDir, 'copa2026-logo.png'))

// Logo versão compacta para sidebar 120×78
await sharp(Buffer.from(logoSvg))
  .resize(120, 78)
  .png()
  .toFile(path.join(outDir, 'copa2026-logo-sm.png'))

// Logo em branco puro (para fundo verde)
const logoWhiteSvg = logoSvg.replace(/fill="url\(#trophy\)"/g, 'fill="#F5D060"')
await sharp(Buffer.from(logoWhiteSvg))
  .resize(400, 260)
  .png()
  .toFile(path.join(outDir, 'copa2026-logo-color.png'))

console.log('✅ Logo Copa 2026 gerado: copa2026-logo.png, copa2026-logo-sm.png')
