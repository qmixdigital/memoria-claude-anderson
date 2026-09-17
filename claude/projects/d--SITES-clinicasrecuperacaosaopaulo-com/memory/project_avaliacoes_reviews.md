---
name: avalia-es-de-cl-nica-ugc-moderado
description: Sistema de avaliações (nota+comentário) nas páginas de clínica — no ar; moderação IA+humano; falta só o bot do Telegram
metadata: 
  node_type: memory
  type: project
  originSessionId: fab07a3e-8707-4a23-979e-3bf26cd09b20
  modified: 2026-07-28T19:06:31.773Z
---

Sistema de **avaliações de clínica** (engajamento/UGC p/ autoridade SEO). **No ar em produção** (mergeado no master + deploy 28/jul/2026). Spec: `docs/superpowers/specs/2026-07-28-avaliacoes-clinicas-design.md`; plano: `docs/superpowers/plans/2026-07-28-avaliacoes-clinicas.md`.

**Fluxo:** form aberto na página da clínica (nome + e-mail privado + relação + nota 1-5 + texto) → pré-filtro regex (`src/lib/moderation.ts`) → IA classifica via cliente OpenAI-compatível (`src/lib/llm.ts`, modelo `gpt-4o-mini`; `reject` descarta, `approve`/`flag`/sem-IA → `pending`) → **aprovação humana** (Telegram OU painel admin) → publica. Schema `aggregateRating` + `review[]` só com **≥3 aprovadas**.

**Peças:** tabela `clinic_reviews` (aplicada em prod via DDL cirúrgico — prod NÃO é migrate-managed; migração drizzle 0003 no repo). API: `POST /api/public/reviews` (rate-limit+Zod+honeypot+dedup por e-mail), `POST /api/telegram/webhook` (gated por `TELEGRAM_WEBHOOK_SECRET`), `/api/clinic/reviews/{owns,[id]/dispute}` (dono contesta → notifica admin), `/api/admin/reviews[/id]` + página `/admin/avaliacoes` (fallback de moderação, espelha depoimentos). UI: `clinic-reviews.tsx` (server) + `review-form.tsx` + `dispute-button.tsx` + `review-owner-context.tsx` (1 checagem de posse via contexto).

**Env no servidor (.env):** `OPENAI_API_KEY` (reusa a do Palpite Mestre) e `TELEGRAM_WEBHOOK_SECRET` já configurados. **FALTAM `TELEGRAM_BOT_TOKEN` + `TELEGRAM_ADMIN_CHAT_ID`** — usuário vai criar bot novo no @BotFather. Sem eles, o Telegram é no-op e a moderação é feita no painel `/admin/avaliacoes`. Ao receber o token: `curl "https://api.telegram.org/bot<TOKEN>/setWebhook" -d "url=https://clinicasrecuperacaosaopaulo.com/api/telegram/webhook" -d "secret_token=<SECRET do .env>" -d 'allowed_updates=["callback_query"]'`.

**Próxima fase (a pedido):** estender o mesmo motor de moderação para **comentários dos artigos do blog**.

**Minors diferidos:** phone-regex do prefilter pode ter falso-positivo (aceitável anti-spam); ordering cosmético `.notNull().references()`.
