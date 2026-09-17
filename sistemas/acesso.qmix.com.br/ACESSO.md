# ACESSO — sistema Antônio (acesso.qmix.com.br)

> ⚠️ Documento com credenciais reais. Manter privado.

## Servidor (VPS)

| Item | Valor |
|---|---|
| Alias SSH | `hostinger-vps-srv1166087` |
| Comando | `ssh hostinger-vps-srv1166087` (entra como **root**) |
| Host / IP | `srv1166087.hstgr.cloud` — IPv4 `31.97.173.40`, IPv6 `2a02:4780:66:6b6f::1` |
| Chave | `<<REMOVIDO>>` |
| IP de saída | `2a02:4780:66:6b6f::1` (IPv6) — relevante p/ allowlist dos receptores |
| Raiz do app | `/home/boot/web/acesso.qmix.com.br/public_html` (dono: user `boot`) |
| Logs de cron | `/var/log/antonio/<script>.log` + `_resend.log` |

Outros sites WordPress da rede também vivem neste servidor em `/home/boot/web/<dominio>/public_html` (ex: blog.coegoiania, drbrunoair, blog.cirurgiadojoelhogoiania, cirurgiadecolunagoiania).

## Banco de dados

| Item | Valor |
|---|---|
| Tipo | MySQL/MariaDB local |
| Host | `localhost` |
| Base | `boot_qmixmarketplac` |
| Usuário | `boot_qmixmarketplac` |
| Senha | `<<REMOVIDO>>` |
| Fonte | `codigo/includes/dbh.inc.php` (define `$conn` mysqli) |

> O **mysql CLI recusa essa senha** (caracteres `[ ! ]`). Para consultas use PHP:
> `ssh hostinger-vps-srv1166087 'cd /home/boot/web/acesso.qmix.com.br/public_html && php -r "require \"includes/dbh.inc.php\"; ...consulta com \$conn..."'`
> ou envie um `.php` por base64 e rode com `php arquivo.php`.

## Painel web

- URL: https://acesso.qmix.com.br
- Login: Google OAuth (`includes/google-login.inc.php`). Usuários na tabela `users` (227 registros).

## Bot de alertas Telegram

| Item | Valor |
|---|---|
| Bot | `@qmixdigital_bot` (também é o bot de healthcheck/integridade da rede) |
| Token | em `/opt/opengravity/.env` na VPS **opengravity** (`TELEGRAM_BOT_TOKEN`) e copiado p/ `/home/boot/.qmix-alert.env` no srv1166087 |
| Chat do Anderson | `<<REMOVIDO>>` (= 1º de `TELEGRAM_ALLOWED_USER_IDS`) |
| Config no servidor | `/home/boot/.qmix-alert.env` (`TG_TOKEN`, `TG_CHAT`), permissão 600 |

## Alertas de erro (e-mail — legado do Antônio)

- Dentro de `/usr/local/bin/qmix-cron-runner`: em falha de cron envia e-mail via **Resend** para `antoniovieiragti@gmail.com` (from `noreply@qmix.com.br`). A `RESEND_KEY` está hardcoded no runner.

## Crons (user `boot`)

- Ver `crontab -u boot -l`. ~30 entradas por minuto, todas via wrapper `/usr/local/bin/qmix-cron-runner`.
- Publicadores ativos: `article-transfer-qmix-news.php` (news_items), `article-transfer-scheduled.php` (seo_articles), `article-transfer.php`, `lc-article-transfer*.php`.
- Coleta/geração: `cron-fetch-news.php`, `cron-qmix-generate-articles.php`, `cron-img-article.php`, `cron-pedidos-*`.
- Manutenção: `cron-reset-wp-tentativas.php` (a cada 5 min, reprocessa artigos travados em tentativa>2).
- **Alerta Telegram (add 25/07/2026):** `*/10 * * * * qmix-cron-runner php cron-alert-publicacao.php`.

## Receptor em cada site WordPress (o "Antônio" no destino)

- Cada site da rede tem um mu-plugin receptor: `POST https://SITE/wp-json/<NS>/artigos`, header `X-API-KEY`.
- NS e chave por site: coluna `wp_sites.endpoint_url` (contém o NS) e `wp_sites.api_key` (**criptografada**).
- Descriptografar a chave real: `getWpApiKey($conn, $dominio)` em `codigo/<<REMOVIDO>>` (+ `cripto-dominio.php`). Nunca usar o valor bruto da coluna.
- Ferramentas de recuperação/instalação do receptor: `D:/SISTEMAS/MinhasHospedagens/antonio-recovery/` (template + scripts) e CSV oficial `qmix_endpoints_atual.csv`.

## Outras chaves de API (no código)

- `codigo/includes/config/secrets.php` e os helpers `deepseek-helper.php`, `gemini-helper.php`, `ideogram-helper.php`, `lc-image-processor.php` (Runware), etc. Também há chaves no `/opt/opengravity/.env` (Groq, OpenRouter, OpenAI, Tavily, Stripe, Twitter) — esse é do bot, não do painel.

## Snapshot deste handoff

- `codigo/` = fonte de 25/07/2026 (sem `uploads` 2.5G, `vendor` 257M, `logs`).
- `db/schema.sql` = estrutura das 49 tabelas. `db/config_data.sql` = dados de `wp_sites`, `news_sources`, `users`. `db/wp_sites_mapa.tsv` = mapa domínio→endpoint→status dos 119 sites. `db/tabelas_inventario.txt` = tamanhos.

## Correções e armadilhas medidas em 21/08/2026

**A função de descriptografia chama-se `decryptApiKey($valorCru)`**, não
`getWpApiKey($conn, $dominio)` como este documento dizia antes. Ela está em
`<<REMOVIDO>>` e faz AES-256-CBC com o IV prefixado no base64.
Par: `encryptApiKey($chaveClara)` para gravar de volta.

**`wp_sites.last_published_at` está abandonada.** Marca `2026-03-06` em 92 sites
e `NULL` em 31, o que faz a plataforma parecer morta desde março. A verdade está
em `news_items.wp_transferred_at`, que em 21/08/2026 registrava transferência às
17:06 do mesmo dia. O flag de sucesso é `wp_transfer = 2`, não 1; o mesmo vale
para `seo_articles.pw_transfer`.

**Como testar uma chave sem publicar nada:** POST com corpo `{}` no endpoint
cadastrado, com o header `X-API-KEY`. Chave boa devolve **400** pedindo title e
content; chave ruim devolve **401**. O receptor antigo do institutoortopedico
devolve **422** no lugar de 400, e isso também é aceitação.

**O receptor do Portal Engine identifica o site pela chave sozinha**
(`cfg.sites.find(s => timingSafeEq(s.apikey, key))`). O `ns` da URL não confere
identidade. Se a chave cadastrada aqui pertencer a outro portal da mesma
instância, o artigo publica **no portal errado com HTTP 201**. Ao trocar chaves,
conferir colisão antes.

**Conversão para Portal Engine invalida a chave cadastrada aqui.** A conversão
gera chave nova no portal e o cadastro fica para trás, dando 401 silencioso. Em
21/08/2026 havia 15 sites nesse estado, todos na `srv1166087`, corrigidos por
`/root/corrige_chaves.php` (alinha o cadastro à chave do portal, com backup do
valor anterior em `/home/boot/backup-wp_sites-apikey-<data>.json`).

### O 403 `forbidden_origin` de 12 sites WordPress

O mu-plugin receptor valida a origem por `<hash>_origins`, que continha apenas o
hostname `acesso.qmix.com.br`. Ele resolve esse nome com `gethostbynamel()` e
`dns_get_record(..., DNS_AAAA)` e compara com o IP da requisição.

**Como `acesso.qmix.com.br` está atrás do proxy da Cloudflare, o nome resolve
para IPs anycast da Cloudflare (104.26.x, 172.67.x, 2606:4700::), nunca para o
IP real de saída do servidor** (`31.97.173.40` / `2a02:4780:66:6b6f::1`). A
comparação não tem como casar, por IPv4 ou IPv6. Os 12 sites rejeitam a
plataforma desde que o painel foi para trás do proxy.

A saída barata é o próprio plugin: ele também aceita a origem pelo **cabeçalho
`Origin`** (`b2837355_origin_allowed()`, comparação por hostname). Enviar
`Origin: https://acesso.qmix.com.br` nas chamadas resolve os 12 de uma vez, sem
DNS e sem tocar em nenhum site remoto. Medido: 403 vira 400 nos 12, e a
varredura completa dos 117 sites ativos não regride nenhum.

Aplicar com `bash /root/patch_origin.sh` (insere o header nos 5 scripts de
transferência, com backup `.bak-origin-<data>` e `php -l` antes de manter).

Sobram dois casos fora desse escopo: `desentupidora.pro` devolve 403 do próprio
nginx, antes do WordPress, e `darkcyan-narwhal-224012.hostingersite.com` não
responde.
