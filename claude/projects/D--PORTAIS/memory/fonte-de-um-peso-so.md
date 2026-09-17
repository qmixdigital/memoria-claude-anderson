---
name: fonte-de-um-peso-so
description: Anton e afins têm só o peso 400; pedir 700 faz o navegador fabricar negrito e o título sai com fantasma
metadata:
  type: reference
---

**Anton**, **Bebas Neue**, **Yeseva One** e outras display do Google Fonts têm um
peso só. Pedir `font-weight:700` faz o navegador **sintetizar** o negrito
engrossando o desenho por deslocamento, e o título sai com um fantasma atrás de
cada letra. Aparece na captura, nunca no código.

**How to apply:** ao trocar a fonte de título de uma arquitetura, conferir os
pesos que a família tem e ajustar **todas** as regras que usam `var(--fd)`:
o `h1..h4` global, o `h2`/`h3` do corpo, a marca do cabeçalho, a do rodapé, o
título de cartão e o nome na ficha de assinatura. Uma regra esquecida basta para
o defeito reaparecer numa parte da página.

Ver [[logo-da-origem-antes-de-inventar]] e [[conferir-por-captura-usar-cache-busting]].
