---
name: slug-da-lixeira-tem-sufixo
description: O WordPress acrescenta __trashed ao slug na lixeira; o 410 tem que cobrir a URL sem o sufixo
metadata:
  type: project
---

Post mandado para a lixeira tem o slug renomeado pelo WordPress com o sufixo
**`__trashed`**. A URL que existiu em público é a **sem** o sufixo: é ela que
precisa de 410.

Sem desfazer, o vhost cobre um endereço que nunca existiu e deixa o real de fora.
No publisherbrasil eram 140 slugs, no saberdefato 55.

**Why:** o sufixo tem `_`, que fica fora de `[a-z0-9-]`, então o script de vhost
os classifica como "slug fora do ASCII" e gera 140 blocos `location` próprios,
todos inúteis. O número alto de blocos é o sinal.

**How to apply:** ao montar a lista de 410, cortar `__trashed` do fim do slug
antes de deduplicar. E a URL que o export registra para post na lixeira é
`/?p=NNNN`: ela responde 404 e está certo assim, nunca foi link público.

Ver [[lixeira-gigante-nao-cabe-no-inventario]] e [[410-nao-alcanca-slug-fora-do-ascii]].
