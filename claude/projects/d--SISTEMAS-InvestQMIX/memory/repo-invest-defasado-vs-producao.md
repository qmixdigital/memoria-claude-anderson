---
name: repo-invest-defasado-vs-producao
description: "Como o QMIX Invest e versionado e implantado, e os bugs de deploy ja corrigidos que nao devem voltar"
metadata: 
  node_type: memory
  type: project
  originSessionId: 6adc9304-3162-4d2d-b146-9fa9af335091
  modified: 2026-09-07T19:10:53.547Z
---

O QMIX Invest roda em `qf.qmix.digital`, na VPS `hostinger-vps-srv1166087`
(31.97.173.40), a partir de `/opt/qmix-invest`.

**Versionamento (montado em 07/09/2026):** repositorio PRIVADO
`qmixdigital/qmix-invest` no GitHub. O `/opt/qmix-invest` agora e um clone que
puxa por **deploy key so-leitura** (`/root/.ssh/qmix-invest-deploy`, alias ssh
`github-qmix-invest`). O token pessoal fica so na maquina do Anderson, em
`Documents/APIs/github.txt`; nao foi parar na VPS de proposito.

O repo veio do Windows, entao a VPS roda `git config core.fileMode false` — sem
isso o `chmod +x scripts/*.sh` vira alteracao local e trava o `git pull`.

**Deploy:** `cd /opt/qmix-invest && ./scripts/deploy.sh`. Roda ~4 min. Rodar
**desacoplado da sessao ssh**, senao o script morre junto com a conexao:
`nohup setsid ./scripts/deploy.sh > /tmp/deploy.log 2>&1 < /dev/null &`

**Quatro bugs ja corrigidos no deploy. Nao reintroduzir:**

1. `APP_VERSION` precisa de `export` antes de qualquer comando do compose. O
   `image:` e `qmix-invest-app:${APP_VERSION:-latest}` e o Compose le o `.env`
   sozinho. O `.env` estava preso em `phase-0-initial` e tudo resolvia para
   imagens de junho — inclusive o `compose run` do migrate, que dizia
   "migrations applied" sem aplicar nada. O deploy grava o APP_VERSION novo no
   `.env` no fim, depois do health check.
2. O health check bate em `http://127.0.0.1:3000`, **nunca `localhost`**. O Next
   sobe com `HOSTNAME=0.0.0.0` (so IPv4) e dentro do alpine o `localhost`
   resolve `::1` primeiro: connection refused. Com `localhost` o check falhava
   sempre e disparava rollback em todo deploy sadio.
3. `PREV_TAG` sai do `APP_VERSION` do `.env`, nao de `docker compose images`,
   que devolvia "none" e fazia o rollback abortar com "imagem :none nao existe".
4. Em `verify-other-sites.sh`: `pm2 jlist` antepoe um aviso de versao ao JSON
   (descartar com `sed -n '/^\[/,$p'`), e `((failures++))` sob `set -e` encerra
   o script na primeira falha (usar `failures=$((failures + 1))`). Juntos davam
   falso positivo e derrubavam deploy bom. **Nunca rodar `pm2 update`** pra
   calar o aviso: reinicia o daemon e derruba os ~90 processos da VPS.

**Migrations:** o migrator do drizzle voltou a funcionar. Foi selado em
07/09/2026 com uma linha de marco de agua em `drizzle.__drizzle_migrations`
(`created_at = 1777948525933`), abaixo do `when` da 0023 no journal, porque a
0000-0022 ja tinham sido aplicadas a mao. O `_journal.json` foi reconstruido com
as 24 entradas em ordem — ele listava 6 e com a 0005 fora de ordem, o que fazia o
migrator tentar reaplicar a 0000 e derrubar o deploy.

**Historia que explica o codigo:** a migration `0020_remove_signals_ai_smartmoney`
(29/06/2026) removeu de proposito o motor de sinais, a camada de IA e o smart
money tracking. A `0021_tax_module` colocou no lugar um motor fiscal de ganho de
capital, e a `0023_darfs` guarda as DARF pagas. Referencia a signals, teses de IA
ou fundos CVM e residuo, nao feature a consertar.

O motor fiscal puro mora em `db/src/tax/`, exposto como `@qmix-invest/db/tax/*`.
**Obrigatorio, nao estilo:** o `app/Dockerfile` copia `app/`, `db/` e os
manifests, nunca `worker/`. O que toca banco ou Telegram (`service.ts`,
`alertas.ts`, `export.ts`) segue no worker.

Producao roda `AI_PROVIDER=openai` e `MODE=dry-run`.

Existem arquivos do projeto **distribuidorasdealimentos** soltos em
`/opt/qmix-invest` (`src/`, `CLAUDE.md`, `next.config.ts`, varios `scripts/`),
subidos por engano em 04/04/2026, e nao entraram no repositorio. **Nao mexer:**
Anderson pediu explicitamente para nao tocar naquele projeto, que tem trafego
alto. Nao atrapalham o build, porque o Docker so olha `app/`, `worker/` e `db/`.

Ver [[carteira-invest-fonte-de-verdade]].
