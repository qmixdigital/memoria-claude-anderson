---
name: entrega-so-legenda-em-portugues
description: A entrega do Radar Volt leva só a legenda em português; inglês, espanhol, alemão e francês saíram do padrão
metadata:
  node_type: memory
  type: feedback
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
  modified: 2026-08-23T23:55:28.144Z
---

**A entrega leva uma legenda só, em português.** O Anderson decidiu em
23/08/2026, no vídeo 05: "acho que não vou usar legenda em outras línguas
mais".

Isso **substitui** o padrão anterior, de 22/08/2026, que pedia cinco idiomas
(pt-BR, inglês, espanhol, alemão e francês). Os vídeos 01 a 04 foram entregues
com os cinco e ficam como estão.

**Why:** os quatro idiomas estrangeiros custavam tempo de produção em todo
vídeo e ele não os usou. Vídeo de nicho brasileiro (história do Proálcool,
picape para sítio, preço em real) não encontra público fora, e cinco idiomas
num vídeo que um alcança é enfeite.

**How to apply:** o `legendas.json` do projeto passa a ter só a chave `pt-BR`,
e o `legendas.py` gera um arquivo só. A seção de idiomas e o bloco `localizado`
do `entrega.json` deixam de ser preenchidos. Se um vídeo futuro tiver assunto
claramente internacional (um lançamento global, sem recorte brasileiro), vale
levantar a hipótese de novo, mas o padrão é uma legenda.

Relacionado: [[entrega-na-pasta-do-modelo]], [[radar-volt-canal]].
