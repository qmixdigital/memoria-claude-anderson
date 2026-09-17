---
name: deploy-workflow
description: "Como fazer deploy do revistamsaude (VPS opengravity, sem git pull, build só na VPS)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 83b06f82-5a45-4a34-ab7e-948b3a416370
---

Revista Mais Saúde (Next.js 15 + Payload 3) roda na VPS **opengravity** em `/var/www/revistamsaude`, PM2 `revistamsaude` :3004 atrás do Nginx (a `revistamsaude-b` :3008 é EFÊMERA: só existe durante o deploy), Postgres **local** (`localhost/revistamsaude`, não é Neon), media em **disco local** (`/api/media/file/...`, Vercel Blob foi removido).

**Particularidades do deploy (não-óbvias):**
- O git da VPS **não consegue `git pull`** (remote HTTPS sem credencial). Para sincronizar código: editar local → commit/push pro GitHub (`webpixeldf/revistamsaudenx`) → transferir os arquivos alterados via **tar+base64 sobre SSH**: `git diff --name-only HEAD~1 HEAD | tar czf - -T - | base64 -w0 | ssh opengravity 'base64 -d | tar xzf - -C /var/www/revistamsaude'`.
- **Build só roda na VPS** — `next build` chama `generateStaticParams` que precisa do banco, e o Postgres `revistamsaude` **não existe** na máquina Windows local. `tsc --noEmit` local valida tipos, mas o build é sempre na VPS.
- **DEPLOY ZERO-DOWNTIME: rodar `bash scripts/deploy.sh` na VPS. NUNCA `npm run build` direto no diretório ativo.** Por quê: `next build` apaga/reescreve o `.next` no lugar enquanto o `next start` serve dele → chunks CSS/JS somem por ~2min → site quebrado (já tirou o site do ar, jun/2026). O `deploy.sh` builda num diretório separado (`.next-a`/`.next-b` alternado, via `NEXT_DIST_DIR`, com o `.next` ativo intocado), faz **swap atômico via symlink** (`ln -sfn`) e `pm2 reload` graceful. `.next` é um **symlink** para o slot ativo; `next.config.ts` tem `distDir: process.env.NEXT_DIST_DIR || '.next'`. Build que falha não chega ao swap (site fica no build anterior). Nunca `pm2 restart/delete`.
- Páginas com `generateStaticParams` **precisam** de `export const revalidate = N` senão ficam estáticas infinitas (`s-maxage=1y`) e edições do admin nunca aparecem. Ver [[isr-revalidate-fichas]].

**Desde 11/09/2026:**
- `deploy.sh` sobe a B (`pm2 start ecosystem.config.cjs --only revistamsaude-b`), espera 200 na 3008, recarrega a A, confere 3004 e o domínio, e derruba a B por `trap EXIT`. Fora do deploy `pm2 list` mostra só `revistamsaude`. Não é bug.
- Site passa pela **Cloudflare (nuvem laranja, conta `master`, zona 6cd438c67d7824c98c26e3c5a41149c5)**. O vhost Nginx tem `if ($cf_trusted = 0) { return 403; }`: **curl direto no IP/`--resolve` na origem dá 403**, testar sempre pelo domínio com UA de navegador e `?nc=`. Testes locais na VPS usam `127.0.0.1:3004` (liberado no geo).
- Rate limit `nextjs_ip` 5r/s burst 20 no `location /`; `/_next/image` e `/api/media/` ficam fora. Fail2ban jails `nginx-limit-req` e `recidive` ativas.
- Backups de conteúdo no Postgres: `materias_bak_20260911` (travessões/duplicatas) e `materias_seo_bak_20260911` (resumo/meta antes da geração em massa).
