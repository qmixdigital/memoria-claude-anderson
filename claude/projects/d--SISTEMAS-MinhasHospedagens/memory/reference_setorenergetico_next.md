---
name: reference_setorenergetico_next
description: "setorenergetico.com.br AO VIVO é Next.js+Postgres na opengravity (NÃO o WordPress da anderson, que é backend morto); como publicar/editar"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 611c5219-ea2f-4933-b1d7-762f552ee8c8
---

O site **ao vivo** de `setorenergetico.com.br` é um app **Next.js 16 + Drizzle + Postgres 16**. É um **diretório de empresas do setor de energia** (Fase 2: cruza ANEEL + Receita Federal) + portal de notícias. Cliente (não mexer em massa sem pedido — ver [[feedback_sites_clientes_rede]]).

⚠️ **SERVIDOR CORRIGIDO (2026-06-17):** a versão LIVE está no **srv1166087** (`hostinger-vps-srv1166087`), NÃO no opengravity. PM2 `setorenergetico` + `setorenergetico-b` (par zero-downtime, portas **3015/3016**), `/var/www/setorenergetico`, nginx upstream `setorenergetico_backend`. Confirmado ao resolver um 502 (DNS/Cloudflare → srv1166087). O **enjai.com.br** também é Next no srv1166087 (`enjai`+`enjai-b`, portas 3024/3025). Em 2026-06-17 os dois estavam **STOPPED no PM2** (não OOM — servidor com 25GB livres) → `pm2 start` + `pm2 save` resolveu (voltaram 200). Pode existir um deploy ANTIGO/duplicado no opengravity (id ~17, porta 3015) — ignorar; a viva é a do srv1166087. (O doc `D:\SITES\setorenergetico\README.md` que montei antes diz opengravity — está ERRADO no campo servidor; corrigir lá.)

⚠️ **O WordPress que ficava em `hostinger-anderson-gna` (`/home/u400588174/domains/setorenergetico.com.br`) foi ELIMINADO em 2026-06-08** (DROP DATABASE `u400588174_GJd7P` + arquivos removidos). Backup final + README em `D:\SISTEMAS\MinhasHospedagens\setorenergetico\`. (Antes de descobrir que a live era o Next, desperdicei tempo fazendo pruning/remoção de link no WP — ele nunca alimentou a live.) Pendência manual: remover o addon domain `setorenergetico.com.br` do hPanel da anderson (sem MCP da Hostinger anderson aqui).

**Como publicar conteúdo na live** (receptor WP-compatível, igual ao Antônio):
- `POST http://127.0.0.1:3015/api/qmix/noticias` (na VPS) com header `X-API-KEY: <QMIX_API_KEY de /var/www/setorenergetico/.env.local>`.
- Body JSON: `title`, `content` (HTML; sanitizado por DOMPurify — `<script>` é removido, `<a>`/`<table>`/`class` passam, links ficam **dofollow**), `categories` (slug ex: `["energia"]`, lista em `src/site.config.ts`), `author` (UUID de `autores` ou índice numérico), `tags[]`, `resumo`, `seo_title`, `seo_description`, `image_base64` (vira AVIF 1200x630), `status:"publish"`.
- Resposta 201 `{post_id,slug,url}`. URL pública = `https://setorenergetico.com.br/<slug>/` (com barra; sem barra dá 308).

**Conteúdo no Postgres:** tabela `noticias` (`status` enum draft/published/inactive, `deleted_at` soft-delete, `categoria` varchar slug, `wp_post_id` rastreia origem). Categorias em `categorias`, autores em `autores`. DB url em `.env.local` (root lê). Off-topic herdado do WP: `site.config.ts` tem `hiddenCategories` (esconde `insights`/`qual-remedio`/`empresas` das listagens mas mantém URL viva p/ backlinks). Ver [[reference_pm2_opengravity_pattern]].

1º guest post publicado por aqui: `economizar-energia-no-forno-ao-assar-bolos-e-quitandas` (backlink dofollow p/ topodebolo.net).
