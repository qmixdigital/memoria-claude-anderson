---
name: deploy-pages-nunca-como-root
description: Rodar pages_pack.js/wrangler como root deixa arquivos de root em public/ e o gancho do motor (usuário portais) falha com EACCES em silêncio; artigos de parceiro ficam sem deploy
metadata:
  type: feedback
---

Em 18/09/2026 outra sessão rodou o deploy dos 104 portais como root e deixou
`_routes.json` de root em cada `public/`. O gancho `pagesDeploy` (usuário
`portais`) passou a falhar com EACCES, só no log, e dois artigos de parceiro
(df8, sabedoriaglobal) ficaram publicados na VPS mas fora do Pages.

**Why:** o Pages recebe o que está em `public/`; se o motor não consegue
reescrever um arquivo, o deploy inteiro para, e ninguém vê.

**How to apply:** sempre `sudo -u portais HOME=/opt/portal-engine node
pages_pack.js <slug>`; o script agora recusa root. O gancho chama
`conserta_dono.sh` via sudo antes de cada deploy, e falha de deploy vai para o
Telegram do Anderson (`src/alerta_telegram.js`, config em
`/opt/portal-engine/telegram.json`). Ver [[portais-no-cloudflare-pages]].
