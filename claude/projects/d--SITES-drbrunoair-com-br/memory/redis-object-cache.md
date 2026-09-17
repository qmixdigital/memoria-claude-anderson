---
name: redis-object-cache
description: Blog WordPress do drbrunoair usa Redis Object Cache no DB5 isolado (servidor compartilhado)
metadata: 
  node_type: memory
  type: project
  originSessionId: 3874aa23-e226-4938-ad73-5439794c0174
---

O blog WordPress (`/blog`) do drbrunoair.com.br usa o plugin **Redis Object Cache** (Till Krüss) habilitado em 2026-06-19.

- **Redis DB = 5** (isolado) — o servidor srv1166087 é compartilhado: DB0 = blog.coegoiania, DB3 = outro site (~10k chaves). Escolhido DB5 livre para evitar colisão.
- **Prefixo de chave** `WP_CACHE_KEY_SALT = 'drbrunoair_'` — constantes Redis ficam num bloco em `wp-config.php` (inserido antes do check `ABSPATH`; o wp-config não tem a âncora padrão do wp-cli, então `wp config set` falha — editar manualmente).
- Page cache continua sendo o **LiteSpeed Cache**; o Redis cobre só object cache. Ganho medido: TTFB do blog de ~1.0-1.25s → ~0.6s.
- Flush isolado: `redis-cli -n 5 FLUSHDB`. Nunca usar `FLUSHALL` (apaga os outros sites).
- WordPress core 7.0 e todos os plugins já estavam na última versão nessa data — nada a atualizar.

Ver [[hospedagem]] para acesso ao servidor.
