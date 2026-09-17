---
name: coluna-vazia-ao-lado-do-corpo
description: "No single post, medida de 70ch num container de 1240 deixa 450px vazios ao lado de todo o corpo; a queixa 'título e texto desincronizados da imagem' é isso, e o trilho fixo é o que ocupa a coluna"
metadata:
  type: feedback
---

Em 15/09/2026 o Anderson reclamou do single do divirto (arch AN): "a imagem é
muito grande" e "o título e o texto estão completamente desincronizados da
imagem". A causa medida: coluna de texto de 720px e foto de 920px num container
de 1240px, nada alinhado, e ~450px vazios à direita do corpo inteiro.

**Why:** a direção "placa de abertura" (texto e foto lado a lado, corpo em
70ch) resolveu a abertura e reproduziu a queixa espelhada: o vazio saiu do meio
e foi para a direita ao longo de 2.760px. O revisor vetou por isso. A direção
"coluna e trilho" (foto 3/4 estreita à esquerda, título à direita, coluna da
esquerda vira trilho sticky com autora, compartilhar e sumário dos h2) é a
única que preenche a largura sem inflar a foto.

**How to apply:** em portal com container de 1200+, corpo em coluna única só
com algo ocupando a lateral. Trilho enxuto: só o que a abertura não tem
(avatar, compartilhar, "Neste artigo"), ~300px, `top:24px`; repetir editoria,
data e leitura no trilho é o ritmo de eyebrow que o craft-floor proíbe. Syne
800 num título de 110 caracteres dá 7 linhas; 700 tira uma. Foto 16:9
recortada em 3/4 precisa de `object-position:50% 30%`. Ver
[[layout-nada-centralizado]] e [[relatorio-de-3-a-4-linhas]].
