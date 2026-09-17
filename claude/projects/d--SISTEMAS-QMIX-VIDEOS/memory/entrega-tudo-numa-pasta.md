---
name: entrega-tudo-numa-pasta
description: Tudo que ele precisa ver (vídeo, capa, comparação de opções) vai para a pasta de entrega em demandas qmix/; nunca espalhar por shorts/ ou scratchpad
metadata:
  type: feedback
---

**Correção dele em 15/09/2026:** "Não consegui achar a capa. Você está
bagunçando, colocando conteúdos em pastas diferentes. Coloque em uma pasta só
onde eu possa ver o vídeo e a capa e não tenho que sair procurando."

Eu tinha deixado o vídeo em `demandas qmix/<slug>/` e a comparação de paletas
em `shorts/<slug>/qa-paletas.jpg`. Ele só abre a pasta de entrega.

**Why:** a pasta de entrega é o único lugar que ele olha; arquivo fora dela é
arquivo que não existe para ele, e pedir para ele procurar é retrabalho dele.

**How to apply:** toda peça que ele precisa VER ou ESCOLHER vai para
`demandas qmix/<slug>/` (ou `clientes/<cliente>/entrega/`), inclusive
comparações de opções, cada uma como vídeo completo com áudio e capa própria,
com nome que diga o que é (`anuncio-clinico.mp4`, `capa-clinico.jpg`,
`COMPARAR-as-duas-capas.jpg`). Folhas de QA e rascunhos ficam em `shorts/` e
nunca são citados para ele como coisa a abrir. Ver [[entrega-na-pasta-do-modelo]].
