---
name: fotos-banco-capas
description: Em 16/09/2026 todas as imagens de IA dos dois sites viraram foto de banco (Pexels/Pixabay); coluna cover_alt em blog_posts; fluxo folha de contato + escolha manual; purge Cloudflare quando o nome do arquivo se mantem
metadata:
  type: project
---

Aprovado por Anderson em 16/09/2026: 256 capas de blog (127 clinicas + 129 casas, fotos diferentes por site), 11 imagens inline, 18 genericas de ficha (`/uploads/clinics/generic/`), 3 heros da home e og-default (agora `.jpg`) sao foto de banco. Nada de IA sobrou nos dois sites.

**Como foi feito (repetir para artigo novo):** `blog_posts.cover_alt` (text) existe nos dois bancos e o template ([slug]/page.tsx, post-card, recent-posts) usa `coverAlt || title`. Capa = `/uploads/blog/<slug-keyword-cena>.webp` 1216x640, alt escrito olhando a foto e com a keyword do artigo. Termo de busca em ingles descrevendo a CENA (nao o tema): "cocaine" devolve neve e matcha, "brain neurons" devolve render 3D; trocar o termo, nunca a fonte. Folha de contato com 8 candidatas (4 Pexels + 4 Pixabay intercaladas) e escolha manual, uma por artigo.

**Why:** o site com capas de IA "nao estava legal" (Anderson) e foto real rende melhor no Google.

**How to apply:** artigo novo segue [[blog-publish-workflow]] + cover_alt preenchido. Se um arquivo de imagem for sobrescrito com o MESMO nome, purgar a URL no Cloudflare (30 dias de TTL em /uploads): token em `D:/SISTEMAS/Cloudflare/contas.json`, `POST /zones/{id}/purge_cache {files:[...]}`. Ver tambem [[build-node20-path-ssh]].
