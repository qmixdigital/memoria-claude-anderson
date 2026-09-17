---
name: ancora-de-patch-nao-e-exclusiva
description: `return _lcpEager(out);` aparece em duas funções do render.js e o patch cai na errada
metadata:
  type: feedback
---

Ancorar um patch do motor em `return _lcpEager(out);` põe o código na função
errada: na opengravity e na clinicas-vps essa linha aparece **antes**, no fim da
função que insere anúncio, e não no `_renomClasses`. Na clinicas o
`_renomClasses` nem termina assim, termina em `return out;`.

**Why:** o gancho passa a rodar só nas páginas que passam pela função de anúncio,
e o artigo daquela máquina não passa. **Nada dá erro**: a página sai inteira, só
sem o que deveria ter sido acrescentado. Aconteceu duas vezes no mesmo dia, com o
botão de Fonte Preferida e com o menu sanfonado.

**How to apply:** achar a função **pelo nome** (`t.find('function _renomClasses(site, html) {')`),
andar até o `return` dela e inserir ali. E conferir depois, com o próprio Python,
que o trecho ficou dentro do corpo da função certa. O `corrige_ganchos.py` em
`D:\SISTEMAS\MinhasHospedagens\Opengravity` faz exatamente isso.
