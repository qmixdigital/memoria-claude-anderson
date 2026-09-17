---
name: reference_opengravity_disco_isr
description: disco do opengravity enche por cache ISR de runtime (não build); poda por tamanho em /root/prune-isr-cache.sh, cron 04h
metadata:
  type: reference
---

08/09/2026, disco em 96% (4,6 GB livres de 96 GB). A causa não era build, log nem
backup: era **cache ISR de runtime** dos diretórios Next.

| app | rota | tinha |
|---|---|---|
| consultarimovel | `.next/server/app/imovel-rural` | **13,6 GB** (79 mil `.html`, 395 mil `.rsc`) |
| ebookcult-dir | `.next/server/app/livraria` | 5,5 GB |
| geladeirastop.com | `.next/server/app/empresas` | 5,9 GB |

Nesses apps `generateStaticParams` devolve `[]` e `dynamicParams` é `true`: nada nasce
no build. Cada ficha é gerada sob demanda e reescrita a cada revalidação (30 dias no
consultarimovel). Com Googlebot reciclando, **podar por idade não remove nada** — é o
mesmo diagnóstico da [[reference_clinicas_vps_disco_isr]].

**Solução:** `/root/prune-isr-cache.sh` no opengravity, cópia adaptada do que roda na
clinicas-vps desde 01/09. Poda por TAMANHO, remove o trio `.html`+`.rsc`+`.meta` junto,
ignora caminho com `[colchetes]` (código da rota) e reduz os tetos à metade quando o
disco passa de 85%. Cron diário às 04h. Primeira execução: **96% para 77%**, 122 mil
fichas removidas, sites respondendo 200.

Aposentei o `/root/scripts/geladeirastop-prune-isr.sh` (cron 04:20), que cobria um app
só e foi absorvido pelo script novo.

**Outros ganhos da mesma passada:** 2,4 GB de restos de deploy
(`certificadodigital-descartada`, `consultarimovel-quebrada-*`, `skipark-build`) e
2,3 GB de binlog do MySQL (36 arquivos, retenção de 30 dias sem réplica nenhuma).
Retenção baixada para 7 dias em `/etc/mysql/mysql.conf.d/mysqld.cnf`.

**Armadilha de medição:** `du -sm .next/cache` engana. Em consultarimovel esse diretório
tem 52 MB enquanto `.next/server/app` tem 13,6 GB. Medir `.next/server/app`.
