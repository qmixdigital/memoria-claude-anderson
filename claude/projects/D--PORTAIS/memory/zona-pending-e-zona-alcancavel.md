---
name: zona-pending-e-zona-alcancavel
description: A listagem da API mostra a zona como pending e parece fora de alcance; lida pelo id ela está active
metadata:
  type: project
---

A virada do incast ficou parada um dia por leitura errada da API: o
`acha_zona.py` percorre as contas com `?name=<dominio>` e a zona aparecia como
**`pending`**, o que parece zona criada e nunca confirmada.

Lendo a zona **direto pelo id** (`GET /zones/<id>`), ela estava **`active`**, com
os nameservers certos, e o token master a alcançava sem problema.

**Why:** conclui-se cedo demais que o acesso não existe, e o portal fica
construído esperando um token que nunca faltou.

**How to apply:** quando a listagem devolver `pending` — ou vier vazia — ler a
zona pelo id antes de desistir. Só depois disso vale dizer que a zona está fora
de alcance.

⚠️ `conta11` e `conta25` do `contas.json` continuam devolvendo
`401 Invalid API Token`. Isso é real, mas é outro problema: não era a causa aqui.

Ver [[zona-cloudflare-fora-das-contas]] e [[cloudflare-zone-id-por-dominio]].
