---
name: portais-no-cloudflare-pages
description: "Migração dos portais do motor para o Cloudflare Pages por Direct Upload (VPS continua a fábrica); piloto pronto no pages.dev, parado na virada de DNS"
metadata:
  type: project
---

Em 16/09/2026 o Anderson pediu para pôr todos os portais no Cloudflare Pages e
criou um token de usuário (todas as 82 contas, Pages:Edit, DNS:Edit, Zone:Read,
purge, expira 15/10/2026) em `Documentos/APIs/cloudflare-pages.txt`.

Estratégia escolhida: **Direct Upload** (`wrangler pages deploy public`) a
partir da VPS, que continua recebendo e renderizando; sem GitHub. Peças e
runbook em `D:\PORTAIS\pages\README.md`; código em `/opt/portal-engine/pages_pack.js`
mais o gancho `pagesDeploy` no fim de `rebuildIndexes` do render.js
(opengravity). Piloto `matogrossosaude` virado em 16/09/2026 (domínio real no Pages), com
200/301/410/404, apex→www, API e contato pelo ingresso `og-ingresso.qmix.com.br`
(vhost + cert DNS-01 + regra de WAF skip) conferidos.

**Why:** Direct Upload não gasta build, mantém o sharp e o receptor como
estão, e todos os 113 portais cabem no teto de 20.000 arquivos.

**How to apply:** por portal: conta da zona → projeto → deploy → conferir no
pages.dev → domínios no projeto → CNAME → esperar "active active" (antes disso
dá 522) → conferir no domínio real. DNS pede autorização dele (deu em 16/09 para
o piloto; para os lotes, pedir de novo ou uma autorização em bloco). Cert do
ingresso renova com o hook que usa o token do Pages, que expira 15/10: trocar
antes de dezembro. O serviço roda como `portais`: nada de criar arquivo como root em
`public/`, `functions/` ou `.wrangler/`.

**Estado em 17/09/2026:** 100 dos 104 portais do motor estão no Pages (37+27+36),
conferidos; ficam na VPS os 4 com aplicativo Next.js embutido (desassossegada,
ebookcult, revistadeducao, seuguiadesaude). Cada VPS tem o kit completo e um
ingresso próprio (`og-`, `hs-`, `cv-ingresso.qmix.com.br`) com Origin CA de 15
anos. Vhosts antigos do nginx ainda no lugar: retirar depois de uma semana.
Orquestrador: `D:\PORTAIS\pages\migra_portal.py` (`--so-preparar`,
`--so-virar`, `--conferir`); runbook e armadilhas no README da pasta.

Atualização 17/09/2026: os 104 portais do motor estão no Pages. Os 4 com diretório em Next (ebookcult, desassossegada, revistadeducao, seuguiadesaude) mantêm o app na VPS: `pages.json.apps` lista as pastas e o middleware as proxia pelo ingresso, que tem `map` host → upstream. Detalhe em D:\PORTAIS\pages\README.md.
