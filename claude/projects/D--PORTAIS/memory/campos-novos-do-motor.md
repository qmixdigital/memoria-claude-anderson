---
name: campos-novos-do-motor
description: "Campos que acrescentei ao portal-engine (heroFrom, titleMax) e o que cada um resolve"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-15T18:49:58.235Z
---

Campos de `sites.json` implementados em 15/08/2026 no motor da clinicas-vps, ambos
opt-in (sem o campo, o comportamento é o de antes):

- **`heroFrom: "<slug-da-editoria>"`** — define de qual editoria saem a capa e o
  mosaico da home. Sem ele, o conteúdo mais recente domina o topo e um cluster novo
  sequestra a identidade do portal. No boxnoticias, 10 artigos de Sonhos fizeram
  um portal de cinema parecer portal de sonhos. Implementado na arch V (`uHome`
  equivalente), não no motor.
- **`titleMax: 62`** — em `render.js`, função `tituloArt()`. O sufixo ` - <marca>`
  só entra no `<title>` quando o total cabe no limite. Antes o motor colava sempre
  e estourava 60 caracteres em 463 de 480 páginas do boxnoticias.

Backups dos patches: `render.js.bak-title2-20260815`, `archs.js.bak-archV-*`.

Ver [[patches-motor-clinicas-vps]] e [[conversao-total]].
