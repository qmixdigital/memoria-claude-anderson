---
name: cor-escrita-nao-e-cor-efetiva
description: auditar contraste lendo o CSS gerado aprova página onde o texto some; só o getComputedStyle vê
metadata:
  type: feedback
---

Auditar contraste **lendo a regra que o motor gerou** aprova tudo mesmo quando o
texto está invisível na tela. A regra está escrita e correta; ela **perde por
especificidade** para a da arquitetura.

O caso: o botão de Fonte Preferida usava `.classe{color:#fff}`, **(0,1,0)**. A
arquitetura tem `.xxbody a{color:var(--p)}` e `.xxfoot a{color:var(--footer-tx)}`,
**(0,1,1)**. No advivo o texto saiu `rgb(18,58,92)` sobre fundo
`rgb(18,58,92)`: a mesma cor. O auditor de CSS deu 101 de 101 aprovados.

**Why:** quem viu foi o Anderson, abrindo a página. Um auditor que lê o CSS
gerado é cego para herança e para especificidade, e por isso não serve para
contraste de elemento injetado em tema de terceiro.

**How to apply:** medir com o navegador. `audita_cor_rede.py` e
`mede_efetivo.py`, em `D:\SISTEMAS\MinhasHospedagens\Opengravity`, baixam a
página, injetam um script que lê `getComputedStyle` do elemento e do fundo atrás
dele, e leem o resultado pelo `--dump-dom`. Para elemento injetado, `!important`
em `color` e `background` é o certo. E o `:hover` **não** dá para medir assim:
ele é conferido lendo a regra, com `hover_fp.py`.

⚠️ Segundo furo do mesmo auditor: ele pegava **a primeira** regra da classe, que
era a genérica sem cor, e pulava o portal. Relatório limpo sem ter medido nada.
Ver [[contraste-do-tema-abaixo-da-regua]].
