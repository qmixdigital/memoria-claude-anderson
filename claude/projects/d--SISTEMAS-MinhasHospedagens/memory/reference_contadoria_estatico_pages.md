---
name: contadoria-estatico-pages
description: contadoria.ia.br virou estático no Cloudflare Pages (19/10/2026); fonte local, app removido da clinicas-vps
metadata:
  type: reference
---

contadoria.ia.br é estático desde 19/10/2026: projeto Pages `contadoria` na conta BYTX (75a81880...), CNAME proxied, www com 301 para o apex. 12.760 páginas (as 12.9 mil com impressão no GSC em 16 meses + fixas + estados). Fonte local: D:/SITES/contadoria.ia.br/site (deploy com `npx wrangler@4 pages deploy site --project-name contadoria --branch main`). App, banco e nginx foram REMOVIDOS da clinicas-vps; backups em D:/SISTEMAS/MinhasHospedagens/backups/contadoria-*-20261019.*.

**Why:** diretório read-only (só admin), tráfego orgânico moderado; o operador quer tudo só no Cloudflare para poder desligar servidores.

**How to apply:** ao congelar com mirror_next.py use SEMPRE `--podavel "^/"` (links para páginas fora da lista viram texto). Na primeira tentativa, sem isso, 47% dos links internos ficaram quebrados. Depois do deploy, o CF pode servir HTML antigo da origem por cache: purgar a zona (purge_everything). Conferir links quebrados com um script de varredura (amostra de 1500 páginas) antes de virar o DNS.

Relacionado: [[geladeirastop-estatico-pages]]
