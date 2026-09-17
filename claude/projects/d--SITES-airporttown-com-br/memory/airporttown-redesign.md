---
name: airporttown-redesign
description: "Redesign do site airporttown.com.br em HTML estatico; retirado do Cloudflare Pages em 17/09/2026, copia local e backup zip na pasta do projeto"
metadata: 
  node_type: memory
  type: project
  originSessionId: 58871c13-d1fd-481d-b48a-f96e67cfbde6
  modified: 2026-09-03T20:21:59.953Z
---

Em 03/09/2026 comecou o redesign do site do cliente Airport Town Business Park
(galpoes e escritorios em Guarulhos/SP). O site atual e WordPress bilingue
PT/EN; o novo e HTML estatico gerado por Python em `d:\SITES\airporttown.com.br`
(`_build/` gera, `public/` e a saida do Cloudflare Pages).

**Why:** o cliente so autoriza trocar o DNS depois de aprovar o novo site, entao
o dominio continua apontando para o WordPress ate la. Nada pode ser publicado no
dominio antes dessa aprovacao.

**How to apply:** as URLs do novo site foram mantidas identicas as do WordPress
para preservar ranking (as paginas EN migraram de `/enterprises/` e `/locations/`
para `/en/...` com 301 no `_redirects`). Pendencias combinadas com o cliente:
ID do GA4, e-mail comercial (o site atual so tem WhatsApp e telefone), fotos em
alta resolucao (as do WP tem 440 a 495 px) e revisao das metragens de 2023/2024.

## Retirado do ar em 17/09/2026

A pedido do Anderson, o projeto `airporttown` foi **apagado do Cloudflare
Pages** e a URL `airporttown.pages.dev` nao existe mais. O site nunca esteve no
GitHub. A unica copia e local:

- fonte e saida continuam em `d:\SITES\airporttown.com.br` (`_build/`, `public/`)
- snapshot completo em `d:\SITES\airporttown.com.br\backup\airporttown-2026-09-17.zip`
  (47 MB, 614 arquivos, com `RESTAURAR.txt` dentro)

Para voltar ao ar basta `python build.py` e o `wrangler pages deploy` do
README; o deploy recria o projeto sozinho. O motivo da retirada nao foi dito.
