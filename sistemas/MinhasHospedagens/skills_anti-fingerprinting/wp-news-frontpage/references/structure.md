# Site Structure: Categories, Menus, Widgets, Permalinks

Beyond the visible templates, the site's information architecture is itself a fingerprint. Detection tools fingerprint:

- Permalink structure
- Category slugs
- Menu structure (which top-level items, what order)
- Widget areas and which widgets are populated
- Custom post types and taxonomies

## Permalink structure

WordPress default is `/?p=123`, almost no portal uses that. Common production options:

| Slug | Permalink format |
|---|---|
| `post_name` | /post-name/ |
| `category_post` | /category/post-name/ |
| `year_month_post` | /2026/05/post-name/ |
| `category_year_post` | /category/2026/post-name/ |
| `numeric_post` | /123/post-name/ |
| `archive_post` | /artigo/post-name/ (custom prefix) |

Roll variable: `permalink_structure`. Pick differently across siblings.

## Category slug conventions

The same category "Saúde" can be slugged as:
- `saude` (no accent)
- `saude-e-bem-estar`
- `bem-estar`
- `vida-saudavel`
- `health` (English fallback)

Roll variable: `category_slug_style`. Options: `pt_simple`, `pt_descriptive`, `pt_compound`, `en_fallback`, `mixed`.

## Menu structure

The default WordPress menu has Home, Sobre, Contato, plus all categories. Variations:

### Menu structure 1: Categorical-first

```
Home | Política | Economia | Esportes | Cultura | Saúde | Mais ▾
                                                            ├ Tecnologia
                                                            ├ Automotivo
                                                            └ Lifestyle
```

### Menu structure 2: Topical hub

```
Home | Notícias ▾ | Análises ▾ | Vídeos | Newsletter | Sobre
       ├ Brasil    ├ Política
       ├ Mundo     ├ Economia
       └ Local     └ Cultura
```

### Menu structure 3: Flat compact

```
Home | Hoje | Trending | Categorias ▾ | Buscar
```

### Menu structure 4: Editorial sections

```
Manchete | Reportagem | Análise | Opinião | Cultura | Sobre
```

### Menu structure 5: Niche-focused

For saude:
```
Home | Sintomas | Tratamentos | Prevenção | Especialidades ▾ | Sobre
```

For automotivo:
```
Home | Lançamentos | Reviews | Mecânica | Mercado | Buscar
```

Roll variable: `menu_structure_style`.

## Widget areas

Standard WP widget areas: `sidebar-1` (main sidebar), `footer-1` to `footer-4`. Most portals over-populate these. Variations:

| Style | Treatment |
|---|---|
| `widget_heavy` | All sidebars populated, 5+ widgets each |
| `widget_minimal` | Only essentials: search + recent posts |
| `widget_none` | No widgets, sidebar removed |
| `widget_dynamic` | Different widgets per page type |
| `custom_blocks` | Use Gutenberg blocks instead of legacy widgets |

Roll variable: `widgets_style`.

## Recommended widget combinations per niche

Don't repeat the same widget combo across siblings:

**Saúde portal (Combo A):**
- Search
- Most read this week
- Newsletter signup
- Tag cloud (top 10 tags)

**Saúde portal (Combo B):**
- Latest posts
- Featured doctor / author
- Newsletter signup
- Categories

**Saúde portal (Combo C):**
- Search
- Categories
- Random post
- Social media feed

3 different combos for what looks like the same niche. Across 5 saude portals, rotate 3-5 combos.

## Custom post types and taxonomies

Most portals don't need CPTs. If you do create them, the slug is itself a fingerprint:

- `cpt_review` (auto/tech reviews)
- `cpt_recipe` (gastronomia)
- `cpt_event` (cultura/local)
- `cpt_obituary` (regional)
- `cpt_classified` (regional)

If two siblings both have a "review" CPT, slug them differently: one as `review`, another as `analise`, another as `avaliacao`.

## Date format

Brazilian portals usually display dates in pt-BR. Variations:

| Format | Example |
|---|---|
| `j de F de Y` | 1 de maio de 2026 |
| `d/m/Y` | 01/05/2026 |
| `j F Y` | 1 maio 2026 |
| `D, j \d\e F` | Qui, 1 de maio |
| `relative` | "há 2 horas", "ontem" |
| `iso_with_relative` | "01/05/2026 (há 2 dias)" |

Roll variable: `date_format`.

## Settings beyond UI

Some WP options that matter for fingerprinting:

| Option | Variations |
|---|---|
| `posts_per_page` (homepage) | 5, 7, 10, 12, 15 |
| `posts_per_rss` | 5, 10, 15, 20 |
| `comments_per_page` | 10, 25, 50 |
| `default_comment_status` | open, closed |
| `thread_comments_depth` | 0, 3, 5, 10 |
| `comment_registration` | 0, 1 |
| `default_pingback_flag` | 0, 1 |
| `default_ping_status` | open, closed |
| `blog_charset` | UTF-8 (don't vary, just confirm) |
| `gmt_offset` | -3 (Brazil); could vary to mask location, but stay coherent |

Setting these via wp-cli at portal install time, with different combinations per portal, creates DB-level diversity that some forensic tools check.

## Schema and SEO settings

If using Yoast/Rank Math:

| Setting | Variations |
|---|---|
| Site representation | Person vs Organization |
| Schema type per post | Article, NewsArticle, BlogPosting |
| Breadcrumb separator | >, /, |, →, none |
| Title separator | -, |, ::, –, → |
| Open Graph image strategy | Featured, custom OG image, fallback to logo |

## Anti-pattern: cookie-cutter setup

Avoid running the same wp-cli setup script across 5 portals back-to-back. The exact same options table values (with different domain) produce DB rows that hash similarly. Vary:

- Order in which posts are imported
- WordPress Customizer values
- Active plugins (some portals can omit certain plugins)
- Theme.json customizations
