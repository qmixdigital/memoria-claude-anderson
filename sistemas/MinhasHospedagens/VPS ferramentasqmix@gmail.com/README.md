# VPS Hostinger — ferramentasqmix@gmail.com

Conta com 2 VPS na Hostinger.

---

## VPS 1 — OpenGravity (srv1000825)

**Painel:** HestiaCP
**Template:** Ubuntu 24.04 com HestiaCP
**VPS ID:** 1000825
**Plano:** KVM 2 (2 CPUs, 8GB RAM, 100GB disco)
**IP:** `77.37.69.175`
**Hostname:** `srv1000825.hstgr.cloud`
**Porta SSH:** `22`
**Usuário SSH:** `root`
**Senha:** `<<REMOVIDO>>`
**Passphrase da chave SSH:** `ftUAjG0Hl6pCvmYA@z4O`
**Conexão:** `ssh root@77.37.69.175` ou `ssh opengravity` (via alias em `~/.ssh/config`)
**API Token Hostinger:** `<<REMOVIDO>>`

### Acesso SSH

```
Host opengravity
    HostName 77.37.69.175
    User root
    IdentityFile ~/.ssh/id_ed25519_vps
```

### Acesso ao HestiaCP

```
https://77.37.69.175:8083
```

### Usuários do HestiaCP

| Usuário | Papel | Sites | Bancos |
|---------|-------|-------|--------|
| user | admin | 1 | 0 |
| qmix | user | 22 | 22 |

### Domínios (usuário qmix — 22 sites)

| Domínio | SSL |
|---------|-----|
| blog.coegoiania.com.br | sim |
| coegoiania.com.br | sim |
| cirurgiadecolunagoiania.com.br | sim |
| blog.drbrunoair.com.br | sim |
| drbrunoair.com.br | sim |
| blog.ombrogoiania.com.br | sim |
| blog.qmix.com.br | sim |
| blog.nutricionista.digital | sim |
| nutricionista.digital | sim |
| blog.clinicasrecuperacaosaopaulo.com | sim |
| clinicasrecuperacaosaopaulo.com | sim |
| drtiagobernardes.com.br | sim |
| camilafarias.com.br | sim |
| blog.camilafarias.com.br | sim |
| blog.drtiagobernardes.com.br | sim |
| blog.cirurgiadojoelhogoiania.com | sim |
| blog.drthiagotredicci.com.br | sim |
| peritodicas.com | sim |
| blog.drhenriquebufaical.com.br | sim |
| tendenciasmarketing.news | sim |
| cirurgiadojoelhogoiania.com | sim |
| revistamsaude.com.br | sim |

### Estrutura de arquivos

```
/home/qmix/web/{dominio}/public_html/
```

### Comandos úteis (HestiaCP CLI)

```bash
v-list-users
v-list-web-domains qmix
v-list-databases qmix
v-backup-user qmix
v-restart-web
v-restart-proxy
```

---

## VPS 2 — Clínicas SP (srv984283)

**Painel:** HestiaCP
**Template:** Ubuntu 24.04 com HestiaCP
**VPS ID:** 984283
**Plano:** KVM 2 (2 CPUs, 8GB RAM, 100GB disco)
**IP:** `31.97.162.199`
**Hostname:** `srv984283.hstgr.cloud`
**Localização:** São Paulo, Brasil
**Porta SSH:** `22` (bloqueada pelo ISP — usar deploy via HTTP)
**Usuário SSH:** `root`
**Chave SSH:** `~/.ssh/id_ed25519_deploy` (sem passphrase)
**API Token Hostinger:** `<<REMOVIDO>>`
**Validade:** até 2027-08-30

### Acesso SSH

A porta 22 está bloqueada pelo ISP local. Para SSH direto, é necessário usar o **terminal web do HestiaCP** ou o **terminal do painel Hostinger**.

Alias no `~/.ssh/config` (porta 80, funciona apenas com Nginx parado):
```
Host clinicas-vps
    HostName 31.97.162.199
    User root
    Port 80
    IdentityFile ~/.ssh/id_ed25519_deploy
```

Para usar SSH na porta 80 (temporário, derruba o site):
```bash
# No terminal web do Hostinger:
sed -i '1i Port 80' /etc/ssh/sshd_config && systemctl stop nginx && systemctl restart ssh

# Após terminar, restaurar Nginx:
sed -i '/^Port 80$/d' /etc/ssh/sshd_config && systemctl restart ssh
systemctl stop apache2; sleep 1; systemctl start nginx; sleep 1; systemctl start apache2 2>/dev/null
```

### Acesso ao HestiaCP

```
https://31.97.162.199:8083
```

### Usuários do HestiaCP

| Usuário | Papel | Sites | Bancos |
|---------|-------|-------|--------|
| user | admin | 3 | 1+ |
| consultaplacabrasil | admin | 0 | 0 |

### Domínios (usuário user)

| Domínio | Template Hestia (custom) | Porta Node | SSL |
|---------|--------------------------|-----------:|-----|
| desentupidora.pro | `nextjs-desentupidora` | 3008 | sim |
| clinicasrecuperacaosaopaulo.com | `nextjs-clinicas` | 3006 | sim (Cloudflare Flexible) |
| consultaplacabrasil.com | `default` (Apache + PHP-FPM) | — | sim |
| news.consultaplacabrasil.com | (DNS quebrado, fora do ar) | — | — |

> **distribuidorasdealimentos.com.br foi migrado para `srv1166087` em 22/06/2026.** Tudo deletado deste VPS — PM2 (distribuidoras + distribuidoras-b + mgmt-api), DB Postgres `distribuidoras_db`, dir `/home/user/web/distribuidorasdealimentos.com.br/`, domínio Hestia, template customizado `nextjs-distribuidoras`. Ver `<<REMOVIDO>>/CONEXAO.md` para nova localização.

### Sites rodando (PM2)

| App | Porta | Diretório | Stack |
|-----|------:|-----------|-------|
| clinicas-sp | 3006 | /home/qmix/web/clinicasrecuperacaosaopaulo.com/app | Next.js 16 |
| desentupidora | 3008 | /home/user/web/desentupidora.pro/app | Next.js |

### ⚠️ Arquitetura nginx — REGRAS CRÍTICAS (não quebrar)

**Histórico:** este VPS já travou 3+ vezes porque o HestiaCP regenera os configs nginx a partir de templates a cada rebuild (edição no painel, renovação SSL, `v-rebuild-web-domain`). Quando o template está errado, **todos os sites Next.js servem conteúdo de clinicas** (ou ficam fora do ar). Fix definitivo aplicado em **02/06/2026** com 3 templates customizados.

#### Templates Hestia customizados (sobrevivem a rebuilds)

Localização: `/usr/local/hestia/data/templates/web/nginx/`

| Template | Domínio | Porta Node | Aliases /app/ |
|----------|---------|-----------:|---------------|
| `nextjs-desentupidora.{tpl,stpl,sh}` | desentupidora.pro | 3008 | `/home/user/web/{domain}/app/` |
| `nextjs-clinicas.{tpl,stpl,sh}` | clinicasrecuperacaosaopaulo.com | 3006 | `/home/qmix/web/{domain}/app/` |

(`nextjs-distribuidoras` removido em 22/06/2026 com a migração.)

**Counterparts obrigatórios (Hestia exige para reconhecer o template):**
- Cópias em `/usr/local/hestia/data/templates/web/apache2/`
- Cópias em `/usr/local/hestia/data/templates/web/apache2/php-fpm/`

Sem essas cópias, `v-list-web-templates` não lista o template e `v-change-web-domain-tpl` retorna "template doesn't exist".

#### Regras inegociáveis dos templates Next.js

1. **`listen %ip%:%proxy_ssl_port% ssl;`** (porta 443 — frontend) — **NÃO usar** `%web_ssl_port%` (8443). Cloudflare bate em 443; templates antigos que usam 8443 só funcionam se houver outro nginx server block na 443 redirecionando, o que sempre quebra em rebuilds.

2. **Porta 80 NUNCA faz `return 301 https://...`** — só proxy direto pro Node, igual à porta 443. Motivo: se o Cloudflare estiver em SSL **"Flexible"** (CF↔origem em HTTP), o 301 origin→HTTPS cria loop infinito (`ERR_TOO_MANY_REDIRECTS`). Com proxy direto, funciona em Flexible, Full e Full Strict.

3. **`proxy_set_header X-Forwarded-Proto https;`** (hardcoded, não `$scheme`) — assim o Next.js sempre acredita que é HTTPS no client e gera URLs absolutas corretas, mesmo quando CF entrega HTTP na origem.

4. **Aliases `/_next/static/` e `/uploads/`** — apontam para o `app/.next/static/` e `app/public/uploads/` do projeto. **Cuidado:** clinicas mora em `/home/qmix/`, distribuidoras e desentupidora moram em `/home/user/`. Templates separados garantem path correto.

5. **`include /home/user/conf/web/{domain}/nginx.conf_*;`** no final — permite adicionar override (ex: locations extras, rate limiting) sem editar o template. Arquivos `nginx.conf_*` sobrevivem aos rebuilds do Hestia.

#### Apache (não desabilitar!)

Apache fica vivo nas portas **8080/8443** apenas para `consultaplacabrasil.com` (PHP legacy com `.htaccess` complexo: `DirectoryIndex consulta-placa.php`, mod_rewrite). Se Apache cair:
- consultaplacabrasil.com quebra
- Sites Next.js continuam funcionando (proxy direto pro Node, não passam por Apache)

Se já fez `systemctl mask apache2` por engano:
```bash
systemctl unmask apache2 && systemctl enable apache2 && systemctl start apache2
```

#### Mgmt-API — descontinuado

Foi um sidecar HTTP que permitia rodar comandos no VPS via `POST /mgmt-api/` quando ainda não havia SSH direto. Removido em 22/06/2026 junto com a migração do distribuidoras. Atualmente o acesso é via `ssh clinicas-vps`.

#### QMIX News — rewrite de URL legada (referência histórica)

Padrão usado em sites Next.js que recebem notícias do painel QMIX (acesso.qmix.com.br): o painel chama `/wp-json/sistema-qmix/v1/artigos` mas o Next.js expõe em `/api/wp-json/...`. Sem rewrite, retorna 404 silencioso.

A solução foi um include nginx que sobrevive rebuilds Hestia:

```nginx
location ^~ /wp-json/ {
    rewrite ^/wp-json/(.*)$ /api/wp-json/$1 last;
}
```

Atualmente esse rewrite vive **no novo VPS srv1166087** dentro de `/etc/nginx/conf.d/distribuidoras.conf` (sem Hestia, sem include separado). Documentação histórica mantida aqui caso seja necessário replicar.

#### Diagnóstico rápido (quando algum site quebrar)

1. **Apache vivo?** `systemctl status apache2` — se `failed`, geralmente porta 8443 está ocupada por nginx → identificar o server block e remover
2. **Origin direto** (bypassa CF): `curl -sk --resolve DOMAIN:443:31.97.162.199 https://DOMAIN/ | head` — se 200, problema está em Cloudflare; se 5xx/redirect, problema é no VPS
3. **Config correto?** `head -10 /home/user/conf/web/DOMAIN/nginx.ssl.conf` — deve ter `listen :443 ssl;` e `proxy_pass http://127.0.0.1:PORT_CORRETO`
4. **TPL correto?** `grep DOMAIN /usr/local/hestia/data/users/user/web.conf | grep -oE "TPL='[^']*'"` — deve ser o template customizado, não `default`
5. **Regenerar do template:** apague o nginx.{ssl.,}conf e rode `v-rebuild-web-domain user DOMAIN` (vai dar "apache2 restart failed" se Apache estiver com problema, mas o nginx config É gerado e basta `systemctl reload nginx`)

#### Salvaguardas para o futuro

- **Não editar manualmente** os arquivos `/etc/nginx/conf.d/domains/*.conf` nem `/home/user/conf/web/*/nginx.conf` — sempre editar via TEMPLATE em `/usr/local/hestia/data/templates/web/nginx/`
- **Após editar template:** sempre rodar `nginx -t && systemctl reload nginx` antes de fechar
- **Backup dos templates:** `cp -r /usr/local/hestia/data/templates/web/nginx /backup/nginx-templates-$(date +%Y%m%d)` antes de qualquer manutenção pesada

---

### Banco de Dados (PostgreSQL local)

| Banco | Usuário | Senha |
|-------|---------|-------|
| clinicas_db | clinicas_user | <<REMOVIDO>> |

(`distribuidoras_db` removido em 22/06/2026 — migrado para srv1166087.)

### Deploy do clinicasrecuperacaosaopaulo.com (SEM SSH)

O site tem um endpoint de deploy via HTTP. Para enviar arquivos atualizados e rebuildar:

```bash
# 1. Na pasta do projeto local:
cd d:/SITES/clinicasrecuperacaosaopaulo.com

# 2. Criar tar dos arquivos (excluindo node_modules, .next, etc):
TAR_B64=$(tar --exclude='node_modules' --exclude='.next' --exclude='_old_static' --exclude='.git' --exclude='.env.local' --exclude='.env' --exclude='drizzle' -czf - . | base64 -w0)

# 3. Enviar via HTTP e rebuildar:
curl -X POST "https://clinicasrecuperacaosaopaulo.com/api/deploy" \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"<<REMOVIDO>>\",\"files\":\"$TAR_B64\"}"
```

**Deploy secret:** `<<REMOVIDO>>`

Para apenas rebuildar (sem enviar arquivos novos):
```bash
curl -X POST "https://clinicasrecuperacaosaopaulo.com/api/deploy" \
  -H "Content-Type: application/json" \
  -d '{"secret":"<<REMOVIDO>>"}'
```

### Admin do site

| URL | Usuário | Senha |
|-----|---------|-------|
| https://clinicasrecuperacaosaopaulo.com/admin | admin@clinicasrecuperacaosaopaulo.com | Admin@2026! |

### DNS (Cloudflare)

- **SSL/TLS:** Flexible
- **Proxy:** Ativado (nuvem laranja)
- Registro A: `clinicasrecuperacaosaopaulo.com` → `31.97.162.199`
- Registro A: `blog` → `77.37.69.175` (WordPress antigo, migrar depois)

### Stack (válido para os 2 sites Next.js restantes)

- Next.js 16 + Drizzle ORM + PostgreSQL local
- NextAuth.js v5 (Google OAuth + Credentials)
- Tailwind CSS v4 + shadcn/ui
- PM2 + Nginx (proxy reverso via templates Hestia customizados — ver "Arquitetura nginx" acima)
- Fontes locais (WOFF2)

### Histórico de incidentes

| Data | Sintoma | Causa raiz | Fix |
|------|---------|------------|-----|
| 30/05/2026 | Hestia regenerou configs com template default | Hestia rebuild automático | Templates `nextjs-distribuidoras` e `nextjs-desentupidora` criados |
| 02/06/2026 11:30 UTC | distribuidoras servindo conteúdo de clinicas | Apache morto (porta 8443 tomada por nginx do clinicas) + distribuidoras sem 443 server block próprio caía no default | Templates customizados + Apache religado |
| 02/06/2026 12:00 UTC | clinicas com loop ERR_TOO_MANY_REDIRECTS | CF Flexible + nginx porta 80 fazia 301→HTTPS | Templates passaram a proxiar porta 80 direto pro Node (sem redirect) |
| 22/06/2026 | QMIX news não chegavam mais (24 dias acumulados desde 30/05) | Painel QMIX chama `/wp-json/...`; Next.js só expunha `/api/wp-json/...` → 404 silencioso | Rewrite nginx `/wp-json/* → /api/wp-json/*` via include `nginx.conf_qmix-rewrite` |
| **22/06/2026** | **distribuidoras migrado para srv1166087** | Decisão de melhor performance (KVM 8 vs KVM 2) | App + DB + uploads + DNS A movidos. Cleanup completo deste VPS no mesmo dia. |
