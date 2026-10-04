---
name: visual-moderno-sem-arco
description: Anderson rejeitou o visual "editorial botânico" (foto em arco, creme, serifa itálica); o padrão do site é o painel digital de 10/2026
metadata:
  type: feedback
---

Em 03/10/2026 o Anderson reprovou com força o visual antigo do nutricionista.digital: chamou a foto em arco de "janela de igreja antiga" e o conjunto de "arcaico". Pediu moderno, digital, com gráficos e ícones de nutrição, e proibiu emoji como ícone. O que foi aprovado para seguir: superfície branca, Poppins nos títulos e Karla no texto, verde e teal da logo, foto em retângulo de cantos arredondados com bloco de cor deslocado atrás, cartões com sombra leve, artes de painel (anel de macros, prato dividido, barras) e ícones de linha em SVG.

**Why:** o domínio se chama "digital" e o visual de papel creme com serifa itálica passava o oposto; a queixa veio duas vezes seguidas (subdomínio e depois site principal).

**How to apply:** em qualquer página nova deste projeto, não usar `border-radius` em arco, fundo creme, grão, Fraunces, itálico decorativo nem laranja em link. Partir dos tokens de `assets/css/style.css` e dos ícones de `tools/gerar-icones.py`. Vale como pista para outros sites dele: perguntar antes de propor estética "editorial" ou "vintage". Ver [[deploy-pages-armadilhas]].
