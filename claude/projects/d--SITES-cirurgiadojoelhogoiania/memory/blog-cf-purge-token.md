---
name: blog-cf-purge-token
description: "Token e comando para purgar o cache Cloudflare do blog joelho (auto-purge estava quebrado, corrigido 24/07/2026)"
metadata: 
  node_type: memory
  type: reference
  originSessionId: ec40060a-ac91-4c9e-82a2-9f992865fd05
  modified: 2026-07-24T13:24:38.773Z
---

Cache do **blog.cirurgiadojoelhogoiania.com** = Cloudflare (Cache Everything anônimo, edge TTL 4h). Auto-purge via mu-plugin `joelho-cf-autopurge.php` (dispara em publish/edit de post).

**Token de purge (conta cirurgiadojoelhogoiania, NS anderson/frida):**
- Zona: `a543b64e2c25df9d5174e012757e71a0` · Account: `e1afd354b17fd5c336f44c6095f41081`
- Token (Cache Purge): `<<REMOVIDO>>`
- Também gravado em `JOELHO_CF_TOKEN` no wp-config do blog e no CONEXAO.md do `<<REMOVIDO>>`.

**Purge manual:**
```
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/a543b64e2c25df9d5174e012757e71a0/purge_cache" \
  -H "Authorization: Bearer <<REMOVIDO>>" \
  -H "Content-Type: application/json" --data '{"purge_everything":true}'
```

**Histórico:** em 24/07/2026 o token anterior (`cfat_oxeFk40b...`) estava inválido (erro 1000/10000), então o auto-purge não funcionava e edições só apareciam após ~4h. Substituído pelo token acima (purge testado = success:true). Obs.: o endpoint `/user/tokens/verify` retorna "Invalid API Token" para esse token, mas o `purge_cache` funciona — validar sempre pelo purge, não pelo verify.
