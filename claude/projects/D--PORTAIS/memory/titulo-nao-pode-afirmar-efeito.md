---
name: titulo-nao-pode-afirmar-efeito
description: Em site de saúde, "Perlutan engorda: ..." afirma no SERP o que o artigo responde com "depende"; vira pergunta ou sai
metadata:
  type: feedback
---

Ao montar o title a partir da consulta real do Search Console, saiu
**"Perlutan engorda: em quanto tempo faz efeito"**. A consulta que traz a página
é "a injeção perlutan engorda", então o dado está certo, mas o título passou a
**afirmar**, na primeira linha do resultado do Google, que o remédio engorda. O
artigo por baixo responde "depende" ou "não há evidência": o snippet promete o
que o texto não entrega, e num site de saúde isso é alegação.

Aconteceu de três formas, e cada uma pediu uma regra:

- **verbo no assunto** ("Perlutan engorda"): ganha interrogação, e o
  dois-pontos seguinte vira espaço;
- **verbo na lista de rótulos** ("...para que serve, bula e engorda"): o rótulo
  sai. Em letra miúda a afirmação continua sendo afirmação;
- **interrogação cortada pelo parser**: "Herbalife emagrece?" virava "Herbalife
  emagrece" ao extrair o assunto, e depois ganhava dois-pontos. O extrator tem
  que **preservar o "?"**.

⚠️ Também não basta comparar a primeira palavra do rótulo com o assunto:
"Herbalife emagrece?" saiu como "Herbalife emagrece engorda?" porque "engorda"
não está no nome mas "emagrece" está, e as duas são a **mesma intenção**. A
comparação é pela expressão da família inteira.
