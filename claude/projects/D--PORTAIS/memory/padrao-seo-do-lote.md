---
name: padrao-seo-do-lote
description: "Os números obrigatórios de cada artigo de lote: 1.200 a 1.400 palavras, keyword exata no primeiro parágrafo e densidade de 1% a 2,5%"
metadata:
  type: feedback
---

Todo artigo de lote precisa fechar estes cinco números, conferidos por script
antes de publicar:

| Item | Alvo |
|------|------|
| Palavras | 1.200 a 1.400 |
| Keyword exata no primeiro parágrafo | obrigatório |
| Termo-raiz em h2 | pelo menos 1 |
| Densidade do termo-raiz | 1,0% a 2,5% |
| Termo popular ao lado do técnico | "cocô de rato, ou fezes de roedor" |

**Por quê:** em 19/08/2026 o Anderson desconfiou da quantidade de texto e da
variação de palavra-chave. A auditoria nos 20 artigos do umjornal e do
jornaldabahia deu razão a ele: a keyword exata não aparecia no corpo de nenhum
dos 20, a densidade estava abaixo de 1% em 9 deles e a média era de 917
palavras. A causa foi aplicar a regra de variação de âncora, que existe para
link interno, também ao corpo do texto: o artigo de cocô de rato escrevia
"fezes de roedor" o tempo todo e usava o termo buscado uma única vez. Ver
[[padrao-de-crosslinking-do-lote]] e [[palavras-chave-e-entrega]].

**Como aplicar:** o validador `pub_*.py` do scratchpad já tem o bloco `KW` e a
constante `MIN_PAL` com essas checagens; copiar dele para o lote seguinte, e não
reescrever do zero. Como a meta description do motor sai do primeiro parágrafo,
pôr a keyword ali resolve a meta junto. Quando o termo-raiz é uma palavra só e
inevitável, como queen, king ou colchão, a densidade encosta em 2,5%
naturalmente: alterne com "esse tamanho" e "a peça" em vez de tirar a
palavra-chave. Em pauta com números comparáveis, entrar com tabela, que é
formato de featured snippet.

**Aplicado retroativamente** nos 20 artigos do umjornal e do jornaldabahia em
19/08/2026: média de 1.286 palavras, keyword exata no primeiro parágrafo em 20 de
20 e nenhuma densidade abaixo de 1%. Republicados nos mesmos slugs, sem redirect.
