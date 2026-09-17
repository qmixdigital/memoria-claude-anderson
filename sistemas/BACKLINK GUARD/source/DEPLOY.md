# Deploy — BacklinkGuard

Rodando no **VPS Hostinger srv1166087** (`ssh hostinger-vps-srv1166087`, `31.97.173.40`),
mesmo servidor do Cortes IA / infobrasil. Padrão idêntico (Next + PM2 + nginx + Postgres).

## Onde está

| Item | Valor |
|---|---|
| URL | https://backlinkguard.qmix.com.br |
| Diretório | `/var/www/backlinkguard` (release ativa) |
| Shared | `/var/www/backlinkguard-shared/.env` (symlink p/ dentro do app; persiste entre deploys) |
| PM2 | `backlinkguard-web` (3090) + `backlinkguard-web-b` (3091), dual-backend |
| Runtime | Node 20.20.2 (nvm) — Next 16 exige Node ≥20; o Node global do servidor é 18 |
| Banco | PostgreSQL local, db `backlinkguard`, user `backlinkguard` (senha no `.env` do servidor) |
| Nginx | `/etc/nginx/conf.d/backlinkguard.conf` (upstream `backlinkguard_backend`) |
| Cert | self-signed em `/etc/ssl/portais/backlinkguard.qmix.com.br/` (Cloudflare Full) |
| Proteção | Login no app (página `/login`, cookie de sessão HMAC) + `cf_trusted` (só via Cloudflare). Senha em `APP_PASSWORD` no `.env` do servidor |
| Cache | Page Rule Cloudflare `backlinkguard.qmix.com.br/*` = **Bypass** (a zona qmix.com.br tem cache-everything dos WP; sem isso o CF cacheava o app e furava o login) |
| DNS | Cloudflare conta14, zona `dominioprovisorio.net.br` — A `backlinkguard` → 31.97.173.40 **proxied** |

## Schema do banco

Produção usa `prisma db push` (sem migrations, provider `postgresql`). Para
alterar o schema depois: editar `prisma/schema.prisma` e rodar, no servidor,
`./node_modules/.bin/prisma db push`.

## Redeploy (manual, zero-downtime possível depois)

```bash
# 1) empacotar local (da pasta "Backlinks QMIX")
cd "/g/QMIX/Sites/Backlinks QMIX"
tar --exclude="backlinkguard/node_modules" --exclude="backlinkguard/.next" \
    --exclude="backlinkguard/.git" --exclude="backlinkguard/.env" \
    -czf /tmp/backlinkguard-deploy.tar.gz backlinkguard
cat /tmp/backlinkguard-deploy.tar.gz | ssh hostinger-vps-srv1166087 'cat > /tmp/backlinkguard-deploy.tar.gz'

# 2) no servidor
ssh hostinger-vps-srv1166087
export PATH=/root/.nvm/versions/node/v20.20.2/bin:/root/.bun/bin:$PATH
cd /var/www && tar -xzf /tmp/backlinkguard-deploy.tar.gz
ln -sf /var/www/backlinkguard-shared/.env /var/www/backlinkguard/.env
cd /var/www/backlinkguard
bun install
./node_modules/.bin/prisma generate && ./node_modules/.bin/prisma db push --skip-generate
bun run build
pm2 restart backlinkguard-web backlinkguard-web-b
```

Para deploy realmente zero-downtime (montar em `-build`, troca atômica, restart
em rolagem), portar o `scripts/deploy.sh` do Cortes IA. Como hoje o site é novo
e interno, o redeploy manual acima já basta.

## Ligar o check de indexação (DataForSEO)

Editar `/var/www/backlinkguard-shared/.env` no servidor, preencher
`DATAFORSEO_LOGIN` e `DATAFORSEO_PASSWORD`, e `pm2 restart backlinkguard-web backlinkguard-web-b`.
Sem isso, os checks 1 e 2 (publicado / link) funcionam; indexação fica “—”.

## Indexação: Google Search Console (grátis) + DataForSEO (fallback)

O check de indexação tenta primeiro o **Google Search Console** (URL Inspection
API) — **grátis** e autoritativo — para domínios que são propriedades
verificadas da conta de serviço. Só cai no **DataForSEO** (pago) para domínios
de terceiros não verificados. Lógica em [`src/lib/checks/indexation.ts`](src/lib/checks/indexation.ts).

- Conta de serviço Google: `backlinkguard@backlinkguard.iam.gserviceaccount.com`.
  Chave em `/var/www/backlinkguard-shared/google-sa.json` (chmod 600), apontada
  por `GOOGLE_SA_JSON_PATH` no `.env`. APIs ativadas: Search Console + Site Verification.
- **Verificar novos domínios** (torná-los grátis): rodar LOCALMENTE (tem acesso
  ao `contas.json` do Cloudflare):
  ```bash
  SA_PATH=<google-sa.json> CONTAS=<G:\QMIX\Cloudflare\contas.json> \
    bun run scripts/gsc-verify-domains.ts dominio1.com.br dominio2.com.br
  ```
  O script acha o token Cloudflare da zona, põe o TXT de verificação (deixa no
  lugar), verifica e adiciona como propriedade `sc-domain`. Idempotente.
- Quota GSC: 2.000 inspeções/dia por propriedade (grátis).

## Alerta de saldo da API (email)

Cron diário (`0 9 * * *`) roda `scripts/check-balance.sh` → consulta o saldo
DataForSEO (`GET /v3/appendix/user_data`) e manda email quando cai abaixo dos
limites. Só envia quando a faixa piora (evita spam) + lembrete a cada 7 dias.

- Limites: `DFS_BALANCE_WARN` e `DFS_BALANCE_CRITICAL`. **Configurado para
  avisar só quando zera** (WARN=0, CRITICAL=0,01 = sem saldo p/ mais 1 check).
- Email via **Resend** (reusa a chave/remetente do smspix — domínio verificado):
  `ALERT_EMAIL_FROM`, `ALERT_EMAIL_TO` no `.env` do servidor.
- Estado em `/var/www/backlinkguard-shared/.balance-alert-state.json`; log em
  `/var/log/backlinkguard-balance.log`.
- Testar envio: `bun run scripts/check-balance.ts --test`.
