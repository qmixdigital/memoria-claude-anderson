---
name: legenda-volta-quando-o-titulo-e-reescrito
description: Reescrever o título faz a legenda da imagem reaparecer, porque o alt fica com o título velho
metadata:
  type: project
---

As funções `*Legenda` das arquiteturas escondem a legenda quando o `alt` é cópia
do **título** — que é o caso em metade do acervo importado.

Reescrever o título (par repetido, fragmento de frase, título em outro idioma)
quebra essa comparação: o `alt` continua com o título **velho**, deixa de bater
com o novo, e a legenda reaparece. O leitor vê duas manchetes em sequência, e a
de baixo é a que foi descartada.

O título velho é o que gerou o **slug**, então a comparação com o slug pega esse
caso e todos os antigos.

⚠️ Normalizar acento dos dois lados: "culinaria" do slug nunca casa com
"culinária" do alt.

⚠️ E aceitar **um ser prefixo do outro**: o slug do segundo de um par repetido
termina em `-2`, e sem essa tolerância a legenda volta justo onde o título foi
trocado.

Ver [[legenda-repete-o-h1]] e [[titulo-duplicado-nao-apagar]].
