---
name: img-sem-src-infla-a-auditoria
description: Tags `<img alt="" />` sem src nenhum contam como imagem sem alt e escondem os casos reais
metadata:
  type: project
---

A raspagem deixa tags `<img alt="" />` **sem `src` nenhum** dentro do corpo. Um
artigo do opopularjornal tinha 16 delas.

**Why:** não mostram nada na tela, mas entram na contagem de "imagem sem alt" de
toda auditoria. O número sobe, o portal parece muito pior do que está, e os casos
que realmente precisam de alt escrito à mão ficam escondidos no meio. Ali eram 15
reais e 16 fantasmas.

**How to apply:** antes de contar imagem sem alt, tirar do corpo toda `<img>` sem
`src`, junto com o `<figure>` que a embrulhava. O auditor deve ignorar `<img>` sem
`src` em vez de contá-la:

```python
if 'src=' not in tag.lower():
    novo = novo.replace(tag, '', 1)   # some, nao entra na conta
```

Ver [[legenda-repete-o-h1]] e [[auditoria-da-rede-tem-regua-errada]], que é a mesma
família de problema: régua que acusa em massa o que não é defeito.
