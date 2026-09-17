---
name: reference_cloudflare_api_hardening
description: "API do Cloudflare está em D:/SISTEMAS/cloudflare (27 contas em contas.json, tokens cfat_*). harden_site.py aplica WAF anti-bot (AI crawlers, threat, sem-UA) + SSL/HSTS/DNSSEC. Armadilha: SSL strict quebra site com cert de origem inválido (526)."
metadata:
  node_type: memory
  type: reference
  originSessionId: 275c97d9-ef2f-4298-a595-74a3b5880cd9
  modified: 2026-07-28T21:09:13.599Z
---

**API do Cloudflare da rede: `D:/SISTEMAS/cloudflare/`.**
- `contas.json` = 27 contas CF, cada uma `{nome, account_id, token: cfat_*}`. NUNCA expor token.
- `harden_site.py <dominio> [...]` = localiza a zona entre as 27 contas e aplica o pacote. `harden_conta.py` = conta inteira. `cf_redirects.py` = Single Redirect Rules.
- `ai_bots_expression.txt` = expressão WAF que bloqueia ~30 crawlers de IA (GPTBot, ClaudeBot, Claude-User, Bytespider, CCBot, PerplexityBot, Applebot, meta-externalagent, etc), **exceto** `/robots.txt`.
- `sites_hardened.txt` = lista dos já feitos (124+); atualizar à mão após cada run.
- Deps: `requests` (já instalado). Rodar com `python3` no ambiente.

**`harden_site.py` aplica:** SSL strict, TLS 1.2+, Always HTTPS, HSTS 1a+preload, DNSSEC, Security Level HIGH, http3/brotli/0rtt, **5 WAF Custom Rules** (limite do plano Free): AI bots block, .env/.git/wp-config block, threat_score>30 block, managed_challenge em admin/login, sem-User-Agent block; **Rate Limit** 5req/10s em /admin /login /wp-login.php.

⚠️ **ARMADILHA SSL — derrubei o qmiximoveis por ~1min (19/07/2026).** O script põe SSL em **`strict`** (Full Strict), que exige cert de origem válido/CA-assinado. O qmiximoveis tinha cert de origem inválido → **HTTP 526 para todos, inclusive navegador**. Fix: `PATCH /zones/{zid}/settings/ssl {value:'full'}` (full criptografa mas não valida o cert de origem). Voltou em segundos. Os 124 anteriores não quebraram porque tinham cert válido. **Ao rodar em site novo, testar a home logo após e reverter SSL para `full` se der 525/526.**

⚠️ **Antes de rodar num site que RECEBE do Antônio:** a regra "sem-User-Agent block" derruba requisição sem UA. Se o cliente do Antônio publicar sem UA, o REST dele apanha. As regras admin/login usam `contains "/admin"|"/login"` e **não** pegam `/wp-json/…/artigos`. Sites que não recebem do Antônio (ex: imobiliário qmiximoveis) não têm esse risco. No Free, se o ruleset já tiver regras, o script só preenche até o limite de 5 (no qmiximoveis já havia 3, entrou só AI-bots + arquivos-sensíveis — a "sem-UA" nem coube).

**Contexto:** o alerta que disparou isso foi e-mail do Cloudflare "aumento de tráfego automatizado" (qmiximoveis, +57% em 15/07). Causa provável: crawlers de IA (Bytespider é agressivo). A regra AI-bots resolve na borda; **Googlebot continua 200** (não está na lista). Plano do site é Free, então Super Bot Fight Mode (Pro) não está disponível — as WAF rules fazem o equivalente.

**Hardening em massa 19/07/2026 (`harden_safe.py`):** pacote SEGURO aplicado em 174 sites não-hardened (SSL `full`, WAF AI-bots + .env/.git + threat>30 + challenge wp-admin/login, HSTS, DNSSEC; **sem a regra sem-UA**, para não tocar no Antônio; testa home e reverte SSL se cair). Resultado: ~139 no ar (200), **26 "quebrados" que investiguei e são PRÉ-EXISTENTES**, não dano meu.

⚠️ **Os "quebrados" em massa foram falso alarme — todos DNS órfão / PBN parked com origem morta.** Prova: cadeirastop.com e tvsnota10.com apontam para IP Hostinger mas **não existem na hospedagem**; foxxplay.com aponta para `192.0.2.1` (IP de documentação RFC 5737); reycastro/masterjuris sem registro A; origens não respondem nem no bypass do CF (curl --resolve direto no IP = 000); e o próprio script reverteu o SSL sem resolver (logo, o SSL nunca foi a causa). Códigos 522/525/000 = falha de conexão CF→origem, que as regras WAF **não causam**. Lição: **antes de hardening em massa, medir o baseline HTTP de cada site** — sem isso, "site fora" pós-mudança confunde origem-morta-pré-existente com dano real.

**Erro operacional a evitar:** rodar `python x.py > log &` dentro de um comando em background trava o log com buffer (0 bytes até terminar). Acompanhar o progresso pelo efeito colateral (linhas novas em sites_hardened.txt), não pelo log redirecionado.

⚠️ **`conta11` (account `f554283e1bb09f7be42a2a26d41d1e71`) está com TOKEN MORTO** (`/user/tokens/verify` → 401 Invalid API Token; as outras 26 contas indexam 309 zonas de boa). Essa conta hospeda o cluster de portais da **hostinger-qmix + anderson-gna** (16+ sites: barranews, oiempreendedores, folhadonoroeste, folhar, desassossegada, itacaiugo, belemduartealmeida, incast, advivo, ebookcult, adonline, diariopernambucano, jornaldobairroalto, opopularjornal, saberdefato, universoneo). Sem token válido da conta11, NÃO dá pra aplicar Always Online / edge cache / hardening em nenhum deles. Precisa que o Anderson gere token novo (template "Edit zone", escopo todas as zonas da conta11). Relacionado: [[reference_hostinger_qmix_u463_node_overload]].

⚠️ **Rate-limit da API CF (1200 req/5min por token/IP): NÃO fazer `localizar_zona` que varre todas as zonas de cada conta POR domínio** (7 dom × 27 contas × páginas = centenas de chamadas → estoura e TODAS as contas passam a devolver 401 espúrio, parece "token morto" mas é rate-limit; limpa em ~5-8min). Usar `build_index()` (lista cada conta 1x, mapeia domínio→zona) — está no `cache_wp_edge.py`. Esse script também aplica microcache de HTML (Cache Rules, edge_ttl 300s, bypass wp-admin/wp-login/wp-json/cookie-logado/POST) e tem `--undo`.

## ATUALIZAÇÃO 28/07/2026 — NÃO bloquear AI bots + cliquex intocável + token mestre
**DIRETRIZ DO OPERADOR: NÃO bloquear bots de IA na rede.** Feito:
- **Cloudflare:** removida a regra WAF `AI Crawl Control - Block AI bots by User Agent` de **313 zonas** (via `remove_ai_block.py --all`, token mestre). `harden_safe.py` AJUSTADO p/ não re-adicionar: removida a regra AI, threat>30 virou **managed_challenge** (não block), `security_level`=**medium** (não high), e **`cliquex.click` excluído dos alvos**. Também converti o block>30 legado→managed_challenge em 89 zonas (`convert_threat.py`).
- **Origem (.htaccess):** havia um 2º bloqueio de AI no `.htaccess` (linha `RewriteCond %{HTTP_USER_AGENT} (...gptbot|claudebot|amazonbot|bytespider...)` + scrapers SEO). Presente em **anderson-gna 38/38 sites**; vps1 e hostverge = 0. Removi só os 4 AI (gptbot/claudebot/amazonbot/bytespider), **mantive os scrapers SEO** (ahrefs/semrush/etc = bloqueio deliberado). Backup `.htaccess.bak-ai-20260728`. Verificado adonline: GPTBot/ClaudeBot/Amazonbot=200, AhrefsBot=403. **PENDENTE: qmix (u463) — SSH em timeout pelo flap**; os 7 sites do qmix (barranews/folhar/etc.) ainda têm o bloqueio no .htaccess, fazer quando o SSH voltar (mesmo sed).

## ⚠️ qmix.com.br = INTOCÁVEL no Cloudflare (domínio-marca da QMIX)
Operador (28/07): NÃO fazer nenhuma alteração de Cloudflare no **qmix.com.br** (o próprio site da QMIX). A hospedagem "qmix"/"hostinger-qmix" (conta u463007860) É liberada pra mexer — o mal-entendido era achar que "qmix" = o site. Só o DOMÍNIO qmix.com.br é protegido no CF. Meus runs em massa (antes da ordem) adicionaram 2 regras WAF a ele (`Block arquivos sensiveis` + `Managed Challenge threat>30`); config própria dele = cache "public marketing pages" + WAF webhook-allow + block SEO scrapers. Scripts já excluem `qmix.com.br` EXATO (não pegar qmiximoveis/qmixdigital). **RESOLVIDO 28/07: operador mandou remover minhas 2 regras → removidas** (sobrou só a config própria dele: cache marketing + WAF webhook-allow + block SEO scrapers + settings security_level HIGH + browser_check + rate-limit "auto anti-flood").

**Nível de servidor (srv1166087): fechei uma LACUNA.** qmix.com.br roda no srv1166087 (Next PM2 3020/3021) + opengravity. Tinha camadas 1 (Nginx `limit_req nextjs_ip` 5r/s) e 2 (Fail2ban 5 jails) mas FALTAVA a camada 3 **origin-só-CF** que o cliquex tem → **teste de bypass: origem respondia 200 direto no IP** (furava o CF). Fix: adicionei `if ($cf_trusted = 0) { return 403; }` nos 2 `location /` de `/etc/nginx/conf.d/qmix.conf` (backup `.bak-cfonly-20260728`, nginx -t + reload). Verificado: via CF (navegador)=200, direto na origem=403. `$cf_trusted` é global (geo em conf.d/00-cf-realip*). Agora qmix.com.br = 3 camadas servidor + CF nível-máximo, igual cliquex.

## ⚠️ cliquex.click = INTOCÁVEL no Cloudflare
Ordem explícita e absoluta do operador: **NÃO alterar NADA** no cliquex.click no Cloudflare (nem add, nem remove, nem reverter). Ele tem 5 regras WAF próprias (skip DONO / block atacante / managed_challenge painel / block scans / AI block) — é o ÚNICO site que PODE ter bloqueio de IA. Todos os scripts (`remove_ai_block.py`, `harden_safe.py`) já excluem `cliquex` por nome. NUNCA rodar nada de CF nele.

## Token MESTRE (28/07): `D:/SISTEMAS/cloudflare/.token_master` (gitignored)
Operador passou um token `cfut_*` que enxerga **326 zonas** (mais amplo que os per-conta). Escopo: **Cache Rules + WAF/Firewall edit SIM; Zone Settings NÃO** (ssl/security_level/always_online = 403 Unauthorized). Por isso: microcache + regras WAF dá; always_online/ssl NÃO (precisa token com Settings). Scripts que usam ele: `cache_master.py`, `waf_master.py`, `convert_threat.py`, `remove_ai_block.py`, `flap_resilience.py`. **NÃO enxerga itacaiugo/blog.advdobrasil** (ficaram sem cache). **ROTACIONAR/limitar depois** (passou em texto puro no chat). conta11/conta25 continuam com token morto no contas.json.

## Fixes de ferramenta (28/07)
- **BUG corrigido no `cache_wp_edge.py`**: criação do entrypoint de cache mandava `{name,kind,phase,rules}` → 400 "unknown field kind"; correto = PUT `{'rules':[]}`. (Nada de cache era aplicado antes disso.)
- `flap_resilience.py`: subiu edge_ttl do microcache 300→1800s (sobrevive à janela de flap ~10min). always_online falhou (token sem Settings).

Relacionado: [[reference_blindagem_php_uploads_languages]], [[reference_hostinger_qmix_u463_node_overload]].
