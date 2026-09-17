---
name: bloco-novo-na-rede-inteira-vira-footprint
description: qualquer bloco aplicado aos 103 portais precisa nascer com variação por portal, senão o conserto cria o defeito
metadata:
  type: feedback
---

Ao fechar a malha interna eu gravei `<h2>Veja também</h2>` em **103 de 103
portais**, na mesma posição estrutural: fim do texto, antes do FAQ. String
idêntica, posição idêntica e marcação idêntica, que são os três sinais que um
analista procura. O próprio motor já tratava esse rótulo como vetor: o
`_ROT_OPC` do `render.js` tem 14 variações para o "Leia também" da arquitetura.

**Why:** o trabalho de anti-footprint e o de conteúdo puxam para lados opostos.
Toda melhoria aplicada em massa é, por construção, um padrão novo.

**How to apply:** todo bloco, rótulo ou atributo que for para a rede inteira
nasce sorteado por hash do slug, com pool de 30 a 40 opções. E conferir a
**distribuição**, não só a existência do sorteio: FNV-1a puro em chave curta e
parecida punha 14 dos 103 no mesmo rótulo; o passo de avalanche (xor-shift)
derrubou a maior concentração para 6. Ver [[classes-css-nao-podem-repetir]].
