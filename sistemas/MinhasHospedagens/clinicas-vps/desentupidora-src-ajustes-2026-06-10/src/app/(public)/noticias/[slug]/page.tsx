// src/app/(public)/noticias/[slug]/page.tsx
import { cache } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { siteConfig } from "@/site.config"
import { getNoticiaBySlug, getNoticiasRelacionadas } from "@/lib/noticias/queries"
import { getAutorWithNoticiaBySlug } from "@/lib/autores/queries"
import { getMaisLidasSemana } from "@/lib/noticias/mais-lidas"
import { ArticleFullWidth } from "@/components/noticias/ArticleFullWidth"
import { ArticleSidebarRight } from "@/components/noticias/ArticleSidebarRight"
import { ArticleMinimal } from "@/components/noticias/ArticleMinimal"
import { ReadingProgress } from "@/components/ui/ReadingProgress"
import { BackToTop } from "@/components/ui/BackToTop"
import { ViewTracker } from "@/components/ui/ViewTracker"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import Link from "next/link"

// Deduplicate within the same request
const getNoticia = cache(getNoticiaBySlug)

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const noticia = await getNoticia(slug)
  if (!noticia) return {}

  const base    = `https://${siteConfig.domain}`
  // Canonical aponta para URL legada /%postname%/ (preservada em /[slug])
  const pageUrl = `${base}/${slug}`
  const seoTitle = noticia.seo_title ?? noticia.titulo
  const seoDesc  = noticia.seo_description ?? noticia.resumo ?? undefined

  // Converte URL relativa (/uploads/...) em absoluta para OG/WhatsApp
  const rawImg = noticia.imagem_url
  const ogImageUrl = rawImg
    ? (rawImg.startsWith("http") ? rawImg : `${base}${rawImg}`)
    : `${base}/og?titulo=${encodeURIComponent(noticia.titulo)}&categoria=${encodeURIComponent(noticia.categoria ?? "")}&resumo=${encodeURIComponent(noticia.resumo ?? "")}`

  return {
    title: seoTitle,
    description: seoDesc,
    keywords: noticia.tags?.join(", ") ?? undefined,
    alternates: {
      canonical: noticia.seo_canonical ?? pageUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      type: "article",
      url: pageUrl,
      siteName: siteConfig.name,
      locale: "pt_BR",
      publishedTime: noticia.published_at?.toISOString(),
      modifiedTime: noticia.updated_at?.toISOString(),
      section: noticia.categoria ?? undefined,
      tags: noticia.tags ?? undefined,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: noticia.imagem_alt ?? noticia.titulo,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      title: seoTitle,
      description: seoDesc,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
    },
  }
}

export default async function ArtigoPage({ params }: Props) {
  const { slug } = await params
  const noticia = await getNoticia(slug)
  if (!noticia) notFound()

  const [relacionadas, autor, maisLidas] = await Promise.all([
    getNoticiasRelacionadas(noticia.categoria ?? "", noticia.id),
    getAutorWithNoticiaBySlug(slug),
    getMaisLidasSemana(5),
  ])

  const base    = `https://${siteConfig.domain}`
  // Canonical aponta para URL legada /%postname%/ (preservada em /[slug])
  const pageUrl = `${base}/${slug}`
  const rawImg  = noticia.imagem_url
  const ogImageUrl = rawImg
    ? (rawImg.startsWith("http") ? rawImg : `${base}${rawImg}`)
    : undefined

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    url: pageUrl,
    headline: noticia.titulo,
    description: noticia.seo_description ?? noticia.resumo ?? undefined,
    datePublished: noticia.published_at?.toISOString(),
    dateModified: noticia.updated_at?.toISOString(),
    image: ogImageUrl
      ? [{ "@type": "ImageObject", url: ogImageUrl, width: 1200, height: 630 }]
      : undefined,
    keywords: noticia.tags?.join(", ") ?? undefined,
    articleSection: noticia.categoria ?? undefined,
    inLanguage: "pt-BR",
    author: autor
      ? { "@type": "Person", name: autor.nome, url: `${base}/autor/${autor.slug}` }
      : { "@type": "Organization", name: siteConfig.name, url: base },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: base,
      logo: { "@type": "ImageObject", url: `${base}${siteConfig.logo.file}` },
    },
  }

  // Tempo de leitura estimado (200 palavras/min)
  const wordCount = (noticia.conteudo ?? "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.round(wordCount / 200))

  const props = { noticia, relacionadas, readingTime, autor }

  const categoriaLabel = noticia.categoria
    ? siteConfig.categories.find(c => c.slug === noticia.categoria)?.label ?? noticia.categoria
    : null

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Notícias", href: "/noticias" },
    ...(noticia.categoria && categoriaLabel
      ? [{ label: categoriaLabel, href: `/categoria/${noticia.categoria}` }]
      : []),
    { label: noticia.titulo },
  ]

  return (
    <>
      <ReadingProgress />
      <BackToTop />
      <ViewTracker slug={slug} />
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {siteConfig.layout.article === "sidebar-right" ? <ArticleSidebarRight {...props} maisLidas={maisLidas} /> :
       siteConfig.layout.article === "minimal"       ? <ArticleMinimal {...props} /> :
                                                        <ArticleFullWidth {...props} />}

      {/* CTA p/ o diretório — topic cluster: conteúdo -> diretório (passa autoridade às páginas de cidade) */}
      <div className="max-w-3xl mx-auto px-4 my-12">
        <div className="border-2 border-dark rounded-lg p-6 bg-[var(--color-primary-soft)]">
          <h2 className="text-xl font-black text-dark tracking-tight mb-2">Precisa de uma desentupidora?</h2>
          <p className="text-sm text-dark leading-relaxed mb-4">
            Se o entupimento não resolver, encontre <strong>desentupidoras com CNPJ verificado na Receita Federal</strong>{" "}
            na sua cidade — desentupimento de esgoto, fossa, caixa de gordura e hidrojateamento, com contato direto e orçamento.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/empresas/" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">
              Ver desentupidoras por cidade →
            </Link>
            <Link href="/empresas/cidades/" className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-dark text-dark text-sm font-bold rounded-md hover:border-primary hover:text-primary transition-colors">
              Buscar por estado
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
