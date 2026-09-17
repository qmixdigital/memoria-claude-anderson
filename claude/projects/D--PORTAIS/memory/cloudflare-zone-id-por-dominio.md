---
name: cloudflare-zone-id-por-dominio
description: "Nunca reaproveitar zone_id da Cloudflare entre domínios: buscar sempre por nome antes de purgar"
metadata:
  type: feedback
---

Antes de qualquer purga ou mudança na Cloudflare, **buscar a zona pelo nome do
domínio** (`/zones?name=DOMINIO`) e usar o id retornado naquela chamada. Nunca
reaproveitar um `zone_id` que já está no histórico da conversa.

**Por quê:** em 19/08/2026 eu guardei o id de `jornaldabahia.net` e continuei
usando ele para purgar o `sejanoticia.com`. A API respondeu `success: true` em
todas as tentativas, porque a purga realmente acontecia, só que na zona errada.
Passei um bom tempo investigando um cache "à prova de purga" que não existia, e
ainda liguei o modo de desenvolvimento no domínio errado. O sintoma clássico é
`cf-cache-status: HIT` com `age` crescendo mesmo depois de `purge_everything`.

**Como aplicar:** uma função que recebe o domínio, resolve a zona e purga, em vez
de uma constante no topo do script. Quando a purga parecer não fazer efeito, o
primeiro teste é `GET /zones/<id>` e conferir se o `name` bate com o domínio que
você está olhando. Ver [[cloudflare-purge-token-de-conta]] e
[[html-sem-cache-control]].

## O zone id ja esta no sites.json

Nao precisa procurar nem chutar: cada portal traz o proprio no campo **`cf`**.

```json
"cf": { "zone": "ef5c8c46746d9fceeaaa2448e0db1732", "token": "cfat_..." }
```

⚠️ **Nem todo portal tem o `token` ali.** Na opengravity, 24 dos 40 trazem so a
`zone`: esses usam o token de conta, ver [[cloudflare-purge-token-de-conta]].
Um script que exija `cf["token"]` pula esses 24 em silencio e diz que purgou.

