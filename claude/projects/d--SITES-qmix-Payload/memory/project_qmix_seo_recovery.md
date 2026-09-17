---
name: qmix-seo-recovery-2026-05
description: "QMix Digital perdeu rankings e está há 60 dias sem clientes novos — usuário autorizou ações SEO agressivas, pode arriscar mais que o normal"
metadata: 
  node_type: memory
  type: project
  originSessionId: f0fe6811-0d34-4f0f-86c9-aff621746640
---

Status em 2026-05-22: qmix.com.br não retorna nas pesquisas que ranqueavam antes e zero clientes nos últimos 60 dias.

**Why:** O usuário disse "ate não voltou a ranquear" e "nenhum cliente chega no site nos últimos 60 dias" — o downside está saturado. Confia que dá pra arriscar mudanças mais ousadas (refactor, conteúdo novo, mudança de estrutura) porque já bateu o fundo.

**How to apply:** Para esse projeto especificamente, posso fazer mudanças SEO/conteúdo mais agressivas sem pedir confirmação a cada passo. Decisões reversíveis (title/meta/schema/internal linking/content rewrites) podem ir direto. Mudanças irreversíveis em larga escala (drop de tabelas, mudança de domínio, mudança de URL canonical em massa que quebraria backlinks externos) ainda precisam confirmar.

Contexto técnico: site é Next.js 16 + Drizzle + Postgres na VPS opengravity (ssh alias), com 2 instâncias PM2 (qmix-next porta 3005, qmix-next-b porta 3006) e Nginx upstream. Deploy via npm run build + pm2 reload sequencial.

Cloudflare zone: `f5f7d6c9deebedfb89f5f3b6b0884a23`, plano Pro Website. Já configurei cache rules cobrindo páginas públicas, bot fight Pro com AI bots liberados, custom WAF bloqueando scrapers SEO/regionais.
