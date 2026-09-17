// src/lib/noticias/queries.ts
import { db } from "@/lib/db"
import { noticias } from "@/lib/db/schema"
import { eq, desc, and, ne, count, isNull, notInArray } from "drizzle-orm"
import { unstable_cache } from "next/cache"
import type { Noticia, ConteudoTipo } from "@/lib/db/schema"
import { siteConfig } from "@/site.config"

// Filtro aplicado em tudo que é "listagem pública" (home, feeds, sitemap, busca):
// esconde categorias legadas marcadas como hiddenCategories. Links diretos
// (/categoria/<slug> e /<post-slug>) continuam funcionando.
const HIDDEN = siteConfig.hiddenCategories ?? []

function excluirOcultas() {
  return HIDDEN.length > 0 ? notInArray(noticias.categoria, HIDDEN) : undefined
}

// Guias/dicas de desentupimento para linkagem interna (topic cluster) nas páginas
// de diretório. Cacheado global (1 query/hora p/ todas as cidades), só campos leves.
export const getGuiasDesentupimento = unstable_cache(
  async (): Promise<{ slug: string; titulo: string }[]> =>
    db
      .select({ slug: noticias.slug, titulo: noticias.titulo })
      .from(noticias)
      .where(and(
        eq(noticias.status, "published"),
        isNull(noticias.deleted_at),
        excluirOcultas(),
      ))
      .orderBy(desc(noticias.published_at))
      .limit(8),
  ["guias-desentupimento-diretorio"],
  { revalidate: 3600, tags: ["noticias"] },
)

export async function getNoticiasPublicadas(limit = 20, offset = 0, tipo: ConteudoTipo = "noticia") {
  return db
    .select()
    .from(noticias)
    .where(and(
      eq(noticias.status, "published"),
      eq(noticias.tipo, tipo),
      isNull(noticias.deleted_at),
      excluirOcultas(),
    ))
    .orderBy(desc(noticias.published_at))
    .limit(limit)
    .offset(offset)
}

export async function getNoticiasByCategoria(categoria: string, limit = 20, offset = 0, tipo: ConteudoTipo = "noticia") {
  // Não aplica excluirOcultas aqui — quando o usuário está olhando a categoria,
  // ele quer ver os posts dela (mesmo que seja oculta do agregado).
  return db
    .select()
    .from(noticias)
    .where(and(
      eq(noticias.status, "published"),
      eq(noticias.tipo, tipo),
      eq(noticias.categoria, categoria),
      isNull(noticias.deleted_at)
    ))
    .orderBy(desc(noticias.published_at))
    .limit(limit)
    .offset(offset)
}

export async function countNoticiasPublicadas(tipo: ConteudoTipo = "noticia"): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(noticias)
    .where(and(
      eq(noticias.status, "published"),
      eq(noticias.tipo, tipo),
      isNull(noticias.deleted_at),
      excluirOcultas(),
    ))
  return row?.total ?? 0
}

export async function countNoticiasByCategoria(categoria: string, tipo: ConteudoTipo = "noticia"): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(noticias)
    .where(and(eq(noticias.status, "published"), eq(noticias.tipo, tipo), eq(noticias.categoria, categoria), isNull(noticias.deleted_at)))
  return row?.total ?? 0
}

export async function getNoticiaBySlug(slug: string, tipo?: ConteudoTipo): Promise<Noticia | null> {
  const conditions = [eq(noticias.slug, slug), eq(noticias.status, "published"), isNull(noticias.deleted_at)]
  if (tipo) conditions.push(eq(noticias.tipo, tipo))
  const [noticia] = await db
    .select()
    .from(noticias)
    .where(and(...conditions))
    .limit(1)
  return noticia ?? null
}

export async function getNoticiasRelacionadas(categoria: string, excludeId: string, limit = 4, tipo: ConteudoTipo = "noticia") {
  return db
    .select({
      id:         noticias.id,
      titulo:     noticias.titulo,
      slug:       noticias.slug,
      resumo:     noticias.resumo,
      imagem_url: noticias.imagem_url,
      imagem_alt: noticias.imagem_alt,
      categoria:  noticias.categoria,
      published_at: noticias.published_at,
    })
    .from(noticias)
    .where(and(
      eq(noticias.status, "published"),
      eq(noticias.tipo, tipo),
      eq(noticias.categoria, categoria),
      ne(noticias.id, excludeId),
      isNull(noticias.deleted_at)
    ))
    .orderBy(desc(noticias.published_at))
    .limit(limit)
}
