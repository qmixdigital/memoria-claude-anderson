---
name: descricao-curta-vira-descricao-longa
description: A régua do motor é 100 a 175, e ele COMPLETA descrição curta com o metaDescription do site; o defeito de "longa" nasce de ser curta
metadata:
  type: project
---

`_descNaRegua` no render.js: se a descrição tem menos de 100 caracteres, o motor
**gruda o `metaDescription` do site no fim** para chegar na régua. Com um
`metaDescription` de 152 caracteres, uma descrição de 28 vira 169.

Por isso o auditor acusava 11 páginas com "description acima de 160" no
seuguiadesaude, e todas eram páginas cuja descrição era **curta demais**.

**Why:** cortar essas descrições não resolve, porque o motor volta a completar
no rebuild seguinte. Procurar a causa no lado errado custa uma rodada inteira.

**How to apply:** escrever cada `desc` de `extraPages`, cada `catDesc` e o
`aboutDesc` já com **110 a 160**, para o motor devolver o texto intacto. O que
sobrar longo é texto fixo do motor (contato, termos, mapa do site), vale para
todos os portais e fica em 165 a 171, dentro da régua do próprio motor. Ver
[[regua-de-meta-description-escapada]] e [[title-separado-do-h1]].
