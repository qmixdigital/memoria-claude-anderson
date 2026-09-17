# QMIX Indexation — Sistema de Monitoramento de Indexação

## Visão geral

Aplicativo PWA que monitora a indexação no Google de ~134 domínios (Portais, Projetos, Clientes). Verificação automática semanal via Serper API. Alertas no Telegram (@qmixdigital_bot).

## Arquitetura (atual)

**Tudo roda na VPS opengravity. NÃO usa Cloudflare Pages. NÃO depende do GitHub para operação.**

```
indexation.qmix.com.br (VPS opengravity, IP 77.37.69.175)
  ├── /              → Frontend estático (HTML/CSS/JS)
  ├── /domains.json  → Lista de domínios por categoria
  ├── /status.js     → window.__QMIX_STATUS__ com indexação atual (regenerado pelo checker)
  ├── /status.json   → Mesmos dados em JSON puro
  ├── /api/*         → API HTTP Node/Express (proxy para 127.0.0.1:3030)
  └── SSL Let's Encrypt + Nginx
```

## Diretórios na VPS

```
/var/www/qmix-indexation-api/
├── .env                    → SERPER_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
├── server.js               → API HTTP (PM2: qmix-indexation-api, porta 3030)
├── checker.js              → Roda semanal: verifica todos os domínios via Serper
├── generate-status.js      → Escreve public/status.js e public/status.json
├── domains-sync.js         → Lê domains.json e sincroniza com SQLite
├── telegram.js             → Envia relatórios
├── db.js                   → SQLite (better-sqlite3)
├── db.sqlite               → Banco com histórico
├── domains.json            → Lista de domínios (raiz, lida pelo domains-sync)
├── gsc-fetcher.js          → Coletor do Google Search Console (aba Relatórios)
├── gsc-service-account.json    → SA "enjai"         (chmod 600)
├── gsc-service-account-2.json  → SA "backlinkguard" (chmod 600)
├── gsc-service-account-3.json  → SA "seoqmix"       (chmod 600)
├── gsc-service-account-4.json  → SA "qmix-seo"      (chmod 600, so casadatoalha)
├── public/                 → Frontend servido pelo Nginx
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   ├── sw.js
│   ├── status.js           → Regenerado a cada check
│   ├── status.json
│   ├── gsc.js              → window.__QMIX_GSC__ (regenerado pelo gsc-fetcher)
│   ├── gsc.json
│   ├── domains.json        → Cópia (lida pelo app)
│   └── imagens/
└── acme/                   → Webroot do Let's Encrypt
```

## Google Search Console (aba Relatórios)

O coletor `gsc-fetcher.js` roda **só na VPS** (não existe cópia local, o `deploy.sh`
não envia arquivos de backend). Rodar manualmente:

```bash
ssh opengravity 'cd /var/www/qmix-indexation-api && node gsc-fetcher.js'
```

Ele usa **múltiplas service accounts** — cada conta Google enxerga um conjunto
diferente de propriedades no GSC. As listas de `sites.list()` são unidas; quando
o mesmo domínio aparece em mais de uma conta, vence a de maior permissão
(`siteOwner` > `siteFullUser` > `siteRestrictedUser`) e, no empate, a propriedade
de domínio (`sc-domain:`) sobre a de prefixo de URL.

As chaves ficam em `C:\Users\User\Documents\APIs\`.
A conta corrente para propriedades novas e **`seoqmix@seoqmix.iam.gserviceaccount.com`**:
e ela que deve ser adicionada no Search Console de sites novos. As duas antigas
(`enjai` e `backlinkguard`) seguem no coletor porque atendem a maior parte da rede.

Propriedade com `permissionLevel: siteUnverifiedUser` e **ignorada** pelo coletor:
a API recusa consultar dados nesse nivel, entao o dominio aparece como "sem
acesso" em vez de erro. Aconteceu com o `tratamentodor.com.br` em 17/09/2026,
quando a verificacao da propriedade se perdeu no Search Console.

**Para adicionar uma service account nova:**

1. `scp SA.json opengravity:/tmp/sa.json`
2. `ssh opengravity 'install -m 600 /tmp/sa.json /var/www/qmix-indexation-api/gsc-service-account-N.json && rm /tmp/sa.json'`
3. Acrescentar `{ label: 'nome', path: \`${BASE}/gsc-service-account-N.json\` }` no array `SERVICE_ACCOUNTS` do `gsc-fetcher.js`
4. Rodar o coletor — arquivo ausente ou credencial inválida só gera warning, não quebra o run

Cada domínio traz também `prev`, com os mesmos quatro números da janela de 28
dias **imediatamente anterior**, calculada da própria série diária — não custa
chamada extra à API. É o que alimenta a seta de variação de cliques na aba
Relatórios. `prev: null` significa que o domínio não tem histórico anterior no
GSC, e aí o app não mostra seta: zero e "não dá para saber" são coisas
diferentes.

O JSON de saída traz `accounts` (contas usadas), `source`/`property` por domínio e
`not_in_app` — propriedades que existem no GSC mas **não** estão no `domains.json`.
Vale conferir esse campo ao adicionar contas: é ali que aparecem sites novos.

## Pasta local (este diretório)

Edição feita normalmente no VS Code. Deploy via `./deploy.sh`.

```
d:\SISTEMAS\APP INDEXAÇÃO\
├── deploy.sh           → rsync via SSH para VPS (UM COMANDO PRA DEPLOY)
├── index.html
├── app.js
├── style.css
├── sw.js
├── domains.json        → Lista de domínios (fonte da verdade)
├── manifest.json
├── status.js           → Pode ficar desatualizado localmente (VPS regenera)
├── status.json         → Pode ficar desatualizado localmente
├── imagens/
└── .git/               → Backup em github.com/qmixdigital/App-QMIX-Indexation
```

## Como atualizar o app

1. Edita arquivos localmente no VS Code
2. Roda: `./deploy.sh` ou `bash deploy.sh`
3. Pronto — site atualizado em ~5 segundos
4. (Opcional) `git push` para manter backup no GitHub

## Como atualizar domínios

1. Edita `domains.json` local
2. `./deploy.sh` (envia para VPS)
3. SQLite sincroniza automaticamente na próxima execução do checker
4. (Opcional) Forçar agora: `ssh opengravity 'cd /var/www/qmix-indexation-api && node domains-sync.js && node generate-status.js'`

## Verificação manual de indexação

```bash
ssh opengravity 'cd /var/www/qmix-indexation-api && node checker.js'
```

Verifica todos os domínios via Serper API, atualiza SQLite, regenera status.js, envia relatório no Telegram. Demora ~3 minutos.

### Só uma categoria (`check-category.js`)

```bash
ssh opengravity 'cd /var/www/qmix-indexation-api && node check-category.js "Portais" --dry-run'   # lista, não gasta crédito
ssh opengravity 'cd /var/www/qmix-indexation-api && node check-category.js "Portais"'
```

Importa `checkDomain()` do próprio `checker.js`, então usa a **mesma** máquina
de estados, o mesmo `check_history` e o mesmo intervalo do cron de segunda. O
único recorte é a categoria. Portais (106 domínios) leva ~2 minutos.

De propósito **não grava em `daily_reports`**: aquela tabela é `INSERT OR
REPLACE` por data e representa o run semanal completo — um run parcial no mesmo
dia apagaria o número real da semana. O relatório no Telegram sai com o
cabeçalho "Atualização manual" para não se confundir com o semanal.

> **Atenção ao rodar fora de segunda:** `TRANSITION_WEEKS = 3` no `checker.js`
> assume uma verificação por semana. Cada run extra avança o `transition_count`
> em mais um passo, então laranja/azul confirmam em menos de 3 semanas.

### Como detectar a stack de um domínio (etiquetas HTML/WP/NEXT/SHOPIFY)

**`/wp-content/` NÃO é prova de WordPress.** Os portais convertidos preservam os
caminhos das imagens (`/wp-content/uploads/2026/08/foto.webp`), então um site
estático pode ter dezenas de ocorrências e mesmo assim não ter WordPress nenhum.
Classificar por essa string já marcou errado o `pael.com.br` e o
`saudevitalidade.com.br`.

Marcadores que valem, todos de **runtime**: `/wp-includes/`, `wp-emoji`,
`rsd+xml`, `wlwmanifest` e o `<meta name="generator" content="WordPress...">`.

Quando o HTML não tem nenhum deles mas tem `/wp-content/`, a API REST desempata —
e o que importa é o **content-type**, não o código HTTP:

```bash
curl -s -o /dev/null -w '%{content_type}' -L "https://DOMINIO/wp-json/wp/v2/posts?per_page=1"
# application/json  -> WordPress vivo
# text/html         -> convertido (o host responde 200 servindo a página)
```

Host convertido costuma devolver **200 com HTML**, **410 Gone** ou **404** nesse
caminho. Só o `application/json` prova WordPress rodando.

### Provedor de SERP

É **Serper.dev** (`google.serper.dev`), com `SERPER_API_KEY` no `.env` — **não**
é o SerpApi.com. São serviços diferentes, com chaves e endpoints diferentes.
Não existe conta nem chave de SerpApi neste projeto.

## Cron automático

```
0 8 * * 1    segunda-feira 5h Brasília (8h UTC)
```

Edita: `ssh opengravity 'crontab -e'`

## Credenciais (todas no `.env` da VPS)

- **SERPER_API_KEY**: pacote 50k créditos válido por 6 meses
- **TELEGRAM_BOT_TOKEN**: `@qmixdigital_bot` (token completo em D:\SISTEMAS\OpenGravity\.env)
- **TELEGRAM_CHAT_ID**: <<REMOVIDO>> (qmixdigital — Anderson Alves QMIX)

## Senha de acesso ao app

Hardcoded em `app.js`: **<<REMOVIDO>>**

## URLs

- **App principal**: https://indexation.qmix.com.br
- **API standalone**: https://api-indexation.qmix.com.br (legado, manter para compatibilidade)
- **Cloudflare Pages antigo**: app-qmix-indexation.pages.dev (DESATIVADO ou DELETADO)

## Tecnologias

- Frontend: HTML/CSS/JS vanilla, PWA com Service Worker
- Backend: Node.js (Express), SQLite (better-sqlite3)
- Hospedagem: VPS opengravity (Ubuntu, Nginx, PM2)
- SSL: Let's Encrypt (auto-renovação)
- DNS: Cloudflare (zona qmix.com.br na conta23 do D:\SISTEMAS\Cloudflare\contas.json)
- API Google: Serper.dev (chave em VPS .env)
- Telegram: Bot OpenGravity (compartilhado com bot pessoal do user)

## NÃO faça

- ❌ Não use Cloudflare Pages para deploys — tudo direto na VPS
- ❌ Não use GitHub API para sincronizar dados — VPS regenera localmente
- ❌ Não tente fazer fetch cross-origin de api-indexation.qmix.com.br no frontend — use mesma origem
- ❌ Não modifique `status.js` ou `status.json` localmente — eles são regenerados pela VPS

## Em caso de problemas

- App fora do ar: `ssh opengravity 'pm2 status qmix-indexation-api'` → reload se preciso
- Bolinhas cinzas: verifica `status.js` na VPS (`ls -la /var/www/qmix-indexation-api/public/status.js`) e tamanho do conteúdo
- Serper sem créditos: verifica saldo em serper.dev
- Telegram não chega: testa token (`curl https://api.telegram.org/bot$TOKEN/getMe`)

## Repositório no GitHub

`github.com/qmixdigital/App-QMIX-Indexation` — mantido só como **backup de código**. Não tem deploy automático, não é fonte da verdade. Push manual quando quiser versionar.
