---
name: qmix-deploy-atomico
description: Deploy do qmix-next é ATÔMICO via ./deploy.sh; nunca rodar npm run build direto
metadata:
  type: project
---

Desde 2026-09-02, o deploy do qmix-next na VPS é **atômico**: `ssh hostinger-vps-srv1166087 '/var/www/qmix-next/deploy.sh'`.

**Nunca** rodar `npm run build` direto em `/var/www/qmix-next`. O `next build` reescreve o `.next` **por baixo** das 2 instâncias que estão servindo, e durante essa janela aparecem `ENOENT: .next/required-server-files.json`, `Failed to load static file for page: /500` e `Invariant: The client reference manifest for route "/" does not exist`. Requisições reais falham e **server actions quebram** com "An unexpected response was received from the server" (foi exatamente isso que derrubou o verificador de indexação de domínios enquanto o Anderson usava a tela).

Como o `deploy.sh` funciona (5 passos, com log): builda em `.next-build` (site segue no ar do `.next` atual, reaproveitando `.next/cache` pra não ficar lento) → valida `BUILD_ID`, `required-server-files.json` e `server/app` → **troca atômica** (`mv .next .next.old && mv .next-build .next`, dois renames) → `pm2 reload` nas duas instâncias → healthcheck em 3020/3021. Se o build falhar ou faltar artefato, **nada é trocado** e o site segue intacto. Rollback: `rm -rf .next && mv .next.old .next && pm2 reload qmix-next && pm2 reload qmix-next-b`.

Habilitado por `distDir: process.env.NEXT_DIST_DIR || '.next'` no `next.config.ts`.

Ver também [[qmix-multicategoria]] e [[qmix-telegram-notificacoes]].
