---
name: grupo-precisa-de-saida-escrita
description: "Todo grupo de texto no TSX precisa da saída escrita, não só da entrada; foi o defeito mais repetido dos vídeos 04 e 05"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 676560cf-103b-4f15-a7d1-ebc77cf1ca08
  modified: 2026-08-24T11:23:16.166Z
---

**Grupo que entra com `em(a)` e não tem `entre(a, b)` fica no ar até o fim do
bloco, e aterrissa em cima da fala seguinte.** Apareceu quatro vezes em dois
vídeos, sempre pela mesma causa e sempre descoberto pelo Anderson ou pela
folha de contato, nunca por erro de compilação.

Casos reais:

- o cartão "1979, Fiat 147" seguia no ar na fala que fala de **2026**, sobre
  um carro elétrico no Rio
- "Guarde esta cena", que fala da cena de TV, caía sobre a fila de 1989 e
  mandava guardar a foto errada
- o texto do Henry Ford reaparecia num trecho onde ele já tinha passado

E a variante venenosa, do lado oposto: um carimbo **aninhado no grupo errado**,
com `p` próprio que apaga em 42,7 dentro de um pai que só acende em 42,7.
Produto sempre zero. O carimbo dos 25% do etanol nacional não entrou na tela
uma vez sequer, e nada acusou.

**Why:** grupos que se revezam na mesma área da tela precisam da troca escrita
dos dois lados. Escrever só a entrada é meio contrato: o autor pensa "agora
entra este" e esquece "e sai aquele". Não dá erro, dá texto sobreposto.

**How to apply:**

- Todo grupo intermediário usa `entre(a, b)`. Só o **último** de cada bloco
  pode usar `em(a)` sozinho, porque a `janela` do bloco o apaga.
- O `b` é lido do `beats.json`, do `start` da fala onde aquele assunto acaba.
  Offset interno de bloco **não se estima**: um chute de vinte segundos já
  fez um cartão marcado em 96s nunca aparecer, num bloco de 94,1s.
- Carimbo tem que morar no grupo cuja janela contém o `p` dele. Conferir
  aninhamento sempre que o carimbo não aparecer na folha de contato.

Relacionado: [[revisao-e-quadro-por-fala]], [[qmix-animacao-continua]],
[[defeito-silencioso-conferir-artefato]].
