// src/components/seo/FaqSection.tsx
//
// Renderiza um bloco de Perguntas Frequentes visível + o JSON-LD FAQPage
// (elegível a featured snippet / rich result no Google). Server component.
// Reutilizado pelas páginas de cidade, estado e segmento.

export type Faq = { q: string; a: string }

export function FaqSection({ faqs, titulo = "Perguntas frequentes" }: { faqs: Faq[]; titulo?: string }) {
  if (!faqs || faqs.length === 0) return null

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return (
    <section className="mt-12 mb-4 max-w-3xl" aria-labelledby="faq-titulo">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h2 id="faq-titulo" className="text-2xl font-black text-dark tracking-tight mb-6">{titulo}</h2>
      <dl className="divide-y divide-border">
        {faqs.map((f, i) => (
          <div key={i} className="py-4">
            <dt className="font-bold text-dark mb-1.5">{f.q}</dt>
            <dd className="text-sm text-muted leading-relaxed">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
