---
name: marca-do-radar-volt-nasce-em-codigo
description: "O logo, o favicon e a capa do Radar Volt são gerados por composição Remotion, não desenhados; refazer o jogo inteiro é um comando"
metadata: 
  node_type: memory
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
  modified: 2026-08-24T14:24:22.677Z
---

**A marca do Radar Volt vive em `remotion/src/lib/radarlogo.tsx`** e o jogo
inteiro se refaz com `cd remotion && node scripts/logo.mjs`, saindo em
`radar-volt/logo/`. A documentação de qual arquivo usar onde está no
`LEIA-ME.md` da própria pasta.

Feito em 24/08/2026, a pedido do Anderson, que queria logo horizontal sem fundo
e favicon para o site.

**Why nasce em código:** as cores saem do mesmo objeto `RADAR` que os vídeos
usam, então a marca do site nunca desalinha da marca dos vídeos. E sai em
qualquer tamanho sem serrilhar.

**Duas decisões que se repetem em qualquer kit de marca:**

1. **O favicon principal tem fundo sólido, não é o transparente.** O símbolo é
   desenhado em traço claro: em aba escura funciona, em aba branca desaparece.
   A cor da aba é do sistema do visitante e não dá para escolher por ele. O
   quadrado azul-noite resolve os dois, e foi conferido nos dois.
2. **A cor da marca não serve em fundo branco.** `#00E5FF` sobre branco dá
   1,6:1 de contraste, e o mínimo para texto grande é 3:1: a palavra VOLT
   sumia. A versão clara usa `#0089A3`. No fundo escuro o original continua,
   porque ali tem 8:1 de sobra.

O ponto âmbar é âmbar nos dois temas: é o único ponto quente da marca e é o que
se reconhece em 16 pixels.

O mesmo padrão existe para a capa (`radarthumb.tsx`, via
`scripts/thumb.mjs --id=RadarThumb`) e para avatar, banner e marca d'água, em
`remotion/src/shots/brand/`.

Relacionado: [[radar-volt-canal]], [[qmix-thumb-motivo-unico]].
