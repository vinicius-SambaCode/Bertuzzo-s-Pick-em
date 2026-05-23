/**
 * Mapeamento dos códigos FIFA (3 letras) para os códigos ISO usados pelo flagcdn.com
 * Todos os 48 times da Copa do Mundo 2026.
 */
export const FIFA_TO_ISO: Record<string, string> = {
  // Grupo A
  MEX: "mx", RSA: "za", KOR: "kr", CZE: "cz",
  // Grupo B
  CAN: "ca", BIH: "ba", QAT: "qa", SUI: "ch",
  // Grupo C  — SCO usa código de subdivisão do Reino Unido
  BRA: "br", MAR: "ma", HAI: "ht", SCO: "gb-sct",
  // Grupo D
  USA: "us", PAR: "py", AUS: "au", TUR: "tr",
  // Grupo E  — CUW = Curaçao
  GER: "de", CUW: "cw", CIV: "ci", ECU: "ec",
  // Grupo F
  NED: "nl", JPN: "jp", SWE: "se", TUN: "tn",
  // Grupo G
  BEL: "be", EGY: "eg", IRN: "ir", NZL: "nz",
  // Grupo H
  ESP: "es", CPV: "cv", KSA: "sa", URU: "uy",
  // Grupo I
  FRA: "fr", SEN: "sn", IRQ: "iq", NOR: "no",
  // Grupo J
  ARG: "ar", ALG: "dz", AUT: "at", JOR: "jo",
  // Grupo K  — COD = Congo DR (código cd)
  POR: "pt", COD: "cd", UZB: "uz", COL: "co",
  // Grupo L  — ENG usa código de subdivisão do Reino Unido
  ENG: "gb-eng", CRO: "hr", GHA: "gh", PAN: "pa",
}

type FlagWidth = 20 | 40 | 80 | 160

/**
 * Retorna a URL da bandeira no flagcdn.com para o código FIFA informado.
 * @param code Código FIFA de 3 letras (ex: "BRA", "MEX")
 * @param width Largura desejada em pixels (20, 40, 80 ou 160)
 */
export function getFlagUrl(code: string, width: FlagWidth = 40): string {
  const iso = FIFA_TO_ISO[code?.toUpperCase()]
  if (!iso) return ""
  return `https://flagcdn.com/w${width}/${iso}.png`
}

/** Retorna a URL em 2× resolução (para retina/HiDPI) */
export function getFlagUrl2x(code: string, width: FlagWidth = 40): string {
  const iso = FIFA_TO_ISO[code?.toUpperCase()]
  if (!iso) return ""
  return `https://flagcdn.com/w${width * 2}/${iso}.png`
}
