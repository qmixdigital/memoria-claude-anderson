---
name: hero-mobile-alinhado-esquerda
description: O Anderson prefere o texto da hero alinhado a esquerda tambem no mobile neste site, e a hero sem lista longa de bairros
metadata:
  type: feedback
---

Em 11/09/2026 o Anderson reprovou a hero centralizada no mobile ("extremamente centralizado, prefiro textos mais organizados"). Neste site a hero fica alinhada a esquerda em todas as larguras, mesmo o CLAUDE.md global dizendo "hero mobile centralizado".

Tambem pediu que a hero nao liste os bairros de atuacao (fica grande e exclui os outros): ficar neutro ("em Goiania") ou, no maximo, "Jardim America, Setor Bueno, Setor Sul, Aeroporto e outros bairros". A lista completa fica na secao de bairros, mais abaixo.

**Why:** organizacao visual e nao parecer que so atende quatro bairros.
**How to apply:** manter `.hero-texto{text-align:left}` no mobile; qualquer variacao de hero mantem o subtitulo neutro sobre bairros.
