---
name: editoria-vem-da-url-nao-da-lista
description: "Em portal com permalink /categoria/slug/, a editoria tem que sair da URL da origem; a primeira da lista muda a URL de dezenas de artigos"
metadata:
  node_type: memory
  type: feedback
---

Num portal cujo WordPress serve `/%category%/%postname%/`, o artigo pode ter
**mais de uma editoria**, e o permalink usa uma delas. Importar com `cats[0]`
parece natural e está errado: no curiosododia, **63 dos 898 preservados tinham
mais de uma editoria, e para 40 deles o WordPress montou o permalink com outra
que não a primeira**. Esses 40 mudariam de URL, que é exatamente o que uma
conversão parcial não pode fazer.

**How to apply:** a editoria sai do caminho da URL de origem, e a lista é só o
desempate:

```python
da_url = urllib.parse.urlsplit(a['url']).path.strip('/').split('/')
slug_url = da_url[0] if len(da_url) > 1 else None
cat = next((c for c in cats if c['slug'] == slug_url), None) or (cats[0] if cats else PADRAO)
```

E a prova, que é o que fecha: para cada preservado, o caminho da origem tem que
existir no `public/` do motor depois de reconstruir. Sem essa conferência os 40
passam calados, porque cada um responde 200 no **novo** endereço.

Ver [[conversao-exige-redirects]] e [[registro-de-donos-de-slug]].
