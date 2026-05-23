"use client"

import { useState } from "react"

type Size = "xs" | "sm" | "md" | "lg" | "xl"

const IMG_H: Record<Size, number> = { xs: 32, sm: 48, md: 72, lg: 96, xl: 128 }
const TITLE_SIZE: Record<Size, string> = { xs: "text-xs", sm: "text-sm", md: "text-base", lg: "text-lg", xl: "text-xl" }

/**
 * Exibe o logo oficial da Copa 2026.
 *
 * → Para usar o logo REAL: salve a Imagem 1 do chat em
 *   public/images/copa2026-logo.png
 *   O componente usa essa imagem automaticamente.
 *
 * → Se a imagem não existir, usa tipografia limpa como fallback.
 */
export function Copa2026Logo({ size = "md", subtitle }: { size?: Size; subtitle?: string }) {
  const [imgFailed, setImgFailed] = useState(false)
  const h = IMG_H[size]

  return (
    <div className="flex flex-col items-center select-none gap-1">
      {!imgFailed ? (
        <img
          src="/images/copa2026-logo.png"
          alt="FIFA World Cup 2026"
          className="copa-logo-img object-contain"
          style={{ height: h, width: "auto", maxWidth: h * 1.8 }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        /* Fallback tipográfico — sem emoji, só texto */
        <div className="flex items-end gap-1 leading-none" style={{ height: h }}>
          <span className="font-display text-white" style={{ fontSize: h * 0.85 }}>2</span>
          <div className="flex flex-col items-center pb-1">
            <span className="font-display text-white" style={{ fontSize: h * 0.5 }}>★</span>
            <span className="font-heading font-black tracking-[0.2em] text-white" style={{ fontSize: h * 0.18 }}>FIFA™</span>
          </div>
          <span className="font-display text-white" style={{ fontSize: h * 0.85 }}>6</span>
        </div>
      )}

      {subtitle && (
        <p className={`font-heading font-black uppercase tracking-widest ${TITLE_SIZE[size]}`}
           style={{ color: "#FFCD00", marginTop: 2 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
