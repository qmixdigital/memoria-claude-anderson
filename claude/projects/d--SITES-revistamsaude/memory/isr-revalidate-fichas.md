---
name: isr-revalidate-fichas
description: Bug recorrente — páginas com generateStaticParams sem revalidate ficam congeladas
metadata: 
  node_type: memory
  type: project
  originSessionId: 83b06f82-5a45-4a34-ab7e-948b3a416370
---

No revistamsaude, qualquer página de rota dinâmica com `generateStaticParams` **precisa** de `export const revalidate = N` (usamos 60). Sem isso ela vira estática infinita (`Cache-Control: s-maxage=31536000`) e **edições feitas no admin do Payload nunca aparecem no site** — salvam no banco mas o HTML congela no último build.

**Sintoma:** "edito a ficha do profissional/edição no admin, salva, mas não muda na página."

Já aconteceu com `profissionais/[slug]` e `edicoes/[slug]` (corrigido jun/2026). As demais páginas já tinham `revalidate=60`.

**Por que `revalidate` (e não só os hooks `revalidatePath` na coleção):** há 2 instâncias PM2 e cada uma tem cache em memória próprio — um hook `revalidatePath` só limpa a instância que processou o save. `revalidate=N` garante que **ambas** atualizam em ≤N segundos independentemente. Ver [[deploy-workflow]].
