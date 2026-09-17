---
name: blog-publish-workflow
description: "Como publicar artigo no blog do clinicasrecuperacaosaopaulo (banco, imagem, sitemap, IndexNow)"
metadata: 
  node_type: memory
  type: reference
  originSessionId: fab07a3e-8707-4a23-979e-3bf26cd09b20
  modified: 2026-07-28T21:32:16.580Z
---

Workflow para publicar artigo no blog do [[diretorio-clinicas]] (Next 16, conteúdo HTML em `blog_posts`, VPS srv1166087). Ver também [[comentarios-blog-ugc-moderado]].

**Banco `blog_posts`** (produção, DBURL no `.env` do servidor): colunas id, title (H1/display, pode passar de 60), slug, content (HTML), excerpt, cover_image, status ('published'), category_id, meta_title (é o `<title>`, manter ≤60), meta_description (150-160), author_id, published_at, views, created_at. Inserir com `gen_random_uuid()`, `published_at=now()`. Usar **dollar-quoting** (`$BODY$...$BODY$`) no INSERT para não escapar aspas do HTML — montar o SQL NO servidor concatenando o arquivo .html (evita transferir string gigante escapada).

**Categorias (ids):** Alcoolismo `ef0cd0ca...`, Dependência Química `bd226b2d-1326-492a-ad9e-431b6bd969c3`, Drogas e Substâncias `6f9d75e8-7067-47de-984b-0ef2aad85064`, Família e Apoio `15921e85...`, Saúde Mental `a98fff60...`, Tratamento e Internação `36b04ede...`, Vícios e Compulsões `a64e719d...`. **Autor** padrão (77 posts): `e21b725f-f171-4188-a9dc-16031f3abc18` (Heberson Oliveira, admin).

**Conteúdo (regras do render):** `sanitizeDbHtml` = `demoteH1 + stripMicrodata + sanitizeXss`. Logo: **H1 vira H2** (começar conteúdo com `<p>` intro + `<h2>`), **microdata Schema (itemprop/itemscope/itemtype) é REMOVIDA** (FAQ tem que ser H2/H3 limpo — a página só emite JSON-LD Article, não FAQPage) e **inline `style=` é removido** (usar HTML semântico, não caixas com style). `<table>` (colspan/rowspan/class/id) É permitido e estilizado por `prose-table` — ótimo p/ featured snippet de comparação. Padrão dos artigos: intro com keyword nos primeiros 40-60 caracteres, H2 por pergunta, links internos com âncora-keyword variada (home = "clínicas de recuperação em São Paulo", `/clinicas`, `/tratamento-gratuito/caps`, `/blog/...` relacionados), bloco final "Fontes e referências" com links `rel="nofollow noopener"` (gov.br saúde, NIDA/nida.nih.gov, PubMed). Adicionar link de ENTRADA de 1-2 artigos existentes p/ o novo (não deixar órfão).

**Imagens de capa (GOTCHA):** gerar WebP 1216x640 na Runware. O nginx serve `/uploads` de **`/var/www/clinicasrecuperacaosaopaulo/public/uploads/`** — NÃO do `UPLOAD_DIR` do `.env` (`/home/qmix/web/...`, que dá 404). Copiar o arquivo p/ `.../public/uploads/blog/<slug>-cover.webp`. cover_image no banco = `/uploads/blog/<slug>-cover.webp`. scp desabilitado: transferir binário com `base64 -w0 | ssh host 'base64 -d > destino'`.

**Pós-publicação:** o `src/app/sitemap.ts` lê o banco mas é CACHEADO no build (sem revalidate) → precisa **rebuild** (`rm -rf .next && pnpm build && pm2 reload clinicas clinicas-b`) para o post entrar no sitemap e na listagem `/blog`. A página do post em si (`/blog/[slug]`) é dinâmica e aparece na hora. Depois, disparar **IndexNow**: key file `https://clinicasrecuperacaosaopaulo.com/6ae1679001529026217e711a11832e27.txt`, POST em `https://api.indexnow.org/indexnow` com host+key+keyLocation+urlList.
