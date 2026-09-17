---
name: api-editor-mcp-jean
description: API do editor (editor.qmix.com.br/api) e ferramentas MCP para o Jean mandar artigos pelo chat sem abrir o painel
metadata:
  type: project
---

Desde 15/09/2026 existe uma API com chave em `editor.qmix.com.br/api/`
(`api/index.php`, chaves em `/opt/qmix/env/api-editor.env`, formato
`API_CHAVES=chave:lc_user_id`). Ela grava em `lc_articles` como `approved`
e a cron de transferencia publica, entao vale para WordPress e portal-engine.
O conector MCP `wp-mcp` (gnd-motor, `/opt/wp-mcp`, systemd `wp-mcp`) ganhou
um modo "editor": usuario OAuth listado em `EDITOR_API_USERS` ve so as
ferramentas da API, nunca o cofre WordPress. Jean = lc_user 6, usuario OAuth
`jean`.

**Why:** o Jean publicava direto no WP como parceiro; com os sites migrando
para HTML (portal-engine) a unica porta que chega a todos os 42 dominios dele
e a fila do sistema Antonio.

**How to apply:** passo a passo e rotas em `OPERACOES.md` (secao "API do
editor e MCP do Jean"). Cloudflare Super Bot Fight Mode bloqueia a API vinda
de servidor: precisa da regra de skip descrita la (mesma da
`mcp.qmix.com.br`). Ver [[faturamento-editores-asaas]] para o padrao de
segredos em `/opt/qmix/env`.
