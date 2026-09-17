---
name: motor-reescreve-o-favicon
description: Ícone desenhado à mão dura até o próximo rebuild; e o head declara favicon-96 e favicon-144 que o motor nunca gerou
metadata:
  type: project
---

`generateFavicons` no render.js só respeita desenho próprio quando o portal tem
**`site.iconSvg`** (ou `logoSvg`) no sites.json. Sem esse campo ele desenha a
**primeira letra do nome** num quadrado e grava por cima de `icon-512.png`,
`icon-192.png`, `apple-touch-icon.png`, `favicon.ico` e `favicon.svg`.

No seuguiadesaude a cápsula que eu tinha gerado a mão durou até o rebuild
seguinte e virou um "S". Só apareceu porque o arquivo tinha encolhido de 45 KB
para 21 KB.

**How to apply:** gravar o SVG em `site.iconSvg` (com `width`/`height`, que o
motor reescreve para 512). Aí ele gera sozinho os PNG, o `.ico`, o `.svg` e as
duas versões maskable, e nada mais sobrescreve.

**Segundo defeito, dos 34 portais da clinicas-vps:** o `<head>` declara
`favicon-48.png`, `favicon-96.png` e `favicon-144.png`, e o motor **nunca gerava
nenhum dos três**. Três 404 em toda página. Corrigido nos dois ramos da função,
o do `iconSvg` e o da letra; falta o rebuild de cada portal para valer. Ver
[[favicon-48-declarado-e-nunca-gerado]], [[favicon-para-a-serp-do-google]] e
[[icone-que-e-letra-nao-se-desenha]].
