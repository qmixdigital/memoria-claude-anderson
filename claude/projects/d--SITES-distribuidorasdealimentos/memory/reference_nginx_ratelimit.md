---
name: nginx-rate-limit-shared-nextjs
description: Rate limit compartilhado + fail2ban jails aplicados a TODOS os apps Next.js do servidor srv1166087. Padronização de segurança implantada 28/07/2026.
metadata: 
  node_type: memory
  type: reference
  originSessionId: bf5f6c7b-623b-4092-bc48-366d1a308f25
  modified: 2026-07-28T19:11:13.627Z
---

Proteção de servidor contra bot bombardier + bug do Next.js 16 SSR streaming aplicada em nível global no VPS `hostinger-vps-srv1166087`.

## Arquitetura (3 camadas defensivas)

**Camada 1 — Rate limit Nginx (por IP real):**
- `/etc/nginx/conf.d/00-nextjs-ratelimit.conf` — zone compartilhada `nextjs_ip` (5r/s, 10MB memória)
- 18 configs Nginx patcheados com `limit_req zone=nextjs_ip burst=15 nodelay` no `location /`
- Sites protegidos: `app-facoqr`, `backlinkguard`, `clinicas`, `coegoiania`, `distribuidoras`, `encontreleiloes`, `enjai`, `facoqr`, `henrique`, `infobrasil`, `joelho`, `portuga`, `qmix`, `qmix-invest`, `qmiximoveis`, `setorenergetico`, `smspix`, `danfemax`
- IP real via `real_ip_module` + `CF-Connecting-IP` (todos os sites usam Cloudflare proxied)

**Camada 2 — Fail2ban ban automático:**
- Jail `nginx-limit-req` — 15 hits em 5 min → ban 30 min (`/etc/fail2ban/jail.d/qmix-hardening.local`)
- Jail `recidive` — IPs banidos 3x em 7 dias → ban 7 dias em ALL PORTS (`iptables-allports`)
- Além das jails pré-existentes: sshd, qmix-nginx-http-auth, qmix-wordpress

**Camada 3 — Origem só aceita Cloudflare:**
- Já estava configurada (`if ($cf_trusted = 0) { return 403; }`)
- Acesso direto ao IP 31.97.173.40 → 403

## Bug mitigado

`TypeError: controller[kState].transformAlgorithm is not a function` — bug interno Next.js 16 SSR streaming quando páginas dinâmicas recebem 50+ req concurrent (reproduzido em laboratório: 300 req concurrent → 165 crashes; após rate limit → 0 crashes).

Cliquex NÃO tem esse problema porque está no Cloudflare Workers (só o banco no VPS). Migrar distribuidoras + outros pra Workers exigiria refactoring gigante — rate limit + fail2ban é o mitigation adequado.

## Validação inicial (28/07/2026 19:10 UTC)

- 32 IPs banidos automaticamente em ~10 minutos (bots brasileiros, indianos, subnets Vodafone/Airtel)
- 3.089 failed attempts registrados
- Total logs Nginx antes: 6.180+ TransformStream crashes acumulados
- Após aplicar: 0 novos crashes durante testes de reprodução

## Não é fix do código

O bug do Next.js 16 continua existindo. Fix upstream requer upgrade `next-auth 5.0.0-beta.30` → versão estável, ou upgrade Next.js 16.2.1 → patch. Rate limit + fail2ban apenas impede que bots derrubem os processos Node.js.

## Cloudflare (edge, ainda não aplicado)

Token da conta distribuidoras no `CONEXAO.md` está expirado. Quando renovar, ativar via API:
- Bot Fight Mode ON (grátis, plano Free)
- Security Level = "high"
- Browser Integrity Check ON
- Rate limit rules (grátis 10k eventos/mês no plano Free)

Isso adicionaria Camada 4 (edge) — mais efetiva ainda, bloqueando antes de chegar ao VPS.

## Como verificar/manter

```bash
ssh hostinger-vps-srv1166087
grep -l "zone=nextjs_ip" /etc/nginx/conf.d/*.conf | wc -l  # esperado: 18+
fail2ban-client status nginx-limit-req  # ver IPs banidos ativos
fail2ban-client status recidive          # ver repeat offenders
```

Backups dos configs antes do patch em `/etc/nginx/conf.d/*.conf.bak-preratelimit`.
