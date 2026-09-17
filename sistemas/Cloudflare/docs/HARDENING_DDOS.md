# Hardening DDoS — Pacote de Segurança Cloudflare

Pacote padronizado de configurações de segurança aplicado em sites para reduzir risco de DDoS e ataques de concorrentes.

Origem: configuração do `lepur.com.br`, refinada e replicável.

## Como aplicar em novo(s) site(s)

```bash
# Em 1 zona
python harden_site.py exemplo.com.br

# Em várias
python harden_site.py site1.com.br site2.com.br site3.com.br
```

O script é idempotente — pode rodar várias vezes sem duplicar regras (checa por descrição antes de criar).

## O que é aplicado

### Settings de SSL/TLS
| Setting | Valor |
|---------|-------|
| SSL Mode | Full (Strict) |
| TLS minimum | 1.2 |
| TLS 1.3 | ON |
| Always Use HTTPS | ON |
| Opportunistic Encryption | ON |
| Automatic HTTPS Rewrites | ON |
| HSTS | 1 ano, includeSubDomains, preload, nosniff |

### Settings de Segurança
| Setting | Valor |
|---------|-------|
| Security Level | HIGH |
| Browser Integrity Check | ON |
| Email Obfuscation | ON |
| DNSSEC | ATIVADO |

### Settings de Performance
| Setting | Valor |
|---------|-------|
| 0-RTT | ON |
| Early Hints | ON |
| Always Online | ON |
| Brotli | ON |
| HTTP/3 | ON |

### 5 WAF Custom Rules (limite do Free)
1. **Block AI bots** — Bloqueia ~50 user agents de IA (ChatGPT, Claude, GPTBot, Perplexity, etc.) exceto em `/robots.txt`. Expression em [ai_bots_expression.txt](../ai_bots_expression.txt).
2. **Block arquivos sensíveis** — `.env`, `.git`, `wp-config.php`
3. **Block threat_score > 30** — IPs com pontuação alta de ameaça (Cloudflare ML)
4. **Managed Challenge em rotas críticas** — `/admin`, `/wp-admin`, `/wp-login`, `/login`
5. **Block sem User-Agent** — Bots maliciosos costumam não enviar UA

### 1 Rate Limit Rule
- 5 requests/10s em `/admin`, `/login`, `/wp-login.php` → bloqueia por 10s
- Característica: `ip.src + cf.colo.id` (bloqueio por IP + datacenter)

## Limites do plano Free

| Recurso | Free | Pro+ |
|---------|------|------|
| WAF Custom Rules | **5** (atingido) | 25 |
| Rate Limit período | Fixo 10s + timeout 10s | 10s/1min/10min flexível |
| Bot Fight Mode | ❌ | ✅ |
| Super Bot Fight Mode | ❌ | ✅ |
| Managed WAF Rules (OWASP) | ❌ | ✅ |
| WAF Managed Rules (Cloudflare) | ❌ | ✅ |
| Adaptive DDoS Protection (ML) | ❌ | ❌ (só Enterprise) |

## O que JÁ vem grátis no Free (sem ação)

- ✅ **Proteção DDoS L3/L4 ilimitada** (TCP/UDP floods)
- ✅ **DDoS L7 básica** com regras automáticas Cloudflare
- ✅ **Under Attack Mode** disponível sob demanda (acionar manualmente durante ataque ativo)

## Sob ataque ativo

Se um site está sob ataque DDoS ativo:
1. Acessar painel Cloudflare → Security → Settings
2. Ativar **"I'm Under Attack Mode"** (mostra desafio JS pra todo visitante por ~5s antes de servir o site)
3. Após o ataque cessar, desativar (impacta UX)

## Sites já hardened

Lista mantida em [sites_hardened.txt](../sites_hardened.txt).

## Reverter

Se precisar desfazer um endurecimento (ex: para testar algo):
1. WAF rules: deletar manualmente no painel ou via API
2. HSTS: cuidado — visitantes que já receberam o header terão HSTS ativo por 1 ano no navegador. Desativar HSTS no Cloudflare não remove a regra cacheada localmente.
3. DNSSEC: pode desativar via API ou painel

## Referências

- [Cloudflare DDoS Protection](https://developers.cloudflare.com/ddos-protection/)
- [WAF Custom Rules](https://developers.cloudflare.com/waf/custom-rules/)
- [HSTS Preload List](https://hstspreload.org/)
