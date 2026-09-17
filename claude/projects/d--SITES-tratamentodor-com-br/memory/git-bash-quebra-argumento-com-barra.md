---
name: git-bash-quebra-argumento-com-barra
description: No Git Bash do Windows, argumento que comeca com barra vira caminho do Windows; usar MSYS_NO_PATHCONV=1
metadata:
  type: feedback
---

No Git Bash do Windows, argumento que começa com `/` é convertido em caminho do
Windows antes de chegar ao programa. Passar `/bio/` para um script Python vira
`C:/Program Files/Git/bio/`.

**Por quê:** meu script de auditoria de hover passou a não imprimir nada e eu quase
concluí que estava tudo certo. Na verdade a URL chegava como
`https://tratamentodor.com.brc/Program%20Files/Git/bio/` e a página nem carregava.
Saída vazia parecia aprovação.

**Como aplicar:** prefixar o comando com `MSYS_NO_PATHCONV=1`, ou passar o caminho sem
a barra inicial. E tratar saída vazia de script de verificação como suspeita, nunca
como aprovação: redirecionar `2>&1` antes de concluir que passou. Ver
[[validar-js-antes-de-publicar]].
