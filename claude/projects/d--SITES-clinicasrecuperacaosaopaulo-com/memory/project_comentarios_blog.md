---
name: comentarios-blog-ugc-moderado
description: Comentários/mensagens de apoio moderados nos artigos do blog — no ar em produção; reusa o motor de moderação das avaliações
metadata: 
  node_type: memory
  type: project
  originSessionId: fab07a3e-8707-4a23-979e-3bf26cd09b20
  modified: 2026-07-28T20:43:22.356Z
---

Sistema de **comentários (mensagens de apoio/depoimento)** nos artigos do blog. **No ar em produção** (deploy 28/jul/2026 no srv1166087). Estende o motor de moderação das [[avalia-es-de-cl-nica-ugc-moderado]] para o blog. Spec: `docs/superpowers/specs/2026-07-28-comentarios-blog-design.md`; plano: `docs/superpowers/plans/2026-07-28-comentarios-blog.md`.

**Fluxo:** form aberto no artigo (nome + e-mail privado + relação OPCIONAL + mensagem, SEM nota) → `codePrefilter` regex → IA `moderateBlogComment` (`src/lib/moderation.ts`, cliente OpenAI) → aprovação humana (Telegram OU `/admin/comentarios`) → publica. Sem nota/estrelas. Schema `Comment[]` + `commentCount` no JSON-LD do artigo quando ≥1 aprovado.

**Peças:** tabela `blog_comments` (FK→blog_posts cascade; enums `comment_relationship` recovering|family|professional|visitor, `comment_status`; aplicada em prod via DDL cirúrgico, NÃO drizzle-migrate — migração `drizzle/0004_funny_thunderbolts.sql` no repo). `src/lib/comments.ts` (getApprovedComments/getCommentCount/hasCommented). API `POST /api/public/comments` (rate-limit 3/10min + Zod + honeypot `website` + dedup e-mail+post). UI: `src/components/blog/{comment-form,blog-comments}.tsx` + integrado em `src/app/(public)/blog/[slug]/page.tsx` (dinâmico, aparece no próximo render). Admin `/admin/comentarios` + `/api/admin/comments[/id]`.

**Telegram compartilhado com avaliações:** `sendCommentForApproval` (`src/lib/telegram.ts`) usa prefixo callback **`bc:`** (avaliações usam `rv:`). O webhook `src/app/api/telegram/webhook/route.ts` foi generalizado: roteia `rv:`→clinicReviews e `bc:`→blogComments por prefixo, mesmo secret. Reusa mesmas envs (OPENAI_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID, TELEGRAM_WEBHOOK_SECRET) — nenhuma credencial nova.

**Fix de segurança junto:** `src/components/shared/json-ld.tsx` passou a escapar `<`/`>` (via `<`/`>`) antes do `dangerouslySetInnerHTML` — impede break-out de `</script>` por corpo de UGC (fecha também a mesma exposição no `review[]` das clínicas).

**Design/UX (redesign 28/jul):** as duas seções de UGC (comentários do blog e avaliações de clínica) usam um card "warm" âmbar/dourado (gradiente `from-[#FFFBF3] via-[#FFF6E9] to-[#FFEFD9]`, borda `border-[#F5A623]/30`, badge coração/MessageSquareHeart, cards de depoimento com ícone Quote, CTA dourado com texto escuro `#1A2B3C` p/ contraste WCAG) que contrasta com o azul clínico do resto do site, para chamar atenção e convidar ao compartilhamento. O board de comentários fica **logo abaixo do último parágrafo** do artigo (antes de "Precisa de ajuda agora?"), não no fim.

**GOTCHA crítico (Next 16 App Router):** `BlogComments`/`ClinicReviews` eram `async` (faziam `await` do próprio fetch) → o Next fazia STREAM do conteúdo para o FIM do HTML cru, então a posição no meio do artigo não valia para crawlers/no-JS (aparecia por último no HTML apesar do JSX estar no lugar certo). Solução: a PAGE já busca os dados (`approvedComments` p/ o JSON-LD; `approvedReviews`+`rating` na clínica) — passar como PROP e tornar os componentes SÍNCRONOS (`function`, sem await). Aí renderizam inline na posição correta. Ao verificar posição, checar no ORIGIN (`curl localhost:3028`) e ignorar o payload RSC `self.__next_f` (ordem enganosa).

**Deploy/infra:** VPS `hostinger-vps-srv1166087` (srv1166087.hstgr.cloud, 31.97.173.40), app em `/var/www/clinicasrecuperacaosaopaulo`, PM2 `clinicas`+`clinicas-b` (reload zero-downtime). scp desabilitado no host — transferir arquivos via `cat | ssh host 'cat > /tmp/...'`. DATABASE_URL/env no `.env` do servidor. **Cuidado:** alias `clinicas-vps` (31.97.162.199 = srv984283) NÃO é o host do site.
