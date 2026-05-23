import { getFlagUrl, getFlagUrl2x } from "@/lib/flags"

type Size = "xs" | "sm" | "md" | "lg" | "xl"

const SIZES: Record<Size, { w: number; h: number; fdw: 20 | 40 | 80 | 160 }> = {
  xs: { w: 20, h: 14, fdw: 20  },
  sm: { w: 28, h: 19, fdw: 40  },
  md: { w: 36, h: 24, fdw: 40  },
  lg: { w: 48, h: 32, fdw: 80  },
  xl: { w: 64, h: 43, fdw: 80  },
}

interface TeamFlagProps {
  /** Código FIFA de 3 letras: "BRA", "MEX", "GER"… */
  code: string
  /** Nome do time (usado no alt da imagem) */
  name?: string
  /** Tamanho da bandeira */
  size?: Size
  /** Classe adicional no wrapper */
  className?: string
}

/**
 * Exibe a bandeira oficial do país via flagcdn.com.
 * Suporta retina (srcSet automático).
 * Cai de volta para um quadrado colorido com as iniciais se o código não for encontrado.
 */
export function TeamFlag({ code, name, size = "sm", className = "" }: TeamFlagProps) {
  const { w, h, fdw } = SIZES[size]
  const src    = getFlagUrl(code, fdw)
  const src2x  = getFlagUrl2x(code, fdw)
  const label  = name ?? code

  if (!src) {
    // Fallback: quadrado com as 2 primeiras letras do código
    return (
      <span
        className={`inline-flex items-center justify-center rounded-sm text-white font-bold flex-shrink-0 ${className}`}
        style={{ width: w, height: h, fontSize: h * 0.55, background: "#243354" }}
        title={label}
      >
        {code?.slice(0, 2)}
      </span>
    )
  }

  return (
    <img
      src={src}
      srcSet={`${src} 1x, ${src2x} 2x`}
      alt={label}
      title={label}
      width={w}
      height={h}
      loading="lazy"
      decoding="async"
      className={`rounded-sm object-cover flex-shrink-0 inline-block ${className}`}
      style={{ width: w, height: h }}
    />
  )
}

/**
 * Exibe bandeira + nome do time lado a lado.
 */
export function TeamWithFlag({
  code, name, size = "sm", nameFirst = false, className = "",
}: TeamFlagProps & { nameFirst?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {nameFirst && <span className="font-semibold">{name ?? code}</span>}
      <TeamFlag code={code} name={name} size={size} />
      {!nameFirst && <span className="font-semibold">{name ?? code}</span>}
    </span>
  )
}
