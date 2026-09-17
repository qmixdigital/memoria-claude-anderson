import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { siteConfig } from "@/site.config"
import {
  getEmpresasPublicadas,
  countEmpresasPublicadas,
  getUfsDisponiveis,
  SEGMENTOS,
} from "@/lib/empresas/queries"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { Pagination } from "@/components/ui/Pagination"
import { tituloEmpresa, cidadeLabel, tituloSeo } from "@/lib/empresas/utils"
import { FaqSection, type Faq } from "@/components/seo/FaqSection"
import { ShieldCheck, Building2 } from "lucide-react"

// Descrição editorial por segmento (conteúdo único pra SEO, não-duplicado).
const SEG_INTRO: Record<string, string> = {
  "desentupidora": "Empresas especializadas em desentupimento de esgoto, pias, ralos, vasos sanitários e tubulações, com equipamentos profissionais e atendimento de emergência.",
  "limpeza": "Empresas de limpeza especializada e hidrojateamento de alta pressão para fossas, caixas de gordura, redes pluviais e tubulações industriais.",
  "redes-esgoto": "Empresas que atuam na manutenção, limpeza e desobstrução de redes de esgoto e saneamento, incluindo galerias e coletores.",
  "manutencao": "Empresas de manutenção hidráulica preventiva e corretiva, reparo de vazamentos, troca de tubulações e desobstrução de sistemas.",
}
const SEG_FAQ_SERVICO: Record<string, string> = {
  "desentupidora": "desentupimento de esgoto, pia, ralo, vaso sanitário e caixa de gordura",
  "limpeza": "hidrojateamento, limpeza de fossa, caixa de gordura e redes pluviais",
  "redes-esgoto": "desobstrução e limpeza de redes de esgoto, galerias e coletores",
  "manutencao": "reparo de vazamentos, troca de tubulação e manutenção hidráulica preventiva",
}

export const dynamic = "force-dynamic"

const PER_PAGE = 24

const SEG_LABEL = Object.fromEntries(SEGMENTOS.map(s => [s.slug, s.label]))
const SEG_VALID = new Set<string>(SEGMENTOS.map(s => s.slug))

type Props = {
  params: Promise<{ seg: string }>
  searchParams: Promise<{ page?: string; uf?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seg } = await params
  if (!SEG_VALID.has(seg)) return { title: "Segmento não encontrado" }
  const label = SEG_LABEL[seg]
  const titulo = `Empresas de ${label} no Brasil`
  const canonical = `https://${siteConfig.domain}/empresas/segmentos/${seg}/`
  const description = `Diretório de empresas de ${label.toLowerCase()} no Brasil com CNPJ verificado na Receita Federal. Veja contatos e peça orçamento de desentupimento.`
  return {
    title: { absolute: tituloSeo(titulo, siteConfig.name) },
    description,
    alternates: { canonical },
    openGraph: { title: titulo, description, url: canonical, siteName: siteConfig.name, locale: "pt_BR", type: "website", images: ["/og-default.jpg"] },
  }
}

export async function generateStaticParams() {
  return SEGMENTOS.map(s => ({ seg: s.slug }))
}

export default async function EmpresasPorSegmentoPage({ params, searchParams }: Props) {
  const { seg } = await params
  if (!SEG_VALID.has(seg)) notFound()

  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const offset = (page - 1) * PER_PAGE
  const uf = (sp.uf ?? "").trim().toUpperCase()

  const filtros = {
    segmento: seg,
    uf: uf || undefined,
  }

  const [empresas, total, ufs] = await Promise.all([
    getEmpresasPublicadas(PER_PAGE, offset, filtros),
    countEmpresasPublicadas(filtros),
    getUfsDisponiveis(),
  ])
  const totalPages = Math.ceil(total / PER_PAGE)

  const baseUrl = uf
    ? `/empresas/segmentos/${seg}?uf=${uf}`
    : `/empresas/segmentos/${seg}`

  const label = SEG_LABEL[seg]
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${label} — Empresas no Brasil`,
    description: SEG_INTRO[seg] ?? `Empresas de ${label.toLowerCase()} no Brasil.`,
    url: `https://${siteConfig.domain}/empresas/segmentos/${seg}/`,
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: `https://${siteConfig.domain}/` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: empresas.length,
      itemListElement: empresas.map((e, i) => ({
        "@type": "ListItem",
        position: offset + i + 1,
        item: { "@type": "LocalBusiness", name: tituloEmpresa(e.nome), url: `https://${siteConfig.domain}/empresas/${e.slug}/` },
      })),
    },
  }

  const faqs: Faq[] = [
    {
      q: `O que faz uma empresa de ${label.toLowerCase()}?`,
      a: `${SEG_INTRO[seg] ?? `Empresas de ${label.toLowerCase()} atuam no setor de desentupimento e saneamento.`}`,
    },
    {
      q: `Quais serviços de ${label.toLowerCase()} estão disponíveis?`,
      a: `As empresas listadas atuam com ${SEG_FAQ_SERVICO[seg] ?? "desentupimento e saneamento"}. Você pode filtrar por estado e falar direto com cada empresa.`,
    },
    {
      q: `As empresas de ${label.toLowerCase()} são verificadas?`,
      a: `Sim. Todas as ${total.toLocaleString("pt-BR")} empresas de ${label.toLowerCase()} no ${siteConfig.name} têm CNPJ ativo verificado na base da Receita Federal.`,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Empresas", href: "/empresas/" },
        { label }, ]} />

      <div className="mb-8 pb-4 border-b-2 border-dark">
        <div className="w-8 h-0.5 bg-primary mb-3" />
        <h1 className="text-3xl font-black text-dark uppercase tracking-tight">
          Empresas de {label}
        </h1>
        <p className="text-sm text-muted mt-2">
          {total.toLocaleString("pt-BR")} empresas {uf ? `em ${uf} ` : ""}cadastradas no diretório.
        </p>
      </div>

      {!uf && (
        <section className="mb-8 max-w-3xl">
          <p className="text-base text-dark leading-relaxed">
            {SEG_INTRO[seg]} Todas as <strong>{total.toLocaleString("pt-BR")} empresas de {label.toLowerCase()}</strong> no{" "}
            <strong>{siteConfig.name}</strong> têm CNPJ ativo verificado na <strong>Receita Federal</strong>. Filtre por estado e fale direto com cada empresa.
          </p>
        </section>
      )}

      <form action={`/empresas/segmentos/${seg}`} method="get" className="mb-6 flex gap-2 flex-wrap">
        <select
          name="uf"
          defaultValue={uf}
          className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary"
        >
          <option value="">Todos UFs</option>
          {ufs.map(({ uf: u, total: n }) => (
            <option key={u} value={u}>{u} ({n.toLocaleString("pt-BR")})</option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90">
          Filtrar
        </button>
        {uf && (
          <Link href={`/empresas/segmentos/${seg}/`} className="px-4 py-2 text-sm font-semibold text-muted border border-border rounded-lg hover:text-primary hover:border-primary">
            Limpar
          </Link>
        )}
      </form>

      {empresas.length === 0 ? (
        <p className="text-muted text-center py-16">Nenhuma empresa encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {empresas.map(e => (
            <Link
              key={e.id}
              href={`/empresas/${e.slug}/`}
              className="group block border border-border rounded-xl p-5 hover:border-primary hover:shadow-md transition-all bg-bg"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-dark group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {tituloEmpresa(e.nome)}
                  </h2>
                  {e.cnpj && <p className="text-[11px] text-muted mt-1 font-mono">{e.cnpj}</p>}
                </div>
                <Building2 size={18} className="text-muted/40 flex-shrink-0" strokeWidth={1.5} />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted">
                {e.verificada && (
                  <span className="flex items-center gap-1 text-primary font-semibold">
                    <ShieldCheck size={12} strokeWidth={2.5} /> Verificada
                  </span>
                )}
                {e.cidade && e.uf && <span>{cidadeLabel(e.cidade, e.uf)}/{e.uf}</span>}
                {!e.cidade && e.uf && <span>{e.uf}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} baseUrl={baseUrl} />

      <FaqSection faqs={faqs} titulo={`Perguntas frequentes sobre ${label.toLowerCase()}`} />
    </div>
  )
}
