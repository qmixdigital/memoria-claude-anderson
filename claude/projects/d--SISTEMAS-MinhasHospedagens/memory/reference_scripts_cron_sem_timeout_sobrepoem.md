---
name: reference_scripts_cron_sem_timeout_sobrepoem
description: "Scripts de cron sem timeout e sem flock se sobrepõem quando o servidor fica lento, empilham processos e emitem alertas com dados velhos"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-09-07T17:23:33.571Z
---

Padrão que apareceu **duas vezes no mesmo dia** (07/09/2026) no opengravity, em
scripts diferentes, e que provavelmente existe em outros:

**O bug:** script de cron que faz N requisições em série, **sem `-m` no curl** e
**sem `flock`**. Enquanto o servidor está saudável ele termina rápido e ninguém
percebe. Quando o servidor fica lento, cada requisição passa a levar dezenas de
segundos, a execução ultrapassa o intervalo do cron, e as rodadas se sobrepõem.

Os dois casos:

- `/opt/qmix-wpcron/run.sh`: 116 sites, cron a cada 30 min. Chegou a **4
  instâncias simultâneas**. Pior: quando o `curl -m 25` desiste, **o PHP do outro
  lado continua rodando**, então cada rodada deixava php-fpm órfão. Havia 16
  processos de ~30 minutos, 8 deles ocupando todos os workers do pool de um blog.
- `/root/smoke-test-{geladeirastop,arcondicionadotop}.sh`: 25 URLs, cron a cada
  30 min, **sem timeout nenhum**. Com o Cloudflare devolvendo 524 só depois de
  100s, uma execução levou **85 minutos**.

## O efeito colateral que engana o diagnóstico

O script carrega as variáveis **na memória** quando começa. Uma execução iniciada
às 15:30 e terminada às 16:55 grava no log o horário do **fim** (16:55), mas usa
os valores lidos no **início** (15:30).

Foi o que aconteceu ao trocar o token do Telegram às 15:52: um alerta gravado às
16:55 saiu pelo bot antigo, porque o processo que o emitiu tinha começado às 15:30.
Parecia que a troca não tinha funcionado, e tinha. **Antes de concluir que uma
alteração não pegou, verificar se há execução longa em curso que a antecede.**

Pelo mesmo motivo, o alerta reportava o estado do servidor de 1h25 atrás como se
fosse o de agora.

## A correção, para todo script assim

```bash
set -u
exec 9>/var/lock/<nome>.lock
flock -n 9 || exit 0      # nao começa se a anterior ainda roda
...
curl -s -m 20 -o /dev/null -w "%{http_code}" "$URL"   # timeout em TODA requisicao
```

Aplicado nos três scripts em 07/09/2026 (backups `.bak-timeout-20260907` e
`run.sh.bak-20260907`). **Vale auditar os outros scripts de cron do servidor com
o mesmo critério.**

Ver [[reference_hostinger_cpu_limit_steal]],
[[reference_healthcheck_falso_positivo_opengravity]],
[[reference_bots_telegram_opengravity]].
