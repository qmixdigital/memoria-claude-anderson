---
name: registro-sem-permalink-herda-cliques-da-home
description: Post sem permalink sai como ?p=NNN, o caminho vira "/" e ele herda os cliques da home no cruzamento com o Search Console
metadata:
  type: feedback
---

Post sem permalink (rascunho, status inventado, auto-draft) sai da origem com
`url` no formato `https://dominio/?p=4104`. O normalizador tira a query, o
caminho vira `/`, e no cruzamento com o Search Console ele **casa com a home**.

No jornaldobairroalto eram **9 registros levando 41 cliques cada**: o relatório
dizia "11 artigos com clique" quando só 2 tinham. Nenhum era `publish`, então a
regra 1 os apagou antes, mas um `publish` nessa situação seria **preservado por
engano**.

**Why:** o número inflado não parece erro, parece portal com tráfego. E a poda é
decidida por esse número.

**How to apply:** guarda no cruzamento — se o caminho normalizado for `/` e o
registro não for a página home, não conta clique:

```python
_cam = caminho(a.get('url') or '')
d = {} if (_cam == '/' and a.get('type') != 'page') else pag.get(_cam, {})
```

Ver [[lote-a-partir-do-search-console]] e [[impressao-nao-e-oportunidade]].
