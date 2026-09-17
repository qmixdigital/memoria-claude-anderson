// src/app/(public)/empresas/[slug]/reivindicar/page.tsx
import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import type { Metadata } from "next"
import Link from "next/link"
import { siteConfig } from "@/site.config"
import { getEmpresaBySlug } from "@/lib/empresas/queries"
import { criarClaim, temClaimPendenteParaEmpresa } from "@/lib/empresas/claims"
import { Breadcrumbs } from "@/components/ui/Breadcrumbs"
import { ShieldCheck, Mail, Phone, BadgeCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Reivindicar perfil de empresa",
  description: `Sou o dono da empresa — quero atualizar dados, fotos e contatos no diretório do ${siteConfig.name}.`,
  robots: { index: false, follow: true },
}

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ ok?: string }> }

async function reivindicarAction(formData: FormData) {
  "use server"
  const slug = String(formData.get("slug") ?? "")
  const empresa = await getEmpresaBySlug(slug)
  if (!empresa) throw new Error("Empresa não encontrada")

  const nome = String(formData.get("nome") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const telefone = String(formData.get("telefone") ?? "").trim() || null
  const cargo = String(formData.get("cargo") ?? "").trim() || null
  const evidencia = String(formData.get("evidencia") ?? "").trim() || null

  if (nome.length < 3 || !email.includes("@")) {
    redirect(`/empresas/${slug}/reivindicar/?erro=campos`)
  }

  if (await temClaimPendenteParaEmpresa(empresa.id, email)) {
    redirect(`/empresas/${slug}/reivindicar/?erro=duplicado`)
  }

  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null

  await criarClaim({
    company_id: empresa.id,
    nome,
    email,
    telefone,
    cargo,
    evidencia_text: evidencia,
    ip_origem: ip,
  })

  redirect(`/empresas/${slug}/reivindicar/?ok=1`)
}

export default async function ReivindicarPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const empresa = await getEmpresaBySlug(slug)
  if (!empresa) notFound()

  const enviado = sp.ok === "1"

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Empresas", href: "/empresas/" },
        { label: empresa.nome, href: `/empresas/${empresa.slug}/` },
        { label: "Reivindicar" },
      ]} />

      <div className="mb-8 pb-4 border-b-2 border-dark">
        <div className="flex items-center gap-2 mb-2">
          <BadgeCheck size={16} className="text-primary" strokeWidth={2.5} />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Reivindicação de perfil</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl uppercase leading-[0.95] text-dark">
          Reivindicar <span className="font-editorial italic font-normal text-primary">{empresa.nome}</span>
        </h1>
        <p className="text-sm text-muted mt-2 max-w-xl">
          É o dono ou representante autorizado? Preencha os dados — nossa equipe valida e libera o
          painel pra você atualizar fotos, contatos, redes sociais e descrição.
        </p>
      </div>

      {enviado ? (
        <div className="border-2 border-primary bg-[var(--color-primary-soft)] p-6 rounded-sm">
          <h2 className="text-xl font-bold text-primary mb-2 flex items-center gap-2">
            <ShieldCheck size={20} strokeWidth={2.5} /> Solicitação enviada
          </h2>
          <p className="text-sm text-dark leading-relaxed">
            Recebemos sua reivindicação para <strong>{empresa.nome}</strong>. Nossa equipe valida em
            até 2 dias úteis e responde por e-mail. Em caso de dúvida, escreva pra{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-primary underline font-semibold">
              {siteConfig.email}
            </a>.
          </p>
          <Link href={`/empresas/${empresa.slug}/`} className="inline-block mt-4 text-xs font-semibold uppercase tracking-wider text-primary hover:underline">
            ← Voltar pro perfil
          </Link>
        </div>
      ) : (
        <form action={reivindicarAction} className="space-y-5">
          <input type="hidden" name="slug" value={empresa.slug} />

          <Field label="Seu nome completo" required>
            <input
              name="nome"
              type="text"
              required
              minLength={3}
              maxLength={120}
              autoComplete="name"
              className="form-input"
            />
          </Field>

          <Field label="Cargo na empresa" hint="Ex: Sócio-proprietário, Diretor comercial, Gerente de marketing">
            <input
              name="cargo"
              type="text"
              maxLength={60}
              className="form-input"
            />
          </Field>

          <Field label="E-mail corporativo" required hint="Preferível e-mail do mesmo domínio do site da empresa.">
            <input
              name="email"
              type="email"
              required
              maxLength={255}
              autoComplete="email"
              className="form-input"
            />
          </Field>

          <Field label="Telefone / WhatsApp" hint="Opcional — facilita o contato pra confirmar.">
            <input
              name="telefone"
              type="tel"
              maxLength={40}
              autoComplete="tel"
              className="form-input"
            />
          </Field>

          <Field label="Como podemos verificar?" hint="Ex: link público da empresa que mostre seu nome (LinkedIn, site institucional), ou descreva a relação com a empresa.">
            <textarea
              name="evidencia"
              rows={4}
              maxLength={1000}
              className="form-input"
            />
          </Field>

          <div className="border-t border-border pt-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-xs text-muted leading-relaxed max-w-md">
              Ao enviar, declaro que tenho autorização da empresa <strong>{empresa.nome}</strong>{" "}
              para reivindicar este perfil. Solicitações falsas podem ser banidas.
            </p>
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white font-bold uppercase tracking-wider text-sm hover:bg-[var(--color-primary-hover)] transition-colors rounded-sm whitespace-nowrap"
            >
              Enviar reivindicação
            </button>
          </div>
        </form>
      )}

      <div className="mt-12 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
        <Step icon={<Mail size={18} className="text-primary" strokeWidth={2.5} />} title="Você envia" body="Seus dados de contato + comprovação." />
        <Step icon={<ShieldCheck size={18} className="text-primary" strokeWidth={2.5} />} title="Validamos" body="Até 2 dias úteis. Podemos contatar pra confirmar." />
        <Step icon={<Phone size={18} className="text-primary" strokeWidth={2.5} />} title="Acesso liberado" body="Você recebe credenciais por e-mail e edita o perfil." />
      </div>
    </div>
  )
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-dark block mb-1.5">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      {children}
      {hint && <span className="text-[11px] text-muted block mt-1 leading-relaxed">{hint}</span>}
    </label>
  )
}

function Step({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div>
      <div className="mb-2">{icon}</div>
      <div className="text-xs font-bold uppercase tracking-wider text-dark mb-1">{title}</div>
      <p className="text-xs text-muted leading-relaxed">{body}</p>
    </div>
  )
}
