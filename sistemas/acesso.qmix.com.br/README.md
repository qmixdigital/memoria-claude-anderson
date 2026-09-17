# Sistema Antônio — plataforma acesso.qmix.com.br

Handoff completo do sistema de geração/distribuição de artigos da rede QMIX (o "sistema do Antônio"). Este pacote existe para permitir assumir o projeto e trabalhar a partir dele num chat novo.

- **URL do painel:** https://acesso.qmix.com.br (login via Google)
- **Servidor:** VPS Hostinger `srv1166087.hstgr.cloud` (31.97.173.40) — ver [ACESSO.md](ACESSO.md)
- **Código:** [codigo/](codigo/) (fonte PHP completa, 236 arquivos na raiz + includes + libs)
- **Banco:** [db/](db/) (schema das 49 tabelas + dados de config + inventário)
- **Autor original:** Antônio Vieira (antoniovieiragti@gmail.com)

> ⚠️ **Este pacote contém credenciais reais** (senha do banco em `codigo/includes/dbh.inc.php`, chaves de API em `codigo/includes/config/secrets.php` e afins). Tratar como sensível.

---

## O que o sistema faz

É uma plataforma PHP (sem framework, mysqli puro) que:

1. **Coleta notícias** de fontes RSS/scraping (`news_sources` → `news_items`) via `cron-fetch-news.php`.
2. **Gera/reescreve artigos** com IA (DeepSeek/Gemini/OpenAI) — `article-redactor.php`, `cron-qmix-generate-articles.php`.
3. **Gera imagens** (Runware/Ideogram/Pollinations) — `cron-img-article.php`.
4. **Publica nos sites WordPress da rede** enviando via REST para um mu-plugin receptor em cada site (o "Antônio"). Duas filas:
   - `news_items`  → publicador `article-transfer-qmix-news.php` (coluna `wp_transfer`)
   - `seo_articles` → publicador `article-transfer-scheduled.php` (coluna `pw_transfer`, backlinks agendados)
   - `article-transfer.php` / `lc-article-transfer*.php` — variações/legado.

### Fluxo de publicação (o núcleo)

```
Painel/cron gera artigo  ->  linha em news_items / seo_articles (transfer=0)
        cron (user boot, ~a cada minuto) pega LIMIT 1 pendente
        -> decripta a chave do site: getWpApiKey($conn, dominio)  [<<REMOVIDO>> + cripto-dominio.php]
        -> POST https://SITE/wp-json/<NS>/artigos  header X-API-KEY: <chave>
        -> sucesso: transfer=2, grava wp_post_id | falha: grava wp_error, wp_tentativa++
```

- A chave de cada site vive **criptografada** em `wp_sites.api_key`. NUNCA usar o valor bruto: passar por `getWpApiKey()` que descriptografa. O receptor no site recifra com `sha256(AUTH_KEY do wp-config)`.
- O NS (namespace REST) de cada site está no `wp_sites.endpoint_url` (ex: `.../wp-json/30e4-api/v1/artigos` → NS `30e4-api/v1`).
- Crons ignoram artigos com `wp_tentativa > 2` (travados após 3 falhas). `cron-reset-wp-tentativas.php` reseta periodicamente para reprocessar.

### Crons (user `boot`, quase todos por minuto)

Rodam via wrapper `/usr/local/bin/qmix-cron-runner <php> <script>`, que:
- executa, loga em `/var/log/antonio/<script>.log`
- em falha (exit≠0): envia e-mail via Resend para o Antônio **e** (desde 25/07/2026) alerta no Telegram (ver abaixo)

Ver a crontab completa em [ACESSO.md](ACESSO.md).

---

## Sistema de alertas no Telegram (adicionado 25/07/2026)

Alertas do sistema passam a chegar no Telegram do Anderson (**@qmixdigital_bot**, chat `<<REMOVIDO>>`), além do e-mail que já ia pro Antônio.

| Alerta | Arquivo | Frequência | Anti-spam |
|---|---|---|---|
| **Falha de cron** (exit≠0) | patch em `/usr/local/bin/qmix-cron-runner` | na hora | 1 aviso por script / 30 min (`/tmp/qmix-tgalert-<NAME>.ts`) |
| **Erro de publicação** (wp_error) | `codigo/cron-alert-publicacao.php` | cron a cada 10 min | cada artigo 1x só (tabela `qmix_alert_seen`) |

- Config do bot: `/home/boot/.qmix-alert.env` no servidor (`TG_TOKEN`, `TG_CHAT`), permissão 600.
- O token é o mesmo do bot @qmixdigital_bot (fonte: `/opt/opengravity/.env` na VPS opengravity).
- Baseline: 1.240 erros pré-existentes foram marcados como vistos (`php cron-alert-publicacao.php --seed`), então só chegam erros novos.
- Backup do runner antes do patch: `/usr/local/bin/qmix-cron-runner.bak-20260725-121344`.

Para desligar: remover a linha do crontab do boot + reverter o runner pelo `.bak`.

---

## Tabelas principais (banco `boot_qmixmarketplac`)

Ver [db/tabelas_inventario.txt](db/tabelas_inventario.txt) para tamanhos. Destaques:

| Tabela | Papel |
|---|---|
| `wp_sites` (119 linhas) | sites da rede: domínio, endpoint_url, **api_key criptografada**, status |
| `news_sources` (232) | fontes de notícia (RSS/scraping), mapeia `source_id` |
| `news_items` (1.2k) | notícias coletadas, fila de publicação (`wp_transfer`, `wp_error`) |
| `seo_articles` (13k) | artigos/backlinks agendados (`pw_transfer`, `destination_link`, `wp_error`) |
| `cron_logs` (195k) | log de execução dos crons |
| `api_usage_logs` (105k) | uso das APIs de IA |
| `qmix_alert_seen` | dedup dos alertas Telegram (criada 25/07/2026) |

> ⚠️ **Não** usar `wp_sites.last_published_at` nem as tabelas `orders`/`order_items`/`lc_articles` para medir atividade — são do sistema ANTIGO, descontinuado desde fev-mar/2026. O sistema ATIVO é `seo_articles` + `news_items`.

---

## Como retomar num chat novo

1. SSH: `ssh hostinger-vps-srv1166087` (root — ver ACESSO.md).
2. Código vivo: `/home/boot/web/acesso.qmix.com.br/public_html/` (a cópia em `codigo/` é snapshot de 25/07/2026).
3. Banco: conectar com as credenciais de `codigo/includes/dbh.inc.php` **via mysqli/PHP** (o mysql CLI recusa a senha por causa dos caracteres especiais; use um `php -r` que dê `require dbh.inc.php`).
4. Diagnóstico de saúde: `SELECT destination_link, wp_error, COUNT(*) FROM seo_articles WHERE wp_error<>'' GROUP BY 1,2` e equivalente em `news_items`.
