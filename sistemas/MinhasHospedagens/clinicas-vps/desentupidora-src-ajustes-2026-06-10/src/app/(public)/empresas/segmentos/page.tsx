import Link from "next/link"
import type { Metadata } from "next"
import { siteConfig } from "@/site.config"
import { getSegmentosDisponiveis, SEGMENTOS } from "@/lib/empresas/queries"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "Desentupidoras por Segmento",
  description: `Encontre desentupidoras por tipo de serviço: desentupimento, limpeza especializada, redes de esgoto e manutenção hidráulica. ${siteConfig.name}.`,
  alternates: { canonical: `https://${siteConfig.domain}/empresas/segmentos/` },
}

const SEG_DESC: Record<string, string> = {
  desentupidora: "Empresas especializadas em desentupimento de pias, vasos, ralos, esgoto e fossa séptica.",
  limpeza: "Limpeza especializada de caixas d'água, caixas de gordura e reservatórios.",
  "redes-esgoto": "Empresas de gestão de redes de esgoto e saneamento.",
  manutencao: "Manutenção de redes hidráulicas e infraestrutura predial.",
}

export default async function EmpresasSegmentosPage() {
  const segmentos = await getSegmentosDisponiveis()
  const counts = new Map(segmentos.map(s => [s.segmento, s.total]))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Empresas", href: "/empresas/" }, { label: "Por segmento" }]} />

      <div className="mb-8 pb-4 border-b-2 border-dark">
        <div className="w-8 h-0.5 bg-primary mb-3" />
        <h1 className="text-3xl font-black text-dark uppercase tracking-tight">
          Empresas por Segmento
        </h1>
        <p className="text-sm text-muted mt-2">
          Selecione o tipo de serviço para ver as desentupidoras cadastradas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SEGMENTOS.map(s => {
          const total = counts.get(s.slug) ?? 0
          if (total === 0) return null
          return (
            <Link
              key={s.slug}
              href={`/empresas/segmentos/${s.slug}/`}
              className="group p-5 border border-border rounded-xl hover:border-primary hover:bg-[var(--color-primary-soft)] transition-colors"
            >
              <div className="flex items-baseline justify-between mb-1">
                <h2 className="text-lg font-black text-dark group-hover:text-primary uppercase tracking-tight">
                  {s.label}
                </h2>
                <span className="text-sm font-bold text-primary">{total.toLocaleString("pt-BR")}</span>
              </div>
              <p className="text-xs text-muted">{SEG_DESC[s.slug] ?? ""}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
