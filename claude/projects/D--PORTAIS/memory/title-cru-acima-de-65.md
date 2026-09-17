---
name: title-cru-acima-de-65
description: O motor tira a marca quando o title estoura, mas não corta o título do cliente; o campo é o metaTitle
metadata:
  type: project
---

`tituloArt` faz o certo até certo ponto: se `título + marca` passa do `titleMax`,
ele serve só o título. Mas quando o **próprio título** já tem 70 ou 86
caracteres, não há corte, e o `<title>` sai estourado.

Eram **5.786 artigos nas três máquinas**, mais **16 homes** sem `metaTitle`, onde
o motor monta `descrição | nome` e passa de 70.

⚠️ **O `h1` não muda.** O `metaTitle` existe para separar o que o Google mostra do
que o leitor lê, e o título é o texto que o cliente comprou.

⚠️ **Cortar em fronteira de palavra não basta**: sobra "…na administração do seu"
e "…qual é o melhor caminho para". As palavras vazias do fim têm que sair até
sobrar palavra com conteúdo, sem descer de 30 caracteres.

**How to apply:** `title_regua.py` grava o `metaTitle`, `title_apara.py` limpa o
fim. Quando há dois-pontos ou travessão antes dos 60, cortar ali: a primeira
metade costuma ser a manchete e a segunda o complemento.

Ver [[title-separado-do-h1]] e [[home-title-com-marca-duplicada]].
