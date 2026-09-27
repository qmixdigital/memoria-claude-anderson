---
name: pages-redirects-splat-ordem
description: Cloudflare Pages descarta em silêncio regras estáticas do _redirects escritas depois de um splat quando passam de 100; splats sempre por último
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 7ff5efae-8b50-4a69-8837-609c7ccb4168
  modified: 2026-09-21T19:23:26.094Z
---

No `_redirects` do Cloudflare Pages, toda regra estática que vem DEPOIS de uma regra com `*` ou `:placeholder` é tratada como dinâmica (para preservar a ordem), e o limite de dinâmicas é 100. Passou disso, o Pages ignora o resto do arquivo e só avisa no log do deploy ("Maximum number of dynamic rules supported is 100. Skipping remaining N lines"). O deploy sai como sucesso.

**Why:** Em 21/09/2026, 248 regras de slugs antigos do WordPress do joelho ficaram mortas por isso; os testes com curl davam 404 sem motivo aparente até ler o log do deploy pela API (`/deployments/<id>/history/logs`).

**How to apply:** Regras com splat ficam no fim do arquivo. Depois de cada deploy que mexe no `_redirects`, conferir no log "Parsed N valid redirect rules" contra o total de linhas com `/`. Vale para qualquer projeto no Pages, não só o joelho. Ver também [[repo-github-joelho]].
