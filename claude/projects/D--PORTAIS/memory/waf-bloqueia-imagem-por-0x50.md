---
name: waf-bloqueia-imagem-por-0x50
description: A regra "Exploting Fix" da Cloudflare devolve 403 na imagem de capa porque a query ?p=1000x500 contém a sequência 0x50
metadata:
  node_type: memory
  type: project
---

O motor pede a imagem como `/img/<arquivo>.webp?p=1000x500`. A regra de WAF
**"Exploting Fix"**, do conjunto de hardening da rede, bloqueia query que
**contenha** o literal `0x50`, assinatura de SQL injection por hexadecimal. E
`1000x500` contém `0x50` no meio: `100` **`0x50`** `0`.

Resultado: **403 na imagem**, com a página "Attention Required! | Cloudflare".
O arquivo está íntegro, o servidor não registra erro e o portal não acusa nada.

```
/img/foto.webp              200, 47.318 bytes
/img/foto.webp?p=1000x500   403
/img/foto.webp?p=1200x800   200
/img/foto.webp?foo=0x50     403   <- prova que não é o parâmetro, é o literal
```

**Não é só o 0x50.** A mesma cadeia tem `0x22`, que aparece em `220x229`, e
`0x25`, que aparece em `970x25`. Qualquer medida futura pode reproduzir.

## Alcance medido em 01/09/2026

| | |
|---|---|
| zonas com a regra | **38** |
| páginas pedindo imagem com a sequência | 1.567 na opengravity, 23 na clinicas-vps |
| portais efetivamente quebrados | **14**, somando 586 páginas |

O resto era bomba-relógio: 24 zonas com a regra e sem imagem afetada ainda, e
26 portais com imagem afetada cuja zona não tinha a regra.

## O conserto

Estreitar a expressão para não valer no caminho de imagem. Sob `/img/` o
servidor entrega arquivo estático, sem banco e sem interpretador: assinatura de
SQLi ali não protege nada.

```
(<expressão atual inteira entre parênteses>) and not http.request.uri.path contains "/img/"
```

```
GET   /zones/{zone}/rulesets/phases/http_request_firewall_custom/entrypoint
PATCH /zones/{zone}/rulesets/{ruleset}/rules/{rule}
      {expression, action, description, enabled}
```

Aplicado nas 38 em 01/09/2026. Scripts no scratchpad: `waf_regra.py` acha a
regra em uma zona ou em todas, `mede_waf.py` conta as páginas afetadas no
servidor do motor, `corrige_waf.py` aplica.

⚠️ **A descrição varia entre zonas**: "Exploting Fix" e "Exploting fix", com
`rule_id` e `ruleset_id` diferentes em cada uma. Procurar pelo nome falha;
procurar pelo literal na expressão é o que funciona.

## O que ficou de fora, e é decisão do Anderson

A mesma regra bloqueia, em **qualquer** query e não só em imagem:
`OR`, `SELECT`, `WHERE`, `union`, `concat`, `DROP`, `%40` e `%22`. `OR` em
maiúscula casa dentro de palavras comuns, e `%40` é o arroba codificado, que
aparece em qualquer formulário com e-mail na query. Isso é largo demais e pode
estar barrando tráfego legítimo fora de `/img/`, mas mexer nisso é decisão de
segurança, não conserto de bug.

⚠️ O token master não cobre todas as contas: `conta11` e `conta25` devolvem 403
e podem esconder mais zonas com a regra. Ver [[zona-cloudflare-fora-das-contas]].
