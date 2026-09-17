---
name: goiania-pro-onde-vive
description: "Onde o goiania.pro está hospedado, repo GitHub, clone local e ficha de acesso (não há README óbvio, foi preciso varrer as VPS)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 8122701c-18c3-44b0-9f78-5a018883a30a
  modified: 2026-09-13T16:19:17.884Z
---

goiania.pro (diretório de empresas de Goiânia, Next.js 16 + Prisma + PostgreSQL) roda na VPS `hostinger-vps-srv1166087` (31.97.173.40) em `/var/www/goiania`, PM2 `goiania-web`:3170 + `goiania-web-b`:3171 (as duas ficam ligadas por design, deploy em rolagem). Repo: `qmixdigital/goiania.pro` (privado), clone local `d:\SITES\goiania.pro`. Ficha completa com .env: `d:\SISTEMAS\MinhasHospedagens\<<REMOVIDO>>\goiania.pro.md` + `goiania.pro.env` (criados 13/09/2026).

**Why:** Nenhum README em MinhasHospedagens mencionava o domínio; precisei fazer ssh em 8 hosts para achar. O servidor não tem .git, o deploy é `bun run deploy` a partir do clone local.

**How to apply:** Para alterações, editar em `d:\SITES\goiania.pro`, commitar e rodar `bash scripts/deploy.sh --fast` no Git Bash (não há Bun local; o build é remoto e só troca se compilar; chave `<<REMOVIDO>>`). Push no GitHub com token de `Documents/APIs/github.txt` na URL (não há credential helper). Política desde 13/09/2026: tudo indexável (`MIN_CAT_BAIRRO = 1`, cadastro nasce indexável). Categoria nova = regra em `ingest/categorias.py` (raw string, `` vira backspace em string normal) + editorial JSON + medir em `/root/goiania-teste` + rodar categorias.py e load.ts em `/var/www/goiania` (fluxo no README da hospedagem). 87 categorias e ~60 mil fichas desde 13/09/2026. Não usar `pm2 restart all` nessa VPS.
