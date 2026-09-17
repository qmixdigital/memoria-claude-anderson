import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { siteConfig } from "@/site.config"
import { getCidadesPorUf } from "@/lib/empresas/queries"
import { UF_NOME, cidadeSlug, cidadeLabel, estadoComPrep, tituloSeo } from "@/lib/empresas/utils"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { FaqSection, type Faq } from "@/components/seo/FaqSection"

export const revalidate = 86400

type Props = { params: Promise<{ uf: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uf } = await params
  const UF = uf.toUpperCase()
  const nomeUf = UF_NOME[UF] ?? UF
  const titulo = `Desentupidoras em ${nomeUf} (${UF})`
  const canonical = `https://${siteConfig.domain}/empresas/cidades/${uf.toLowerCase()}/`
  const description = `Encontre desentupidoras em todas as cidades ${estadoComPrep(UF)}, com CNPJ verificado para desentupimento de esgoto, fossa e caixa de gordura.`
  return {
    title: { absolute: tituloSeo(titulo, siteConfig.name) },
    description,
    alternates: { canonical },
    openGraph: { title: titulo, description, url: canonical, siteName: siteConfig.name, locale: "pt_BR", type: "website", images: ["/og-default.jpg"] },
  }
}

export default async function CidadesPorUfPage({ params }: Props) {
  const { uf } = await params
  const UF = uf.toUpperCase()
  if (UF.length !== 2 || !UF_NOME[UF]) notFound()

  const cidades = await getCidadesPorUf(UF, 500)
  if (cidades.length === 0) notFound()

  const nomeUf = UF_NOME[UF]
  const estadoFrase = estadoComPrep(UF)
  const totalEmpresas = cidades.reduce((s, c) => s + c.total, 0)
  const topCidades = cidades.slice(0, 5).map(c => cidadeLabel(c.cidade, UF))

  const faqs: Faq[] = [
    {
      q: `Quantas desentupidoras tem ${estadoFrase}?`,
      a: `O ${siteConfig.name} reúne ${totalEmpresas.toLocaleString("pt-BR")} desentupidoras com CNPJ ativo em ${cidades.length.toLocaleString("pt-BR")} cidades ${estadoFrase}, todas verificadas na Receita Federal.`,
    },
    {
      q: `Quais cidades ${estadoFrase} têm mais desentupidoras?`,
      a: `As cidades ${estadoFrase} com mais desentupidoras cadastradas são ${topCidades.join(", ")}. Você encontra a lista completa por cidade nesta página.`,
    },
    {
      q: `As desentupidoras ${estadoFrase} atendem emergências?`,
      a: `Sim. Muitas desentupidoras ${estadoFrase} oferecem atendimento 24 horas para entupimentos de esgoto, pia, vaso sanitário e caixa de gordura. Confira o contato de cada empresa na cidade desejada.`,
    },
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Desentupidoras em ${UF_NOME[UF]} (${UF})`,
    description: `Cidades com desentupidoras em ${UF_NOME[UF]}.`,
    url: `https://${siteConfig.domain}/empresas/cidades/${uf.toLowerCase()}/`,
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: `https://${siteConfig.domain}/` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: cidades.length,
      itemListElement: cidades.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${cidadeLabel(c.cidade, UF)} (${UF})`,
        url: `https://${siteConfig.domain}/empresas/cidades/${uf.toLowerCase()}/${cidadeSlug(c.cidade)}/`,
      })),
    },
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Empresas", href: "/empresas/" },
        { label: "Por estado", href: "/empresas/cidades/" },
        { label: UF_NOME[UF] ?? UF },
      ]} />

      <div className="mb-8 pb-4 border-b-2 border-dark">
        <div className="w-8 h-0.5 bg-primary mb-3" />
        <h1 className="text-3xl font-black text-dark uppercase tracking-tight">
          Desentupidoras em {UF_NOME[UF]} ({UF})
        </h1>
        <p className="text-sm text-muted mt-2">
          {cidades.length.toLocaleString("pt-BR")} cidades com {totalEmpresas.toLocaleString("pt-BR")} desentupidoras cadastradas.
        </p>
      </div>

      <section className="mb-8 max-w-3xl">
        <p className="text-base text-dark leading-relaxed">
          Encontre <strong>desentupidoras em {nomeUf}</strong> por cidade. O <strong>{siteConfig.name}</strong> reúne{" "}
          {totalEmpresas.toLocaleString("pt-BR")} empresas com CNPJ ativo verificado na <strong>Receita Federal</strong>,
          distribuídas em {cidades.length.toLocaleString("pt-BR")} cidades {estadoFrase}, especializadas em desentupimento
          de esgoto, limpeza de fossa, caixa de gordura e hidrojateamento. Selecione sua cidade abaixo para ver empresas,
          contatos e orçamento.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {cidades.map(({ cidade, total }) => (
          <Link
            key={cidade}
            href={`/empresas/cidades/${uf.toLowerCase()}/${cidadeSlug(cidade)}/`}
            className="flex items-baseline justify-between p-3 border border-border rounded-lg hover:border-primary hover:bg-[var(--color-primary-soft)] transition-colors"
          >
            <span className="text-sm text-dark group-hover:text-primary line-clamp-1">{cidadeLabel(cidade, UF)}</span>
            <span className="text-xs text-muted ml-2">{total.toLocaleString("pt-BR")}</span>
          </Link>
        ))}
      </div>

      <FaqSection faqs={faqs} titulo={`Perguntas frequentes sobre desentupidoras em ${nomeUf}`} />
    </div>
  )
}
