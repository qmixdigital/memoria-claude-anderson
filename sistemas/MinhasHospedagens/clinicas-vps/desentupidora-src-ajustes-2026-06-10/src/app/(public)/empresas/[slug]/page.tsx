import { cache } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { siteConfig } from "@/site.config"
import { getEmpresaBySlug, getEmpresasPublicadas, SEGMENTOS } from "@/lib/empresas/queries"
import { tituloEmpresa, cidadeLabel, UF_NOME, tituloSeo } from "@/lib/empresas/utils"
import { cidadeSlug } from "@/lib/empresas/utils"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { FaqSection, type Faq } from "@/components/seo/FaqSection"
import { MapaEmpresas } from "@/components/empresa/MapaEmpresas"
import { LeadForm } from "@/components/empresa/LeadForm"
import { ShareButtons } from "@/components/empresa/ShareButtons"
import Link from "next/link"
import { ShieldCheck, Building2, Mail, Phone, Globe, MapPin, Calendar, BadgeCheck, Send, Wrench, ArrowRight } from "lucide-react"

const SEG_LABEL = Object.fromEntries(SEGMENTOS.map(s => [s.slug, s.label]))

// Serviços típicos por segmento — conteúdo útil e único por tipo de empresa.
const SEG_SERVICOS: Record<string, string[]> = {
  "desentupidora": ["Desentupimento de esgoto", "Desentupimento de pia e ralo", "Desentupimento de vaso sanitário", "Limpeza de caixa de gordura", "Limpeza de fossa séptica", "Hidrojateamento de tubulações"],
  "limpeza": ["Hidrojateamento de alta pressão", "Limpeza de fossa séptica", "Limpeza de caixa de gordura", "Limpeza de redes pluviais", "Sucção a vácuo", "Limpeza de tubulações industriais"],
  "redes-esgoto": ["Desobstrução de redes de esgoto", "Limpeza de galerias e coletores", "Manutenção de redes de saneamento", "Inspeção de tubulação com câmera", "Hidrojateamento de redes"],
  "manutencao": ["Reparo de vazamentos", "Troca de tubulações", "Manutenção hidráulica preventiva", "Desobstrução de encanamentos", "Instalação hidráulica"],
}
const SERVICOS_PADRAO = SEG_SERVICOS["desentupidora"]

const getEmpresa = cache(getEmpresaBySlug)

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const e = await getEmpresa(slug)
  if (!e) return {}

  const base = `https://${siteConfig.domain}`
  const nome = tituloEmpresa(e.nome)
  const local = e.cidade ? ` em ${cidadeLabel(e.cidade, e.uf)}${e.uf ? ` (${e.uf})` : ""}` : ""
  // meta_title/description armazenados são auto-gerados (CAIXA ALTA, de-acentuados);
  // só usamos os salvos quando a empresa foi reivindicada/curada por um dono.
  const curada = !!e.owner_user_id
  const canonical = `${base}/empresas/${slug}/`
  const metaTitle = (curada && e.meta_title) ? e.meta_title : `${nome} — Desentupidora${local}`
  const metaDesc = (curada && e.meta_description) ? e.meta_description
    : (curada && e.descricao?.trim()) ? e.descricao.trim()
    : `${nome}: desentupidora${local} com CNPJ verificado na Receita Federal. Desentupimento de esgoto, fossa e caixa de gordura.`
  return {
    title: { absolute: tituloSeo(metaTitle, siteConfig.name) },
    description: metaDesc,
    alternates: { canonical },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      type: "website",
      url: canonical,
      siteName: siteConfig.name,
      locale: "pt_BR",
      images: ["/og-default.jpg"],
    },
  }
}

export default async function EmpresaPage({ params }: Props) {
  const { slug } = await params
  const e = await getEmpresa(slug)
  if (!e) notFound()

  const base = `https://${siteConfig.domain}`
  const pageUrl = `${base}/empresas/${slug}/`
  const nomeExib = tituloEmpresa(e.nome)
  const cidadeExib = cidadeLabel(e.cidade, e.uf)
  const segLabel = (e.segmento && SEG_LABEL[e.segmento]) || "Desentupidora"
  const servicos = (e.segmento && SEG_SERVICOS[e.segmento]) || SERVICOS_PADRAO
  const localFrase = e.cidade
    ? ` em ${cidadeExib}${e.uf ? `, ${UF_NOME[e.uf]}` : ""}`
    : (e.uf ? ` em ${UF_NOME[e.uf]}` : "")

  // Descrição: a coluna `descricao` salva é auto-gerada (CNAE genérico, de-acentuado) e 0 empresas
  // são curadas — só usamos o texto salvo quando a empresa foi reivindicada por um dono.
  const descricaoCurada = (e.owner_user_id && e.descricao?.trim()) ? e.descricao.trim() : null
  const descricaoFinal = descricaoCurada || (
    `${nomeExib} é uma empresa de ${segLabel.toLowerCase()}${localFrase}` +
    `${e.fundacao_ano ? `, em atividade desde ${e.fundacao_ano}` : ""}. ` +
    `Atua com serviços de desentupimento e saneamento para residências, condomínios e empresas, ` +
    `incluindo ${servicos.slice(0, 3).map(s => s.toLowerCase()).join(", ")} e mais. ` +
    `${e.cnpj ? `CNPJ ${e.cnpj}, ` : ""}empresa verificada na base da Receita Federal.`
  )

  // Empresas relacionadas (mesma cidade) p/ linkagem interna
  const relacionadas = (e.cidade && e.uf)
    ? (await getEmpresasPublicadas(8, 0, { uf: e.uf, cidade: e.cidade })).filter(r => r.slug !== slug).slice(0, 6)
    : []

  const faqs: Faq[] = [
    {
      q: `Quais serviços a ${nomeExib} oferece?`,
      a: `A ${nomeExib} é uma ${segLabel.toLowerCase()} e atua com ${servicos.slice(0, 4).map(s => s.toLowerCase()).join(", ")}${localFrase}.`,
    },
    ...(e.cidade ? [{
      q: `Onde fica a ${nomeExib}?`,
      a: `A ${nomeExib} fica em ${cidadeExib}${e.uf ? `, ${UF_NOME[e.uf]}` : ""}${e.endereco ? ` — ${e.endereco}` : ""}. Veja no diretório outras desentupidoras na mesma cidade.`,
    }] : []),
    {
      q: `Como entrar em contato com a ${nomeExib}?`,
      a: (e.telefone || e.email)
        ? `Você pode falar com a ${nomeExib}${e.telefone ? ` pelo telefone ${e.telefone}` : ""}${e.email ? `${e.telefone ? " ou pelo" : " pelo"} e-mail ${e.email}` : ""}.`
        : `Use o formulário de contato desta página para pedir um orçamento. Se você é o responsável, pode reivindicar o perfil e adicionar telefone, site e mais informações.`,
    },
    {
      q: `A ${nomeExib} tem CNPJ ativo?`,
      a: e.cnpj
        ? `Sim. A ${nomeExib} tem o CNPJ ${e.cnpj} com situação ativa, verificado na base da Receita Federal.`
        : `Sim, é uma empresa com situação cadastral ativa verificada na Receita Federal.`,
    },
  ]

  // sameAs com nofollow não se aplica em JSON-LD; redes sociais entram aqui
  const sameAs = [e.site, e.linkedin, e.facebook, e.youtube, e.instagram ? `https://instagram.com/${e.instagram.replace(/^@/, "")}` : null].filter((x): x is string => !!x)

  const planoAtivo = e.plan_paid_until && new Date(e.plan_paid_until) > new Date()

  // Schema.org LocalBusiness (desentupidora é negócio local de serviço)
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": pageUrl,
    name: nomeExib,
    legalName: tituloEmpresa(e.razao_social ?? e.nome),
    url: pageUrl,
    taxID: e.cnpj ?? undefined,
    description: descricaoFinal,
    knowsAbout: servicos,
    areaServed: e.cidade ? { "@type": "City", name: cidadeExib } : (e.uf ? UF_NOME[e.uf] : undefined),
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    address: e.uf ? {
      "@type": "PostalAddress",
      addressRegion: e.uf,
      addressLocality: cidadeExib || undefined,
      streetAddress: e.endereco ?? undefined,
      postalCode: e.cep ?? undefined,
      addressCountry: "BR",
    } : undefined,
    geo: (e.latitude && e.longitude) ? { "@type": "GeoCoordinates", latitude: e.latitude, longitude: e.longitude } : undefined,
    email: e.email ?? undefined,
    telephone: e.telefone ?? undefined,
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Empresas", href: "/empresas/" },
    { label: nomeExib },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <header className="mb-8 pb-6 border-b border-border">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-[var(--color-primary-soft)] flex items-center justify-center flex-shrink-0">
            <Building2 size={32} className="text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-black text-dark leading-tight mb-2">{nomeExib}</h1>
            {e.razao_social && e.razao_social !== e.nome && (
              <p className="text-sm text-muted">{tituloEmpresa(e.razao_social)}</p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {e.verificada && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-md">
              <ShieldCheck size={14} strokeWidth={2.5} />
              Empresa Verificada
            </span>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-border">
          <ShareButtons url={pageUrl} title={nomeExib} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-8">

          {/* Sobre */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-dark mb-3">Sobre a {nomeExib}</h2>
            <p className="text-base text-dark leading-relaxed">{descricaoFinal}</p>
          </section>

          {/* Serviços oferecidos */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Wrench size={16} className="text-primary" strokeWidth={2} />
              <h2 className="text-sm font-black uppercase tracking-widest text-dark">Serviços de {segLabel.toLowerCase()}</h2>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {servicos.map(s => (
                <li key={s} className="flex items-center gap-2 text-sm text-dark">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </section>

          {/* Localização no mapa */}
          {e.latitude && e.longitude && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-primary" strokeWidth={2} />
                <h2 className="text-sm font-black uppercase tracking-widest text-dark">Localização</h2>
              </div>
              <MapaEmpresas
                pins={[{ id: e.id, slug: e.slug, nome: nomeExib, lat: parseFloat(String(e.latitude)), lng: parseFloat(String(e.longitude)), verificada: e.verificada }]}
                centerLat={parseFloat(String(e.latitude))}
                centerLng={parseFloat(String(e.longitude))}
                zoom={14}
                height="300px"
              />
              <p className="text-[11px] text-muted mt-1">
                {planoAtivo
                  ? `Localização de ${cidadeExib}${e.uf ? `, ${e.uf}` : ""}.`
                  : `Localização aproximada (nível de cidade) em ${cidadeExib}${e.uf ? `, ${e.uf}` : ""}.`}
              </p>
            </section>
          )}

          {/* Aviso enquanto não tem dados Receita Federal */}
          {!e.uf && !e.endereco && !e.telefone && (
            <section className="p-5 border border-dashed border-border rounded-lg bg-surface">
              <p className="text-sm text-muted">
                <strong>Esta empresa ainda não tem dados completos de contato e localização.</strong>{" "}
                Os dados serão atualizados em breve via cruzamento com a Receita Federal.
                Se você é representante desta empresa,{" "}
                <Link href={`/empresas/${e.slug}/reivindicar/`} className="text-primary font-semibold hover:underline">
                  reivindique este perfil
                </Link>.
              </p>
            </section>
          )}

          {/* Solicitar orçamento — só se empresa pagante */}
          {planoAtivo && e.owner_user_id && (
            <section id="solicitar" className="border-2 border-dark rounded-sm p-6 bg-bg">
              <div className="flex items-center gap-2 mb-3">
                <Send size={18} className="text-primary" strokeWidth={2.5} />
                <h2 className="font-display text-2xl uppercase text-dark leading-none">Solicitar orçamento</h2>
              </div>
              <p className="text-sm text-muted mb-5">
                Sua mensagem vai direto pra <strong>{nomeExib}</strong>. Resposta normalmente em até 24h úteis.
              </p>
              <LeadForm empresaSlug={e.slug} empresaNome={nomeExib} />
            </section>
          )}

        </div>

        {/* Sidebar com informações de contato */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="border border-border rounded-xl p-5 bg-bg">
            <h2 className="text-sm font-black uppercase tracking-widest text-dark mb-4">
              Informações
            </h2>
            <dl className="space-y-3 text-sm">
              {e.cnpj && (
                <div>
                  <dt className="text-xs text-muted uppercase tracking-wide">CNPJ</dt>
                  <dd className="font-mono text-dark">{e.cnpj}</dd>
                </div>
              )}
              {e.fundacao_ano && (
                <div className="flex items-start gap-2">
                  <Calendar size={14} className="text-muted mt-0.5" />
                  <div>
                    <dt className="text-xs text-muted uppercase tracking-wide">Fundada em</dt>
                    <dd className="text-dark">{e.fundacao_ano}</dd>
                  </div>
                </div>
              )}
              {(e.cidade || e.uf) && (
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-muted mt-0.5" />
                  <div>
                    <dt className="text-xs text-muted uppercase tracking-wide">Localização</dt>
                    <dd className="text-dark">
                      {e.cidade && e.uf ? `${cidadeExib}, ${e.uf}` : e.uf ?? cidadeExib}
                    </dd>
                  </div>
                </div>
              )}
              {e.telefone && (
                <div className="flex items-start gap-2">
                  <Phone size={14} className="text-muted mt-0.5" />
                  <div>
                    <dt className="text-xs text-muted uppercase tracking-wide">Telefone</dt>
                    <dd className="text-dark">
                      <a href={`tel:${e.telefone}`} className="hover:text-primary">{e.telefone}</a>
                    </dd>
                  </div>
                </div>
              )}
              {e.email && (
                <div className="flex items-start gap-2">
                  <Mail size={14} className="text-muted mt-0.5" />
                  <div>
                    <dt className="text-xs text-muted uppercase tracking-wide">E-mail</dt>
                    <dd className="text-dark break-all">
                      <a href={`mailto:${e.email}`} className="hover:text-primary">{e.email}</a>
                    </dd>
                  </div>
                </div>
              )}
              {e.site && (
                <div className="flex items-start gap-2">
                  <Globe size={14} className="text-muted mt-0.5" />
                  <div>
                    <dt className="text-xs text-muted uppercase tracking-wide">Site</dt>
                    <dd className="text-dark break-all">
                      <a href={e.site} target="_blank" rel="nofollow ugc noopener noreferrer" className="hover:text-primary">
                        {e.site.replace(/^https?:\/\//, "")}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          </div>

          {/* Reivindicar perfil — empresa não-reivindicada */}
          {!e.owner_user_id && (
            <div className="border-2 border-dark rounded-sm p-5 bg-surface">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <BadgeCheck size={16} strokeWidth={2.5} />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em]">É sua empresa?</span>
              </div>
              <p className="text-sm text-dark leading-relaxed mb-4">
                Reivindique este perfil para atualizar fotos, contatos, redes sociais e descrição.
                Liberamos o painel após validação manual.
              </p>
              <Link
                href={`/empresas/${e.slug}/reivindicar/`}
                className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-3 bg-primary text-white font-bold uppercase tracking-wider text-xs hover:bg-[var(--color-primary-hover)] transition-colors rounded-sm"
              >
                Reivindicar perfil
              </Link>
              <Link
                href="/precos/"
                className="block text-center mt-2 text-[11px] text-muted hover:text-primary transition-colors"
              >
                Ver planos →
              </Link>
            </div>
          )}
        </aside>
      </div>

      <FaqSection faqs={faqs} titulo={`Perguntas frequentes sobre a ${nomeExib}`} />

      {(relacionadas.length > 0 || e.cidade) && (
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="text-2xl font-black text-dark tracking-tight mb-5">
            Desentupidoras em {cidadeExib}{e.uf ? `, ${e.uf}` : ""}
          </h2>
          {relacionadas.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
              {relacionadas.map(r => (
                <Link
                  key={r.id}
                  href={`/empresas/${r.slug}/`}
                  className="group block border border-border rounded-lg p-4 hover:border-primary hover:shadow-sm transition-all"
                >
                  <span className="block font-bold text-sm text-dark group-hover:text-primary leading-snug line-clamp-2">{tituloEmpresa(r.nome)}</span>
                  {r.verificada && (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-primary font-semibold">
                      <ShieldCheck size={11} strokeWidth={2.5} /> Verificada
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
          {e.cidade && e.uf && (
            <Link
              href={`/empresas/cidades/${e.uf.toLowerCase()}/${cidadeSlug(e.cidade)}/`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:gap-2.5 transition-all"
            >
              Ver todas as desentupidoras em {cidadeExib} <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          )}
        </section>
      )}
    </div>
  )
}
