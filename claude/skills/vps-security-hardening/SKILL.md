---
name: VPS Security Hardening
description: Playbook completo de segurança para a rede QMIX/Cliquex — nível servidor (Linux/Nginx/VPS) E nível Cloudflare (edge/zona). Use quando o usuário pedir "segurança máxima", "segurança máxima nível Cloudflare e VPS", "proteção máxima", "segurança a nível de servidor", "hardening", "proteger o servidor", "proteger site contra ataque", "blindar contra bots/flood/DDoS", "nunca bloquear o Google", "aplicar segurança do Cliquex/QMIX em outros sites", "aplicar em todos os domínios", ou reportar flood/ataque coordenado, queda de ranking na SERP por ataque, crashes de PM2, TransformStream errors, bot bombardier. Cobre camadas de VPS (Nginx rate limit, Fail2ban, origin-only-CF) e de Cloudflare edge (skip verified-bot, WAF por zona, rate-limit, Bot Fight, security level, security headers) aplicáveis em massa a todas as contas/zonas.
---

# VPS Security Hardening

Playbook validado para proteger VPS Linux que hospeda múltiplos apps web (Next.js, WordPress, Node.js) atrás do Cloudflare. Aplicado com sucesso no `hostinger-vps-srv1166087` (28/07/2026, 18 sites Next.js protegidos, 32 bots banidos automaticamente em 10 minutos).

## Quando usar

Invoque esta skill quando o usuário:
- Pedir **"segurança máxima"** / **"proteção máxima"** / **"segurança máxima nível Cloudflare e VPS"** (aplica AMBAS as camadas)
- Pedir "segurança em nível de servidor" / "hardening do VPS" / "proteger meus sites"
- Pedir para **blindar/proteger domínios no Cloudflare**, **"aplicar em todos os domínios"**, ou **"nunca bloquear o Google"**
- Reportar **flood/ataque coordenado**, ou **queda de ranking na SERP** suspeita de ataque
- Reclamar de crashes recorrentes, PM2 reboots, upstream errors do Nginx
- Reportar tráfego suspeito de bots/scrapers indianos ou de outras origens
- Pedir para "estender a segurança do Cliquex/QMIX/outro site pros demais"
- Investigar erro `TransformStream / controller[kState].transformAlgorithm is not a function` em Next.js 16
- Mencionar "bot bombardier", "rajada de requests", "DDoS pequeno", "alto tráfego indesejado"

**Sites no Cloudflare Pages / sem VPS:** pular Camadas 1-3 (não há Nginx/origem) e aplicar direto a **Camada 4 — Cloudflare edge**.

## Contexto arquitetural (assume-se)

- **Nginx** como reverse proxy na frente dos apps
- **Cloudflare proxied** (orange cloud) na frente do Nginx
- **PM2** gerenciando processos Node.js (padrão dual instance failover)
- **Real IP** via `real_ip_module` + `CF-Connecting-IP` (ver `/etc/nginx/conf.d/cloudflare.inc`)
- **Origin só-CF**: `if ($cf_trusted = 0) { return 403; }` já configurado (geo em `/etc/nginx/conf.d/00-cf-realip.conf`)
- **Fail2ban** já ativo com jails padrão QMIX (sshd, qmix-nginx-http-auth, qmix-wordpress)

Se algum desses NÃO estiver configurado, aplicar antes deste playbook.

## Playbook — 4 camadas defensivas

### Camada 1 — Rate limit Nginx (por IP real)

**Objetivo:** limitar requests por segundo por IP real do usuário, protegendo o Node.js de rajadas.

**Passo 1a — Criar zone compartilhada:**

```bash
ssh <host>
cat > /etc/nginx/conf.d/00-nextjs-ratelimit.conf << 'EOF'
# Rate limit compartilhado por todos os apps Next.js do servidor
# Mitiga bug conhecido do Next.js 16 SSR streaming (TransformStream/kState)
# e bot bombardier em geral.
#
# Zone por IP real (via CF-Connecting-IP + real_ip_module):
#   nextjs_ip: 5 req/s por IP, 10MB memória (~160k IPs simultâneos)
#
# Uso nos configs individuais:
#   location / {
#     limit_req zone=nextjs_ip burst=15 nodelay;
#     ...
#   }
limit_req_zone $binary_remote_addr zone=nextjs_ip:10m rate=5r/s;
limit_req_status 429;
EOF
nginx -t && systemctl reload nginx
```

**Ajuste de rate:** `5r/s` cobre a maioria dos usuários legítimos (que raramente passam de 3-4 req/s). Se o site tem SPA fazendo muitas chamadas API, considerar `10r/s`. Se apenas conteúdo estático, `2r/s` já bloqueia bots.

**Passo 1b — Aplicar em cada vhost Next.js:**

Automatizar via Python (já que muitos configs seguem padrão `location / {` multiline ou inline):

```bash
python3 << 'EOF'
import os, re, subprocess

CONFS = [ "site1", "site2", "site3", ... ]  # nomes sem .conf
RATE_LIMIT_MULTI = "        # Rate limit contra bot bombardier\n        limit_req zone=nextjs_ip burst=15 nodelay;\n"
RATE_LIMIT_INLINE = "limit_req zone=nextjs_ip burst=15 nodelay; "

for name in CONFS:
    p = f"/etc/nginx/conf.d/{name}.conf"
    if not os.path.exists(p): continue
    with open(p) as f: content = f.read()
    if "zone=nextjs_ip" in content:
        print(f"OK {name}: já protegido"); continue
    subprocess.run(["cp", p, f"{p}.bak-preratelimit"])
    # Padrão multi-line: 'location / {\n        if (...) { return 403; }?\n'
    new_content = re.sub(
        r"(location / \{\n)((?:        if \([^\)]+\) \{ return 403; \}\n)?)",
        r"\1\2" + RATE_LIMIT_MULTI,
        content,
    )
    if new_content == content:
        # Fallback pra padrão inline: 'location / { proxy_pass ...'
        new_content = re.sub(r"(location / \{ )", r"\1" + RATE_LIMIT_INLINE, content)
    if new_content == content:
        print(f"SKIP {name}: pattern não casou"); continue
    with open(p, "w") as f: f.write(new_content)
    print(f"PATCH {name}: +{new_content.count('zone=nextjs_ip')} location(s)")
EOF
nginx -t && systemctl reload nginx
```

**Descoberta de sites Next.js:** `pm2 list | grep next-` e/ou grep em `/etc/nginx/conf.d/*.conf` por `server 127.0.0.1:30`.

**NÃO aplicar em:**
- Sites que estão em Cloudflare Workers (só têm backend/API no VPS)
- Endpoints de webhook/API pública que precisam receber batch legítimo (ex: `/api/wp-json/`)
- Health check endpoints (`/health`) — colocar `access_log off` em location separada

### Camada 2 — Fail2ban ban automático

**Objetivo:** banir IPs que estouram rate limit repetidamente (não apenas 429 mas iptables drop).

**Editar `/etc/fail2ban/jail.d/qmix-hardening.local`** (ou criar `security-hardening.local`):

```ini
# Bane IPs que estouram rate limit do nginx (usa filter nginx-limit-req já existente)
[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
          /var/log/nginx/*-error.log
maxretry = 15
findtime = 300
bantime = 1800

# Recidive — bane repeat offenders por LONGO período em TODAS as portas
# Ex: mesmo IP banido 3x na última semana → ban 7 dias em iptables-allports
[recidive]
enabled = true
logpath = /var/log/fail2ban.log
banaction = iptables-allports
bantime = 604800
findtime = 604800
maxretry = 3
```

Aplicar: `fail2ban-client reload && fail2ban-client status`.

**Filter `nginx-limit-req` já vem com Fail2ban** (versão >= 0.10). Se não tiver, criar em `/etc/fail2ban/filter.d/nginx-limit-req.conf`:

```ini
[Definition]
ngx_limit_req_zones = [^"]+
failregex = ^\s*\[[a-z]+\] \d+#\d+: \*\d+ limiting requests, excess: [\d\.]+ by zone "(?:%(ngx_limit_req_zones)s)", client: <HOST>,
ignoreregex =
datepattern = {^LN-BEG}
```

**Ajuste dos números:**
- `maxretry=15 findtime=300`: 15 hits em 5 min → ban. Ajustar pra menos (5-10) em sites muito atacados.
- `bantime=1800`: 30 min inicial. `recidive` sobe pra 7 dias automático.
- Sempre monitorar com `fail2ban-client status nginx-limit-req` — se banir usuário legítimo, afrouxar.

### Camada 3 — Origin só-CF (impede bypass do Cloudflare)

Deve estar configurado já em cada vhost:

```nginx
location / {
    if ($cf_trusted = 0) { return 403; }
    ...
}
```

Onde `$cf_trusted` é definido em `/etc/nginx/conf.d/00-cf-realip.conf` como `geo $realip_remote_addr $cf_trusted { default 0; ... /* IPs CF */ }`.

**Se não existir:**
1. Copiar bloco `geo` da doc CF: https://www.cloudflare.com/ips-v4 / -v6
2. Adicionar `set_real_ip_from` + `real_ip_header CF-Connecting-IP` para cada range CF em `cloudflare.inc`
3. Aplicar `if ($cf_trusted = 0) { return 403; }` no location `/` de cada vhost

Sem isso, atacantes bypassam CF batendo direto no IP do VPS.

### Camada 4 — Cloudflare edge (a MAIS eficaz; funciona até sem VPS, ex: sites no Pages)

Bloqueia bots/flood ANTES de chegar na origem. Para sites estáticos no **Cloudflare Pages** (edge) é a ÚNICA camada aplicável — não há servidor pra "derrubar", só se protege a zona. Validado em produção em **450 zonas / ~13 contas** (29/07/2026, após ataque coordenado de flood: fnem levou 31M reqs/dia, 5,4M ameaças; nenhum site caiu).

**Tokens:** 1 por conta em `D:\SISTEMAS\Cloudflare\contas.json` (campo `token`, `account_id`). Para ver tráfego/ataque (GraphQL `httpRequests1dGroups`, `firewallEventsAdaptive`) precisa de token com **Analytics:Read** — o usuário fornece na hora, NÃO guardar em memória. Descobrir zona: `GET /zones?name=DOM` iterando os tokens até achar quem a edita.

### ⚠️ Ordem de regra: WAF e cache têm semânticas OPOSTAS

Confusão que já custou uma decisão errada (20/08/2026) e vale para toda zona:

| Ruleset | Semântica | Consequência prática |
|---|---|---|
| **WAF custom** (`http_request_firewall_custom`) | avaliação **para na PRIMEIRA regra que casa** | a regra mais permissiva tem que ficar **ACIMA** da mais restritiva, senão nunca é alcançada |
| **Cache Rules** (`http_request_cache_settings`) | **todas** as que casam se aplicam, e a **ÚLTIMA vence** | a exceção fica **ABAIXO** da regra genérica |

Transplantar a lição do cache para o WAF inverte o resultado. Exemplo concreto:
a genérica `block (not http.request.method in {"GET" "HEAD" "OPTIONS"})` bloqueia
POST. Um `skip` colocado **abaixo** dela para liberar um IP de publicação por API
**nunca é avaliado**: o POST casa com o block primeiro, a avaliação para ali, e
toda publicação toma 403. O `skip` tem que estar no topo.

Regra prática para o WAF: **skip e allow no topo, block depois.**

**REGRA #0 — NUNCA bloquear o Google** (mata ranking; um Googlebot que recebe 429/403 some da SERP). 1ª regra WAF custom de TODA zona (exceto `cliquex.click`, que não indexa) = `skip` de verified bot:

```bash
# expression: (cf.client.bot)  → verified bot validado por IP da CF, não falsificável por UA
# action: skip, pulando rate-limit + managed + security level + bot fight etc.
python3 - <<'EOF'
import json,urllib.request
T="<token da conta>"; ZID="<zone id>"
def req(p,m="GET",b=None):
    r=urllib.request.Request("https://api.cloudflare.com/client/v4"+p,data=json.dumps(b).encode() if b else None,
      method=m,headers={"Authorization":f"Bearer {T}","Content-Type":"application/json"})
    try: return json.load(urllib.request.urlopen(r,timeout=20))
    except urllib.error.HTTPError as e: return json.load(e)
SKIP={"action":"skip","action_parameters":{"ruleset":"current",
   "phases":["http_ratelimit","http_request_firewall_managed"],
   "products":["waf","rateLimit","securityLevel","bic","uaBlock","hot","zoneLockdown"]},
   "expression":"(cf.client.bot)","description":"ALLOW verified search bots (Googlebot/Bing) - nunca bloquear","enabled":True}
ep=req(f"/zones/{ZID}/rulesets/phases/http_request_firewall_custom/entrypoint")
rules=[r for r in (ep.get("result") or {}).get("rules",[]) if r.get("description")!=SKIP["description"]]
keep=[{k:v for k,v in r.items() if k in ("action","action_parameters","expression","description","enabled","ratelimit","logging")} for r in rules]
print(req(f"/zones/{ZID}/rulesets/phases/http_request_firewall_custom/entrypoint","PUT",{"rules":[SKIP]+keep}).get("success"))
EOF
```

Free = **máx 5 regras** WAF custom. Se já tem 5 e uma é `skip` (ex: WordPress "[WP] Bypass Admin"), ESTENDER essa (add `or (cf.client.bot)` na expressão + os `phases`/`products` acima) em vez de criar 6ª.

**WAF custom p/ site estático** (rede IPTV; NÃO usar em WordPress/cliente — quebra): (a) block `(not http.request.method in {"GET" "HEAD" "OPTIONS"})`; (b) block ferramentas de ataque + UA vazio (`sqlmap,nikto,nmap,masscan,nuclei,acunetix,wpscan,gobuster,dirbuster,httrack,semrush,ahrefs,mj12,dotbot,zgrab,python-requests,scrapy`); (c) block paths de exploit (`/wp-,xmlrpc,.env,.git,phpmyadmin,.sql,.php,/vendor/`). Skip do Google fica ACIMA.

**Outros settings por zona** (curl PATCH):
```bash
H="Authorization: Bearer $CF_TOKEN"
# Bot Fight Mode (exige token c/ Bot Management; token só-WAF dá erro 10405 — checar via GET)
curl -sX PATCH ".../zones/$ZONE/bot_management" -H "$H" -d '{"fight_mode":true}'
# Security level: medium (normal) | high (sob ataque) | under_attack (escudo extremo, 5s de fricção no humano — só flood pesado; Google passa blindado)
curl -sX PATCH ".../zones/$ZONE/settings/security_level" -H "$H" -d '{"value":"high"}'
curl -sX PATCH ".../zones/$ZONE/settings/browser_check" -H "$H" -d '{"value":"on"}'
```
**Rate-limit** (fase `http_ratelimit`, PUT entrypoint): 200 req/10s por IP → block. Googlebot já isento pela skip.

**Security headers** (Transform Rules, fase `http_response_headers_transform`, action `rewrite`, `expression:true`, funciona no Free): sempre seguros → `X-Frame-Options: SAMEORIGIN` + `Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=(), usb=()` + CSP. **CSP mínimo (qualquer site, não quebra nada)**: `frame-ancestors 'self'; object-src 'none'; base-uri 'self'`. **CSP completo (só template conhecido com inline scripts → precisa `'unsafe-inline'`)**: `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self'; object-src 'none'; base-uri 'self'`. Nunca aplicar CSP restritivo (script-src limitado) em site de cliente cuja estrutura você não conhece.

**Aplicação em massa:** iterar todos os tokens → coletar `{zone_id: (name, token)}` (dedup) → aplicar a regra por zona, pulando `cliquex.click`. Rodar em background (450 zonas × 2 calls demora). **Auditoria/validação:** `curl -A "Mozilla/5.0 (compatible; Googlebot/2.1)" https://DOM/` DEVE dar 200/301/302 — 429/403 = Googlebot bloqueado, corrigir. Ver memórias `cliquex-nunca-bloquear-google` e `cliquex-seguranca-playbook`.

## Validação pós-aplicação

**1. Sites continuam OK:**

```bash
# Extrair server_names e testar cada um
python3 << 'EOF'
import subprocess, re, os
sites = set()
for f in os.listdir("/etc/nginx/conf.d"):
    if not f.endswith(".conf"): continue
    with open(f"/etc/nginx/conf.d/{f}") as fp:
        for m in re.finditer(r"server_name\s+([^;]+);", fp.read()):
            for n in m.group(1).split():
                if n and "." in n and not n.startswith(("*", "_")):
                    sites.add(n)
counts = {}
for s in sorted(sites):
    r = subprocess.run(["curl","-s","-o","/dev/null","-w","%{http_code}","--max-time","6",f"https://{s}"], capture_output=True, text=True)
    counts[r.stdout.strip()] = counts.get(r.stdout.strip(), 0) + 1
print(f"Total: {len(sites)}")
for c, n in sorted(counts.items()): print(f"  {c}: {n}")
EOF
```

Esperado: 200/301/302/307/308 na maioria. 403/401 apenas em sites internos/protegidos por design.

**2. Fail2ban banindo:**

```bash
fail2ban-client status nginx-limit-req
# Ver "Currently banned" e "Total banned" — deve crescer se há bots ativos
```

**3. Reproduzir bug antes/depois (padrão do bug Next.js 16 SSR):**

```bash
# ANTES do fix: 300 requests concurrent gera N crashes
# DEPOIS do fix: 300 requests concurrent → primeiros 15 passam, resto 429
BASE="https://<seu-site>"
BEFORE=$(ssh <host> 'grep -c "transformAlgorithm" /root/.pm2/logs/<app>-error*.log')
for i in $(seq 1 60); do
  for url in "/rota-dinamica-1" "/rota-dinamica-2" "/rota-dinamica-3"; do
    curl -s -o /dev/null "$BASE$url?_rsc=t$i" &
  done
done
wait; sleep 3
AFTER=$(ssh <host> 'grep -c "transformAlgorithm" /root/.pm2/logs/<app>-error*.log')
echo "Delta: $((AFTER - BEFORE)) (esperado: 0)"
```

## Rollback

Todos os configs Nginx patcheados têm backup em `.bak-preratelimit`:

```bash
for f in /etc/nginx/conf.d/*.conf.bak-preratelimit; do
  cp "$f" "${f%.bak-preratelimit}"
done
rm /etc/nginx/conf.d/00-nextjs-ratelimit.conf
nginx -t && systemctl reload nginx
```

Reverter fail2ban: remover as jails `[nginx-limit-req]` e `[recidive]` do `qmix-hardening.local`, `fail2ban-client reload`.

## O que NÃO é

- **Não substitui fix de bug do código.** Se app tem bug tipo Next.js 16 SSR streaming, isso apenas mitiga o exploit — solução real é upgrade da dependência.
- **Não é DDoS protection** — CF Enterprise + Magic Transit fazem isso. Isso protege de bot scrapers e rajadas moderadas.
- **Não substitui WAF** — ModSecurity + OWASP CRS + Cloudflare WAF Managed Rules são camadas complementares.

## Referências de sucesso

- **srv1166087 (Hostinger VPS, 28/07/2026):** 18 sites Next.js protegidos, bug Next.js 16 `TransformStream/kState` mitigado, 32 IPs banidos automaticamente em 10 min, 0 downtime.
- Bug reproduzido pré-fix: 300 req concurrent → 165 crashes Node.js
- Pós-fix: 300 req concurrent → 0 crashes, bots recebem 429.

## Skills relacionadas

- `superpowers:systematic-debugging` — para investigar root cause antes de aplicar (obrigatório se ainda não sabe qual bug está sendo mitigado)
- `wordpress-master` — para sites WordPress (pattern QMIX)
- `seo-optimizer` — se rate limit puder afetar Googlebot legítimo
