---
name: reference_opengravity_disco_alerta
description: O que enche o disco do opengravity e o que é lixo seguro de apagar; o alerta de 95% de 07/09/2026 e as correções permanentes aplicadas
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-09-07T15:33:41.188Z
---

O opengravity tem **96G** e vive perto do limite porque três coisas grandes são
**produto, não lixo**, e não adianta procurar economia nelas:

| Item | Tamanho | O que é |
|---|---|---|
| banco `consultarimovel` | 13 GB | tabela `imoveis_car`, 8,5 milhões de linhas do CAR |
| `.next/server/app/imovel-rural` | 2,5 GB | 21 mil páginas ISR, ~147 mil arquivos (5 `.rsc` por `.html`) |
| `node_modules` de 12 apps Next | ~4 GB | soma |

**O pico de uso é o deploy do consultarimovel**, que gera os 2,5 GB de ISR novo
enquanto o `-prev` (1,1 GB) ainda existe. O alerta de 95% em 07/09/2026 se
resolveu sozinho quando o build terminou, antes de qualquer limpeza. Ou seja:
**alerta de disco nesse servidor durante um deploy pode ser transitório**, então
o primeiro passo é rodar `df -h /` de novo antes de sair apagando.

## Lixo real, já eliminado em 07/09/2026 (~3 GB)

- `/var/backups/setorenergetico` (788 MB): dumps parados em 16/06, do app que
  migrou para o srv1166087. O cron `setorenergetico-backup.sh` continuava
  rodando todo dia às 3h contra um banco que não existe mais. Removido do
  crontab, script arquivado em `/root/`.
- `/var/backups/notebookx` (607 MB): 14 dumps diários de 63 MB, sem rotação.
- `/root/backups/arcondicionadotop` e `/geladeirastop` (563 MB): mesmo padrão.
- `/root/backups/portuga-*.tar.gz` (493 MB): 10 cópias do mesmo site de junho.
- `/var/log/cf-bot.log` (439 MB): o bot do Telegram loga em INFO **cada
  `getUpdates`, a cada 10 segundos**, e não tinha logrotate.
- `/var/log/nginx/error.log` (283 MB): o logrotate do nginx era `weekly` sem
  `maxsize`.

## Correções permanentes aplicadas

- `/etc/logrotate.d/qmix-extras` para o cf-bot.log (`maxsize 20M`, 3 rotações).
- `/etc/logrotate.d/nginx` passou para `daily` + `maxsize 50M` (backup em
  `nginx.bak-20260907`).
- Crontab do root salvo em `/root/crontab.bak-20260907`.

## Por que o error.log do nginx cresce tanto

`connect() failed (111: Connection refused)` é o comportamento **esperado** do
deploy zero-downtime: a instância `-b` fica desligada fora do deploy e o nginx
tenta a porta fechada antes de cair na outra. Cada requisição gera uma linha.
Não é incidente, é ruído estrutural, e o conserto é o `maxsize` do logrotate.

Ver [[reference_clinicas_vps_disco_isr]], [[reference_alerta_disco_telegram]],
[[reference_opengravity_conta_vencimento]].
