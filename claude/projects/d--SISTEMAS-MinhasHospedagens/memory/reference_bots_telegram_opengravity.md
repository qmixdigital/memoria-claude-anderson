---
name: reference_bots_telegram_opengravity
description: Os três bots do Telegram do opengravity e qual script usa qual; scripts copiados do ENJAI ficavam alertando no bot errado
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-09-07T16:22:08.011Z
---

O opengravity tem **três** bots do Telegram, e é fácil confundir porque os scripts
de monitoramento foram criados por cópia:

| Bot | Token (prefixo) | Para que serve |
|---|---|---|
| `enjai_alertas_bot` | `8568397071` | **exclusivo do E.N.J.A.I.** |
| `skipark_bot` | `8653615668` | skipark |
| `qmixdigital_bot` | `8726948248` | alertas gerais da rede (healthcheck em `/opt/opengravity`) |

**O erro encontrado em 07/09/2026:** `smoke-test-arcondicionadotop.sh`,
`smoke-test-geladeirastop.sh`, `cleanup-nightly.sh` e `verify-backup-portuga.sh`
foram criados copiando os scripts do ENJAI e **ninguém trocou o token**. Os
alertas desses quatro chegavam no `enjai_alertas_bot`, que é do cliente. Movidos
para o `qmixdigital_bot`.

No bot do ENJAI devem ficar **apenas**: `deploy-enjai.sh`, `rollback-enjai.sh`,
`smoke-test-enjai.sh`, `verify-backup-enjai.sh`.

**Ao criar um script de alerta novo, conferir o token antes de ativar.** E ao
trocar de bot, testar o envio para cada `chat_id` primeiro: o Telegram só entrega
para quem já iniciou conversa com aquele bot, e a falha é silenciosa. Os chat_ids
`<<REMOVIDO>>` e `7945216822` estão liberados no `qmixdigital_bot` (testado).

Varredura para achar o problema:

```bash
grep -l "8568397071" /root/*.sh /usr/local/bin/* 2>/dev/null | grep -v bak
```

Ver [[reference_site_healthcheck]], [[reference_alerta_disco_telegram]].
