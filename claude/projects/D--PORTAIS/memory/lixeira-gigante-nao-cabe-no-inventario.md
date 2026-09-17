---
name: lixeira-gigante-nao-cabe-no-inventario
description: Portal com dezenas de milhares de posts na lixeira: exportar só metadado, e não pôr esses slugs no 410
metadata:
  type: project
---

O universoneo tinha **37.185 posts em `trash`**, sete vezes o acervo publicado.
Duas decisões que valem para qualquer portal nessa situação:

**1. O inventário guarda a lixeira só com metadado.** O conteúdo inteiro passaria
de 180 MB, inviável de mover por SSH. E não precisa: `trash` cai pela regra 1 sem
que nenhuma decisão dependa do texto, e post na lixeira já estava fora do ar antes
da conversão. Ficam id, slug, título, data e status — 7,8 MB. Os que **eram
públicos** continuam com o conteúdo inteiro, e um `LEIA-ME.md` no inventário
explica a diferença.

⚠️ **A exportação da lixeira sai por SQL direto**, não por `WP_Query`: com 37 mil
registros o `WP_Query` estoura a memória montando objeto de post.

**2. Os slugs da lixeira NÃO entram no 410.** O WordPress renomeia o slug ao
mandar para a lixeira, acrescentando `__trashed`. Essas URLs **nunca existiram em
público**: ninguém tem link para elas e o Google nunca as indexou. Mandar 410
incharia o vhost em milhares de blocos de `location` à toa.

```python
ok = [x for x in slugs if not x.endswith('__trashed')]
```

Ver [[any-nao-traz-a-lixeira]], que é o lado oposto: a lixeira precisa **aparecer**
no inventário, só não com o texto todo.
