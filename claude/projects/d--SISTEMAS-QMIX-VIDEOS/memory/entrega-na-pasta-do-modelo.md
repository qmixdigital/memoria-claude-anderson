---
name: entrega-na-pasta-do-modelo
description: A entrega de cada vídeo vai numa subpasta "entrega" dentro da pasta do próprio modelo, nunca mais na Área de Trabalho
metadata:
  node_type: memory
  type: feedback
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
  modified: 2026-08-23T11:37:24.840Z
---

A partir do vídeo 04 do Radar Volt, o pacote final vai para uma subpasta
chamada **`entrega`** dentro da pasta do modelo, ali onde o Anderson largou as
imagens e os vídeos daquele veículo. Nada mais é copiado para a Área de
Trabalho. Pedido dele em 23/08/2026.

Ou seja, para um modelo em `radar-volt\<MODELO>\`, o pacote fica em
`radar-volt\<MODELO>\entrega\` com `video.mp4`, `thumbnail.jpg`,
`PUBLICAR.txt` e `legendas\`.

**Why:** a pasta do modelo é onde ele já está trabalhando quando pensa naquele
carro. Área de Trabalho vira depósito e o pacote se perde entre outras coisas.

**How to apply:** o `radar-volt/entrega.py` ainda monta em
`radar-volt/entregas/<slug>/`. Apontar o destino para a pasta do modelo, ou
copiar para lá no fim, e não copiar para o Desktop. Vale para o Radar Volt; a
QMIX Digital continua com `demandas qmix/<slug>/` (ver o CLAUDE.md do repo).
Relacionado: [[radar-volt-canal]].
