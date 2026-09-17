# Hostinger — Mariana (cliente novo)

> Site WordPress de **marianacabraldermato.com.br** (dermatologista). Onboarding 2026-06-23.

## Acesso SSH
- **Alias:** `ssh hostinger-mariana` (sem senha — chave instalada)
- **IP:** 147.93.14.218 · **Porta:** 65002 · **Usuário:** `u761201864`
- **Senha SSH:** `<<REMOVIDO>>` (backup; o dia a dia é por chave)
- **Chave:** `<<REMOVIDO>>` (pública adicionada no authorized_keys + hPanel)
- Host key aceita em `~/.ssh/known_hosts`.

## WordPress
- **Domínio:** marianacabraldermato.com.br (HTTP 200)
- **Caminho:** `/home/u761201864/domains/marianacabraldermato.com.br/public_html`
- **wp-cli:** `wp --path=/home/u761201864/domains/marianacabraldermato.com.br/public_html ...`

## Stack (auditoria 2026-06-23)
- WordPress **7.0** (atualizado) · PHP **8.2.30**
- Tema: **smart-mag** (SmartMag) · Construtor: **Elementor + Elementor Pro + ElementsKit**
- Cache: **LiteSpeed Cache** · SEO: **Rank Math** · Segurança: **Wordfence** · Analytics: Independent Analytics + Google Site Kit
- 18 plugins ativos · 1 update pendente · **807 MB** · 56 posts / 20 páginas
- Outros: click-to-chat (WhatsApp), simple-cloudflare-turnstile, wp-reviews-plugin-for-google, envato-elements, hostinger / hostinger-easy-onboarding, xml-sitemap-feed, skyboot-icons, simple-local-avatars

## ⚠️ Atenção ao otimizar imagens (lição da rede)
NÃO usar conversor que **remove os originais** (quebra imagens — ver caso qmiximoveis). Se usar WebP, manter o original (LiteSpeed com `rm_bkup=0`). Aqui já está seguro (`img_optm-rm_bkup=0`).

## Otimização aplicada (2026-06-23)
**Performance:**
- LiteSpeed: **minificação CSS/JS ligada** (`optm-css_min=1`, `optm-js_min=1`) — combine deixado OFF (evita quebrar Elementor).
- **Cloudflare Cache Rule** criada (zona `535b38d536d9efcd87327f63226fb84a`, conta16) — cacheia HTML de visitante anônimo (bypass wp-admin/login/logado), edge TTL 2h. Confirmado `cf-cache-status: HIT`.
- CF: **Brotli, HTTP/3, 0-RTT, Early Hints** ligados.

**Segurança:**
- CF: **SSL Full**, **Always Use HTTPS** (301 http→https ok), Automatic HTTPS Rewrites, **TLS mín 1.2**, Security Level **medium**, Browser Integrity Check, Email Obfuscation.
- WP: **`DISALLOW_FILE_EDIT=true`** (desabilita editor de arquivos no admin).
- **Headers de segurança** no `.htaccess` (X-Content-Type-Options, X-Frame-Options SAMEORIGIN, Referrer-Policy, Permissions-Policy) — backup `.htaccess.bak-sec-20260623`. Confirmado 3/3 ao vivo.
- Wordfence + Cloudflare Turnstile já presentes (mantidos).

**Limpeza:** removidos **envato-elements** + **hostinger-easy-onboarding** (inúteis). 16 plugins ativos.

**NÃO mexido (decisão do dono):** Elementor/Elementor Pro **não atualizados** (sem licença 2026). xml-sitemap-feed **mantido** (é o sitemap ativo — Rank Math sitemap está OFF).

**Pendência manual:** **Bot Fight Mode** — ligar no painel CF (Security → Bots) — o token não tem permissão de Bot Management via API.

## Content Pruning + Crosslink SEO (2026-06-23)
**Pruning:** análise do GSC → **15 artigos antigos com 0 cliques** mandados pra lixeira + **301 redirect** de cada um pra categoria relevante (`.htaccess`, bloco "BEGIN Pruning 301", backup `.htaccess.bak-prune-20260623`). Mantidos: 3 de imprensa (autoridade) + 6 recentes (jan/2026). Posts publicados: 56→41.

**Crosslink (interno):** método SEGURO (DOMDocument, backup em postmeta, preserva post_modified, idempotente):
- **41 artigos:** links contextuais inline (24, p/ páginas de serviço + home) + bloco **"Veja também"** (1 artigo relacionado + 1 página de serviço + 1 home).
- **10 páginas de serviço** (clássicas, `_elementor_data` vazio): bloco "Veja também" (página de serviço relacionada + artigo + home).
- **NÃO tocado:** as 10 páginas **Elementor** (landing "dermatologia em Goiânia"/estética/clínica/cirúrgica, tecnologias, contato, dra-mariana, legais) — risco ao design; recebem links mas não dão (editar via Elementor manual se quiser).
- **Âncoras da home variadas** (≤2x cada): ~50 links pra home com keywords locais ("dermatologista em Goiânia", "clínica de dermatologia em Goiânia"…). Reversível: backup em postmeta `_xlinkbak_20260623` e `_linkbak_20260623`.
- **CSS:** sublinhado nos links **só no single post** (`body.single-post .entry-content a`) no CSS Adicional do Customizer — não afeta páginas/home.

## Design dos Single Posts (2026-06-23)
**Limpeza de conteúdo (DOMDocument, backup postmeta `_htmlbak_20260623`):**
- Hierarquia de headings corrigida em 4 artigos antigos (colados do Word usavam só `<h4>` → promovidos p/ H2/H3). **0 artigos com hierarquia quebrada**.
- Lixo do Word removido: 232 spans `data-ccp-props`/`data-contrast` (117+77+38) de 3 artigos.
- `<br>` colapsados, bullets vazios removidos, negrito tirado de itens de lista.

**mu-plugin `wp-content/mu-plugins/single-toc.php`** (só `is_singular('post')` — NUNCA roda em páginas; reversível = apagar o arquivo):
- **Índice (TOC)** auto-gerado dos H2/H3 (3+), badges numerados na cor de marca **#DAAB86**, ícone, scroll suave.
- **Tempo de leitura** (no header do TOC).
- **Barra de progresso** de leitura no topo.
- **Drop cap** no 1º parágrafo.
- **CTA de agendamento** ao fim do artigo (box escuro + botão WhatsApp) → `api.whatsapp.com/send/?phone=5562992687632` (número do plugin click-to-chat, msg contextual do blog), target _blank, nofollow.
- **Estilo** do bloco "Veja também" e de `blockquote` (citações) na identidade da marca.

**CSS Customizer (single post):** tipografia 18px / line-height 1.78, largura de leitura `max-width:760px`, espaçamentos. Tudo escopado `body.single-post` — páginas de serviço/landing intactas (verificado).
- **Cor de marca:** #DAAB86 (bege/dourado, do kit Elementor) + escuro #1C1C1C.
- **WhatsApp:** +55 62 99268-7632 (plugin click-to-chat, balão flutuante estilo s8 verde #22a348).

## SEO técnico — 2ª rodada (2026-06-23)
**Auditoria:** schema já forte (home: LocalBusiness+MedicalClinic+Person+Review; artigos: Article+BlogPosting+BreadcrumbList+Organization), OG/Twitter/canonical OK, 0 títulos duplicados, sitemap+robots OK.
- **ALT de imagens:** preenchidos **73** (de 78 sem alt) via `_wp_attachment_image_alt` — 34 destacadas (= título do post) + 39 por título descritivo; 5 genéricas (IMG_/DSC) deixadas vazias de propósito.
- **Meta descriptions:** escritas **21** (`rank_math_description`) nos posts que estavam sem — 150-160 car., keyword + CTA, pt-BR. Renderização confirmada.
- **FAQ schema:** removido **só dos artigos** via mu-plugin `mc-seo-tweaks.php` (filtro `rank_math/json_ld` tira FAQPage). **Home/páginas NÃO tocadas** (FAQ da home vem do widget Toggle do Elementor; ordem do dono: só artigos). Reversível = apagar o arquivo.
- ⚠️ **Slug ≠ título** no post 1127 → **CORRIGIDO**: slug trocado p/ `tratamentos-reduzir-celulite` + focus keyword "tratamentos para celulite" + title "Tratamentos para Celulite em Goiânia | Dra. Mariana Cabral" (58 car.) + H2 otimizado. Links internos que apontavam pro slug antigo corrigidos em 3 artigos (1369, 1179, 1137; backup `_slugfixbak_20260623`). Página ultraformer-mpt também linkava → deixada (coberta pelo 301; ordem: só artigos).
## Estratégia de conteúdo SEO — 9 artigos (2026-06-23)
Cruzado GSC x páginas de serviço: criados artigos **informacionais** (foco em "o que é/dói/quanto dura/diferença") que funilam pras páginas comerciais (anti-canibalização: long-tail informacional ≠ termo comercial+local da página de serviço). Padrão de cada um: autor Dra. Mariana Cabral (ID 3), categoria Procedimentos estéticos (17) ou Tratamentos corporais (14), imagem 1216x640 (foto real da clínica > IA; IA via Runware só quando não há foto), vídeo da Dra. embutido (`preload=metadata`), TOC+CTA via mu-plugin, links com âncoras variadas pra página de serviço + cluster, link de entrada de artigo relacionado (não-órfão), **sem travessões (—)**, 1 title/1 desc (Rank Math), FAQ como conteúdo (sem schema). Sempre conferir página de serviço + pesquisa web antes de escrever.
- **Harmonização glútea (3):** o-que-e-harmonizacao-glutea · harmonizacao-glutea-quanto-tempo-dura · harmonizacao-glutea-acido-hialuronico-riscos (9.112 imp)
- **Ultraformer MPT (2):** ultraformer-mpt-doi-quantas-sessoes · ultraformer-mpt-funciona-resultados (3.446 imp)
- **Laser CO2 Hybrid (1):** laser-co2-hybrid-o-que-e (2.890 imp)
- **Laser de Picossegundos (1):** laser-de-picossegundos-o-que-e (1.590 imp)
- **Skinvive/Skinbooster (1):** skinvive-ou-skinbooster-diferenca (660 imp)
- **Bioestimulador com cânula (1):** bioestimulador-de-colageno-com-canula (180 imp)
- Imagens reais (prints de vídeo) otimizadas: PNG/webp → 1216x640 webp via GD (cover+crop). Runware key nova no CLAUDE.md (exige model `runware:100@1` + dims múltiplas de 64). FLUX erra mãos/pés → enquadrar fechado.
- **Páginas de serviço:** removidas tags SEO duplicadas (title/meta/canonical/og/twitter estavam hardcoded no `wp:html` + Rank Math = 2 de cada) → agora 1 title/1 desc otimizado c/ "em Goiânia". H1 colados (`palavra<br>palavra`) corrigidos (harmonizacao-glutea, hifu, bioestimulador). Link recíproco serviço→artigo no FAQ harmonização.

## Rodada 4 (2026-06-23): auditoria de integridade de imagens (0 anexos sumidos, 0 destacadas sumidas). Corrigida img quebrada no artigo 1131 (Revista Caras 2020, arquivo sumido → `<img>` removido; backup `_imgfixbak_20260623`). **12 posts órfãos → 0**: adicionados 12 links internos de entrada (âncoras variadas com keyword) em 8 artigos-fonte (backup `_orphanlinkbak_20260623`). 0 noindex, 0 posts sem OG image. WebP mantido como está (ver [[reference_webp_cloudflare_vary]]). ⚠️ pendência fora de escopo: `uploads/logo.png` referenciado na página 1475 (provável logo do schema) está sumido — re-subir o logo se quiser rich result com logo.
- **Rodada 3:** 18 title tags custom (`rank_math_title`, <60 car., keyword na frente) nos posts que estavam com title auto. 3 links que apontavam p/ artigos podados repontados p/ conteúdo vivo (1167→viço, 1152→melasma, 1150→bioestimulador). Pendente/opcional: ativar WebP (`img_optm-webp_replace`, originais preservados via QUIC.cloud) e consolidar sitemaps.
- 🔴 **Rank Math `redirections_fallback` estava `homepage`** → TODO link quebrado/404 do site redirecionava pra home (soft-404 em massa, ruim pro SEO e quebrava `_wp_old_slug`). **Mudado p/ `default` (404 real)**. Redirect legado id 29 (URL datada 2019→slug) repontado direto pro slug novo. Redirects testados: slug antigo + URL 2019 → 301 → URL nova; URL inexistente → 404 real.
