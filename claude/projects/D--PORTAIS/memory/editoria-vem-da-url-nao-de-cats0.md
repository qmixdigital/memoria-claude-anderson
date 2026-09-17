---
name: editoria-vem-da-url-nao-de-cats0
description: Artigo com mais de uma categoria tem na URL uma que não é a primeira da lista; conferir por cats[0] acusa erro falso e importar por cats[0] muda a URL
metadata:
  type: feedback
---

Post do WordPress com mais de uma categoria traz `cats` numa ordem que **não é**
a da URL. No divirto eram 15 artigos: `cats[0]` dizia `casa` e a URL era
`/estilo-vida/...`.

**Why:** duas consequências opostas, e as duas custam caro. Importar por `cats[0]`
**muda a URL** de páginas que só foram preservadas porque carregam backlink.
Conferir por `cats[0]` acusa URLs faltando que estão certas, e manda procurar um
defeito que não existe.

**How to apply:** a editoria sai sempre do **caminho da URL de origem**:

```python
p = urllib.parse.urlparse(d['url']).path.strip('/').split('/')
ed = p[0] if len(p) >= 2 else ''
```

Vale para a importação e para o script que confere se as URLs preservadas estão
no ar. Ver [[editoria-vem-da-url-nao-da-lista]], que é o mesmo defeito visto do
lado da importação.
