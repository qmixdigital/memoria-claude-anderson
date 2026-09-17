---
name: italico-abre-o-corpo
description: 1.925 artigos abriam o corpo com o resumo em itálico; o script de conversão só pegava uma das três formas
metadata:
  type: project
---

O acervo importado costuma trazer o **resumo repetido em itálico** na abertura do
texto. O leitor vê a mesma frase duas vezes: na linha fina e no primeiro
parágrafo, quase sempre com a redação pior.

O `italico_<portal>.py` de cada conversão só reconhecia `<p><i>...</i></p>` como
**primeiro parágrafo**. Ficaram de fora duas formas mais comuns:

- `<i>...</i>` **solto**, sem parágrafo em volta
- o mesmo, dentro de um ou mais `<div>` de embrulho do tema

Eram **1.925 artigos em 24 portais**.

**Why:** cada conversão media só o próprio portal e via um número pequeno, o que
parecia resolvido. A varredura de rede mostrou o tamanho real.

**How to apply:** `italico_rede.py`. Se o artigo não tem linha fina, o itálico
vira a linha fina; se já tem, ele só sai do corpo. O `<div>` de embrulho fica: só
a tag de itálico é removida.

⚠️ Só o **primeiro** bloco, e só quando abre o corpo, com 40 a 400 caracteres.
Itálico no meio do texto é ênfase de verdade.
