---
name: rinoplastia-goiania-hospedagem
description: "rinoplastiagoiania.com.br roda em Cloudflare Pages, entao o .htaccess do repo e ignorado e quem vale e o _headers"
metadata: 
  node_type: memory
  type: project
  originSessionId: a1e770fd-c076-4e4e-a360-b1c613a7adfc
  modified: 2026-09-06T16:04:11.099Z
---

O site rinoplastiagoiania.com.br (repo `qmixdigital/rinoplastia-goiania`, deploy
automatico a partir de `main`) e servido pelo **Cloudflare Pages**, confirmado
pelo header `Server: cloudflare` mais `CF-RAY` na resposta.

**Why:** o repositorio tem um `.htaccess` completo, com regra de URL limpa,
HTTPS e headers de seguranca, o que da a impressao de hospedagem Apache. Ele
nao esta valendo nada. Quem faz o 308 de `/pagina.html` para `/pagina` e o
proprio Pages, nativamente, e quem aplica header de seguranca e cache e o
arquivo `_headers` na raiz.

**How to apply:** ao mexer em redirect, header ou cache desse site, editar o
`_headers` (e `_redirects`, se precisar), nao o `.htaccess`. O `.htaccess` foi
mantido no repo so como plano de migracao para hospedagem Apache. Cuidado com
o cache que se define ali: ver [[cache-longo-sem-versionar-asset]].

Pendencias que dependem do Anderson, levantadas em 06/09/2026 e ainda abertas:
ID do GA4 (segue `G-XXXXXXXXXX` no script.js), endereco real da unidade de
Ceres (esta publicado `Rua 7, n 123 - Centro`, com cara de placeholder, e sem
coordenadas `geo` no schema por causa disso) e confirmacao do telefone de
Ceres, que exibia `(62) 99685-6986` mas discava `(62) 99827-7220`, unificado
para o segundo.
