---
name: status-inventado-so-sai-por-sql
description: O WP_Query filtra status não registrados, então `nao` e `sim` não saem nem com "any" nem com a lista explícita de status
metadata:
  type: reference
---

Esta rede tem posts com `post_status` **inventado** (`nao`, `sim`), deixados por
algum plugin antigo. O `WP_Query` filtra status que **não estão registrados no
WordPress**, então eles não aparecem:

- nem com `post_status => 'any'`
- nem com a lista por extenso (`['publish','draft','pending',...]`)

No folhadonoroeste eram 3, e só saíram por SQL direto:

```sql
SELECT ID FROM wp_posts
 WHERE post_type IN ('post','page')
   AND post_status NOT IN ('publish','draft','pending','private','future','inherit')
```

**Why:** é a segunda camada do problema de [[any-nao-traz-a-lixeira]]. Listar os
status por extenso resolve a lixeira e **não resolve** o status inventado, e a
lição errada seria achar que resolveu.

**How to apply:** na Fase 0, sempre um segundo passe por SQL com `NOT IN` dos
status conhecidos. E conferir a contagem por `wp db query` agrupando por
`post_status`, que é a única visão que mostra tudo, antes e depois da poda.
