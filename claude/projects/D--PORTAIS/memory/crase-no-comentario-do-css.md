---
name: crase-no-comentario-do-css
description: "Crase dentro de comentário do CSS fecha o template literal da arquitetura e o archs.js inteiro para de carregar"
metadata:
  node_type: memory
  type: feedback
---

O CSS de cada arquitetura mora dentro de um **template literal** de JavaScript,
delimitado por crase. Escrever um termo entre crases num comentário do CSS, como
se faz em markdown, **fecha a string ali**:

```js
/* sem `order` ele cairia depois */   ← a primeira crase encerra o literal
```

O resto do CSS vira código e o node recusa o arquivo inteiro:
`SyntaxError: Unexpected identifier 'order'`. **Todos os portais daquela máquina
param de reconstruir**, não só o que está sendo mexido.

**Why:** no editor parece só um comentário com um termo destacado, e a revisão
passa direto. Aconteceu na arquitetura AB em 22/08/2026, e só apareceu porque o
exit code do rebuild foi conferido: ver [[rebuild-exit-code-antes-de-comparar]].

**How to apply:** dentro do CSS de arquitetura, escrever "a propriedade order",
nunca entre crases. E antes de instalar, provar que o arquivo compila sozinho:

```bash
node -e 'new Function(require("fs").readFileSync("/tmp/AB.js","utf8")
         .replace(/module\.exports[^;]*;?\s*$/,""))'
```

Vale também para `${...}`: escrever isso num comentário do CSS **interpola de
verdade** e quebra igual.

Ver [[arch-local-e-fonte-unica]] e [[heredoc-come-contrabarra]].

## O que agravou, em 26/08/2026

Aconteceu de novo, num comentário de CSS da arquitetura BD. O que transformou um
erro de digitação em motor fora do ar foi o **instalador conferir tarde**: o
`atualiza_arch.py` gravava o arquivo em `/opt` e só depois rodava
`node --check`. O arquivo quebrado já estava no lugar, o `systemctl restart`
subiu sem `archs.js`, e os 34 portais da máquina passaram a depender só do HTML
estático em disco (que, por sorte, é o que o nginx serve primeiro).

**How to apply:** o instalador agora escreve num arquivo ao lado, com extensão
`.js` (o `node --check` recusa qualquer outra), roda a conferência nele, e só
troca o alvo com `os.replace` se passar. Validar depois de gravar não é validar.
