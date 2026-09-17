---
name: classe-no-corpo-nao-casa-com-o-css
description: Classe literal gravada no conteúdo do artigo nunca casa com a regra da arquitetura; o motor troca toda classe da página por hash. Usar atributo.
metadata:
  type: project
---

Para dimensionar as imagens do corpo eu gravei `class="gsd-fig"` dentro do
`content` dos artigos e escrevi a regra na arquitetura como
`${s('texto')} .${c('fig')}{...}`. A regra **nunca casou**: as imagens subiram
sem estilo nenhum e continuaram no tamanho nativo.

Motivo: `_renomClasses` troca **todo nome de classe da página** por um hash
próprio do portal. O que a arquitetura escreve como `c('fig')` sai como
`d1vr3ju1zc`; a classe literal que eu gravei no corpo não passa por essa troca e
fica `gsd-fig`. Os dois lados deixam de se encontrar.

**How to apply:** o que o conteúdo grava tem que ser **atributo**, que o
renomeador não toca:

```
<img ... data-fig="larga">
${s('texto')} img[data-fig="larga"]{width:100%}
```

Vale para qualquer marcação escrita no `content` e estilizada pela arquitetura,
não só imagem. Ver [[motor-duas-funcoes-de-hash]],
[[classe-do-veja-tambem-sai-do-prefixo]] e [[classes-hasheadas-no-motor]].
