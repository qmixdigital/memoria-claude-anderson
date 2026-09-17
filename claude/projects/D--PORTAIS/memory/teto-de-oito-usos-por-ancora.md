---
name: teto-de-oito-usos-por-ancora
description: Regra permanente: texto ancora em link interno usa de 1 a 8 vezes por portal, e 8 e teto e nao meta
metadata:
  type: feedback
---

Aprovada em 21/08/2026, e corrigida por ele no mesmo dia: **"maximo 8, minimo 1"**.

Cada texto ancora aparece de **1 a 8 vezes** em link interno dentro de um portal.
Vale para a linkagem automatica e para a malha "Veja tambem".

**8 e teto, e nao meta.** Eu li como valor fixo e cortei as quatro ancoras mais
usadas do adonline para exatamente 8. Ele corrigiu: quatro numeros identicos no
limite exato sao um padrao, e denunciam automacao tanto quanto a repeticao que a
regra queria evitar. Ancora que **ja esta dentro da faixa nao se toca**: cortar um
7 natural para 5 tira link sem motivo.

Quando uma ancora passa do teto, o alvo dela sai de um **hash do portal mais a
ancora**, dentro de 1 a 8. Deterministico, entao dois portais com a mesma ancora
nao caem no mesmo numero, e a mesma ancora nao muda de alvo a cada execucao.

**Nao vale para link externo.** Ancora de backlink de cliente foi escolhida por
quem pagou, e nao se mexe nela sem ordem.

**How to apply**, ao cortar o excedente:

  - **fica o link nos artigos com menos saidas.** Tirar de quem ja tem poucos e o
    caminho curto para criar artigo sem link nenhum, defeito pior que a repeticao
  - **o excedente vira texto simples**, e nao some: a frase continua lendo igual
  - **rodar a varredura de orfaos depois**, porque o corte pode deixar artigo sem
    link de saida

O corte de 21/08/2026 desfez 3.551 links em 29 ancoras, e o espalhamento seguinte
mais 108. Ele revelou defeito maior que a repeticao: no `portalnoticiasbh` e no
`nerddahora`, **tres destinos recebiam quase toda a malha** de 1.300 artigos.

Ver [[padrao-de-crosslinking-do-lote]] e [[autolink-so-roda-no-publish]].
