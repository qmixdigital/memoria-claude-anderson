---
name: reference_deploy_skipark
description: "Deploy SkiPark — editar/commitar DIRETO na VPS (/var/www/skipark), push GitHub é read-only, repos locais têm remote errado"
metadata: 
  node_type: memory
  type: reference
  originSessionId: a0d3020a-5c68-49fe-96fe-1609e3397bef
  modified: 2026-07-20T22:39:42.853Z
---

Deploy do SkiPark (https://www.skipark.com.br) tem particularidades vs [[feedback_deploy_use_script]] do enjai:

**Fonte de verdade = VPS `/var/www/skipark`** (remote `git@github-skipark:qmixdigital/skipark.git`). Portas PM2: **3013 (skipark) + 3014 (skipark-b)**. Script: `/root/deploy-skipark.sh` (sincroniza LIVE→BUILD da árvore local, NÃO puxa do GitHub).

**Banco de dados (servidor antigo opengravity):** Postgres **nativo** (NÃO é docker — `docker` nem existe nesse host). `psql` está em `/usr/bin/psql`. Consultar via `psql "$DBURL"` (DATABASE_URL do `.env.local`, host 127.0.0.1:5432; strip o `?query=` p/ psql aceitar). Difere do srv1166087 (enjai/portuga) onde os DBs são containers Docker.

**Node 22 no opengravity (≠ srv1166087 que é Node 18):** aqui `npx prisma generate` **FUNCIONA** (Node 22.22.1). Então mudança de schema no skipark: editar DIRETO na VPS (`/var/www/skipark`), `npx prisma generate` na VPS mesmo, aplicar coluna via `psql`, deploy. NÃO precisa gerar client local + copiar (isso é só p/ enjai/portuga no srv1166087, ver [[feedback_deploy_prisma_generate]]).

**nginx/Hestia — RESOLVIDO PERMANENTEMENTE (2026-07-03):** o opengravity é **Hestia**. Ele regenera o `nginx.ssl.conf` a partir do template de PROXY do domínio (`PROXY=` no `/usr/local/hestia/data/users/qmix/web.conf`). O skipark estava com `PROXY='default'` (template do Apache → `proxy_pass https://77.37.69.175:8443`), então toda regeneração/cert-renew revertia o proxy e as rotas do Next (ex. `/produtos`) davam **404 externo** (app 200 interno, `cf-cache-status: DYNAMIC`). **Fix definitivo aplicado:** criei o template `nextjs-skipark.stpl`+`.tpl` em `/usr/local/hestia/data/templates/web/nginx/` (proxy pro upstream `skipark_backend` = 3013/3014, definido em `/etc/nginx/conf.d/skipark-upstream.conf`) e atribuí com `v-change-web-domain-proxy-tpl qmix skipark.com.br nextjs-skipark`. Testado com `v-rebuild-web-domain` → segue apontando pro skipark_backend. **NÃO mexer via edição manual do nginx.ssl.conf** (Hestia sobrescreve) — se precisar, editar o TEMPLATE `nextjs-skipark.stpl` e rebuildar.

**Mesmo padrão em OUTRO site (desentupidora.pro no `clinicas-vps`, 2026-07-03):** dava 502 porque o PROXY apontava pro template `nextjs-clinicas` (porta 3006) mas o app roda em **3008** (ecosystem.config.js). Fix: atribuído `PROXY='nextjs-desentupidora'` (template já existente, porta 3008) via `v-change-web-domain-proxy-tpl user desentupidora.pro nextjs-desentupidora` + rebuild. Regra geral p/ apps Node em servidor Hestia: o domínio precisa ter o **PROXY template certo (porta do app)**; nunca editar o nginx.ssl.conf direto.

**Fluxo correto:**
1. Editar `app/(loja)/page.tsx` (etc.) DIRETO na VPS via SSH (python/sed)
2. `git add <arquivo> && git commit` na VPS (commit local OK)
3. `bash /root/deploy-skipark.sh` — pega a alteração da working tree

**Pegadinhas (descoberto 2026-06-07):**
- `git push` da VPS **FALHA**: chave SSH do github-skipark é **read-only** (`ERROR: The key you are authenticating with has been marked as read only`). A VPS só puxa, não empurra. GitHub fica desatualizado — isso é esperado, NÃO é erro pra pausar. O deploy funciona mesmo assim (script usa working tree, não GitHub).
- Repos locais NÃO servem pra deploy: `d:/GitHub/skipark` tem remote apontando pro **enjai.git** (errado); `d:/SITES/skipark` aponta pra `cesarwalsh097-afk/skypark.git` (outro dono). NÃO fazer push de nenhum dos dois.
- `git config user` na VPS não está setado (commit cria como root@ubuntu-hestia, gera warning — ignorar).

Deploy é zero-downtime (~150s, smoke test HTTP 200 nas 2 portas), igual padrão [[feedback_deploy]].
