---
name: cloudflare-painel-portugues
description: Usuário usa o painel Cloudflare em PORTUGUÊS — dar toda instrução de dashboard com os rótulos pt-BR
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4e6e74a4-cdf0-4d50-aa4e-ae7c023a9ac0
  modified: 2026-08-19T21:54:47.485Z
---

Sempre que eu passar ao usuário uma alteração pra ele fazer **no painel do Cloudflare** (criar/editar token, WAF, DNS, Redirect Rules, Settings, etc.), usar os **rótulos em PORTUGUÊS**, porque o painel dele está em pt-BR.

**Why:** ele pediu explicitamente (2026-08-19); instruções em inglês o fazem procurar itens que não existem com aquele nome na tela dele.

**How to apply:** traduzir os caminhos de menu e nomes de permissão. Mapa dos termos mais usados:
- My Profile → **Meu perfil**; Manage Account → **Gerenciar conta**; API Tokens → **Tokens de API**; Create Token → **Criar token**; Edit → **Editar**; Continue to summary → **Continuar para o resumo**; Save → **Salvar**.
- Permissions → **Permissões**; Zone Resources → **Recursos de zona**; Include → **Incluir**; All zones from an account → **Todas as zonas de uma conta**; Account Resources → **Recursos da conta**.
- Permissões usadas na rede: Zone·DNS·Edit → **Zona · DNS · Editar**; Zone·Zone Settings·Edit → **Zona · Configurações de zona · Editar**; Zone·Zone WAF·Edit → **Zona · WAF · Editar**; Zone·Dynamic Redirect·Edit → **Zona · Redirecionamento dinâmico · Editar**; Zone·Zone·Read → **Zona · Zona · Ler**; Account·Cloudflare Pages·Edit → **Conta · Cloudflare Pages · Editar**.
- Recursos do painel: Security→WAF→Custom rules → **Segurança → WAF → Regras personalizadas**; Rate limiting rules → **Regras de limitação de taxa**; Rules→Redirect Rules → **Regras → Regras de redirecionamento**; SSL/TLS → **SSL/TLS** (Full Strict = **Completo (estrito)**); DNS→Records → **DNS → Registros**; Bot Fight Mode → **Modo de combate a bots**.
