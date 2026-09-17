---
name: propostas-comerciais-qmix
description: "Sistema de propostas comerciais da QMIX — onde fica, como se usa e onde está a documentação completa"
metadata: 
  node_type: memory
  type: project
  originSessionId: 75534bf0-7c0e-4e2d-9ec9-1b391ecce73e
  modified: 2026-08-06T14:18:17.152Z
---

As propostas comerciais da QMIX são geradas por um sistema próprio em
`d:\SITES\qmix-next\propostas\`. Cada proposta é um JSON em `clientes/<slug>.json`;
`python publicar.py <slug>` faz build, deploy no Cloudflare Pages, cria o
subdomínio `proposta-<cliente>.qmix.com.br`, o DNS, o purge e confere.

**Leia `d:\SITES\qmix-next\propostas\README.md` antes de mexer.** Ele documenta os
tipos de seção, o áudio, as coordenadas da Cloudflare, a versão em papel e —
principalmente — uma lista de armadilhas já pagas. Quase toda decisão estranha do
código existe por causa de um bug que chegou ao cliente. Duas que mais importam:
CSS e JS vão **embutidos** no HTML (arquivo separado quebrava durante o deploy), e
o deploy usa `wrangler pages deploy . --cwd dist/<slug>` (sem o `--cwd` a senha
não entra em ação e a proposta fica aberta).

Propostas publicadas até agora: Dra. Camila Farias (`proposta-camila`) e Sólida
Transporte (`proposta-solida`).

Credenciais em [[cloudflare-toolkit-local]] e [[qmix-voz-elevenlabs]].
Iniciado em agosto de 2026.
