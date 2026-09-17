---
name: qmix-marca-completa
description: "A marca nos videos QMIX e sempre \"QMIX Digital\" por inteiro, nunca a sigla sozinha"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
  modified: 2026-08-03T15:52:24.111Z
---

Em todo conteudo dos videos da QMIX (narracao, titulo, descricao, texto em tela) a marca
se escreve **QMIX Digital**, por inteiro. Nunca "a QMIX" sozinho.

**Why:** duas razoes somadas. (1) `QMIX` isolado e uma sigla de quatro letras sem contexto
e o TTS da ElevenLabs erra: as vezes soletra, as vezes engole. Antes de pontuacao forte o
defeito e quase certo, e foi o que quebrou o audio de "quando voce contrata a QMIX?" no
qmix-5, reportado pelo Anderson em 03/08/2026. (2) O arquivo de legenda entregue e indexado
pelo YouTube, e a marca inteira e o que interessa no indice, nao a sigla.

**How to apply:** ao escrever qualquer linha de `beats.json`, use "QMIX Digital". Excecoes:
o dominio `qmix.com.br` (e endereco, nao nome) e o codigo. O `tools/gen_voice.py` avisa a
cada execucao quando acha `QMIX` sem `Digital` numa linha de narracao, com o numero da
linha. Regra registrada em `CLAUDE.md`, `brand.md` e `LOCALIZACAO-PTBR.md` do repo.

Relacionado: [[qmix-thumb-motivo-unico]]
