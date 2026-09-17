---
name: campo-image-do-motor-e-objeto
description: gravar image como string deixa o artigo sem imagem na página, e não dá erro em lugar nenhum
metadata:
  node_type: memory
  type: project
---

No JSON do artigo o motor espera:

```json
"image": { "file": "nome-do-arquivo.webp", "alt": "...", "title": "..." }
```

`file` é **só o nome**, sem `/img/` na frente: o motor monta o caminho. Gravar
`"image": "/img/nome.webp"` mais um `imageAlt` ao lado é o palpite óbvio, e é o
errado: o artigo sai **sem imagem nenhuma** na página, na home e no og:image, e
nada acusa. A auditoria de "sem imagem destacada" que lê `d.get("image")` também
passa, porque o campo existe e não é vazio.

**Why:** aconteceu no revistadeducao ao gerar as 23 imagens que faltavam. Só
apareceu porque a varredura seguinte estourou com *'dict' object has no attribute
startswith* nos artigos importados, que estavam no formato certo.

**How to apply:** ao escrever `image` na mão, conferir depois com
`isinstance(d["image"], dict) and d["image"]["file"]` em todos os artigos, e
provar no HTML publicado que o arquivo aparece. Ver [[artigo-sem-imagem-apagar]]
e [[banner-lgpd-e-og-image]].
