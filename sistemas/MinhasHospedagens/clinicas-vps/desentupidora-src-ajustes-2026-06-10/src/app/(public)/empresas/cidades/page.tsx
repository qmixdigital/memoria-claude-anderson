import Link from "next/link"
import type { Metadata } from "next"
import { siteConfig } from "@/site.config"
import { getUfsDisponiveis } from "@/lib/empresas/queries"
import { UF_NOME } from "@/lib/empresas/utils"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "Desentupidoras por Estado",
  description: `Encontre desentupidoras por estado e cidade no Brasil. ${siteConfig.name}.`,
  alternates: { canonical: `https://${siteConfig.domain}/empresas/cidades/` },
}

export default async function EmpresasCidadesPage() {
  const ufs = await getUfsDisponiveis()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Empresas", href: "/empresas/" }, { label: "Por estado" }]} />

      <div className="mb-8 pb-4 border-b-2 border-dark">
        <div className="w-8 h-0.5 bg-primary mb-3" />
        <h1 className="text-3xl font-black text-dark uppercase tracking-tight">
          Desentupidoras por Estado
        </h1>
        <p className="text-sm text-muted mt-2">
          Selecione um estado para ver as cidades com desentupidoras cadastradas.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {ufs.map(({ uf, total }) => (
          <Link
            key={uf}
            href={`/empresas/cidades/${uf.toLowerCase()}/`}
            className="group p-4 border border-border rounded-lg hover:border-primary hover:bg-[var(--color-primary-soft)] transition-colors"
          >
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-lg font-black text-dark group-hover:text-primary">{uf}</span>
              <span className="text-xs text-muted">{total.toLocaleString("pt-BR")}</span>
            </div>
            <p className="text-xs text-muted">{UF_NOME[uf] ?? uf}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
