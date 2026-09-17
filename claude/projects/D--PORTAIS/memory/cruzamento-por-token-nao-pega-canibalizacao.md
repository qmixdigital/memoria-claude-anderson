---
name: cruzamento-por-token-nao-pega-canibalizacao
description: "Comparar slug ou token dá falso negativo em série; só a busca da frase no título e no corpo dos artigos pega"
metadata:
  node_type: memory
  type: feedback
---

Em 6 portais auditados no mesmo dia, o cruzamento automático por token deu falso
negativo em **quatro**. Em todos, o artigo concorrente existia e ranqueava:

| pauta dada como livre | artigo que já existia | por que o token falhou |
|---|---|---|
| ar condicionado não está **gelando** | `/como-arrumar-o-ar-condicionado-que-nao-gela/` | gelando ≠ gela |
| **decoração** casa pequena | `/dicas-de-como-decorar-casa-pequena/` | decoração ≠ decorar |
| 48 **vezes** é quantos anos | `/48-meses-sao-quantos-anos/` | vezes ≠ meses |
| sonhar **desenterrando** dinheiro | `/sonhar-com-dinheiro-enterrado/` | desenterrando ≠ enterrado |

O caso do 48 é o mais caro: a página tem **53.813 impressões e 4 cliques**, e um
artigo novo teria dividido isso.

**Why:** slug e token são forma, e canibalização é intenção. Radical, número e
flexão mudam a palavra sem mudar a consulta que o leitor faz.

**How to apply:** três passos, nesta ordem.

1. Buscar a **frase** da consulta no título e no corpo de todos os artigos do portal,
   por substring, e não por token.
2. Olhar no `query x page` do Search Console **qual página já ranqueia** para o termo.
   É o teste que fecha a questão.
3. Conferir o registro de donos nos dois servidores, ver
   [[registro-de-donos-e-por-servidor]].

O script está em `canibal.py` no scratchpad: ele lê `/tmp/pautas.json` com os termos
de cada pauta e devolve LIVRE, olhar ou BLOQUEADA. Termo curto demais gera alarme
falso (o "ave " casou dentro de "grave"), então vale usar a expressão inteira.

Ver [[melhor-pauta-pode-ser-pagina-podada]] e [[padrao-seo-do-lote]].
