---
name: lote-organico-passa-pelo-validador-de-materias
description: "Artigo orgânico dos portais próprios também passa pelo validador_materia.py da skill de matérias; na primeira rodada os 8 do EuVo reprovaram, e quatro regras são de guest post e se ignoram"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1f871aca-8ade-42dd-b70a-66ffccd1c807
  modified: 2026-09-12T22:08:54.237Z
---

Em 12/09/2026 o Anderson mandou conferir "humanização e tudo mais" dos 8 artigos
novos do EuVo com a skill `materias-jornalisticas-linkbuilding`, avisando que
não eram guest post mas que os itens da skill importam. O validador reprovou os
8 na primeira rodada, embora todos passassem no padrão do lote (1.200 palavras,
keyword no primeiro parágrafo, densidade, FAQ, tabela).

**Why:** o padrão do lote mede estrutura; o validador mede escrita. O que ele
pegou e o padrão não pegava: bullets no corpo (3 a 7 listas por artigo), keyword
ausente da linha fina (0 de 8), keyword sem H2 próprio, perguntas retóricas
demais, trigramas repetidos (até 15 num artigo) e, sobretudo, a contagem de
palavras **só em `<p>`**: com o texto em listas e tabelas, os artigos tinham 655
a 1.141 palavras de prosa.

**How to apply:** rodar `validador_materia.py ARQ.html --links N --titulo
"..." --kw "..." --resumo "LINHA FINA"` em todo lote orgânico, e ignorar de
propósito quatro regras que são de guest post: contagem de links contra o
briefing, link no último parágrafo (é o "Veja também"), distância mínima entre
links e a lista do "Veja também" contada como bullet. O resto vale. Escrever a
prosa desde o começo, com no máximo uma lista por artigo além do "Veja também",
custa menos do que reescrever depois: nos 8 do EuVo foram cinco rodadas de
correção. O validador já **exclui os trigramas da keyword** da contagem, então
"tem ou têm" repetido oito vezes não reprova; o que reprova é "a mesma regra"
três vezes.

Resultado nos 8: humanização de 75 a 95, Camada C inteira em ok, 1.200 a 1.214
palavras em prosa. Ver [[padrao-seo-do-lote]] e
[[linha-fina-nao-pode-repetir-a-abertura]].
