---
name: png-paletizado-com-pontilhado
description: Recolorir logo de PNG paletizado por 1-lum deixa a letra chapiscada; e o corte entre símbolo e palavra não se crava
metadata:
  type: project
---

Logo antigo de WordPress costuma vir em PNG **paletizado com pontilhado**: o
preto da letra é uma trama de pixels pretos e claros. Montar a máscara alfa como
`1 - luminância` preserva o pontilhado, e a palavra sai chapiscada de branco.

O que resolve é **fechamento morfológico** na máscara: `MaxFilter(3)` seguido de
`MinFilter(3)`, que tapa o furo do dither sem engordar o traço, e depois um
`SMOOTH`. Blur sozinho não resolve: borra a borda e mantém o furo.

⚠️ **O corte entre símbolo e palavra não se crava.** No PN Brasil, em 600px de
largura, o "P" começa antes de x=150 e metade da letra saiu verde. O corte tem
que sair da **coluna vazia** entre os dois (aqui x=85), varrendo as colunas.

**Why:** a regra é resgatar a marca da origem, e o arquivo da origem quase nunca
está limpo.

**How to apply:** separar por **luminância**, nunca por faixa de RGB, e conferir
a marca recolorida sobre fundo claro e escuro numa captura antes de subir.

Ver [[recolorir-logo-por-luminancia]], [[logo-da-origem-antes-de-inventar]] e
[[marca-tem-duas-cores]].
