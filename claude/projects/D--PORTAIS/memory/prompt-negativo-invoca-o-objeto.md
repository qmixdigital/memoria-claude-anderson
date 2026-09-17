---
name: prompt-negativo-invoca-o-objeto
description: "no lab coat, no stethoscope" no prompt fez 3 de 4 retratos saírem de jaleco e estetoscópio
metadata:
  type: feedback
---

Ao gerar os retratos da equipe do seuguiadesaude, o prompt terminava com
`no lab coat, no badge, no clipboard, no medical equipment`. **Três dos quatro
retratos saíram de jaleco branco com estetoscópio no pescoço.**

A lista de proibição está dentro do **prompt positivo**: cada palavra dela é um
token que o modelo lê como assunto, não como veto. Dizer "sem jaleco" descreve
um jaleco.

**Why:** num portal de saúde isso não é só feio. Redator de jaleco vira
credencial médica que ninguém tem, que é exatamente a linha que o pacote de
E-E-A-T não pode cruzar.

**How to apply:** tirar toda a proibição e dizer por extenso a roupa e o lugar
que se quer, algo que exclua o indesejado por ocupar o espaço dele: "charcoal
wool turtleneck, seated at a wooden kitchen table". Mesmo mecanismo de
[[no-text-nao-impede-texto-na-imagem]]. Ver também
[[pacote-editorial-eeat]].
