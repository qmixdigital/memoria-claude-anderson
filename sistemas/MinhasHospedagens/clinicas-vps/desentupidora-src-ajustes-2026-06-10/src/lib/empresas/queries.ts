import { cache } from "react"
import { unstable_cache } from "next/cache"
import { db } from "@/lib/db"
import { companies } from "@/lib/db/schema"
import { eq, and, desc, count, ilike, or, sql, countDistinct } from "drizzle-orm"
import type { Company } from "@/lib/db/schema"
import { cidadeSlug, tituloEmpresa } from "./utils"

export type EmpresaListaItem = Pick<Company,
  "id" | "slug" | "nome" | "razao_social" | "cnpj" | "uf" | "cidade" |
  "logo_url" | "verificada" | "destaque" | "descricao" | "segmento"
>

export type EmpresaFiltros = {
  busca?: string
  uf?: string
  cidade?: string
  segmento?: string
}

// Segmentos derivados dos CNAEs principais do nicho de desentupimento.
// Cada empresa importada da Receita Federal cai em um segmento conforme seu CNAE.
//   3702-9/00 → desentupidora
//   8129-0/00 → limpeza
//   3701-1/00 → redes-esgoto
//   4221-9/03 → manutencao
export const SEGMENTOS = [
  { slug: "desentupidora", label: "Desentupidora" },
  { slug: "limpeza",       label: "Limpeza Especializada" },
  { slug: "redes-esgoto",  label: "Redes de Esgoto" },
  { slug: "manutencao",    label: "Manutenção Hidráulica" },
] as const

export type SegmentoSlug = typeof SEGMENTOS[number]["slug"]

const STATUS_ATIVO = "active" as const

function buildConditions(f: EmpresaFiltros) {
  const conds = [eq(companies.status, STATUS_ATIVO)]
  if (f.busca && f.busca.length >= 2) {
    const pattern = `%${f.busca}%`
    conds.push(or(
      ilike(companies.nome, pattern),
      ilike(companies.razao_social, pattern),
      ilike(companies.cnpj, pattern),
    )!)
  }
  if (f.uf && f.uf.length === 2) {
    conds.push(eq(companies.uf, f.uf.toUpperCase()))
  }
  if (f.cidade) {
    conds.push(eq(companies.cidade, f.cidade))
  }
  if (f.segmento) {
    conds.push(eq(companies.segmento, f.segmento))
  }
  return conds
}

export async function getEmpresasPublicadas(limit = 20, offset = 0, filtros: EmpresaFiltros = {}): Promise<EmpresaListaItem[]> {
  const conditions = buildConditions(filtros)

  // 1) Pega só os 20 IDs (rápido — usa índice companies_listing_idx)
  const top = await db
    .select({
      id: companies.id,
      slug: companies.slug,
      nome: companies.nome,
      razao_social: companies.razao_social,
      cnpj: companies.cnpj,
      uf: companies.uf,
      cidade: companies.cidade,
      logo_url: companies.logo_url,
      verificada: companies.verificada,
      destaque: companies.destaque,
      descricao: companies.descricao,
      segmento: companies.segmento,
    })
    .from(companies)
    .where(and(...conditions))
    .orderBy(desc(companies.destaque), desc(companies.verificada), companies.nome)
    .limit(limit)
    .offset(offset)

  return top
}

export async function countEmpresasPublicadas(filtros: EmpresaFiltros = {}): Promise<number> {
  const conditions = buildConditions(filtros)
  const [row] = await db.select({ total: count() }).from(companies).where(and(...conditions))
  return row?.total ?? 0
}

// Cache de 1h: UFs mudam quando admin aprova nova empresa, não precisa ser instantâneo
export const getUfsDisponiveis = unstable_cache(
  async (): Promise<{ uf: string; total: number }[]> => {
    const rows = await db
      .select({ uf: companies.uf, total: count() })
      .from(companies)
      .where(and(eq(companies.status, STATUS_ATIVO), sql`${companies.uf} IS NOT NULL`))
      .groupBy(companies.uf)
      .orderBy(desc(count()))
    return rows.filter(r => r.uf).map(r => ({ uf: r.uf!, total: r.total }))
  },
  ["empresas-ufs-disponiveis"],
  { revalidate: 3600, tags: ["empresas-aggregates"] },
)

export async function getEmpresaBySlug(slug: string): Promise<Company | null> {
  const [row] = await db
    .select()
    .from(companies)
    .where(and(eq(companies.slug, slug), eq(companies.status, STATUS_ATIVO)))
    .limit(1)
  return row ?? null
}

export async function getEmpresasSlugsParaSitemap(limit = 50000, offset = 0): Promise<{ slug: string; updated_at: Date | null }[]> {
  return db
    .select({ slug: companies.slug, updated_at: companies.updated_at })
    .from(companies)
    .where(eq(companies.status, STATUS_ATIVO))
    .orderBy(desc(companies.updated_at))
    .limit(limit)
    .offset(offset)
}

export async function countEmpresasSitemap(): Promise<number> {
  const [row] = await db.select({ total: count() }).from(companies).where(eq(companies.status, STATUS_ATIVO))
  return row?.total ?? 0
}

// === Listagens por UF/Cidade/Segmento (rotas SEO) =========================

export async function getCidadesPorUf(uf: string, limit = 200): Promise<{ cidade: string; total: number }[]> {
  const rows = await db
    .select({ cidade: companies.cidade, total: count() })
    .from(companies)
    .where(and(
      eq(companies.status, STATUS_ATIVO),
      eq(companies.uf, uf.toUpperCase()),
      sql`${companies.cidade} IS NOT NULL AND ${companies.cidade} != ''`,
    ))
    .groupBy(companies.cidade)
    .orderBy(desc(count()))
    .limit(limit)
  return rows.filter(r => r.cidade).map(r => ({ cidade: r.cidade!, total: r.total }))
}

// Sem cache aqui: aceita filtros (uf/cidade), seria explosão de chaves cacheadas
export async function getSegmentosDisponiveis(filtros: EmpresaFiltros = {}): Promise<{ segmento: string; total: number }[]> {
  const conds = [eq(companies.status, STATUS_ATIVO), sql`${companies.segmento} IS NOT NULL`]
  if (filtros.uf && filtros.uf.length === 2) conds.push(eq(companies.uf, filtros.uf.toUpperCase()))
  if (filtros.cidade) conds.push(eq(companies.cidade, filtros.cidade))

  const rows = await db
    .select({ segmento: companies.segmento, total: count() })
    .from(companies)
    .where(and(...conds))
    .groupBy(companies.segmento)
    .orderBy(desc(count()))
  return rows.filter(r => r.segmento).map(r => ({ segmento: r.segmento!, total: r.total }))
}

// Versão cacheada — usada nas listagens sem filtro (home, /empresas)
export const getSegmentosDisponiveisGlobal = unstable_cache(
  async (): Promise<{ segmento: string; total: number }[]> => getSegmentosDisponiveis(),
  ["empresas-segmentos-global"],
  { revalidate: 3600, tags: ["empresas-aggregates"] },
)

export async function getEmpresasParaMapa(filtros: { uf?: string; cidade?: string; limit?: number } = {}): Promise<Array<{ id: string; slug: string; nome: string; lat: number; lng: number; verificada: boolean }>> {
  const conds = [
    eq(companies.status, STATUS_ATIVO),
    sql`${companies.latitude} IS NOT NULL AND ${companies.longitude} IS NOT NULL`,
  ]
  if (filtros.uf && filtros.uf.length === 2) conds.push(eq(companies.uf, filtros.uf.toUpperCase()))
  if (filtros.cidade) conds.push(eq(companies.cidade, filtros.cidade))

  const rows = await db
    .select({
      id: companies.id,
      slug: companies.slug,
      nome: companies.nome,
      lat: companies.latitude,
      lng: companies.longitude,
      verificada: companies.verificada,
    })
    .from(companies)
    .where(and(...conds))
    .orderBy(desc(companies.verificada), desc(companies.destaque))
    .limit(filtros.limit ?? 200)

  return rows
    .filter(r => r.lat !== null && r.lng !== null)
    .map(r => ({
      id: r.id,
      slug: r.slug,
      nome: tituloEmpresa(r.nome),
      lat: parseFloat(String(r.lat)),
      lng: parseFloat(String(r.lng)),
      verificada: r.verificada,
    }))
}

export const getTopCidades = unstable_cache(
  async (limit = 12): Promise<{ uf: string; cidade: string; total: number }[]> => {
    const rows = await db
      .select({ uf: companies.uf, cidade: companies.cidade, total: count() })
      .from(companies)
      .where(and(
        eq(companies.status, STATUS_ATIVO),
        sql`${companies.cidade} IS NOT NULL AND ${companies.uf} IS NOT NULL`,
      ))
      .groupBy(companies.uf, companies.cidade)
      .orderBy(desc(count()))
      .limit(limit)
    return rows.filter(r => r.uf && r.cidade).map(r => ({ uf: r.uf!, cidade: r.cidade!, total: r.total }))
  },
  ["empresas-top-cidades"],
  { revalidate: 3600, tags: ["empresas-aggregates"] },
)

export const countTotalEmpresas = unstable_cache(
  async (): Promise<number> => {
    const [row] = await db.select({ total: count() }).from(companies).where(eq(companies.status, STATUS_ATIVO))
    return row?.total ?? 0
  },
  ["empresas-count-total"],
  { revalidate: 3600, tags: ["empresas-aggregates"] },
)

export const countEmpresasVerificadas = unstable_cache(
  async (): Promise<number> => {
    const [row] = await db.select({ total: count() }).from(companies).where(and(
      eq(companies.status, STATUS_ATIVO),
      eq(companies.verificada, true),
    ))
    return row?.total ?? 0
  },
  ["empresas-count-verificadas"],
  { revalidate: 3600, tags: ["empresas-aggregates"] },
)

export const countCidadesUnicas = unstable_cache(
  async (): Promise<number> => {
    const [row] = await db
      .select({ total: countDistinct(companies.cidade) })
      .from(companies)
      .where(and(
        eq(companies.status, STATUS_ATIVO),
        sql`${companies.cidade} IS NOT NULL`,
      ))
    return row?.total ?? 0
  },
  ["empresas-count-cidades"],
  { revalidate: 3600, tags: ["empresas-aggregates"] },
)

// React.cache deduplica entre generateMetadata e o componente da mesma request.
export const resolverCidadePorSlug = cache(async (uf: string, slug: string): Promise<string | null> => {
  const rows = await db
    .selectDistinct({ cidade: companies.cidade })
    .from(companies)
    .where(and(
      eq(companies.status, STATUS_ATIVO),
      eq(companies.uf, uf.toUpperCase()),
      sql`${companies.cidade} IS NOT NULL`,
    ))

  for (const r of rows) {
    if (r.cidade && cidadeSlug(r.cidade) === slug) return r.cidade
  }
  return null
})

export async function getCidadesPaginadasParaSitemap(limit = 5000): Promise<{ uf: string; cidade: string }[]> {
  const rows = await db
    .select({ uf: companies.uf, cidade: companies.cidade, total: count() })
    .from(companies)
    .where(and(
      eq(companies.status, STATUS_ATIVO),
      sql`${companies.cidade} IS NOT NULL AND ${companies.uf} IS NOT NULL`,
    ))
    .groupBy(companies.uf, companies.cidade)
    .having(sql`COUNT(*) >= 3`) // só cidades com 3+ empresas (evita explosão de URLs vazias)
    .orderBy(desc(count()))
    .limit(limit)
  return rows.filter(r => r.uf && r.cidade).map(r => ({ uf: r.uf!, cidade: r.cidade! }))
}
