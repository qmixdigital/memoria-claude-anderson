# wp-news-portal-fullsetup skill

Skill personalizada para a rede QMIX Digital. Gera **pacote completo** de um portal de notícias WordPress com diversificação total de fingerprint: tema-filho, front-page, single, archive, header, footer, identidade visual (paleta + fontes), estrutura (menu, permalinks, widgets), AdSense. Tudo pronto para deploy via SSH + wp-cli.

## O que esta skill faz (versão atual)

✅ Front-page (`front-page.php`) — 5 arquétipos A-E
✅ Single post (`single.php`) — 4 arquétipos I-IV
✅ Archive/category (`archive.php`) — 4 arquétipos α-δ
✅ Header (`header.php`) — 5 arquétipos H1-H5
✅ Footer (`footer.php`) — 5 arquétipos F1-F5
✅ Identidade visual (`style.css`) — 20 paletas, 20 font pairings, 5 spacing scales
✅ Theme management — instala/troca tema parent via wp-cli
✅ Estrutura — permalinks, menus, widgets, date format, category slugs
✅ Performance — LCP < 2.0s, CLS < 0.05, INP < 150ms
✅ AdSense — 3 placement sets
✅ Roll automatizado via Python (sem aleatoriedade do LLM)
✅ Deploy automatizado via Python (SSH + wp-cli)

## Estrutura

```
wp-news-frontpage/
├── SKILL.md                          (instruções principais e workflow expandido)
├── README.md                         (este arquivo)
├── references/
│   ├── fingerprint-vars.md           (variáveis de front-page)
│   ├── multilang-exclusion.md        (ocultar categorias pt-PT/en-US da home)
│   ├── single-templates.md           (4 archetypes I-IV de single.php)
│   ├── archive-templates.md          (4 archetypes α-δ de archive.php)
│   ├── chrome.md                     (5 archetypes H1-H5 + F1-F5 de header/footer)
│   ├── visual-identity.md            (20 paletas + 20 fontes + spacing/radius/shadow)
│   ├── structure.md                  (permalinks, menus, widgets, date format)
│   ├── theme-management.md           (wp-cli para instalar/trocar tema)
│   ├── layouts.md                    (5 archetypes A-E de front-page)
│   ├── theme-integration.md          (hooks por tema parent)
│   └── performance.md                (LCP, CLS, INP, estratégia de fontes)
├── assets/
│   ├── adsense-patterns.md           (3 conjuntos de AdSense)
│   └── example-frontpage.md          (exemplo completo de front-page)
├── data/
│   └── fingerprint-rolls.json        (registro append-only de TODOS os rolls)
└── scripts/
    ├── roll.py                       (gera roll divergindo dos vizinhos)
    ├── install_portal.py             (deploy via SSH + wp-cli)
    ├── append_roll.py                (registra roll manual)
    └── README.md                     (docs dos scripts)
```

## Fluxo recomendado (5 a 10 min por portal)

```bash
cd wp-news-frontpage/

# 1. Gera roll que diverge dos vizinhos (mesmo VPS / mesma niche)
python scripts/roll.py \
    --portal=novoportal.com.br \
    --vps=h-anderson \
    --niche=regional \
    --theme=GeneratePress \
    --exclude-lang-categories=pt-pt,en-us \
    --append

# 2. Cole o header retornado no chat e peça pra skill gerar
#    o pacote completo em generated/novoportal.com.br/

# 3. Deploy automatizado
python scripts/install_portal.py \
    --portal=novoportal.com.br \
    --ssh-host=u651115354@92.113.35.186 \
    --ssh-port=65002 \
    --wp-path=/home/u651115354/domains/novoportal.com.br/public_html

# 4. Manualmente: setar logo + montar menu primário em wp-admin
```

A separação `roll → skill → install` tira a aleatoriedade do LLM, centraliza memória em `data/fingerprint-rolls.json`, e remove etapas manuais de SSH/scp.

## Variáveis cobertas (24+ críticas, 25+ secundárias)

**Críticas (devem divergir em ao menos 18 vs vizinhos):**
- `archetype` (front-page A-E)
- `class_naming`, `sidebar`, `card_style`, `hero_variant`, `breaking_strip`
- `image_ratio`, `adsense_set`
- `single_archetype` (I-IV), `byline_position`, `related_posts_layout`
- `comments_treatment`, `in_article_ad_pattern`, `featured_image_treatment`
- `content_typography`
- `archive_archetype` (α-δ), `posts_per_archive_page`, `archive_card_density`
- `header_archetype` (H1-H5), `footer_archetype` (F1-F5), `footer_credits_text`
- `palette` (P01-P20), `font_pairing` (F01-F20)
- `spacing_scale`, `border_radius`, `shadow_style`

**Secundárias:**
- `permalink_structure`, `category_slug_style`, `menu_structure_style`
- `widgets_style`, `date_format`
- `schema`, `pagination`, `posts_per_category`, `excerpt`
- `meta_visibility`, `wrapper_semantics`, `heading_hierarchy`
- `php_comments`, `indentation`, `function_naming`, `font_strategy`
- `share_buttons_position`, `breadcrumb_style`
- `menu_position_in_header`, `header_search_treatment`, `header_sticky_behavior`
- `social_icons_position`, `post_meta_visibility`, `author_bio_box`
- `archive_pagination`, `category_description_position`
- `subcategory_strip_treatment`, `archive_h1_treatment`
- `link_underline_style`, `button_style`, `dark_mode_support`
- `menu_separator_style`, `menu_item_capitalization`

## Como instalar

A skill segue o formato Anthropic Skills padrão. Três caminhos:

1. **Upload manual em cada conversa**: faça upload da pasta inteira no início de uma conversa. A skill aparece em `<available_skills>`.
2. **Skill global**: usar `.skill` package se Anthropic abrir suporte a skills no nível da conta.
3. **Claude Code (terminal)**: mover `wp-news-frontpage/` para `~/.claude/skills/` e a skill fica disponível como `/wp-news-portal-fullsetup` em qualquer conversa.

## Como editar

- Adicionar nova variável: edite `references/<arquivo>.md` e adicione no `MATRIX` em `scripts/roll.py`.
- Novo arquétipo de layout: adicione em `references/layouts.md` (ou single-templates / archive-templates / chrome).
- Nova paleta ou fonte: adicione em `references/visual-identity.md` e na lista `MATRIX["palette"]` ou `MATRIX["font_pairing"]` em `roll.py`.
- Novo tema parent: adicione em `references/theme-management.md` e em `PARENT_THEME_SLUGS` em `install_portal.py`.

## Convenções da skill

- Sem em dashes (—) em nenhum lugar.
- QMIX Digital opera desde 2020, backlinks dofollow / permanentes / editoriais.
- qmix.com.br (não qmixdigital.com.br).
- Pagamento: PIX (5% desc.), cartão até 4x sem juros, boleto, PayPal.
- Quando "Guilherme" digitar no chat, é o Guilherme operando.
- Português brasileiro em todo conteúdo user-facing.

## O que ainda NÃO faz (escopo futuro)

- Auditoria pós-deploy (script que confere se o site renderizado bate com o roll).
- Cálculo de similaridade DOM real entre N portais (SimHash sobre HTML renderizado).
- Configuração de plugins pagos (Rank Math Pro, Yoast Premium).
- Configuração de DNS / Cloudflare / WAF.
- Compra/configuração de domínio.
- Servidor (PHP, OPcache, Redis) — usar playbook QMIX separado.
