---
name: pages-dev-nem-sempre-e-o-slug
description: "O subdomínio pages.dev de um projeto novo ganha sufixo quando o nome já é de outro (df8-b1l, blogse-ax8); CNAME para <slug>.pages.dev dá erro 1014 e o site cai"
metadata:
  type: project
---

Em 17/09/2026, na migração para o Pages, `df8.com.br` e `blogse.com.br`
ficaram em 403 "error code: 1014" (CNAME cross-user) por uns 20 minutos:
o CNAME apontava para `df8.pages.dev`, que pertence a outra pessoa; o projeto
tinha recebido `df8-b1l.pages.dev`. O nome do projeto é único só dentro da
conta; o subdomínio `pages.dev` é global.

**Why:** a API devolve o subdomínio real em `result.subdomain` na criação e no
GET do projeto; assumir `<slug>.pages.dev` funciona em 90% dos casos e derruba
os outros 10% em silêncio (a prova no pages.dev passa, porque usa o subdomínio
certo; só o DNS erra).

**How to apply:** sempre ler `subdomain` do projeto antes de criar o CNAME
(corrigido em `migra_portal.py`). Sintoma de erro: 403 com corpo `error code:
1014` e o domínio "pending" com `CNAME record not set` no projeto.
Ver [[portais-no-cloudflare-pages]].
