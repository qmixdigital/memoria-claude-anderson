# Nginx — instruções de instalação na VPS

Vhost dedicado de QMIX Invest. Domínio: `qf.qmix.digital` — privado, atrás de Cloudflare proxy, com Basic Auth + noindex.

**SSL strategy:** Cloudflare Origin Certificate (15 anos, free) + SSL/TLS mode "Full (strict)" no Cloudflare. **Não usa Let's Encrypt** porque o proxy do Cloudflare interfere com o challenge HTTP-01.

## Etapa A — Gerar Cloudflare Origin Certificate (no painel Cloudflare)

1. Acessar https://dash.cloudflare.com → selecionar zona `qmix.digital`
2. **SSL/TLS → Overview → Mode = Full (strict)** (importante! sem isso o Cloudflare aceita qualquer cert do origin)
3. **SSL/TLS → Origin Server → Create Certificate**
   - Hostnames: `qf.qmix.digital`
   - Key type: `RSA (2048)` (ou ECC se preferir, mas RSA é mais compatível)
   - Validity: **15 years** (default, mais conveniente)
   - Click **Create**
4. **Copiar AGORA** o conteúdo das duas caixas:
   - Origin Certificate (começa com `-----BEGIN CERTIFICATE-----`)
   - Private Key (começa com `-----BEGIN PRIVATE KEY-----`)
   - **Atenção:** quando você clicar "OK" a Cloudflare nunca mais mostra a private key. Salve em local seguro.

## Etapa B — Instalar cert na VPS srv1166087

```bash
# Como root
mkdir -p /etc/ssl/qmix-invest
chmod 750 /etc/ssl/qmix-invest

# Cole o Origin Certificate (com nano, vim, ou EOF)
nano /etc/ssl/qmix-invest/origin.pem
# Cole conteúdo, salve (Ctrl+X, Y, Enter)
chmod 644 /etc/ssl/qmix-invest/origin.pem

# Cole a Private Key
nano /etc/ssl/qmix-invest/origin.key
# Cole conteúdo, salve
chmod 600 /etc/ssl/qmix-invest/origin.key
chown root:root /etc/ssl/qmix-invest/origin.key
```

## Etapa C — Instalar o vhost

```bash
# Na VPS, como root
cp /opt/qmix-invest/nginx/qmix-invest.conf /etc/nginx/conf.d/qmix-invest.conf

# Testa a config sem aplicar
nginx -t

# Se OK, reload (NUNCA restart — restart pode causar drop de conexões dos outros sites)
systemctl reload nginx
```

## Etapa D — Criar credenciais HTTP Basic Auth

```bash
# Instala apache2-utils se não tiver
apt install -y apache2-utils

# Cria o arquivo com seu primeiro usuário (substitua <usuario> pelo seu)
htpasswd -c /etc/nginx/.htpasswd-qmix-invest <usuario>
# Vai perguntar a senha duas vezes

# Restringe leitura ao processo do nginx
chown www-data:www-data /etc/nginx/.htpasswd-qmix-invest
chmod 640 /etc/nginx/.htpasswd-qmix-invest

# Para adicionar mais usuários depois (sem -c):
# htpasswd /etc/nginx/.htpasswd-qmix-invest <outro_usuario>
```

## Etapa E — Reload final e verificação

```bash
nginx -t && systemctl reload nginx

# Sem credenciais — deve dar 401
curl -i https://qf.qmix.digital/

# Com credenciais — deve dar 200 (após deploy.sh, claro)
curl -i -u <usuario>:<senha> https://qf.qmix.digital/

# /api/health é público (usado pelo deploy.sh) — deve dar 200 sem auth
curl -i https://qf.qmix.digital/api/health

# robots.txt — deve retornar Disallow: /
curl https://qf.qmix.digital/robots.txt
```

## Atualizar a config no futuro

```bash
cd /opt/qmix-invest && git pull
diff /etc/nginx/conf.d/qmix-invest.conf nginx/qmix-invest.conf
cp nginx/qmix-invest.conf /etc/nginx/conf.d/qmix-invest.conf
nginx -t && systemctl reload nginx
```

## Camadas de segurança ativas

| Camada | Onde está |
|---|---|
| Cloudflare proxy (laranja) | esconde IP origem, DDoS protection, WAF |
| Subdomínio opaco (`qf`) | DNS — você escolheu |
| Cloudflare SSL Full (strict) | edge ↔ origem com cert validado |
| Cloudflare Origin Cert (15 anos) | `/etc/ssl/qmix-invest/origin.{pem,key}` |
| HTTP Basic Auth | `location /` no vhost + `/etc/nginx/.htpasswd-qmix-invest` |
| `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` | header de resposta |
| `robots.txt` Disallow: / | servido pelo Nginx |
| Bloqueio por User-Agent (Googlebot, AhrefsBot, etc.) | `if ($http_user_agent ...)` |
| (Opcional) Whitelist de IPs | comentado no vhost |
| (Opcional) CF Authenticated Origin Pulls | comentado no vhost — mTLS entre CF e origem |

## Endpoints sem auth (intencionalmente)

- `/api/health` — usado pelo `verify-other-sites.sh`, status público (sem dados sensíveis)
- `/api/telegram/webhook` — Telegram não passa credenciais; segurança via `secret_token` validado em código (Phase 4)

## Hardening adicional opcional (Cloudflare dashboard)

- **Always Use HTTPS:** ON (CF redireciona HTTP→HTTPS antes mesmo de chegar na origem)
- **Automatic HTTPS Rewrites:** ON
- **Minimum TLS Version:** 1.2
- **HSTS:** ON com `max-age >= 6 months` (faz browsers cravarem HTTPS)
- **Rules → WAF Custom Rules:** bloquear países/ASNs se quiser
- **Rules → Security → Bot Fight Mode:** ON (bloqueia bots não-listados)
