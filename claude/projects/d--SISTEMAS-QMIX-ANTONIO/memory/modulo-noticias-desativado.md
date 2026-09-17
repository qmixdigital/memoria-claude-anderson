---
name: modulo-noticias-desativado
description: O modulo de noticias esta desligado de proposito desde 01/09/2026 e como reativar
metadata: 
  node_type: memory
  type: project
  originSessionId: 99cc4a53-1065-4724-9ce2-a6d6ed6fafd1
  modified: 2026-09-01T18:44:48.943Z
---

O modulo de noticias do sistema Antonio esta **desligado de proposito** desde
01/09/2026. O Anderson passou a usar outro sistema. Se alguem reclamar que
"as noticias pararam", e isto, nao um defeito.

Tres camadas desligadas ao mesmo tempo:

1. as 6 linhas do crontab do `boot` estao comentadas com `#DESLIGADO-NOTICIAS `
   (`cron-fetch-news`, `cron-qmix-generate-articles` x2,
   `article-transfer-qmix-news` x2, `cron-qmix-fontes-mudas`)
2. `admin_settings.qmix_cron_enabled = 0`
3. `news_items` foi esvaziada (eram 40 MB)

**A configuracao foi mantida no banco**: `news_sources` com 230 fontes e
`news_source_negative_keywords` com 52 termos. Reativar e descomentar as crons,
por o interruptor em 1 e ativar as fontes desejadas.

Copia completa em
`/home/boot/backups-web/modulo-noticias-20260901/noticias-completo.sql.gz`
(854 KB, as 4 tabelas com estrutura e dados).

**Why:** apagar as tabelas economizaria pouco e tornaria a volta cara. O peso
estava em `news_items`, que e dado transitorio e o proprio coletor refaz.

**How to apply:** o passo a passo esta em `OPERACOES.md`. Ver
[[campanhas-desativadas-agosto-2026]], que e outra coisa desligada de proposito.
