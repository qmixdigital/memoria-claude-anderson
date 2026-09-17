# Documentação — marianacabraldermato.com.br

**Cliente:** Dra. Mariana Cabral — Dermatologista em Goiânia (CRM 18691 / RQE 9360)
**Tipo:** Site institucional/serviços (WordPress)
**Última atualização desta doc:** 2026-07-01

> Site de CLIENTE (não é da rede de publicações QMIX). Manutenção sob demanda.

---

## 1. Acesso e infraestrutura

| Item | Valor |
|------|-------|
| SSH | `ssh hostinger-mariana` (alias no `~/.ssh/config`) |
| Hospedagem | Hostinger **shared** (LiteSpeed/LSWS) |
| Docroot | `/home/u761201864/domains/marianacabraldermato.com.br/public_html` |
| WP-CLI | disponível no docroot |
| Versões | WordPress 7.0 · PHP 8.2.30 |
| Backup pré-auditoria | `/home/u761201864/backups-mariana/pre-audit-mariana.sql` |
| Cloudflare | **conta16** · zona `535b38d536d9efcd87327f63226fb84a` · account_id `862514f37ef20f4575c631621a1dd750` · token em `D:/SISTEMAS/Cloudflare/contas.json` índice 15 |
| Deploy de arquivos | `base64 -w0 arquivo | ssh hostinger-mariana "base64 -d > /tmp/x && wp ..."` (scp costuma falhar) |

**Contatos usados no site:** WhatsApp `wa.me/5562992687632` · Tel `+55 62 3609-1900` · Endereço Av. T-10, Qd. 102, nº 208 — Ed. New Times Square, salas 2601–2605, Goiânia-GO.

---

## 2. Arquitetura — SEM Elementor

O site foi **100% desintoxicado do Elementor** (2026-07-01). Tema é **SmartMag** (framework Bunyad), `main_color = #daab86` (dourado da marca). Quase todo o front-end é **mu-plugin próprio** — NÃO é Elementor nem widget de tema.

**Plugins removidos:** elementor (todos), elementor-pro, extensions-for-elementor-form, skyboot-custom-icons-for-elementor, **elementskit-lite** (⚠️ "elementskit" não casa com grep "elementor"), click-to-chat, simple-cloudflare-turnstile, simple-local-avatars, Google Site Kit, wp-reviews (Trustindex), Hostinger Tools.

**Plugins ativos (3):** `litespeed-cache`, `seo-by-rank-math`, `wordfence`.

### Como o tema é suprimido
Os mu-plugins desligam o header/footer nativos e injetam os próprios via hooks Bunyad:
- Header: `add_filter('bunyad_do_partial_header','__return_false')` + injeção em `bunyad_header_before`
- Footer: `add_filter('bunyad_do_partial_footer','__return_false')` + injeção em `bunyad_footer_before`

Páginas premium usam o template `page-templates/no-wrapper.php` (full-width). O conteúdo dessas páginas é **HTML incorporado** dentro de um bloco `<!-- wp:html -->` — inclusive um documento HTML completo aninhado (o browser achata as tags `<html>/<head>/<body>` internas e renderiza só o conteúdo).

---

## 3. mu-plugins (`wp-content/mu-plugins/`)

| Arquivo | Função |
|---------|--------|
| **mc-header.php** | Header premium sticky glass + mega-menu "Especialidades" (link `/especialidades/` + dropdown) + overlay mobile. Menu `smartmag-main` (id 6). Link "Início" primeiro no nav. ⚠️ URL com `%`-encoding no `items_wrap` do `wp_nav_menu` quebra `sprintf()` (WSOD) — CTA renderizado FORA do items_wrap. |
| **mc-footer.php** | Footer premium (colunas Especialidades/Institucional/Atendimento). Logo clicável (`/`). Carrega as fontes (Fraunces + Jost) numa única URL, não-bloqueante. Crédito "Site por QMIX Digital" → qmix.com.br (MANTER). Títulos de coluna = `<h2 class="mc-ft__h">` (CSS escopado pela classe). |
| **mc-tracking.php** | GTM `GTM-K957KCH8` **lazy** (carrega na 1ª interação) + Ahrefs (`rXGC7AkTIPureLEtIPzCog`) + preconnect ahrefs. O GTM já dispara o GA4 `G-MLFHFRC852` e o Google Ads — **NÃO** colocar gtag direto aqui (dupla contagem). noscript como fallback. |
| **mc-cta.php** | CTA de conversão (substituiu o Click to Chat): barra fixa mobile (WhatsApp + Ligar) + pílula dourada desktop. Evento GA4 `generate_lead`. |
| **mc-blog.php** + **mc-blog/template.php** | Blog editorial custom via `template_include` em `is_home()`: hero + filtro de categorias client-side + featured + grade. Tem `<main class="mcb">`. |
| **mc-seo-tweaks.php** | Remove o schema FAQPage do JSON-LD do Rank Math (`add_filter('rank_math/json_ld', ...)`). |
| **mc-perf.php** | Remove `jquery-migrate` no frontend (request render-blocking usada só por plugins antigos). |
| **single-toc.php** | Design/índice dos artigos (single). |
| **stats-mk7a2b.php** | ⚠️ **Contador de cliques/views real da rede QMIX** (REST + AJAX, cache-bypass). **NÃO DELETAR** — o usuário avisou que é importante. |
| **hostinger-preview-domain.php** | Do host (não mexer). |

---

## 4. Páginas

**Front page:** id **1564** (`home`) — HTML incorporado, depoimentos Google custom (`.mcrev-*`, 3 reviews reais), vídeo YouTube `9fWQli51JDg` como **facade** (poster + click-to-load), envolvida em `<main id="conteudo-principal">`.

| ID | Slug | ID | Slug |
|----|------|----|------|
| 1564 | home (front) | 90 | tecnologias |
| 80 | dra-mariana-cabral | 88 | blog |
| 82 | dermatologia-estetica-em-goiania | 92 | contatos |
| 84 | dermatologia-clinica-em-goiania | 130 | politica-de-privacidade |
| 86 | dermatologia-cirurgica-em-goiania | 132 | termos-de-uso |
| 1594 | especialidades (vitrine imersiva) | | |

**Tratamentos (páginas dedicadas):** 1405 handpico · 1422 ultraformer-mpt · 1427 botox-em-goiania · 1443 bioestimulador-de-colageno · 1471 harmonizacao-glutea · 1475 hifu · 1484 laser-co2-hybrid · 1501 oligio-x · 1507 preenchimento-acido-hialuronico · 1509 skinbooster-skinvive.

Páginas premium (home, serviços, contatos, especialidades, tratamentos) usam `no-wrapper.php`. Páginas de texto (tecnologias 90, política 130, termos 132) usam template `default`.

---

## 5. SEO (Rank Math)

Plugin: **seo-by-rank-math**. Títulos/metas por página em postmeta `rank_math_title` / `rank_math_description`. Config em `rank-math-options-general` / `-titles` / `-sitemap`. FAQPage schema é removido via mc-seo-tweaks.

### ⚠️ ARMADILHA CRÍTICA — Rank Math some do frontend
Se o Rank Math parar de emitir **title/meta description/og** no frontend (páginas caem no title do tema, aparece `<meta name="generator" content="WordPress...">`) — mesmo estando ativo e configurado — a causa é o **gate de registration**:

`RankMath::init_frontend()` faz `if ($registration->invalid) return;` → não carrega o módulo Frontend. `invalid` = `!is_site_connected()` a menos que a option **`rank_math_registration_skip`** seja `true`.

**Fix (1 linha):**
```bash
wp option add rank_math_registration_skip 1
```
Reinstalar o plugin ou restaurar as options `rank-math-options-*` NÃO resolve — só essa option. Um DELETE em massa em `wp_options` (ex.: `%_ti_%`) apaga essa option e derruba o SEO inteiro.

---

## 6. Performance

Otimizações aplicadas (sem impacto visual):
- **YouTube facade** na home (poster `i.ytimg.com/vi/.../maxresdefault.jpg` + iframe só no clique) — evita ~786 KB do player.
- **Hero com srcset** responsivo + `<link rel="preload" imagesrcset>` (LCP).
- **GTM lazy** (mc-tracking) — carrega na 1ª interação; removeu as 3 long tasks do carregamento.
- **Sem dupla contagem GA4** (só o GTM dispara; nada de gtag direto).
- **jquery-migrate removido** (mc-perf).
- Preconnect ahrefs.

**Teto de performance conhecido (não atacado — exige critical-CSS, risco de FOUC):** o CSS do tema `c287607.css` (~32 KB, ~30 KB não usados) é render-blocking. Só melhora com Critical CSS + async via LiteSpeed, e **precisa de validação visual logo após** (já quebrou o editor Gutenberg antes com JS optim do LiteSpeed).

⚠️ **NÃO** ligar `optm-js_defer` / JS optimization do LiteSpeed sem testar — piorou LCP e quebrou Gutenberg em updates.

---

## 7. Acessibilidade

Correções (Lighthouse):
- Contraste WCAG: links dourados `#9c7638` → `#7a5a1e`; rótulo review `.mcrev-src #8a7c6c` → `#6b5e4e`; texto do mega-menu `#8a7c6c` → `#6b5e4e`.
- Ordem de headings: títulos do footer `<h4>` → `<h2 class="mc-ft__h">` (CSS escopado pela classe para não afetar h2 do conteúdo).
- Landmark: home envolvida em `<main id="conteudo-principal">`.

---

## 8. Segurança (Cloudflare + Wordfence)

- Wordfence ativo.
- Hardening Cloudflare aplicado via `D:\SISTEMAS\Cloudflare\harden_site.py` (SSL Full Strict, HSTS, DNSSEC, WAF bloqueando `.env`/`.git`/`wp-config`, threat>30, **User-Agent vazio**, rate-limit, login managed_challenge; security_level suavizado). **Só proteções invisíveis** — nunca challenge para o usuário final.
- ⚠️ **Block AI bots** deve ficar **DESLIGADO** (Security → Bots no painel) — GPTBot/PerplexityBot/etc. são importantes. O token da conta16 não tem permissão de Bot Management; toggle é manual.
- ⚠️ A regra WAF de **User-Agent vazio** faz o `wp litespeed-purge all` (CLI) retornar **403** — ver seção de cache.

---

## 9. Cache — procedimento de purga (IMPORTANTE)

**Duas camadas teimosas:** LiteSpeed LSWS (origem) + Cloudflare APO (borda).

Fatos:
- APO cacheia a **URL limpa** como `Cf-Cache-Status: HIT` e serve tudo do edge (mascara a origem). Com **query-string** (`?x=1`) o APO não cacheia → bate na origem (útil pra testar o conteúdo real).
- `wp eval 'do_action("litespeed_purge_all")'` é **no-op** no CLI. `wp litespeed-purge all` dá **403** (WAF do CF bloqueia a self-request a `admin-ajax` por UA vazio). `wp litespeed-purge url` diz "Success" mas frequentemente **não evicta**.
- Auto-purge ao editar post no **wp-admin funciona** (header in-request); só o wp-cli falha.

### Receita que FUNCIONA (na ordem)
1. **Purgar a origem LSWS pelo método nativo** — mu-plugin temporário que emite o header `X-LiteSpeed-Purge: *`:
   ```php
   // wp-content/mu-plugins/mc-purge.php (temporário)
   <?php if(!defined('ABSPATH')){exit;}
   add_action('init',function(){
     if(isset($_GET['mc_purge'])&&hash_equals('k9x2QmPz7',(string)$_GET['mc_purge'])){
       nocache_headers();header('X-LiteSpeed-Purge: *');echo 'MCPURGE-OK';exit;}},1);
   ```
   ```bash
   curl -s -A "Mozilla/5.0" "https://marianacabraldermato.com.br/?mc_purge=k9x2QmPz7"   # UA de browser passa na WAF
   rm wp-content/mu-plugins/mc-purge.php   # remover depois
   ```
2. **Confirmar origem fresh** por loopback (bypassa CF):
   ```bash
   ssh hostinger-mariana "curl -s -H 'Host: marianacabraldermato.com.br' -A Mozilla https://127.0.0.1/ -k -D - | grep -i x-litespeed-cache"
   # esperar: x-litespeed-cache: miss  + conteúdo novo
   ```
3. **Só então purgar o Cloudflare** (purge por URL NÃO limpa o APO — usar purge_everything):
   ```bash
   TOKEN=$(python3 -c "import json;print(json.load(open(r'D:/SISTEMAS/Cloudflare/contas.json',encoding='utf-8'))[15]['token'])")
   curl -s -X POST "https://api.cloudflare.com/client/v4/zones/535b38d536d9efcd87327f63226fb84a/purge_cache" \
     -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data '{"purge_everything":true}'
   ```
4. **Re-primar** com 1-2 curl na URL limpa (1º = MISS/fresh, 2º = HIT/fresh).

> Se purgar o CF com a origem ainda velha, ele rebusca e recacheia o antigo. **Origem SEMPRE antes do CF.**
> Alternativa 100% confiável para o usuário: botão **"Purge All"** do LiteSpeed no wp-admin (autenticado, emite o header in-request).

---

## 10. Avisos rápidos (o que NÃO fazer)

- ❌ Não reintroduzir Elementor.
- ❌ Não deletar `stats-mk7a2b.php` (contador real de cliques).
- ❌ Não remover o crédito QMIX do footer.
- ❌ Não rodar DELETE amplo em `wp_options` (já apagou `smartmag_theme_options` e `rank_math_registration_skip`).
- ❌ Não ligar JS optimization/defer do LiteSpeed sem testar (quebra Gutenberg/LCP).
- ❌ Não colocar gtag/GA4 direto no mc-tracking (o GTM já dispara).
- ✅ Restaurar do backup `pre-audit-mariana.sql` quando corromper option (parser escape-aware — ver scripts no scratchpad da sessão).

---

## 11. Histórico (2026-07-01)

Sessão única de redesign + auditoria:
1. Remoção total do Elementor; header/footer/CTA/blog reconstruídos como mu-plugins.
2. Páginas novas/redesenhadas: Especialidades (1594), blog custom, Tecnologias, hero da Dra. Mariana, home premium.
3. Link "Início" no header e footer; logo clicável.
4. Segurança: auditoria WP + hardening Cloudflare + reset de senha admin.
5. Remoção de Site Kit + widget Trustindex (substituído por depoimentos custom) + plugins sem uso.
6. **Incidente:** DELETE em massa (`%_ti_%`) apagou `smartmag_theme_options` (restaurado do backup) e `rank_math_registration_skip` (derrubou o SEO do frontend — corrigido).
7. Performance: facade YouTube, srcset, GTM lazy, jquery-migrate removido, sem dupla GA4.
8. Acessibilidade: contraste, ordem de headings, landmark `<main>`.

---

*Referências cruzadas na memória do Claude:* `reference_mariana_elementor_free`, `reference_mariana_cache_apo_lsws`, `reference_rankmath_registration_disables_frontend`.
