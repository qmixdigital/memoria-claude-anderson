---
name: nao-trocar-numero-por-frase-em-massa
description: Substituir preço por frase genérica em 160 artigos quebrou o texto; a cópia bruta da origem permitiu restauração exata
metadata:
  type: feedback
---

Achei que preço de 2017 apresentado como atual enganava, e troquei **283 valores
em 160 artigos** por frases como "varia conforme o local". O resultado:

    "O preço médio do Koidexa évaria bastante conforme a apresentação e o local"
    "O preço do Candicort fica na casa dos valor que varia de um lugar para outro"
    "tem a variação de preçovaria bastante conforme a apresentação e o local"

**Frase quebrada é pior do que número velho.** O leitor desconta o preço antigo
pela data do artigo; a frase quebrada só diz que ninguém leu a página.

**Why:** as formas em que o valor aparece são variadas demais para um punhado de
expressões: "fica na casa dos", "tem a variação de preço entre", "média de", "a
partir de", "por volta de". Cada uma precisa de um encaixe diferente, e o padrão
que resolve uma estraga a outra.

**How to apply:** número inserido em frase corrida não se troca por frase em
massa. Ou se reescreve o texto, ou se deixa. Se o objetivo é avisar que o valor
envelheceu, o caminho não destrutivo é acrescentar uma nota datada na seção.

⚠️ **A recuperação só foi possível porque a cópia bruta da origem existia** em
`/srv/importado/<slug>/posts.json`, intocada. Extraindo os valores do original na
ordem e as frases injetadas na ordem, e **só restaurando quando as duas contagens
batem**, a volta foi exata em 153 de 153. Guardar a cópia bruta da conversão não
é zelo, é o que permite desfazer.
