# header.php and footer.php Guide

The "chrome" of a WordPress site (header + footer + global menu) is the most-repeated DOM across the network. Detection tools fingerprint these because they show up on every page. Diversifying chrome alone reduces network similarity by 20-30% in DOM-similarity tests.

## Header archetypes

### Header H1: Classic 3-row

Logo + Search row, then horizontal menu, then sub-menu / category bar. Newspaper feel.

```
+-------------------------------------------+
|  LOGO                       [search box]  |
+-------------------------------------------+
|  Home | Política | Economia | Esportes ...|
+-------------------------------------------+
|  ÚLTIMAS NOTÍCIAS: ticker text           |
+-------------------------------------------+
```

### Header H2: Single-row compact

Logo on left, menu inline, search icon on right. Modern blog feel.

```
+-------------------------------------------+
|  LOGO  Home Política Esportes  [icon]     |
+-------------------------------------------+
```

### Header H3: Centered logo with split menu

Two-half menu around centered logo. Editorial feel.

```
+-------------------------------------------+
|  Política Economia  LOGO  Cultura Saúde   |
+-------------------------------------------+
```

### Header H4: Sticky compact + mega-menu

Sticky thin header, expanding mega-menu on hover. Site-app feel.

```
+-------------------------------------------+ <- sticky on scroll
|  LOGO  Menu▾  ...                  [user] |
+-------------------------------------------+
                  |
                  v on hover
+-------------------------------------------+
|  Categoria 1 | Categoria 2 | Featured     |
|  Sub-item    | Sub-item    | Post card    |
|  Sub-item    | Sub-item    |              |
+-------------------------------------------+
```

### Header H5: Magazine masthead

Large branded header with tagline, date, weather/stock widget. Print-publication feel.

```
+-------------------------------------------+
|         Quinta, 1 de maio de 2026         |
+-------------------------------------------+
|                                           |
|              LOGO BIG                     |
|         "Tagline da publicação"           |
|                                           |
+-------------------------------------------+
|  Política | Economia | Cultura | Esportes |
+-------------------------------------------+
```

## Footer archetypes

### Footer F1: Minimal

Single row: copyright + 3-4 links. Modern, lean.

```
+-------------------------------------------+
| © 2026 Portal | Sobre | Contato | Privacy |
+-------------------------------------------+
```

### Footer F2: 4-column classic

Logo + about column, then 3 link columns (categorias, institucional, contato).

```
+-------------------------------------------+
| LOGO     | CATEGORIAS | INSTITUCIONAL | CONTATO |
| About    | Política   | Sobre         | Email   |
| paragraph| Economia   | Equipe        | Telefone|
|          | Esportes   | Anuncie       | WhatsApp|
+-------------------------------------------+
| Copyright + Privacy + Termos              |
+-------------------------------------------+
```

### Footer F3: Newspaper-style with newsletter

Newsletter signup as featured block, then column layout below.

```
+-------------------------------------------+
|  Receba as principais notícias por email  |
|  [email input] [Inscrever]                |
+-------------------------------------------+
|  Categorias | Pages | Social | RSS        |
+-------------------------------------------+
|  © 2026 Portal                            |
+-------------------------------------------+
```

### Footer F4: Mega footer

All-in-one. Recent posts, popular tags, social, newsletter, contact form.

```
+-------------------------------------------+
|  ABOUT       | RECENT POSTS  | POPULAR    |
|  paragraph   | post link 1   | TAGS       |
|              | post link 2   | tag tag tag|
+-------------------------------------------+
|  NEWSLETTER  | CONTACT       | SOCIAL     |
|  signup      | mini-form     | icons      |
+-------------------------------------------+
|  Copyright                                |
+-------------------------------------------+
```

### Footer F5: Bottom-bar only

Just a thin sticky bar at the bottom edge of viewport. Modern app feel.

```
+-------------------------------------------+
| ... main content ...                      |
+-------------------------------------------+
| © 2026 Portal · Privacy · Termos          | <- sticky
+-------------------------------------------+
```

## Header / Footer fingerprint variables

### header_archetype `critical`

`H1_classic_3row` | `H2_single_row_compact` | `H3_centered_split` | `H4_sticky_megamenu` | `H5_magazine_masthead`

### footer_archetype `critical`

`F1_minimal` | `F2_classic_4col` | `F3_newsletter_featured` | `F4_mega` | `F5_sticky_bar`

### menu_position_in_header `secondary`

`above_logo` | `below_logo` | `right_of_logo` | `split_around_logo` | `hidden_burger`

### header_search_treatment `secondary`

`visible_input_box` | `icon_modal_on_click` | `icon_inline_dropdown` | `none`

### header_sticky_behavior `secondary`

`always_sticky` | `sticky_on_scroll_up` | `sticky_after_scroll_300px` | `not_sticky`

### menu_separator_style `secondary`

`pipes` | `bullets` | `slashes` | `chevrons` | `none_just_spacing`

### social_icons_position `secondary`

`top_right_header` | `bottom_left_footer` | `floating_left_sidebar` | `inline_in_post_meta` | `none`

### copyright_text_format `secondary`

| Value | Format |
|---|---|
| `c_year_portal` | © 2026 Portal Name |
| `c_year_only` | © 2026 |
| `years_range` | © 2020-2026 Portal |
| `text_only` | "Portal Name é uma publicação independente." |
| `c_year_with_cnpj` | © 2026 Portal | CNPJ XX.XXX.XXX/0001-XX |

### footer_credits_text `critical`

Anti-fingerprint: never the same exact phrase across the network. Examples to rotate:

- "Todos os direitos reservados."
- "Conteúdo independente. Reprodução sem autorização proibida."
- "Publicação digital desde 2020."
- "Pelo direito à informação clara."
- "Notícias com responsabilidade."
- (Or omit entirely)

### menu_item_capitalization `secondary`

`title_case` (Capitalize Each Word) | `sentence_case` (First word only) | `all_caps` (UPPERCASE) | `lowercase` (all lowercase)

### menu_item_count_per_level `secondary`

How many top-level items: 4, 5, 6, 7, 8. Sub-items per top: 0, 3-4, 5-7. Pick combinations that vary.

### nav_role_attribute `secondary`

WordPress default uses `<nav class="main-navigation" role="navigation">`. Variations:

| Value | Markup |
|---|---|
| `wp_default` | `<nav role="navigation">` |
| `aria_label` | `<nav aria-label="Menu principal">` |
| `semantic_only` | `<nav>` |
| `header_inside` | `<header><nav>...</nav></header>` |
| `unique_id` | `<nav id="primary-nav-portalABC">` |

## Required structure for every header.php

1. `<!DOCTYPE html>` at the top
2. `<html lang="pt-BR">` with locale
3. `<meta charset="UTF-8">` and viewport meta
4. `wp_head()` call before `</head>`
5. `body_class()` on `<body>` for theme/page hooks
6. `<header>` semantic element (or `<div role="banner">`)
7. Skip link for accessibility (`<a class="skip-link" href="#content">Pular para conteúdo</a>`)

## Required structure for every footer.php

1. `<footer>` semantic element (or `<div role="contentinfo">`)
2. `wp_footer()` call before `</body>`
3. Closing `</body>` and `</html>`

## What varies that does NOT change visual

- Comment style in PHP (`// `, `# `, `/** */`, none)
- Indentation tabs vs spaces
- Order of header/footer subsections in DOM
- Whether logo is `<h1>` or `<p>` or `<a><img></a>`
- Whether the menu is `<nav><ul>` or `<nav><div>`
- ARIA labels: `Menu principal` vs `Navegação` vs `Cabeçalho`
- Class names: same convention as front-page roll

## Anti-pattern: shared logo image dimensions

If every portal has a 200x60 PNG logo, that's a fingerprint. Vary logo dimensions across the network: 180x50, 220x70, 160x40, square 80x80, etc. Different brand voices justify different shapes.
