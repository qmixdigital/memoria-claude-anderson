---
name: componente-so-funciona-onde-nasceu
description: Componente estilizado dentro de um contexto guarda cores fixas e quebra ao ser reusado noutro; inverter o padrao para o caso comum e escopar a variante
metadata:
  type: feedback
---

Componente que nasce dentro de um contexto (seção escura, card colorido) tende a
carregar as cores daquele contexto **fixas no próprio seletor**. Ao reusá-lo em
outro lugar, o texto some. Antes de reaproveitar, conferir se o componente tem cor
absoluta em vez de token.

**Por quê:** em tratamentodor.com.br a `.dpp__tab` só existia dentro de
`.dpp__sec--ink` e tinha `color:#FBFDFD` e bordas brancas no seletor base. Reusada
numa seção clara, deu **1,16:1**, invisível. O mesmo aconteceu com o bloco de texto
e imagem e com links verdes sobre navy (2,84:1), esse último já quebrado na home e na
acupuntura havia semanas sem ninguém notar.

**Como aplicar:** o padrão do componente deve ser o **caso comum** (fundo claro), e a
variante fica escopada (`.dpp__sec--ink .componente`). Ao criar a regra de exceção,
usar `:not()` para não pegar botões: `.dpp__cta a:not(.dpp__btn)` — sem isso o texto
do botão de WhatsApp virou verde sobre verde em todas as páginas. E medir contraste
por script compondo alpha, porque tratar rgba como opaco gera reprovação falsa.
Ver [[cls-de-fonte-medir-no-alvo]] e [[reservar-espaco-em-vez-de-adivinhar-breakpoint]].
