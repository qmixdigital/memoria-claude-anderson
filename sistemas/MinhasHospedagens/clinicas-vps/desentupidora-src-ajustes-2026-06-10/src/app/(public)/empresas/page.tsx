import Link from "next/link"
import type { Metadata } from "next"
import { siteConfig } from "@/site.config"
import {
  getEmpresasPublicadas,
  countEmpresasPublicadas,
  getUfsDisponiveis,
  getSegmentosDisponiveisGlobal,
  SEGMENTOS,
} from "@/lib/empresas/queries"
import { Pagination } from "@/components/ui/Pagination"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { tituloEmpresa, cidadeLabel } from "@/lib/empresas/utils"
import { Search, ShieldCheck, Building2 } from "lucide-react"

export const revalidate = 600

export const metadata: Metadata = {
  title: "Diretório Nacional de Desentupidoras",
  description: `Encontre desentupidoras em todas as cidades do Brasil — desentupimento de esgoto, fossa séptica, caixa de gordura, hidrojateamento e atendimento 24h. ${siteConfig.name}.`,
  alternates: { canonical: `https://${siteConfig.domain}/empresas/` },
}

const PER_PAGE = 20

const SEG_LABEL = Object.fromEntries(SEGMENTOS.map(s => [s.slug, s.label]))

type Props = { searchParams: Promise<{ page?: string; q?: string; uf?: string; seg?: string }> }

export default async function EmpresasPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const offset = (page - 1) * PER_PAGE
  const busca = (sp.q ?? "").trim()
  const uf = (sp.uf ?? "").trim().toUpperCase()
  const segmento = (sp.seg ?? "").trim()

  const filtros = {
    busca: busca || undefined,
    uf: uf || undefined,
    segmento: segmento || undefined,
  }

  const [empresas, total, ufs, segmentos] = await Promise.all([
    getEmpresasPublicadas(PER_PAGE, offset, filtros),
    countEmpresasPublicadas(filtros),
    getUfsDisponiveis(),
    getSegmentosDisponiveisGlobal(),
  ])
  const totalPages = Math.ceil(total / PER_PAGE)

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Empresas" },
  ]

  const filterQs = new URLSearchParams()
  if (busca) filterQs.set("q", busca)
  if (uf) filterQs.set("uf", uf)
  if (segmento) filterQs.set("seg", segmento)
  const baseUrl = filterQs.toString() ? `/empresas?${filterQs}` : "/empresas"

  const segCount = new Map(segmentos.map(s => [s.segmento, s.total]))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mb-8 pb-4 border-b-2 border-dark">
        <div className="w-8 h-0.5 bg-primary mb-3" />
        <h1 className="text-3xl font-black text-dark uppercase tracking-tight">
          Diretório de Empresas
        </h1>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          {total.toLocaleString("pt-BR")} desentupidoras cadastradas — desentupimento de esgoto,
          limpa-fossa, caixa de gordura, hidrojateamento e manutenção hidráulica. Empresas com{" "}
          <strong className="text-primary">selo de verificação</strong> tiveram o cadastro
          confirmado pelo responsável.
        </p>
      </div>

      {/* Filtros */}
      <form action="/empresas" method="get" className="mb-8 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="search"
              name="q"
              defaultValue={busca}
              placeholder="Buscar por nome ou CNPJ"
              className="w-full pl-10 pr-3 py-3 text-base sm:text-sm border border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <select
            name="uf"
            defaultValue={uf}
            className="px-3 py-3 text-sm border border-border rounded-lg focus:outline-none focus:border-primary min-w-[110px]"
          >
            <option value="">Todos UFs</option>
            {ufs.map(({ uf: u, total: n }) => (
              <option key={u} value={u}>{u} ({n})</option>
            ))}
          </select>

          <select
            name="seg"
            defaultValue={segmento}
            className="px-3 py-3 text-sm border border-border rounded-lg focus:outline-none focus:border-primary min-w-[180px]"
          >
            <option value="">Todos segmentos</option>
            {SEGMENTOS.map(s => {
              const n = segCount.get(s.slug)
              return <option key={s.slug} value={s.slug}>{s.label}{n ? ` (${n.toLocaleString("pt-BR")})` : ""}</option>
            })}
          </select>

          <button
            type="submit"
            className="px-5 py-3 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors min-h-[44px]"
          >
            Filtrar
          </button>

          {(busca || uf || segmento) && (
            <Link
              href="/empresas/"
              className="px-4 py-3 text-sm font-semibold text-muted border border-border rounded-lg hover:text-primary hover:border-primary transition-colors min-h-[44px] inline-flex items-center"
            >
              Limpar
            </Link>
          )}
        </div>

        {/* chips dos filtros ativos */}
        {(busca || uf || segmento) && (
          <div className="flex items-center gap-2 text-xs text-muted flex-wrap">
            <span>Filtros:</span>
            {busca && <span className="px-2 py-1 bg-surface border border-border rounded-md">&quot;{busca}&quot;</span>}
            {uf && <span className="px-2 py-1 bg-surface border border-border rounded-md">UF: {uf}</span>}
            {segmento && <span className="px-2 py-1 bg-[var(--color-primary-soft)] text-primary border border-primary/20 rounded-md font-semibold">{SEG_LABEL[segmento] ?? segmento}</span>}
          </div>
        )}
      </form>

      {/* Atalhos por segmento populares (sem filtro ativo) */}
      {!busca && !uf && !segmento && (
        <div className="mb-8 flex flex-wrap gap-2">
          {SEGMENTOS.slice(0, 8).map(s => {
            const n = segCount.get(s.slug)
            if (!n) return null
            return (
              <Link
                key={s.slug}
                href={`/empresas?seg=${s.slug}`}
                className="px-3 py-1.5 text-xs font-semibold border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
              >
                {s.label} <span className="text-muted">({n.toLocaleString("pt-BR")})</span>
              </Link>
            )
          })}
        </div>
      )}

      {empresas.length === 0 ? (
        <p className="text-muted text-center py-16">
          Nenhuma empresa encontrada com os filtros aplicados.
        </p>
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
                  {e.cnpj && (
                    <p className="text-[11px] text-muted mt-1 font-mono">CNPJ: {e.cnpj}</p>
                  )}
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
                    <ShieldCheck size={12} strokeWidth={2.5} />
                    Verificada
                  </span>
                )}
                {e.uf && <span>{e.cidade ? `${cidadeLabel(e.cidade, e.uf)}/${e.uf}` : e.uf}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} baseUrl={baseUrl} />
    </div>
  )
}
