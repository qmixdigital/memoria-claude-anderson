---
name: editoria-vazia-deixa-listagem-velha
description: rebuildIndexes só reescreve listagem de editoria que tem artigo, então a última exclusão deixa a página antiga servindo no disco
metadata:
  node_type: memory
  type: project
---

`rebuildIndexes` percorre as editorias **que têm artigo** e reescreve o
`index.html` de cada uma. Editoria que ficou com zero artigo simplesmente não
entra no laço: o `/categoria/<slug>/index.html` antigo continua no disco,
listando artigo que não existe mais, e responde 200.

Aconteceu no revistadeducao em 22/08/2026: um artigo de teste publicado pela
plataforma caiu em Notícias, que era a editoria padrão e não tinha nenhum outro
artigo. Apaguei o JSON, reiniciei o motor e rodei o rebuild **três vezes**; a
listagem continuou citando o teste, com `mtime` congelado, o que parecia
problema de cache e não era.

**Why:** o sinal engana. `md5` igual e `mtime` que não muda parecem "nada
mudou", quando na verdade significam "esse arquivo não foi tocado". Ver
[[rebuild-exit-code-antes-de-comparar]] e [[motor-serve-da-memoria]].

**How to apply:** depois de apagar artigo, comparar as pastas de
`public/categoria/` com as editorias que ainda têm artigo em `data/`, e apagar na
mão a pasta que sobrou, mais a `public/<editoria>/` correspondente. Só então
rodar o rebuild. Um `grep -rl "<slug-apagado>" public/` fecha a conferência.
