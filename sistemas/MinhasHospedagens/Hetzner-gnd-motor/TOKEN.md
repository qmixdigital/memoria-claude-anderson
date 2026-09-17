# Hetzner Cloud — API (projeto cliquex)

> ⚠️ Sensível. Não versionar em repositório público.

| Campo | Valor |
|-------|-------|
| Projeto | `cliquex` |
| Token API | `<<REMOVIDO>>` |
| Permissão | **Read & Write** (confirmada em 20/08/2026: `POST /v1/firewalls` → 201) |
| Base | `https://api.hetzner.cloud/v1` |
| Auth | header `Authorization: Bearer <token>` |

```bash
HZ=<<REMOVIDO>>
curl -s -H "Authorization: Bearer $HZ" https://api.hetzner.cloud/v1/servers | jq
```

Recursos deste projeto em `README.md`.
