---
name: cf_user_token_master
description: Token de usuário Cloudflare com acesso amplo (77 contas / 326 zonas) — onde está guardado e como usar
metadata: 
  node_type: memory
  type: reference
  originSessionId: fbc8d0f3-4277-48dc-a3a3-f65d9a464b49
  modified: 2026-07-28T12:02:55.671Z
---

O Anderson forneceu (2026-07-28) um **token de usuário Cloudflare** (`cfut_...`, prefixo de User API Token, não `cfat_` de conta) com acesso a **77 contas / 326 zonas** — cobre praticamente toda a rede dele.

- **Guardado em:** `d:\SISTEMAS\Cloudflare\.env` como `CF_USER_TOKEN` (não colar o valor bruto em mensagens nem em arquivos de memória).
- **Uso:** para localizar/gerir zonas em qualquer conta acessível sem depender dos tokens `cfat_` por-conta do `contas.json`. Query global de zona: `GET /zones?name=<dominio>` (sem `account.id`, o token já varre todas as zonas visíveis).
- **Propagado para a VPS:** virou o token de `conta11` e `conta25` no `/opt/cf-bot/contas.json` (backup `.bak2-20260728`) — resolveu contas que antes eram WAF-only e não localizavam zonas. Ver [[project_tokens_limitados]].
- **Limite conhecido:** NÃO cobre 100% — ex.: `educacaoeciencia.net.br` está no Cloudflare mas numa conta fora das 77 desse token. Para essas, ainda precisa do token da conta específica.
