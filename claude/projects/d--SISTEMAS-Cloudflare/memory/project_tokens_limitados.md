---
name: project-tokens-limitados
description: "Contas CF cujo token só tem permissão de WAF/Firewall (sem Zone Settings, DNS/DNSSEC, nem Leaked Credentials)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 7b5fb01c-7a66-4d11-9626-4adca9d96e91
  modified: 2026-07-28T11:52:09.360Z
---

Os tokens das contas Cloudflare **conta7** e **conta11** têm escopo **limitado**: conseguem editar WAF custom rules e rate limit, mas **NÃO** conseguem alterar Zone Settings (SSL/TLS/HSTS), DNSSEC, nem ativar Leaked Credentials Detection (endpoint retorna erro 10000 "Authentication error").

**ATUALIZAÇÃO 2026-07-19:** a conta **teste** (account_id a2da896a380bdec758c4ac2cc3078713) recebeu token novo com permissão de **Redirecionamento único / Conjuntos de regras / Zona Lido** — agora faz redirects normalmente (usado p/ enlaw.com.br → revan). Não é mais WAF-only para redirects. (Zone Settings/DNSSEC nessa conta não foram reverificados.)

**ATUALIZAÇÃO 2026-07-28:** o token novo da conta **teste** (`cfat_k4TGihg...`) foi sincronizado também para o `/opt/cf-bot/contas.json` da VPS (backup .bak-20260728) — o bot antes usava o token antigo WAF-only e não localizava as ~12 zonas da conta teste. Ainda **faltam tokens de redirect** para **conta11** e **conta25** (token idêntico local e VPS, negam leitura de zona): 10 domínios da rede funnel ficam sem redirecionar até o Anderson gerar tokens novos (Conta>Conjuntos de regras>Editar + Zona>Zona>Lido + Zona>Redirecionamento único>Editar, todas as zonas). Ver [[cf_token_permissions]].

Tokens **completos**: contas **principal** e **conta3** (settings 14/14 + HSTS + DNSSEC + leaked-cred OK).

**Why:** descoberto ao rodar `harden_site.py` nos domínios do alerta StealC (jun/2026) — fenec/sysportal (teste), vistation (conta7), uniprimebr (conta11) ficaram `settings=0/14 HSTS=X DNSSEC=X` mas `WAF=5/5 RL=OK`.

**How to apply:** ao endurecer zonas dessas 3 contas, o pacote WAF+rate-limit aplica, mas SSL/HSTS/DNSSEC e leaked-cred detection precisam que o usuário amplie o escopo do token no painel (adicionar Zone Settings Edit, DNS Edit, e a permissão de Leaked Credentials). Relacionado: [[project-cf-token-permissions]].
