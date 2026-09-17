---
name: data-do-wordpress-nao-e-iso
description: "post_date_gmt vem no formato do MySQL e o Google recusa cada URL do sitemap; 950 de 960 no advivo"
metadata:
  node_type: memory
  type: project
---

O export do WordPress entrega `post_date_gmt` no formato do MySQL:

```
2026-08-20 23:02:47      espaço no lugar do T, sem fuso
```

Isso **não é data válida** para `<lastmod>`, para o atributo `datetime` do HTML
nem para `datePublished` do schema. O Search Console baixa o sitemap, recusa cada
entrada e devolve o erro **dois segundos depois do envio**: no advivo eram **950
de 960 URLs**, e no viajenodetalhe 223 de 236.

**Não é defeito do motor.** Quem publica pela API passa por
`new Date(...).toISOString()` e sai correto. O defeito é do atalho de importação
que grava o JSON direto em `data/` para preservar a data original: ali a
normalização fica de fora. Foi por isso que só os dois portais convertidos assim
apareceram, e os outros 71 estavam limpos.

Como o campo é `post_date_gmt`, a data **já está em UTC**: trocar o espaço por
`T` e acrescentar `Z`. Inventar fuso local desloca a data de publicação de
milhares de artigos.

⚠️ **Conferir sempre depois de enviar o sitemap**, e não só se o envio deu certo:

```python
sc.sitemaps().get(siteUrl=PROP, feedpath=BASE + '/sitemap.xml').execute()
# olhar "errors", não só "isPending"
```

Ver [[conversao-exige-redirects]] e [[reiniciar-motor-depois-de-editar]].
