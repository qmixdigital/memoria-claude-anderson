// src/components/layout/home/HomeDirectory.tsx
//
// Home do diretório nacional de desentupidoras.
// Aesthetic: "Blueprint Civic" — documento técnico de saneamento.
// Inspiração: planta de engenharia, cadastro municipal, ficha técnica ABNT.

import Link from "next/link"
import { Search, ArrowUpRight, Plus } from "lucide-react"
import { siteConfig } from "@/site.config"
import { SEGMENTOS } from "@/lib/empresas/queries"
import { UF_NOME, cidadeSlug, cidadeLabel } from "@/lib/empresas/utils"
import type { Noticia } from "@/lib/db/schema"

const URL_BASE = `https://${siteConfig.domain}`

type SegmentoCount = { segmento: string; total: number }
type UfCount = { uf: string; total: number }
type CidadeRow = { uf: string; cidade: string; total: number }

type Props = {
  total: number
  verificadas: number
  cidadesUnicas: number
  segmentos: SegmentoCount[]
  ufs: UfCount[]
  cidades: CidadeRow[]
  artigos: Noticia[]
}

const SEG_LABEL = Object.fromEntries(SEGMENTOS.map(s => [s.slug, s.label]))

const SEG_CNAE: Record<string, string> = {
  "desentupidora":  "3702-9/00",
  "limpeza":        "8129-0/00",
  "redes-esgoto":   "3701-1/00",
  "manutencao":     "4221-9/03",
}

const SEG_DESC: Record<string, string> = {
  "desentupidora":  "Atividades relacionadas a esgoto — desentupimento, limpa-fossa, sumidouros.",
  "limpeza":        "Atividades de limpeza não especificadas — caixa d'água, caixa de gordura.",
  "redes-esgoto":   "Gestão de redes de esgoto — operadoras e empresas de saneamento.",
  "manutencao":     "Manutenção de redes de distribuição hidráulica e infraestrutura predial.",
}

function fmtNum(n: number): string {
  return n.toLocaleString("pt-BR")
}

function fmtData(): string {
  return new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function docNumero(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// ───────────────────────────────────────────────────────────
// Pequenos componentes
// ───────────────────────────────────────────────────────────

function SectionHead({ num, eyebrow, title, link }: {
  num: string
  eyebrow: string
  title: string
  link?: { href: string; label: string }
}) {
  return (
    <div className="flex items-end justify-between gap-4 pb-3 mb-8 border-b border-dark/20">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-[11px] text-primary tracking-[0.18em]">§ {num}</span>
          <span className="h-px w-8 bg-dark/20" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{eyebrow}</span>
        </div>
        <h2 className="font-display text-3xl md:text-4xl text-dark leading-[1.05]">
          {title}
        </h2>
      </div>
      {link && (
        <Link
          href={link.href}
          className="hidden md:inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-primary hover:text-primary-hover whitespace-nowrap pb-1.5"
        >
          {link.label}
          <ArrowUpRight size={14} strokeWidth={2.5} />
        </Link>
      )}
    </div>
  )
}

function FichaRow({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-3 items-baseline border-b border-dashed border-dark/15 pb-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{k}</span>
      <span className={`font-mono text-sm ${accent ? "text-primary font-bold" : "text-dark"}`}>
        {v}
      </span>
    </div>
  )
}

// ───────────────────────────────────────────────────────────
// Home principal
// ───────────────────────────────────────────────────────────

export function HomeDirectory({ total, verificadas, cidadesUnicas, segmentos, ufs, cidades, artigos }: Props) {
  const segMap = new Map(segmentos.map(s => [s.segmento, s.total]))
  const topUfs = ufs.slice(0, 6)
  const restUfs = ufs.slice(6)

  // ── Structured Data ──────────────────────────────
  const ldWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: URL_BASE + "/",
    inLanguage: "pt-BR",
    description: `Diretório nacional de desentupidoras no Brasil — ${total.toLocaleString("pt-BR")} empresas cadastradas com dados oficiais da Receita Federal.`,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${URL_BASE}/empresas/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  }
  const ldOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: URL_BASE + "/",
    logo: `${URL_BASE}${siteConfig.logo.file}`,
    sameAs: [] as string[],
  }
  const ldCollectionPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Diretório Nacional de Desentupidoras no Brasil",
    url: URL_BASE + "/",
    inLanguage: "pt-BR",
    isPartOf: { "@type": "WebSite", url: URL_BASE + "/", name: siteConfig.name },
    about: {
      "@type": "Thing",
      name: "Desentupidoras no Brasil",
      description: "Diretório com desentupidoras, limpa-fossas, hidrojateamento, limpeza de caixas d'água, caixas de gordura e manutenção hidráulica.",
    },
    mainEntity: {
      "@type": "ItemList",
      name: "Segmentos do diretório",
      numberOfItems: segmentos.length,
      itemListElement: SEGMENTOS.map((s, i) => {
        const n = segMap.get(s.slug) ?? 0
        return {
          "@type": "ListItem",
          position: i + 1,
          name: `${s.label} (${n.toLocaleString("pt-BR")} empresas)`,
          url: `${URL_BASE}/empresas/segmentos/${s.slug}/`,
        }
      }),
    },
  }

  return (
    <div className="bg-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldWebsite) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldOrganization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldCollectionPage) }} />

      {/* ═══════════════════════════════════════════════════════════
          BARRA DE DOCUMENTO — meta superior estilo cabeçalho técnico
      ═══════════════════════════════════════════════════════════ */}
      <div className="border-b border-dark/20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
          <span>DOC Nº {docNumero()} / DIRETÓRIO NACIONAL</span>
          <span className="hidden md:inline">REV. {fmtData()}</span>
          <span className="text-primary">DADOS PÚBLICOS · RFB · IBGE</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          § 01 — IDENTIFICAÇÃO  (Hero como ficha cadastral)
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-blueprint-millimeter border-b border-dark/20">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* Coluna esquerda — título técnico */}
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] text-primary tracking-[0.18em]">§ 01</span>
                <span className="h-px w-8 bg-primary/40" aria-hidden />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Identificação</span>
              </div>

              <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] tracking-tight text-dark mb-6">
                Diretório nacional de
                <br />
                <span className="text-primary">desentupidoras.</span>
              </h1>

              <p className="text-base md:text-lg text-dark/75 max-w-2xl mb-8 leading-relaxed">
                <span className="font-mono text-primary font-bold">{fmtNum(total)}</span> empresas
                ativas cadastradas em <span className="font-mono text-primary font-bold">{fmtNum(cidadesUnicas)}</span> cidades.
                Base de dados <span className="font-editorial italic text-dark">extraída diretamente da Receita Federal</span> —
                desentupimento de esgoto, fossa séptica, caixa de gordura, hidrojateamento e manutenção hidráulica.
              </p>

              {/* Busca */}
              <form
                role="search"
                aria-label="Buscar empresas no diretório"
                action="/empresas/"
                method="get"
                className="flex flex-col sm:flex-row gap-2 max-w-2xl mb-8"
              >
                <div className="relative flex-1">
                  <Search size={18} aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  <label htmlFor="hero-search" className="sr-only">Buscar empresa, CNPJ ou cidade</label>
                  <input
                    id="hero-search"
                    type="search"
                    name="q"
                    placeholder="Buscar empresa, CNPJ ou cidade…"
                    autoComplete="off"
                    className="w-full pl-11 pr-4 py-3.5 bg-bg border border-dark/30 text-dark placeholder:text-muted text-base font-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-7 py-3.5 bg-primary text-white font-mono uppercase tracking-[0.18em] text-xs hover:bg-primary-hover transition-colors rounded-none whitespace-nowrap"
                >
                  Consultar
                </button>
              </form>

              {/* Atalhos por segmento (estilo CNAE tags técnicas) */}
              <div className="flex flex-wrap gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted self-center mr-1">
                  CNAE :
                </span>
                {SEGMENTOS.map(s => {
                  const n = segMap.get(s.slug) ?? 0
                  if (!n) return null
                  return (
                    <Link
                      key={s.slug}
                      href={`/empresas/segmentos/${s.slug}/`}
                      className="group inline-flex items-baseline gap-2 px-3 py-1.5 border border-dark/30 hover:border-primary hover:text-primary transition-colors"
                    >
                      <span className="font-mono text-[10px] text-primary">{SEG_CNAE[s.slug]}</span>
                      <span className="font-mono text-xs uppercase tracking-wider">{s.label}</span>
                      <span className="font-mono text-[10px] text-muted">{fmtNum(n)}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Coluna direita — ficha de identificação técnica */}
            <aside className="lg:col-span-4">
              <div className="relative bg-bg border-2 border-dark p-6 corner-marks">
                {/* Header da ficha */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-dashed border-dark/30">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-dark">
                    FICHA TÉCNICA
                  </span>
                  <span className="stamp text-[10px] text-primary border-primary">
                    Em Serviço
                  </span>
                </div>

                <dl className="space-y-2">
                  <FichaRow k="Cadastro" v={fmtNum(total)} accent />
                  <FichaRow k="Verificadas" v={fmtNum(verificadas)} />
                  <FichaRow k="UFs" v={`${ufs.length}/27`} />
                  <FichaRow k="Cidades" v={fmtNum(cidadesUnicas)} />
                  <FichaRow k="Segmentos" v={String(SEGMENTOS.length)} />
                  <FichaRow k="Fonte" v="Receita Federal" />
                  <FichaRow k="Atualização" v={fmtData()} />
                </dl>

                <div className="mt-5 pt-4 border-t border-dashed border-dark/30">
                  <p className="font-editorial italic text-xs text-muted leading-relaxed">
                    Documento extraído da base de dados aberta da Receita Federal,
                    filtrado pelos CNAEs do nicho de desentupimento e saneamento.
                  </p>
                </div>
              </div>
            </aside>

          </div>
        </div>

        {/* Tira inferior com UFs (compacta) */}
        <div className="border-t border-dark/20 bg-bg">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-1 overflow-x-auto whitespace-nowrap">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mr-3 flex-shrink-0">
              Estados ativos:
            </span>
            {ufs.map(u => (
              <Link
                key={u.uf}
                href={`/empresas/cidades/${u.uf.toLowerCase()}/`}
                className="font-mono text-xs px-2 py-1 text-dark hover:bg-primary hover:text-white transition-colors"
                aria-label={`${UF_NOME[u.uf]} — ${u.total} empresas`}
              >
                {u.uf}<span className="text-muted ml-1 hover:text-white/80">{fmtNum(u.total)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          § 02 — CLASSIFICAÇÃO POR SEGMENTO (CNAEs como fichas)
      ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <SectionHead
          num="02"
          eyebrow="Classificação"
          title="Por segmento de atividade"
          link={{ href: "/empresas/segmentos/", label: "Ver todos" }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-dark/20 border border-dark/20">
          {SEGMENTOS.map((s) => {
            const n = segMap.get(s.slug) ?? 0
            return (
              <Link
                key={s.slug}
                href={`/empresas/segmentos/${s.slug}/`}
                className="group bg-bg p-6 md:p-8 hover:bg-primary-soft transition-colors relative"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <span className="font-mono text-xs text-primary tracking-[0.1em]">
                    CNAE {SEG_CNAE[s.slug]}
                  </span>
                  <ArrowUpRight size={16} className="text-muted group-hover:text-primary transition-colors mt-0.5" strokeWidth={2.5} />
                </div>

                <h3 className="font-display text-2xl md:text-3xl text-dark group-hover:text-primary transition-colors mb-2">
                  {s.label}
                </h3>

                <p className="text-sm text-muted leading-relaxed mb-4">
                  {SEG_DESC[s.slug]}
                </p>

                <div className="flex items-baseline gap-2 pt-4 border-t border-dashed border-dark/15">
                  <span className="font-mono text-3xl text-dark group-hover:text-primary transition-colors">
                    {fmtNum(n)}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                    estabelecimentos
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          § 03 — DISTRIBUIÇÃO TERRITORIAL (UFs)
      ═══════════════════════════════════════════════════════════ */}
      <section className="border-y border-dark/20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
          <SectionHead
            num="03"
            eyebrow="Cobertura"
            title="Distribuição territorial"
            link={{ href: "/empresas/cidades/", label: "Mapa completo" }}
          />

          {/* Top 6 UFs em destaque */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-dark/20 border border-dark/20 mb-3">
            {topUfs.map(({ uf, total: t }, i) => (
              <Link
                key={uf}
                href={`/empresas/cidades/${uf.toLowerCase()}/`}
                className="group bg-bg p-5 hover:bg-primary hover:text-white transition-colors block"
              >
                <div className="font-mono text-[10px] tracking-[0.18em] text-muted group-hover:text-white/70 mb-1">
                  {String(i + 1).padStart(2, "0")} · {UF_NOME[uf]}
                </div>
                <div className="font-display text-5xl md:text-6xl leading-none text-dark group-hover:text-white transition-colors">
                  {uf}
                </div>
                <div className="mt-2 font-mono text-sm text-primary group-hover:text-accent transition-colors">
                  {fmtNum(t)}
                </div>
              </Link>
            ))}
          </div>

          {/* Demais UFs em grid compacto */}
          {restUfs.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-7 gap-px bg-dark/20 border border-dark/20">
              {restUfs.map(({ uf, total: t }) => (
                <Link
                  key={uf}
                  href={`/empresas/cidades/${uf.toLowerCase()}/`}
                  className="group bg-bg px-3 py-2.5 hover:bg-primary hover:text-white transition-colors flex items-baseline justify-between"
                >
                  <span className="font-display text-2xl text-dark group-hover:text-white">{uf}</span>
                  <span className="font-mono text-[11px] text-muted group-hover:text-white/80">{fmtNum(t)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          § 04 — RANKING TERRITORIAL (Top cidades)
      ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <SectionHead
          num="04"
          eyebrow="Ranking"
          title="Cidades com maior cobertura"
          link={{ href: "/empresas/cidades/", label: "Lista completa" }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-px">
          {cidades.map((c, i) => (
            <Link
              key={`${c.uf}-${c.cidade}`}
              href={`/empresas/cidades/${c.uf.toLowerCase()}/${cidadeSlug(c.cidade)}/`}
              className="group flex items-baseline gap-4 py-3 border-b border-dashed border-dark/20 hover:border-primary transition-colors"
            >
              <span className="font-mono text-xs text-muted group-hover:text-primary w-8 flex-shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-display text-base text-dark group-hover:text-primary transition-colors truncate">
                  {cidadeLabel(c.cidade, c.uf)}
                  <span className="ml-1 font-mono text-xs font-normal text-muted">/{c.uf}</span>
                </div>
              </div>
              <span className="font-mono text-sm text-dark group-hover:text-primary flex-shrink-0">
                {fmtNum(c.total)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          § 05 — EDITORIAL (Guias e artigos do nicho)
      ═══════════════════════════════════════════════════════════ */}
      {artigos.length > 0 && (
        <section className="border-y border-dark/20 bg-surface">
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
            <SectionHead
              num="05"
              eyebrow="Editorial"
              title="Guias e dicas"
              link={{ href: "/artigos/", label: "Todos os guias" }}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-dark/20 border border-dark/20">
              {artigos.slice(0, 3).map((a) => {
                const dt = a.published_at ?? a.created_at
                return (
                  <Link
                    key={a.id}
                    href={`/${a.slug}/`}
                    className="group bg-bg p-6 md:p-7 hover:bg-primary-soft transition-colors block"
                  >
                    {a.imagem_url && (
                      <div className="relative aspect-[16/9] w-full overflow-hidden mb-4 border border-dark/15">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={a.imagem_url}
                          alt={a.imagem_alt ?? a.titulo}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex items-baseline gap-3 mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                      {a.categoria && <span className="text-primary">{a.categoria}</span>}
                      {dt && (
                        <time dateTime={new Date(dt).toISOString()}>
                          {new Date(dt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </time>
                      )}
                    </div>
                    <h3 className="font-display text-xl md:text-2xl text-dark group-hover:text-primary transition-colors leading-tight line-clamp-3">
                      {a.titulo}
                    </h3>
                    {a.resumo && (
                      <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-2">
                        {a.resumo}
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          § 06 — REIVINDICAÇÃO DE PERFIL (CTA técnico)
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-secondary text-white">
        <div className="absolute inset-0 bg-grid-dark opacity-30 pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[11px] text-accent tracking-[0.18em]">§ 06</span>
                <span className="h-px w-8 bg-accent/40" aria-hidden />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                  Para empresários
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-5xl lg:text-6xl leading-[0.95] mb-5">
                Sua empresa está
                <br />
                no <span className="text-accent">cadastro</span>?
              </h2>
              <p className="text-base text-white/75 max-w-xl leading-relaxed mb-2 font-editorial italic">
                Empresário com CNPJ ativo nos CNAEs deste diretório
                pode reivindicar o perfil — atualizar contato, fotos, descrição
                e receber leads qualificados.
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                Reivindicação gratuita · sem custo cadastral
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <Link
                href="/cadastrar/"
                className="group inline-flex items-center justify-between gap-3 px-6 py-4 bg-accent text-secondary font-mono uppercase tracking-[0.18em] text-xs font-bold hover:bg-white transition-colors"
              >
                <span>Cadastrar empresa</span>
                <Plus size={18} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform" />
              </Link>
              <Link
                href="/empresas/"
                className="group inline-flex items-center justify-between gap-3 px-6 py-4 border border-white/30 text-white font-mono uppercase tracking-[0.18em] text-xs hover:bg-white hover:text-secondary transition-colors"
              >
                <span>Reivindicar perfil</span>
                <ArrowUpRight size={18} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          § 06 — METODOLOGIA & FONTES
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-bg border-t border-dark/20">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[11px] text-primary tracking-[0.18em]">§ 07</span>
                <span className="h-px w-8 bg-dark/20" aria-hidden />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  Metodologia & fontes
                </span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl text-dark mb-4 leading-tight">
                Como esse diretório é montado.
              </h3>
              <div className="text-sm text-muted leading-relaxed space-y-3">
                <p>
                  <span className="font-mono text-primary text-[11px] mr-1">[01]</span>
                  Extração mensal dos arquivos abertos da Receita Federal
                  (<span className="font-mono text-dark">dadosabertos.rfb.gov.br</span>).
                </p>
                <p>
                  <span className="font-mono text-primary text-[11px] mr-1">[02]</span>
                  Filtro pelos CNAEs do nicho de desentupimento e saneamento:
                  <span className="font-mono text-dark"> 3702-9/00</span>,
                  <span className="font-mono text-dark"> 8129-0/00</span>,
                  <span className="font-mono text-dark"> 3701-1/00</span> e
                  <span className="font-mono text-dark"> 4221-9/03</span>.
                </p>
                <p>
                  <span className="font-mono text-primary text-[11px] mr-1">[03]</span>
                  Mantemos apenas empresas com situação cadastral
                  <span className="font-mono text-dark"> 02 (ativa)</span> —
                  empresas baixadas, suspensas ou inaptas são automaticamente excluídas.
                </p>
                <p>
                  <span className="font-mono text-primary text-[11px] mr-1">[04]</span>
                  Geolocalização e nomes de município derivados do
                  <span className="font-mono text-dark"> IBGE</span>.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-surface border border-dashed border-dark/30 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-3">
                  Resumo cadastral
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted col-span-2 border-b border-dashed border-dark/15 pb-1">
                    Total
                  </dt>
                  <dd className="font-display text-3xl text-primary col-span-2 -mt-1">
                    {fmtNum(total)}
                  </dd>

                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Verificadas</dt>
                  <dd className="font-mono text-base text-dark text-right">{fmtNum(verificadas)}</dd>

                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">UFs ativas</dt>
                  <dd className="font-mono text-base text-dark text-right">{ufs.length}/27</dd>

                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Cidades</dt>
                  <dd className="font-mono text-base text-dark text-right">{fmtNum(cidadesUnicas)}</dd>

                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Segmentos</dt>
                  <dd className="font-mono text-base text-dark text-right">{SEGMENTOS.length}</dd>

                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Atualizado</dt>
                  <dd className="font-mono text-base text-dark text-right">{fmtData()}</dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Carimbo institucional final */}
          <div className="mt-12 pt-8 border-t border-dashed border-dark/20 flex flex-wrap items-center justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              FIM DO DOCUMENTO · {fmtData()}
            </span>
            <span className="stamp text-xs text-primary border-primary">
              Dados Públicos
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
