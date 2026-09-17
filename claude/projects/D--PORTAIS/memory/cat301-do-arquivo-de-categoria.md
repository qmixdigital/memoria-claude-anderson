---
name: cat301-do-arquivo-de-categoria
description: /category/<editoria>/ do WordPress antigo respondia 404 em 61 dos 101 portais; o mapa de 410 só cobre slug de artigo
metadata:
  type: project
---

O mapa de 410 da conversão cobre **slug de artigo podado**. O **arquivo de
categoria** do WordPress (`/category/<editoria>/`) fica fora dele e fora de
qualquer 301: responde **404**, e todo link antigo para arquivo de categoria
morre calado. Corrigido em 24/08/2026 nos 101 portais das três máquinas.

Três armadilhas achadas no caminho:

- **`categoryBase` vem com maiúscula** em boa parte dos portais (`"Categoria"`).
  Caminho de URL diferencia caixa: montar o destino em minúscula dá 404 igual.
  Comparar em minúscula, **montar com o valor cru**.
- **Ler o vhost para saber se já existe a regra não serve.** Na clinicas havia
  `^/categoria/(.+)$ → /Categoria/$1`, que só normaliza a caixa da forma em
  português; um detector procurando `categor(y|ia)` deu por resolvido e deixou os
  34 em 404. O critério certo é **pedir a URL** e ver se chega em 200.
- O ponto de inserção: ver [[patch-de-vhost-cai-no-bloco-80]].

**How to apply:** em conversão nova, testar `/category/<editoria>/` e
`/categoria/<editoria>/` antes de dar a migração por fechada.
