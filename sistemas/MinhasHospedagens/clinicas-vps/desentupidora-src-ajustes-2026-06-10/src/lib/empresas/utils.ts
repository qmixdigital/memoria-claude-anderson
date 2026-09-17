// src/lib/empresas/utils.ts
//
// Helpers compartilhados pelas rotas /empresas/* — centralizados aqui pra
// evitar duplicação entre cidades/page.tsx, cidades/[uf]/page.tsx, etc.

import { MUNICIPIOS_IBGE } from "./municipios-ibge"

export const UF_NOME: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia",
  CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás",
  MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
  PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí",
  RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RS: "Rio Grande do Sul",
  RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo",
  SE: "Sergipe", TO: "Tocantins",
}

// Preposição contraída para frases naturais em pt-BR: "{prep} {nome}".
// Ex.: "de São Paulo", "do Rio de Janeiro", "da Bahia".
export const UF_PREP: Record<string, string> = {
  AC: "do", AL: "de", AP: "do", AM: "do", BA: "da", CE: "do", DF: "do", ES: "do",
  GO: "de", MA: "do", MT: "de", MS: "do", MG: "de", PA: "do", PB: "da", PR: "do",
  PE: "de", PI: "do", RJ: "do", RN: "do", RS: "do", RO: "de", RR: "de", SC: "de",
  SP: "de", SE: "de", TO: "do",
}

// "do estado de São Paulo" / "do estado do Rio de Janeiro" — frase pronta.
export function estadoComPrep(uf: string): string {
  const u = uf.toUpperCase()
  return `${UF_PREP[u] ?? "de"} ${UF_NOME[u] ?? u}`
}

// Monta o <title> mantendo ≤60 chars: anexa a marca só se couber; senão deixa
// só o título (a keyword fica visível no SERP em vez de a marca ser truncada).
export function tituloSeo(titulo: string, marca: string): string {
  const full = `${titulo} — ${marca}`
  return full.length <= 60 ? full : titulo
}

// Range ̀-ͯ = Combining Diacritical Marks (acentos decompostos via NFD)
const DIACRITICS = /[̀-ͯ]/g
const NON_ALNUM = /[^a-z0-9]+/g
const TRIM_DASH = /^-+|-+$/g

export function cidadeSlug(s: string): string {
  return s.toLowerCase()
    .normalize("NFD").replace(DIACRITICS, "")
    .replace(NON_ALNUM, "-").replace(TRIM_DASH, "")
}

// Normaliza p/ chave de busca: minúsculo, sem acento, espaço único.
function normChave(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, " ").trim()
}

const CIDADE_CONECTORES = new Set(["de", "da", "do", "das", "dos", "e"])

// Re-acentua o nome da cidade (vem de-acentuado da Receita Federal, ex.: "Sao Paulo",
// "Abadia De Goias") usando o nome oficial do IBGE. Mantém o valor cru no banco/filtros;
// isto é só pra DISPLAY (título, H1, breadcrumb, schema). Fallback: title-case com
// conectores minúsculos quando o município não está no IBGE.
export function cidadeLabel(cidade: string | null | undefined, uf?: string | null): string {
  if (!cidade) return ""
  const chave = normChave(cidade)
  if (uf) {
    const oficial = MUNICIPIOS_IBGE[uf.toUpperCase()]?.[chave]
    if (oficial) return oficial
  }
  for (const u in MUNICIPIOS_IBGE) {
    const o = MUNICIPIOS_IBGE[u][chave]
    if (o) return o
  }
  return cidade.trim().toLowerCase().split(/\s+/)
    .map((w, i) => (i > 0 && CIDADE_CONECTORES.has(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

const EMPRESA_CONECTORES = new Set(["de", "da", "do", "das", "dos", "e", "em", "na", "no", "a", "o", "com", "para", "por", "ao", "à", "às"])
// Siglas/sufixos jurídicos que têm grafia canônica própria (não title-case comum).
const EMPRESA_SIGLAS: Record<string, string> = {
  ltda: "Ltda", "ltda.": "Ltda.", me: "ME", epp: "EPP", eireli: "Eireli",
  mei: "MEI", sa: "S.A.", "s/a": "S.A.", "s.a": "S.A.", "s.a.": "S.A.",
  cia: "Cia", "cia.": "Cia.", ind: "Ind", com: "Com",
}

// Converte nome de empresa CAIXA ALTA (Receita Federal) em Title Case legível.
// Mantém conectores minúsculos, siglas jurídicas canônicas, e remove o fragmento de
// CNPJ que a Receita prefixa em alguns MEIs (ex.: "49.071.605 FULANO" → "Fulano").
export function tituloEmpresa(nome: string | null | undefined): string {
  if (!nome) return ""
  let s = nome.trim().replace(/\s+/g, " ")
  // remove fragmento de CNPJ no início (precisa ter ponto/barra pra não comer "24 Horas")
  s = s.replace(/^\d[\d]*[./-][\d./-]*\s+(?=\p{L})/u, "")
  // remove pontuação/símbolos residuais no início (ex.: ". Engenia", "- Fulano")
  s = s.replace(/^[^\p{L}\p{N}]+/u, "")
  if (!s) s = nome.trim()
  const out = s.split(" ").map((w, i) => {
    const lower = w.toLowerCase()
    if (EMPRESA_SIGLAS[lower]) return EMPRESA_SIGLAS[lower]
    // conector minúsculo — mas letra única (P C A) é inicial, não conector; só "e" é exceção
    if (i > 0 && EMPRESA_CONECTORES.has(lower) && (w.length > 1 || lower === "e")) return lower
    // preserva tokens já com mistura de caixa relevante (raro em dados da Receita)
    if (/[a-z]/.test(w) && /[A-Z]/.test(w.slice(1))) return w
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  }).join(" ")
  return out || nome.trim()
}
