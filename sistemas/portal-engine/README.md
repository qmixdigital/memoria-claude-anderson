# Portal Engine — motor de portais de notícias (HTML estático)

Recebe artigos do **Sistema Antônio** (mesmo formato dos sites WordPress da rede QMIX) e publica
**HTML estático otimizado**, multi-site, na VPS. Sem WordPress, sem banco, sem dependências externas.

> 🚀 **Assumindo o projeto numa máquina nova?** Comece por **[LEIA-PRIMEIRO.md](./LEIA-PRIMEIRO.md)** →
> **[ACESSO.md](./ACESSO.md)** (SSH/credenciais) e use **[CLAUDE.md](./CLAUDE.md)** como runbook.
> Converter um WordPress: **[CONVERSAO-WORDPRESS.md](./CONVERSAO-WORDPRESS.md)**.

## Arquitetura
- `src/receiver.js` — endpoint HTTP (Node puro), escuta `127.0.0.1:8791`, identifica o site por `X-API-KEY`.
- `src/render.js` — núcleo: decodifica + **sanitiza** o conteúdo, IO atômico, SEO/schema, sitemap, robots,
  manifest, favicons, **ping IndexNow**, publish/rebuild. Monta o `ctx` (classes + tokens) e despacha pro arquétipo.
- `src/archs.js` — **5 arquétipos estruturais A-E** (`{css,header,footer,home,article,list}`), DOM divergente.
- `src/tokens.js` — **fingerprint roll** anti-PBN: paletas, fontes, escalas de design, prefixo de classe por
  portal, `rollFingerprint(slug, vizinhos)`. Cada portal nasce único em todas as camadas de código.
- `sites.json` — registro dos sites (slug, domínio, `apikey`, `indexnowKey`, `categoryMap`, `defaultCategory`, tema, **`fp`**).
- `newsite.sh` — provisiona um novo portal (pastas + chaves + roll de identidade + vhost Nginx com guarda `nginx -t`).
- `portal-engine.service` — unit systemd **isolado** (usuário sem sudo, sandbox, `MemoryMax`/`CPUQuota`).

## Fluxo
`Antônio → POST /<ns>/v1/artigos (X-API-KEY) → Nginx → receptor → render → HTML estático`.
Cada publicação dispara **IndexNow** (Bing/Yandex/Seznam). Google é coberto via sitemap + Search Console.

## Operação (VPS hostinger-vps-srv1166087 / 31.97.173.40)
- Código em `/opt/portal-engine` (dono: `portais`). Conteúdo em `/srv/portais/<slug>/{data,public}`. Certs em `/etc/ssl/portais/<dominio>/`.
- **SEMPRE reiniciar após editar `render.js`:** `systemctl restart portal-engine` (o `require` cacheia o módulo).
- **NUNCA rodar como root** em `/srv/portais` (gera arquivos root → EACCES no receptor). Use `runuser -u portais -- node ...`.
- Rebuild manual: `runuser -u portais -- node -e 'const fs=require("fs");const{rebuildIndexes}=require("/opt/portal-engine/src/render");const c=JSON.parse(fs.readFileSync("/opt/portal-engine/sites.json"));rebuildIndexes(c,c.sites.find(x=>x.slug==="SLUG"))'`

## Novo portal (replicar)
`bash /opt/portal-engine/newsite.sh <slug> <dominio> "<Nome>"` → cria pastas, gera `apikey` + `indexnowKey`, escreve o vhost.
Depois: no Cloudflare, DNS A → 31.97.173.40 (proxy laranja), SSL **Full (strict)** + Origin Cert em `/etc/ssl/portais/<dominio>/origin.{pem,key}`, e cadastrar **endpoint + X-API-KEY** no Antônio.

## Categorias
`categoryMap` no `sites.json` mapeia o **ID numérico do Antônio** → nome. Ex.: `{"1":"Notícias","2":"Entretenimento"}`.
Mover um artigo de categoria de forma **durável** (Antônio re-entrega e desfaz): setar `catLock:true` + `category` no data JSON.

## Segurança
- Conteúdo **sanitizado** (remove `script/iframe/on*/javascript:`); imagens via `execFileSync` (sem shell) + **whitelist de extensão**.
- Receptor: comparação de chave **timing-safe**, bind **só em localhost**, cap de **8MB**.
- Nginx: **rate-limit** no endpoint + headers (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, HSTS). systemd: sandbox + limites de memória/CPU.
- **Escrita atômica** (temp + rename) — sem corrupção/502 em rebuild concorrente. Idempotência: re-entrega igual não reprocessa.

## Gerenciar conteúdo (via VS Code / SSH)
Tudo é arquivo. Excluir artigo: apagar `data/<slug>.json` + `public/<cat>/<slug>/` + rebuild. Editar links/conteúdo: editar o data JSON ou o template e rebuildar.
