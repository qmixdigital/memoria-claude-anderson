---
name: tabela-em-cartao-no-celular
description: "O CSS de tabela em cartão foi para as 105 arquiteturas, e o data-rotulo é a metade que se esquece"
metadata: 
  node_type: memory
  type: project
  originSessionId: 351fca13-824e-437d-9151-aec38077c276
  modified: 2026-08-20T20:20:07.292Z
---

Em 20/08/2026 o padrão de tabela responsiva foi propagado para **todas as
arquiteturas dos três servidores**. Antes só a W tinha, e as antigas, **A até T,
não estilizavam tabela de forma alguma**.

**Why:** eram 1.477 tabelas em risco de sair da tela em 71 portais. O defeito não
aparece em captura de desktop e o leitor de celular nunca descobre que dá para
arrastar.

**How to apply:**
- **O `data-rotulo` é a metade que se esquece.** Só o CSS deixa o cartão mudo: os
  valores empilham sem dizer a que coluna pertencem, o que não é melhor que sair
  da tela. O rótulo já está no `<thead>` de cada tabela; o script que copia para o
  corpo é `rotula_tabelas.py`, e é idempotente.
- Junto vão a primeira célula como `<th scope="row">`, que titula o cartão, e os
  papéis ARIA, porque `display:block` apaga a semântica de tabela para leitor de
  tela.
- **Toda tabela nova precisa nascer com `data-rotulo`**, senão volta o problema.
  O helper `tabela()` do lote já monta assim.
- O token do corpo do artigo muda por arquitetura (`body`, `corpo`, `texto`,
  `prosa`, `lauda`, `wbody`…). O CSS tem que usar o token daquela arquitetura:
  ver [[motor-duas-funcoes-de-hash]].
- Nem toda tabela quebra. Quatro colunas de valores curtos cabem em 500px. O que
  estoura é 5+ colunas ou valor longo. Não confundir "tem tabela" com "está
  quebrada" na hora de medir.
- Para conferir, capturar em **500px**, não em 390: ver
  [[qa-mobile-chrome-headless]].
