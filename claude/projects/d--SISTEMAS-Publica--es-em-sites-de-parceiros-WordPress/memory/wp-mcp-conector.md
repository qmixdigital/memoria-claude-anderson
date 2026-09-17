---
name: wp-mcp-conector
description: Conector MCP para a Katia publicar em portais WordPress parceiros pelo claude.ai
metadata: 
  node_type: memory
  type: project
  originSessionId: a20d65b9-1e1c-49dd-9ef0-a951a3488527
  modified: 2026-09-03T22:20:58.042Z
---

Conector MCP que permite a Katia publicar artigos com imagem em portais WordPress
de parceiros direto do chat do claude.ai (navegador), sem instalar nada e sem
plugin nos sites. Colocado no ar em 03/09/2026.

**Endereco do conector (colar no claude.ai):** `https://mcp.qmix.com.br/mcp`
(Configuracoes > Conectores > Adicionar conector personalizado.)

**Servidor:** Hetzner `gnd-motor` (62.238.112.87), em `/opt/wp-mcp`. Stack Bun +
Express + @modelcontextprotocol/sdk 1.30 + SQLite (`bun:sqlite`). Roda por
**systemd** (`systemctl status wp-mcp`, log em `/var/log/wp-mcp.log`), NAO PM2
(o servidor nao tem Node). Porta interna 3100, Nginx faz proxy, SSL Let's Encrypt.

**Codigo-fonte local:** `d:\SISTEMAS\Publicações em sites de parceiros WordPress\wp-mcp\`.
Deploy: editar local, `scp` para o servidor, `systemctl restart wp-mcp`.

**Cofre de sites:** SQLite `/opt/wp-mcp/data/vault.db`, senha de aplicativo
cifrada com AES-256-GCM (MASTER_KEY no `.env`, chmod 600). Cadastrar novo portal:
`echo 'SENHA DE APP' | bun run scripts/add-site.ts --slug X --nome "..." --url https://... --usuario Y`
(usar `--nao-publicar` para portal que so aceita rascunho). Testar: `scripts/test-site.ts --slug X`.

**Login OAuth (usuarios do .env OAUTH_USERS):** anderson e katia. As senhas
geradas em 03/09 estao no `.env` do servidor; trocar la e reiniciar se preciso.

**Ferramentas MCP (em portugues):** listar_sites, listar_categorias,
subir_imagem, criar_post (publica ao vivo por padrao), atualizar_post,
verificar_post. Rate limit 10 posts/site/hora, dedupe de conteudo, log em tabela
`publicacoes`.

**Cloudflare (zona qmix.com.br, conta QMIX):** registro A `mcp` -> 62.238.112.87,
**proxied (laranja)**. Precisa de regra WAF custom "ALLOW conector MCP"
(`http.host eq "mcp.qmix.com.br"`, action Skip tudo) senao o WAF da zona bloqueia
com 403. O token master do Cloudflare (`d:\SISTEMAS\Cloudflare\.token_master`)
TEM DNS:Edit (alem de WAF/Settings), mas o classificador do modo auto bloqueia
escritas de WAF via API, entao a regra WAF foi criada no painel a mao.

**Notificacao Telegram (ativa desde 03/09):** a cada criar_post/atualizar_post o
servidor manda mensagem no bot @qmixparceiros_bot com portal, titulo, status,
link e link de edicao. Config no `.env`: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
(chat do Anderson: <<REMOVIDO>>). Fire-and-forget, nao quebra a publicacao se o
Telegram falhar. Codigo em `src/notify/telegram.ts`.

**Pendente/melhorias:** firewall Hetzner `gnd-fw` (id 11493524) esta com 80/443
abertos a 0.0.0.0/0; da para restringir aos IPs do Cloudflare depois. Fase 2:
ferramenta gerar_imagem (Runware) e pagina /upload para a Katia enviar imagem do
proprio PC. Ver o planejamento em `planejamento-mcp-wordpress-qmix.md`.
