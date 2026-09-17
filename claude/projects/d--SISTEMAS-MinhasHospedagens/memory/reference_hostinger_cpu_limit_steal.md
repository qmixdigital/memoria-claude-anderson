---
name: reference_hostinger_cpu_limit_steal
description: "A Hostinger aplica \"Limitação de CPU\" no VPS por uso sustentado, e isso aparece como steal time de 90%; não confundir com nó sobrecarregado"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e75ba1b3-e01c-45ff-978b-5a2475149792
  modified: 2026-09-07T16:57:07.520Z
---

Quando a Hostinger detecta uso de CPU sustentado num VPS, ela aplica uma
**"Limitação de CPU"** (visível no hPanel, em VPS → Overview, com um link
"Ver detalhes"). Dentro da VM isso aparece como **steal time altíssimo**, e é
fácil diagnosticar errado como "nó físico sobrecarregado".

**Como distinguir:** o aviso "Limitação de CPU ativada. O desempenho do seu VPS
pode ser afetado" no painel é a resposta. **Olhar o hPanel antes de concluir
qualquer coisa sobre steal.**

## O episódio de 07/09/2026 no opengravity

- Steal subiu de 6-8% (baseline) para **92%**, com `idle 0%`, ao longo de 12h10 → 15h40.
- Load chegou a 82 num servidor de 2 vCPU. Um loop trivial de shell levou
  **29,8s** para 12,9s de CPU efetiva.
- Todos os apps Next e os blogs WordPress pesados do servidor saíram do ar
  (524/502/504). WordPress leve continuou respondendo.
- **Reiniciar pelo painel não funciona nesse estado**: o restart manda ACPI e o
  systemd não tem CPU para parar os serviços. Ficou 45 minutos pendurado sem
  nunca executar. O que resolve é o suporte remover o limite, ou power off/on.
- O suporte removeu o limite às 16:52 UTC. **O steal caiu de 92% para 1,84%
  imediatamente** e o `user` subiu para 73%.

**Causa apontada pela Hostinger:** processos Node/Next.js, com um `next-build` e
vários `next-server` consumindo a CPU — builds/deploys simultâneos. Bate com o
que se viu: o consultarimovel gerou 21 mil páginas ISR às 12h34 e o
arcondicionadotop reiniciou às 12h41, num servidor de 2 vCPU.

## Depois que o limite sai, os apps não voltam sozinhos

Os processos Next ficam com o event loop travado e o pool do Postgres morto
(`Connection terminated unexpectedly` nos logs). Continuam `online` no PM2, com
0% de CPU, escutando a porta, e **não respondem**. O conserto é `pm2 reload
<app> --update-env` em cada um. Depois disso os tempos voltaram para 0,12-0,29s.

## Prevenção

- Nunca rodar dois builds de Next ao mesmo tempo neste servidor.
- O runner de wp-cron (`/opt/qmix-wpcron/run.sh`) não tinha `flock` e chegou a ter
  4 instâncias simultâneas, deixando php-fpm órfão de 30 minutos. Corrigido em
  07/09/2026, mas conferir se voltou.
- O limite **volta** se o consumo sustentado voltar.

Ver [[reference_opengravity_disco_alerta]],
[[reference_healthcheck_falso_positivo_opengravity]],
[[reference_pm2_opengravity_pattern]].
