---
name: padrao-deploy-hospedagem
description: Hospedagem e deploy dos sites do Anderson: Cloudflare Pages (_headers, _redirects, 404) e VPS (opengravity, clinicas-vps) com Next.js em zero downtime: PM2 com instancia -b efemera, nginx upstream com max_fails=0 e keepalive_timeout 3s, deploy.sh, o que nunca fazer com pm2. Use ao iniciar projeto novo (perguntar Cloudflare ou VPS), ao fazer deploy, configurar PM2/nginx, ou investigar 502 em site Next.js na VPS.
---

## Hospedagem e Deploy

**REGRA: Ao iniciar qualquer projeto novo, PERGUNTAR:**
> "Esse site será hospedado no Cloudflare Pages ou em VPS? Se VPS, qual?"

### Opcao 1: Cloudflare Pages (sites estaticos e Next.js)

- Criar repositorio Git (GitHub) — Cloudflare faz deploy automatico a cada push
- **Pasta de deploy (build output):**
  - HTML estatico: `/` (raiz do projeto, ou pasta especifica se houver)
  - Next.js: usar `@cloudflare/next-on-pages` como adapter
- **Configuracao obrigatoria no projeto:**
  - Arquivo `_headers` na raiz do build para cache e seguranca:
    ```
    /*
      X-Content-Type-Options: nosniff
      X-Frame-Options: DENY
      Referrer-Policy: strict-origin-when-cross-origin
    ```
  - Arquivo `_redirects` se precisar de redirecionamentos (formato Cloudflare)
  - `404.html` customizado (Cloudflare serve automaticamente)
- **Dominio**: configurar DNS no Cloudflare (proxied, orange cloud)
- **SSL**: automatico pelo Cloudflare (Full Strict)
- **Cache**: Cloudflare CDN global — imagens e assets cacheados automaticamente
- **Limites**: sem server-side runtime (exceto Workers/Functions), ideal para sites estaticos

### Opcao 2: VPS (Next.js + Payload, apps com backend)

- **VPS principal**: opengravity (acesso via `ssh opengravity`)
- **Diretorio deploy**: `/var/www/[nome-do-site]`
- **SSL**: Let's Encrypt com auto-renovacao (certbot)
- **Se for outra VPS**: perguntar IP, usuario SSH e porta para configurar

### Deploy Next.js na VPS — REGRA OBRIGATORIA DE ZERO DOWNTIME

**NUNCA tirar o site do ar durante deploy.** Isso ja causou perda de vendas e queda de posicoes no Google.

**A segunda instancia e EFEMERA, nao permanente.** Ela sobe no inicio do deploy,
segura o trafego enquanto a principal recarrega, e e desligada no fim. Fora do
deploy roda um processo so por site.

Por que mudou: manter a instancia B ligada 24h cobrava RAM o ano inteiro para
servir a um evento de poucos minutos. Medido em 31/08/2026: 1,84 GB no
opengravity (6 pares) e 2,28 GB na clinicas-vps (13 pares), as duas maquinas
com menos de 300 MB livres. Depois da mudanca, a memoria disponivel foi de
1,9 para 3,5 GB e de 1,9 para 4,0 GB.

Ganho de seguranca junto: o B sobe do zero e passa por health check ANTES de a
principal ser tocada, entao build quebrado aparece antes de mexer no que esta
no ar.

**Arquitetura obrigatoria para todo projeto Next.js na VPS:**

1. **NAO usar `output: 'standalone'`** — usar `next start` direto
2. **Duas entradas PM2** no ecosystem, portas diferentes (ex: 3005 e 3006) — mas
   so a principal fica rodando fora do deploy
3. **Nginx upstream** com as duas portas e **`max_fails=0`**
4. **deploy.sh** que sobe o B, recarrega o A e derruba o B no fim

**`max_fails=0` e obrigatorio, e o motivo nao e obvio:**

Com `max_fails=2 fail_timeout=10s`, reiniciar a porta A fazia o nginx marca-la
morta por 10s. O deploy conferia que ela voltou testando a porta direto, mas o
nginx ainda cumpria a penalidade, e ja reiniciava a B. Sem nenhum backend
elegivel, o nginx respondia "no live upstreams" e 502. Medido em 31/07/2026:
26 falhas em 377 requisicoes durante um deploy.

Com so DOIS backends, ejetar um cria o problema que a ejecao deveria evitar.
Sem ejecao, o nginx tenta uma porta e, no "connection refused" do loopback, cai
na outra na hora. Por isso a porta B pode ficar fechada entre deploys sem
penalidade perceptivel: o `proxy_next_upstream` padrao (`error timeout`) ja
cobre isso, e ate POST e repassado, porque o nginx so se recusa a repetir
metodo nao idempotente que JA foi enviado — e conexao recusada significa que
nao foi.

**Estrutura PM2 (ecosystem.config.cjs) — as duas entradas continuam existindo:**
```javascript
const base = {
  script: "./node_modules/next/dist/bin/next",
  cwd: "/var/www/projeto",
  instances: 1,
  exec_mode: "fork",
  kill_timeout: 10000,
  autorestart: true,
  max_memory_restart: "700M",
  env: { NODE_ENV: "production" },
}

module.exports = {
  apps: [
    { ...base, name: "projeto",   args: "start -p PORTA_A" },
    // Efemera: quem sobe e derruba e o deploy.sh. Nao deixar ligada.
    { ...base, name: "projeto-b", args: "start -p PORTA_B" },
  ],
}
```

**Nginx (upstream sem ejecao):**
```nginx
upstream projeto_backend {
    # max_fails=0 desliga a ejecao de backend, de proposito (ver acima).
    server 127.0.0.1:PORTA_A max_fails=0;
    server 127.0.0.1:PORTA_B max_fails=0;
    keepalive 32;
    # OBRIGATORIO junto com keepalive: menor que os 5s do keepAliveTimeout do
    # Node, para o nginx fechar a conexao ociosa antes dele (ver abaixo).
    keepalive_timeout 3s;
}

location / {
    proxy_pass http://projeto_backend;
    proxy_connect_timeout 5s;
}
```

**`keepalive_timeout 3s` e obrigatorio, e o motivo se liga ao `-b` efemero:**

Sem ele, o nginx reaproveita uma conexao ociosa que o Node ja fechou (o Node
fecha em 5s) e leva `Connection reset by peer`. Ai tenta o outro servidor do
upstream, que e a porta `-b`, desligada fora de deploy: `no live upstreams`,
502 para o visitante. Fora do deploy cada requisicao tem UMA chance, entao todo
reset vira 502. Medido em 13/09/2026 na opengravity: 64 502 num dia, em 8
sites, todos com essa assinatura. Aparecia nos smoke tests como "rota X:
HTTP 502" em rotas aleatorias. Com o nginx fechando em 3s, antes do Node, o
reset nao acontece. Aplicado nos 12 upstreams da opengravity e nos 13 da
clinicas-vps em 13/09/2026.

**Fluxo de deploy: rodar o `./deploy.sh` do diretorio do app.** Ele builda, sobe
o B, espera a porta responder, recarrega o A, confirma o site pelo dominio e so
entao derruba o B (por `trap EXIT`, entao o B tambem cai se o script morrer no
meio). Se o site nao voltar 200, ele deixa o B de pe e sai com erro, para nao
ficar sem ninguem atendendo.

O health check do deploy vai pelo dominio com cache-buster `?nc=`, nao pela
origem: o middleware desses apps recusa (403) requisicao que nao venha do
Cloudflare, entao `--resolve` na origem daria falso negativo; e sem o `?nc=` um
HIT da borda devolveria 200 mesmo com o backend quebrado.

**NUNCA fazer:**
- Deixar a instancia `-b` ligada fora do deploy
- `pm2 restart` (nao tem graceful shutdown) ou `pm2 restart all` / `pm2 kill`
- `pm2 update` num servidor com muitos apps: reinicia o daemon e derruba todos
- `output: 'standalone'` no next.config (causa indisponibilidade durante build)
- Criar a entrada `-b` no ecosystem sem testar que ela sobe: um ecosystem errado
  so aparece no meio de um deploy, com a principal ja parada

**SEMPRE fazer:**
- `pm2 reload` (zero downtime, graceful) na instancia principal
- `pm2 save` apos qualquer mudanca na configuracao
- Conferir que o ecosystem realmente sobe o `-b` antes de confiar nele
