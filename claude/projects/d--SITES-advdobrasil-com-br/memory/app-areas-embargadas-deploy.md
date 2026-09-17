---
name: app-areas-embargadas-deploy
description: "O diretorio de imovel rural (advdobrasil.com.br/imovel-rural/, ex areas-embargadas e cadastro-rural): onde vive, qual repositorio e canonico, como se publica e o erro de PATH que derrubou o servico"
metadata: 
  node_type: memory
  type: project
  originSessionId: 7147f3e8-6d89-49d6-9498-79e887619e94
  modified: 2026-09-16T23:33:03.441Z
---

`advdobrasil.com.br/imovel-rural/` NAO e parte do site estatico. E uma app
Next.js 16 (App Router, Prisma, Postgres) na VPS `hostinger-vps-srv1166087`,
em `/var/www/advdobrasil`, servida por um **Worker da Cloudflare** que
intercepta so esse prefixo, injeta o item "Imoveis Rurais" no menu, o
"Consultar imovel rural" no rodape e o bloco do diretorio no `/robots.txt`.
O prefixo mudou tres vezes em 13 a 15/09/2026 (`/areas-embargadas/` →
`/cadastro-rural/` → `/imovel-rural/`); os dois antigos respondem 301 pelo
Worker. **Nao renomear de novo:** cada troca zerou o rastreio (10.108 URLs no
sitemap, 0 indexadas em 16/09).

**Repositorio canonico da app: `qmixdigital/advdobrasil-imovel-rural`,
branch `main`** (pastas `app/`, `worker/ponte.js`, `scripts/`, `docs/`,
`STATUS.md`), mantido por outra sessao do Anderson. Foi renomeado em
16/09/2026 (era `advdobrasil.com.br`, depois que essa sessao fez push forcado
por cima do backup do site). **O site estatico voltou a ter repositorio
proprio, `qmixdigital/advdobrasil.com.br`**, recriado em 16/09 com o
historico completo. O repositorio `advdobrasil-areas-embargadas` esta
arquivado e o clone local `d:/SITES/advdobrasil-areas-embargadas` e
**obsoleto**; o clone de trabalho da app fica em `d:/tmp/advrepo`.

**Deploy da app:** clonar o repositorio canonico e rodar
`DEPLOY_KEY=<<REMOVIDO>> bash scripts/deploy.sh` (zero
downtime, sobe o `-b`, confere um exemplo de cada tipo de pagina). A purga de
cache do script procura `G:/QMIX/Cloudflare/contas.json`, que nao existe nesta
maquina: purgar a mao com o token do `.env` do site estatico
(`purge_everything` na zona `fb025bc1b9a01c97bd13a47bc0958817`).

**Why (o erro de 13/09):** o PM2 roda `bash -c "bunx next start -p 3250"`; o
node 20 e o bun so existem em `~/.nvm/...` e `~/.bun/bin`. Um
`pm2 reload --update-env` sem esse PATH substituiu o ambiente do processo:
`bunx: command not found`, crash loop, diretorio fora do ar. Depois, trocas
de build sem manter os chunks antigos deixaram HTML pedindo JS que nao
existia (404 cacheado na borda), com pagina em branco ao navegar.

**How to apply:** usar o `deploy.sh` do repositorio, que ja exporta o PATH e
faz a troca segura. Se fizer a mao: `export PATH=$HOME/.nvm/versions/node/v20.20.2/bin:$HOME/.bun/bin:$PATH`
antes de qualquer `pm2 reload`; copiar `.next/static` antigo para dentro do
novo antes de trocar; purgar a borda depois. Health check pelo dominio com
`?nc=`, nunca so pela porta.

Ver tambem [[deploy-direto-e-backup-sob-autorizacao]].
