---
name: pro-primeiro-assinante
description: "calistenia.ia.br PRO: primeiro pagante em 16/10/2026 (Renato Bandeira Wolf); naquele dia 3 das 5 promessas da /pro não existiam e foram implementadas (PDF, sem anúncios, evolução). AdSense ainda não está configurado no .env."
metadata:
  node_type: memory
  type: project
  originSessionId: 2714604c-b612-4c4c-ac1c-7684461f4c6d
  modified: 2026-10-16T11:09:17.253Z
---

Primeiro assinante do PRO: Renato Bandeira Wolf (renatobwolf@gmail.com), 16/10/2026,
R$ 14,90 PIX, PRO até 15/11/2026. Ao conferir, a tabela da /pro prometia PDF do
plano, navegação sem anúncios e progressão completa sem nenhum código por trás.
Implementado e deployado em 16/10/2026: `/api/planos/pdf` (pdfkit), `/api/pro` +
AdSlot escondendo anúncio para PRO, evolução por exercício no painel.

**Why:** o Anderson disse "o cliente pago deve receber o que há de melhor"; promessa
na tabela sem código é o que mais o incomodou.

Na mesma tarde, por ordem dele ("faça tudo"): AdSense removido de vez (ele disse
"não vamos usar AdSense"; o aviso de cookies só informa, GA4 por legítimo
interesse), e-mail de boas-vindas, lembrete de vencimento + renovação na /pro,
PIX pendente reaproveitado, lista e troca de planos em /conta/planos, cron da
rotina diária agendado (nunca tinha sido).

À noite ("faça todos"): webhook do Asaas (rota pronta, registro barrado pelo teto
de 10 webhooks da conta compartilhada; decisão pendente dele), teste de força,
ajuste automático, resumo semanal, lembretes push, admin de assinantes, PDF com
ilustrações, página /app. Há um segundo PRO na base (heleoliveira36@gmail.com).

**How to apply:** ao mexer na /pro, conferir que cada linha da tabela COMPARACAO tem
teste e código (`scripts/prova-pro.mjs` prova tudo em produção com conta
descartável). Não reintroduzir anúncio nem Consent Mode. Ver
[[repo-branch-producao]] para publicar.
