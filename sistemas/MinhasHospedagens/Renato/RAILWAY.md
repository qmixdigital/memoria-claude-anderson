# Railway — hospedagem do Renato (workspace "sejapopular's Projects")

Projeto **Turbo CMS** (`86cf414b-3afe-4a64-992b-ec7639370d4a`), ambiente **production**
(`43790cb5-9f4f-4765-91e7-5c87225b9647`). PaaS em containers (Debian, app em `/app`),
NAO e VPS: sem painel, sem nginx editavel, sem cron do sistema.
Acesso configurado e TESTADO em 2026-09-19. Uso: ajustes em qualquer site daqui.

## Sites (servicos de app)

| Alias SSH | Servico | Service ID | Dominio Railway (= user do SSH) | Dominio proprio |
|---|---|---|---|---|
| `railway-impulsionagram` | impulsionegram-v3 | `4c6ef183-14ad-426f-a514-fcc709433fdd` | impulsionegram-v3-production-fc99.up.railway.app | impulsionagram.com |
| `railway-igseguidores` | igseguidores | `5a1f9fae-1d9b-43aa-8559-b223c8ff5ed5` | igseguidores-production.up.railway.app | igseguidores.com |
| `railway-comprarseguidores` | comprarseguidores | `93176719-f753-405c-b812-c7616bc3816a` | comprarseguidores-production.up.railway.app | comprarseguidores.store |
| `railway-seguidoresdigital` | seguidores digital | `a5c04dcb-11a7-44a1-875a-44e03a376d2b` | artistic-light-production-0f29.up.railway.app | seguidores.digital |
| `railway-comprarlikes` | comprarlikes | `f68c442d-e2c8-4134-b56b-3eccd11744ca` | comprarlikes-production.up.railway.app | comprarlikes.com.br |

Bancos/cache no mesmo projeto: 5x Postgres (`Postgres`, `-tnk0`, `-WKPb`, `-ryuw`, `-Bzdr`)
e 5x Redis (`Redis`, `-4AcK`, `-UDGG`, `-uXhH`, `-2U_5`). Sem dominio (nao tem SSH por dominio;
use o instance ID se precisar).

> impulsionagram.com, seguidores.digital e comprarlikes.com.br rodam AQUI (nao mais na
> Hostinger renato-novo). Foi por isso que o DNS deles nao apontava pra Hostinger.

## 1) SSH (arquivos e comandos dentro do container)

```bash
ssh railway-comprarlikes           # cai em /app do container
ssh railway-comprarlikes 'ls /app'
scp arquivo railway-comprarlikes:/app/   # scp/sftp funcionam normal
```
- Chave: `<<REMOVIDO>>` (registrada no workspace como **renato**,
  fingerprint `SHA256:zjcCthw3G2QE+<<REMOVIDO>>`).
- Formato nativo: `ssh <dominio-railway-do-servico>@ssh.railway.com`. Chave de workspace
  = acesso a todos os servicos.
- Atencao: o container e **efemero**. Mudanca em arquivo dentro dele SOME no proximo
  deploy. Ajuste permanente = mudar o codigo-fonte/repo e redeployar (ou variavel de ambiente).

## 2) API GraphQL (gerenciar: variaveis, deploys, dominios)

- Token de **Workspace**: `C:/Users/User/Documents/APIs/railway-renato.txt`
  (`47c4b11e-0da2-4c51-83ce-24756a92c6f7`). Endpoint `https://backboard.railway.com/graphql/v2`,
  header `Authorization: Bearer <token>`.
- Script auxiliar: `./railway-api.sh '<query graphql>'` (nesta pasta).
- Consulta `me` da "Not Authorized" com token de workspace — e normal, use escopo de projeto.

Exemplos que funcionam:
```graphql
# listar servicos + dominios
{ project(id:"86cf414b-3afe-4a64-992b-ec7639370d4a") { services { edges { node { id name
  serviceInstances { edges { node { id domains { serviceDomains { domain } customDomains { domain } } } } } } } } } }

# variaveis de um servico (retorna mapa chave=valor)
{ variables(projectId:"86cf414b-3afe-4a64-992b-ec7639370d4a",
  environmentId:"43790cb5-9f4f-4765-91e7-5c87225b9647", serviceId:"<SERVICE_ID>") }

# ultimo deploy de um servico
{ deployments(first:1, input:{projectId:"86cf414b-3afe-4a64-992b-ec7639370d4a",
  serviceId:"<SERVICE_ID>", environmentId:"43790cb5-9f4f-4765-91e7-5c87225b9647"})
  { edges { node { id status createdAt } } } }

# setar variavel (mutation)
mutation { variableUpsert(input:{projectId:"...", environmentId:"...", serviceId:"...",
  name:"NOME", value:"VALOR"}) }

# redeploy do ultimo deploy
mutation { deploymentRedeploy(id:"<DEPLOYMENT_ID>") { id status } }
```

## 3) CLI `railway` (instalado, 5.57.12) — LIMITADO com este token

`railway link`/`list` dao **Unauthorized** com token de Workspace (o CLI quer token de
**Conta** pra essas operacoes). Se quiser o CLI completo (`railway logs`, `variables`,
`up`), pedir ao Renato um token de **Account** em `https://railway.com/account/tokens`
e usar `RAILWAY_API_TOKEN=<token> railway link --project 86cf414b-... --environment production`.
Enquanto isso, SSH + API cobrem tudo.

## Observacoes
- 2026-09-19: ultimo deploy do **comprarlikes** consta como **FAILED** (2026-09-18 23:50).
  O site segue no ar pelo deploy anterior. Nao mexi — conferir se foi tentativa do Renato.
- Cada site tem ~32 variaveis (DATABASE_URL, R2_*, ADMIN_*, JWT_SECRET, MODAL_SCRAPER_URL...).
  Stack: Node/"Turbo CMS" (Postgres + Redis + Cloudflare R2). Nao e WordPress.
