import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { siteConfig } from "@/site.config"
import {
  getEmpresasPublicadas,
  countEmpresasPublicadas,
  getSegmentosDisponiveis,
  resolverCidadePorSlug,
  getEmpresasParaMapa,
  getCidadesPorUf,
  SEGMENTOS,
} from "@/lib/empresas/queries"
import { getGuiasDesentupimento } from "@/lib/noticias/queries"
import { MapaEmpresas } from "@/components/empresa/MapaEmpresas"
import { UF_NOME, cidadeLabel, tituloEmpresa, estadoComPrep, tituloSeo } from "@/lib/empresas/utils"
import { cidadeSlug } from "@/lib/empresas/utils"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { FaqSection, type Faq } from "@/components/seo/FaqSection"
import { Pagination } from "@/components/ui/Pagination"
import { ShieldCheck, Building2 } from "lucide-react"

export const revalidate = 3600

const PER_PAGE = 30

const SEG_LABEL = Object.fromEntries(SEGMENTOS.map(s => [s.slug, s.label]))

type Props = {
  params: Promise<{ uf: string; cidade: string }>
  searchParams: Promise<{ page?: string; seg?: string }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { uf, cidade } = await params
  const UF = uf.toUpperCase()
  const cidadeReal = await resolverCidadePorSlug(UF, cidade)
  if (!cidadeReal) return { title: "Cidade não encontrada" }

  const sp = await searchParams
  const seg = sp.seg
  const segLabel = seg ? SEG_LABEL[seg] : null
  const cidadeNome = cidadeLabel(cidadeReal, UF)

  const titulo = segLabel
    ? `${segLabel} em ${cidadeNome} (${UF})`
    : `Desentupidoras em ${cidadeNome} (${UF})`

  const canonical = `https://${siteConfig.domain}/empresas/cidades/${uf.toLowerCase()}/${cidade}/`
  const description = `${titulo}: empresas com CNPJ verificado para desentupimento de esgoto, fossa e caixa de gordura. Veja contatos e peça orçamento.`
  return {
    title: { absolute: tituloSeo(titulo, siteConfig.name) },
    description,
    alternates: { canonical },
    openGraph: { title: titulo, description, url: canonical, siteName: siteConfig.name, locale: "pt_BR", type: "website", images: ["/og-default.jpg"] },
  }
}

export default async function EmpresasPorCidadePage({ params, searchParams }: Props) {
  const { uf, cidade } = await params
  const UF = uf.toUpperCase()
  if (UF.length !== 2 || !UF_NOME[UF]) notFound()

  const cidadeReal = await resolverCidadePorSlug(UF, cidade)
  if (!cidadeReal) notFound()
  const cidadeNome = cidadeLabel(cidadeReal, UF)

  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const offset = (page - 1) * PER_PAGE
  const segmento = (sp.seg ?? "").trim()

  const filtros = {
    uf: UF,
    cidade: cidadeReal,
    segmento: segmento || undefined,
  }

  const [empresas, total, segmentos, pinsMapa, cidadesUf] = await Promise.all([
    getEmpresasPublicadas(PER_PAGE, offset, filtros),
    countEmpresasPublicadas(filtros),
    getSegmentosDisponiveis({ uf: UF, cidade: cidadeReal }),
    getEmpresasParaMapa({ uf: UF, cidade: cidadeReal, limit: 100 }),
    getCidadesPorUf(UF, 15),
  ])
  const totalPages = Math.ceil(total / PER_PAGE)
  const guias = await getGuiasDesentupimento()

  const estadoFrase = estadoComPrep(UF)
  const segLabels = segmentos.map(s => (SEG_LABEL[s.segmento] ?? s.segmento).toLowerCase())
  const servicosFrase = segLabels.length
    ? `${segLabels.slice(0, -1).join(", ")}${segLabels.length > 1 ? " e " : ""}${segLabels[segLabels.length - 1]}`
    : "desentupimento de esgoto, limpeza de fossa, caixa de gordura e hidrojateamento"

  // Cidades próximas (mesmo estado) para linkagem interna — exclui a atual
  const outrasCidades = cidadesUf
    .filter(c => cidadeSlug(c.cidade) !== cidade)
    .slice(0, 12)

  // FAQ com dados reais (varia por cidade) — elegível a featured snippet
  const faqs: Faq[] = [
    {
      q: `Quantas desentupidoras tem em ${cidadeNome}?`,
      a: `O ${siteConfig.name} lista ${total.toLocaleString("pt-BR")} desentupidora${total === 1 ? "" : "s"} com CNPJ ativo em ${cidadeNome} (${UF}), todas verificadas na base da Receita Federal.`,
    },
    {
      q: `Quais serviços de desentupimento encontro em ${cidadeNome}?`,
      a: `As empresas de ${cidadeNome} atuam com ${servicosFrase}. Você pode filtrar a lista por tipo de serviço e falar direto com cada desentupidora.`,
    },
    {
      q: `As desentupidoras em ${cidadeNome} atendem 24 horas?`,
      a: `Muitas desentupidoras em ${cidadeNome} oferecem atendimento emergencial 24 horas, inclusive fins de semana e feriados. Confirme a disponibilidade no contato de cada empresa antes de fechar o serviço.`,
    },
    {
      q: `Como contratar uma desentupidora confiável em ${cidadeNome}?`,
      a: `Prefira empresas com CNPJ ativo — todas as desentupidoras listadas em ${cidadeNome} são verificadas na Receita Federal. Confirme o endereço, peça orçamento por escrito e verifique os serviços oferecidos antes de contratar.`,
    },
  ]

  const baseUrl = segmento
    ? `/empresas/cidades/${uf.toLowerCase()}/${cidade}?seg=${segmento}`
    : `/empresas/cidades/${uf.toLowerCase()}/${cidade}`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Desentupidoras em ${cidadeNome} (${UF})`,
    description: `${total.toLocaleString("pt-BR")} desentupidoras em ${cidadeNome}, ${UF_NOME[UF]}.`,
    url: `https://${siteConfig.domain}/empresas/cidades/${uf.toLowerCase()}/${cidade}/`,
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: `https://${siteConfig.domain}/` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: empresas.length,
      itemListElement: empresas.map((e, i) => ({
        "@type": "ListItem",
        position: offset + i + 1,
        item: {
          "@type": "LocalBusiness",
          name: tituloEmpresa(e.nome),
          url: `https://${siteConfig.domain}/empresas/${e.slug}/`,
          address: { "@type": "PostalAddress", addressLocality: cidadeNome, addressRegion: UF, addressCountry: "BR" },
        },
      })),
    },
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Empresas", href: "/empresas/" },
        { label: "Por estado", href: "/empresas/cidades/" },
        { label: UF_NOME[UF] ?? UF, href: `/empresas/cidades/${uf.toLowerCase()}/` },
        { label: cidadeNome },
      ]} />

      <div className="mb-8 pb-4 border-b-2 border-dark">
        <div className="w-8 h-0.5 bg-primary mb-3" />
        <h1 className="text-3xl font-black text-dark uppercase tracking-tight">
          Desentupidoras em {cidadeNome}, {UF}
        </h1>
        <p className="text-sm text-muted mt-2">
          {total.toLocaleString("pt-BR")} desentupidoras {segmento && SEG_LABEL[segmento] ? `(${SEG_LABEL[segmento]}) ` : ""}
          em {cidadeNome} ({UF_NOME[UF]}).
        </p>
      </div>

      {!segmento && (
        <section className="mb-8 max-w-3xl">
          <p className="text-base text-dark leading-relaxed">
            O <strong>{siteConfig.name}</strong> reúne {total.toLocaleString("pt-BR")} desentupidora{total === 1 ? "" : "s"} em{" "}
            <strong>{cidadeNome}</strong>, no estado {estadoFrase}, todas com CNPJ ativo verificado na{" "}
            <strong>Receita Federal</strong>. Compare empresas de {servicosFrase}, com contato direto,
            localização no mapa e orçamento sem intermediários — ideal para emergências de entupimento
            de pia, vaso sanitário, ralo, esgoto ou caixa de gordura em {cidadeNome}.
          </p>
        </section>
      )}

      {pinsMapa.length > 0 && (
        <section className="mb-6">
          <MapaEmpresas pins={pinsMapa} height="380px" />
          <p className="text-[11px] text-muted mt-1">
            Mostrando {pinsMapa.length} empresa{pinsMapa.length === 1 ? "" : "s"} no mapa.
            <span className="ml-2 inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-primary" /> Verificada</span>
              <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-blue-500" /> Outras</span>
            </span>
          </p>
        </section>
      )}

      {segmentos.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href={`/empresas/cidades/${uf.toLowerCase()}/${cidade}/`}
            className={`px-3 py-1.5 text-xs font-semibold border rounded-full transition-colors ${
              !segmento
                ? "border-primary bg-primary text-white"
                : "border-border hover:border-primary hover:text-primary"
            }`}
          >
            Todos ({total.toLocaleString("pt-BR")})
          </Link>
          {segmentos.map(s => (
            <Link
              key={s.segmento}
              href={`/empresas/cidades/${uf.toLowerCase()}/${cidade}/?seg=${s.segmento}`}
              className={`px-3 py-1.5 text-xs font-semibold border rounded-full transition-colors ${
                segmento === s.segmento
                  ? "border-primary bg-primary text-white"
                  : "border-border hover:border-primary hover:text-primary"
              }`}
            >
              {SEG_LABEL[s.segmento] ?? s.segmento} ({s.total.toLocaleString("pt-BR")})
            </Link>
          ))}
        </div>
      )}

      {empresas.length === 0 ? (
        <p className="text-muted text-center py-16">Nenhuma empresa encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {e.cnpj && <p className="text-[11px] text-muted mt-1 font-mono">CNPJ: {e.cnpj}</p>}
                </div>
                <Building2 size={18} className="text-muted/40 flex-shrink-0" strokeWidth={1.5} />
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {e.segmento && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-[var(--color-primary-soft)] px-2 py-0.5 rounded">
                    {SEG_LABEL[e.segmento] ?? e.segmento}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted">
                {e.verificada && (
                  <span className="flex items-center gap-1 text-primary font-semibold">
                    <ShieldCheck size={12} strokeWidth={2.5} /> Verificada
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} baseUrl={baseUrl} />

      <FaqSection faqs={faqs} titulo={`Perguntas frequentes sobre desentupidoras em ${cidadeNome}`} />

      {guias.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="text-2xl font-black text-dark tracking-tight mb-2">Dicas e guias de desentupimento</h2>
          <p className="text-sm text-muted mb-5">Aprenda a resolver entupimentos simples antes de chamar uma desentupidora em {cidadeNome}.</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {guias.map(g => (
              <li key={g.slug}>
                <Link href={`/${g.slug}/`} className="group flex items-baseline gap-2 py-1.5 text-sm text-dark hover:text-primary transition-colors">
                  <span className="text-primary">›</span>
                  <span className="group-hover:underline">{g.titulo}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {outrasCidades.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="text-2xl font-black text-dark tracking-tight mb-5">
            Desentupidoras em outras cidades {estadoFrase}
          </h2>
          <div className="flex flex-wrap gap-2">
            {outrasCidades.map(c => {
              const nome = cidadeLabel(c.cidade, UF)
              return (
                <Link
                  key={c.cidade}
                  href={`/empresas/cidades/${uf.toLowerCase()}/${cidadeSlug(c.cidade)}/`}
                  className="text-sm px-3 py-1.5 border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
                >
                  Desentupidoras em {nome}
                </Link>
              )
            })}
            <Link
              href={`/empresas/cidades/${uf.toLowerCase()}/`}
              className="text-sm px-3 py-1.5 border border-dark bg-dark text-white rounded-full hover:bg-primary hover:border-primary transition-colors"
            >
              Ver todas as cidades {estadoFrase} →
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
