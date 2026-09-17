---
name: antonio-endpoint-recovery
description: Sistema de receptor REST para a plataforma Antonio (transferência de artigos para WordPress da rede) - template + scripts em D:/SISTEMAS/MinhasHospedagens/antonio-recovery/
metadata: 
  node_type: memory
  type: reference
  originSessionId: 19f07376-a0e8-450d-a11d-4d4dee4e945b
  modified: 2026-07-25T12:27:46.131Z
---

# Receptor Antonio (transferência de artigos para WP da rede)

A plataforma do Antonio Vieira envia artigos via POST para endpoints REST WP customizados, um por site. Estrutura: `https://DOMAIN/wp-json/SLUG-api/v1/artigos` com header `X-API-KEY`. Cada site tem slug e key únicos.

**Mapeamento por site (FONTE OFICIAL):** `D:/SISTEMAS/MinhasHospedagens/qmix_endpoints_atual.csv` — colunas: `domain, endpoint_url, api_key`. Este é o CSV que o Antonio realmente usa.

⚠ **ATENÇÃO:** existem outros 2 CSVs que NÃO devem ser usados:
- `antonio_COMPLETO.csv` — tem 48 sites com slugs DIFERENTES do que o Antonio envia (slugs gerados pra uma migração que não completou). Usar este é o erro mais fácil — não use.
- `antonio_RESTAURADOS_22.csv` — sub-lista de 22 sites já restaurados anteriormente. Slugs coincidem com qmix_endpoints_atual.

Para extrair NS do `qmix_endpoints_atual.csv`: o slug está no endpoint_url. Ex: `https://gazetaalerta.com/wp-json/30e4-api/v1/artigos` → NS=`30e4-api/v1`.

**Tooling:** `D:/SISTEMAS/MinhasHospedagens/antonio-recovery/`
- `qmix-receiver-template.php` — mu-plugin com placeholders `__NS__` e `__APIKEY__`
- `gen_install_scripts.sh` — gera `install_HOST.sh` por hosting (anderson/qmix/vps1/hostverge)
- `validate_all.sh` — valida endpoints fazendo POST com API key real e dados de teste
- `site_hosting_mapping.txt` — `HOST|DOMAIN|NS|KEY` por site

**Incidente 02/jun/2026:** Antonio reportou 3 sites com 404 (blogse, diariopernambucano, jornaldobairroalto). Investigação mostrou que ~89 sites estavam sem o mu-plugin (haviam sido zerados acidentalmente). Restaurei 74 sites instalando o novo `qmix-receiver.php`. Outros 30 sites mantêm o mu-plugin antigo (`engine-XXXXXX.php`) que tem whitelist de IP — esses retornam 403 para meu IP mas funcionam normalmente para o IP do Antonio.

**Estado pós-recovery (74 OK novo + 30 OK antigo + adonline):**
- 105 sites WP funcionais
- 2 sites Next.js no CSV que NÃO recebem (devem sair): `setorenergetico.com.br`, `notebookx.com.br` (são apps Next no opengravity, não WordPress)

**Para reinstalar em mais sites:**
```bash
# 1. Gerar PHP customizado
NS="XXXX-api/v1"
KEY="hex_sha256"
sed -e "s|__NS__|$NS|g" -e "s|__APIKEY__|$KEY|g" \
  "D:/SISTEMAS/MinhasHospedagens/antonio-recovery/qmix-receiver-template.php" > /tmp/r.php

# 2. Upload + cache flush
cat /tmp/r.php | ssh HOST "cat > /path/to/site/wp-content/mu-plugins/qmix-receiver.php && wp --path=/path/to/site cache flush"

# 3. Validar
curl -X POST "https://DOMAIN/wp-json/$NS/artigos" \
  -H "X-API-KEY: $KEY" -H "Content-Type: application/json" \
  -d '{"title":"test","content":"<p>test</p>","status":"draft"}'
# Esperado: {"success":true,"post_id":N}
```

**Diferença receptor novo vs antigo:**
| Recurso | Novo (`qmix-receiver.php`) | Antigo (`engine-XXXXXX.php`) |
|---|---|---|
| API key | Plain text hardcoded | Criptografada em option |
| Origens permitidas | Não (qualquer IP) | Whitelist em option `XXXX_origins` |
| Tamanho | ~6 KB | ~12 KB |
| Painel admin | Não | Sim (em Configurações) |

Se quiser que o receptor novo aceite só IPs específicos, precisará adicionar verificação no `qmix_perm_check()`. Hoje aceita qualquer IP que envie X-API-KEY válida.

---

**SSH da plataforma:** alias `hostinger-vps-srv1166087` (entra como **root**), `31.97.173.40` / IPv6 `2a02:4780:66:6b6f::1`, chave `<<REMOVIDO>>`. scp/sftp NÃO funciona nesses hosts — transferir por base64. Banco `boot_qmixmarketplac` só conecta via PHP/mysqli (o mysql CLI recusa a senha por causa de `[ ! ]`).

**HANDOFF completo em `D:\SISTEMAS\acesso.qmix.com.br\`** (montado 25/07/2026 p/ o Anderson assumir o projeto num chat novo): `README.md` (arquitetura), `ACESSO.md` (SSH/DB/bot/crons/chaves), `codigo/` (fonte PHP, sem uploads/vendor), `db/` (schema das 49 tabelas + config_data + wp_sites_mapa.tsv). 236 PHPs na raiz; ~30 crons/min via `/usr/local/bin/qmix-cron-runner`.

**ALERTAS NO TELEGRAM (add 25/07/2026):** sistema Antônio agora avisa o Telegram do Anderson (bot **@qmixdigital_bot**, chat `<<REMOVIDO>>`) além do e-mail que ia só pro Antônio.
- Config: `/home/boot/.qmix-alert.env` (TG_TOKEN=token do @qmixdigital_bot copiado de opengravity:/opt/opengravity/.env, TG_CHAT=<<REMOVIDO>>), 0600.
- **Falha de cron:** patch no `qmix-cron-runner` (backup `.bak-20260725-121344`), envia no exit≠0, trava 30min/script via `/tmp/qmix-tgalert-<NAME>.ts`.
- **Erro de publicação:** `cron-alert-publicacao.php` (na raiz do app + cópia no handoff), cron `*/10`, agrupa por site + traduz erro; dedup por artigo na tabela **`qmix_alert_seen`** (avisa 1x só). Baseline `--seed` marcou 1240 erros antigos. Rodar como root funciona (user `boot` é nologin, mas o cron roda).
- **Caso publisherbrasil (25/07):** alerta pegou 32 artigos represados com `error code 522`. **Origem confirmada = `147.79.91.52` = servidor da anderson-gna (caído)** — publisherbrasil MORA na anderson-gna. Artigos NÃO se perdem: `cron-reset-wp-tentativas` (5min) + retry republicam quando a origem voltar. 522 = servidor do site no chão, não é bug do Antônio. Zona CF do publisherbrasil está numa conta dedicada (account `aee94c572dbdd045d2320f24a04bcaac`, salva como `conta28` no contas.json) mas o **token é limitado (DNS/settings só, sem WAF/Cache Rules)**; deu pra ligar Always Online + HSTS, não deu pra AI-bots/microcache. SSL do site está em `flexible`.

**A CHAVE DE CADA SITE vive na plataforma (srv1166087):** `/home/boot/web/acesso.qmix.com.br/public_html`, banco via `includes/dbh.inc.php` (constantes DB_HOST/USER/PASS/NAME), tabela **`wp_sites`** colunas `domain, endpoint_url, api_key, status`.

⚠️ **A coluna `wp_sites.api_key` está CRIPTOGRAFADA, não é plaintext.** O publicador a descriptografa com `getWpApiKey($conn, $domain)` (em `includes/wp-sites-helper.php` → `decryptApiKey()`) ANTES de enviar no header X-API-KEY. **Errei nisso 21/jul:** peguei o valor bruto da coluna (`ZHEY...==`) e salvei no receptor; meu teste manual passou (mandei o mesmo valor bruto), mas o cron mandava a versão descriptografada e dava `invalid_key`. **A chave real (a que o cron envia) = resultado de `getWpApiKey('dominio')`, NÃO o valor bruto da coluna.** Para pegá-la: script PHP no srv1166087 que faz `require dbh.inc.php; require wp-sites-helper.php; echo getWpApiKey(new mysqli(...), 'DOMINIO');` → dá o hex de 64 chars real. Salvar ESSE no receptor via `f9b8947b_encrypt()`.

**Forçar reenvio de conteúdo que falhou (DOIS fluxos, DUAS tabelas):**
- **`news_items`** (notícias) → publicador `article-transfer-qmix-news.php`, coluna `wp_transfer` (0=pendente,1=lock,2=ok), liga ao site por `news_sources.name` (ex: euvo = `source_id=165`).
- **`seo_articles`** (backlinks) → publicador `article-transfer-scheduled.php`, coluna `pw_transfer`, liga por `destination_link` (= domínio).
- Cron do user **boot** roda os 3 publicadores **a cada minuto** (`crontab -u boot -l`), LIMIT 1 por rodada. Ambos ignoram `wp_tentativa > 2` (artigo travado após 3 falhas) e `pw_transfer/wp_transfer <> 0`.
- **Reset para reenviar** (só não-publicados): `UPDATE news_items SET wp_transfer=0, wp_tentativa=0, wp_error='' WHERE source_id=<id> AND wp_transfer<>2 AND (wp_post_id IS NULL OR wp_post_id='') AND lixeira=0` e o equivalente em `seo_articles` (`pw_transfer`, `destination_link='dominio'`). O cron republica sozinho em minutos. **Corrigir a chave ANTES do reset**, senão re-trava em tentativa=3.

**Incidente 21/jul/2026 (euvo parou de receber, DOIS bugs somados):**
1. **403 forbidden_origin por IPv6.** O receptor `init-f9b8947b.php` (namespace `f9b8-api/v1`) tem allowlist na option `f9b8947b_origins` = `acesso.qmix.com.br`. Ele resolve o domínio por DNS e compara com o IP de quem envia (`CF-Connecting-IP` primeiro). O srv1166087 passou a conectar por **IPv6 `2a02:4780:66:6b6f::1`** (estável) quando o site-alvo ganhou AAAA via Cloudflare. O domínio `acesso.qmix.com.br` está **proxied no CF** (conta23, A=31.97.173.40), então resolve para IPs do CF, não para o IP real de saída. Fix: adicionar à allowlist o **IP real de saída** — tanto o IPv4 `31.97.173.40` quanto o IPv6 `2a02:4780:66:6b6f::1`. (Confirmar o IP de saída real com `ssh srv1166087 "curl -s https://api64.ipify.org"`.)
2. **401 no_key por AUTH_KEY trocado.** O receptor `init-f9b8947b` cifra a api_key na option `f9b8947b_api_key` com `AES-256-CBC`, chave = `sha256(AUTH_KEY)` (salt do wp-config). Se o **AUTH_KEY do wp-config muda** (rotação de salts, limpeza de invasão, etc), a descriptografia retorna vazio e o receptor rejeita tudo com "Nenhuma chave API configurada". Fix: pegar a chave plaintext da plataforma (wp_sites.api_key) e re-salvar re-cifrada: `wp eval "update_option('f9b8947b_api_key', f9b8947b_encrypt('<plaintext>'));"` — a função `f9b8947b_encrypt` re-cifra com o AUTH_KEY atual. Verificar com `f9b8947b_get_api_key() === plaintext`. Teste end-to-end: enviar POST do srv1166087 com a key e `{}` → **400 "Título e conteúdo são obrigatórios"** = auth OK (não 401/403).

⚠️ **NÃO usar `wp_sites.last_published_at` para medir atividade — é do sistema ANTIGO, descontinuado.** A plataforma migrou em fev-março/2026 de um sistema (tabelas `orders`, `order_items`, `wp_sites.last_published_at`, `lc_articles` — todas paradas desde fev-mar) para o sistema ATIVO **`seo_articles`**. Olhar a tabela velha dá o falso alarme de "117 sites parados desde 06/03". O sistema real está saudável: em 14 dias, **5.287 publicações com sucesso (pw_transfer=2) vs ~20 erros**.

**Como diagnosticar a saúde real do Antônio (sistema seo_articles):**
- Tabela **`seo_articles`** no mesmo banco. Colunas-chave: `destination_link` (= domínio de publicação), `pw_transfer` (0=pendente, 2=sucesso), `wp_post_id`, **`wp_error`** (erro exato da publicação), `wp_tentativa`, `scheduled_at`.
- Erros por site: `SELECT destination_link, wp_error, COUNT(*) FROM seo_articles WHERE created_at>'DATA' AND wp_error<>'' GROUP BY ...`.
- Padrões de `wp_error`: `no_key`/`invalid_key` = problema de chave (AUTH_KEY mudou, ver acima); `<!DOCTYPE html>` = challenge/WAF do Cloudflare (esporádico é normal; sistemático = hardening quebrou); `error code: 522/502` = origem down (site parked).
- Cron ativo: `cron_logs`, `api_usage_logs`, `import_logs` — se têm linhas de hoje, a plataforma está rodando.

**Incidente euvo confirmado resolvido (21/jul/2026):** os 16 erros dos últimos 21 dias eram TODOS do euvo (os 2 bugs: IPv6 + AUTH_KEY). Após corrigir, teste real do srv1166087 → euvo criou post com `{"success":true,"post_id":N}`. Outros sites (ebookcult, ocontraditorio, gazetaretina) tinham 70+ sucessos e 0-2 erros = ruído normal, hardening NÃO os quebrou.
