# category.php / archive.php Template Guide

The category template renders post listings filtered by taxonomy. It is the second-most-trafficked template after single posts. Detection tools sample category pages because they show the portal's editorial hand at scale.

## 4 archive archetypes

### Archive Archetype α: Dense list

Compact list view. 15-20 posts per page, vertical, image left + text right. Good for portals with high post volume and mobile-heavy traffic.

```
+-------------------------------------------+
|              HEADER + MENU                |
+-------------------------------------------+
|     CATEGORY TITLE (h1)                   |
|     Description (1 paragraph)             |
+-------------------------------------------+
|  [thumb]  Post title                      |
|           Excerpt 1 line                  |
|           Date | category                 |
+-------------------------------------------+
|  [thumb]  Post title                      |
|           Excerpt 1 line                  |
|           Date | category                 |
+-------------------------------------------+
|         [in-feed ad after 5th]            |
+-------------------------------------------+
|         ... 10 more posts ...             |
+-------------------------------------------+
|         PAGINATION                        |
+-------------------------------------------+
|              FOOTER                       |
+-------------------------------------------+
```

### Archive Archetype β: Magazine grid

Visual grid. 9-12 posts per page in 3 or 4 columns, image-top cards. Good for visual niches.

```
+-------------------------------------------+
|              HEADER + MENU                |
+-------------------------------------------+
|     CATEGORY HERO (featured post)         |
+-------------------------------------------+
|   [card] | [card] | [card] | [card]       |
+-------------------------------------------+
|   [card] | [card] | [card] | [card]       |
+-------------------------------------------+
|         [native in-feed ad]                |
+-------------------------------------------+
|   [card] | [card] | [card] | [card]       |
+-------------------------------------------+
|         LOAD MORE / NUMBERED              |
+-------------------------------------------+
|              FOOTER                       |
+-------------------------------------------+
```

### Archive Archetype γ: Editorial column

Single column, large cards, magazine-style. 6-8 posts per page.

```
+-------------------------------------------+
|              HEADER + MENU                |
+-------------------------------------------+
|     CATEGORY TITLE                        |
|     Subtitle                              |
+-------------------------------------------+
|     [POST CARD - large image, big title]  |
+-------------------------------------------+
|     [POST CARD - large image, big title]  |
+-------------------------------------------+
|         [in-feed ad after 3rd]            |
+-------------------------------------------+
|     [POST CARD - large image, big title]  |
+-------------------------------------------+
|         PAGINATION (prev/next only)       |
+-------------------------------------------+
|              FOOTER                       |
+-------------------------------------------+
```

### Archive Archetype δ: Hub with sub-categories

Two-tier listing. Top section shows children/related categories, bottom shows posts. Good for portals with deep taxonomy.

```
+-------------------------------------------+
|              HEADER + MENU                |
+-------------------------------------------+
|     PARENT CATEGORY: Saúde                |
+-------------------------------------------+
|  Sub: Cardio | Sub: Endo | Sub: Pediatria |
+-------------------------------------------+
|     LATEST IN CATEGORY (3-4 cards)        |
+-------------------------------------------+
|     MOST READ (sidebar or strip)          |
+-------------------------------------------+
|     [in-feed ad]                          |
+-------------------------------------------+
|     FULL POST LIST (numbered or load more)|
+-------------------------------------------+
|              FOOTER                       |
+-------------------------------------------+
```

## Archive-specific fingerprint variables

### archive_archetype `critical`

| Value | Layout |
|---|---|
| `alpha_dense_list` | Compact vertical list |
| `beta_magazine_grid` | Multi-column visual grid |
| `gamma_editorial_column` | Single column, large cards |
| `delta_hub_subcategories` | Two-tier with subcat nav |

### posts_per_archive_page `critical`

| Value | Density |
|---|---|
| `8` | Sparse, magazine feel |
| `10` | Moderate |
| `12` | Standard grid (3x4 or 4x3) |
| `15` | Dense list |
| `20` | Very dense, traffic-driven |

### archive_pagination `secondary`

| Value | Behavior |
|---|---|
| `numbered_top_bottom` | 1 2 3 ... at top and bottom |
| `numbered_bottom` | Only at bottom |
| `prev_next_only` | Just prev/next |
| `load_more_button` | JS button |
| `infinite_scroll` | Auto-load |

### category_description_position `secondary`

| Value | Position |
|---|---|
| `top_subtitle` | Below title, before posts |
| `top_inside_box` | Boxed callout above posts |
| `sidebar_only` | In sidebar, not main content |
| `none` | Hidden |

### archive_card_density `critical`

For Archetype β (grid):

| Value | Columns desktop / tablet / mobile |
|---|---|
| `2_2_1` | 2 / 2 / 1 |
| `3_2_1` | 3 / 2 / 1 |
| `4_2_1` | 4 / 2 / 1 |
| `4_3_2` | 4 / 3 / 2 (compact) |
| `mixed_featured` | First post wide, rest in 3-col grid |

### subcategory_strip_treatment `secondary`

For Archetype δ:

| Value | Style |
|---|---|
| `pills` | Rounded buttons |
| `tabs` | Underlined tabs |
| `dropdown` | Single dropdown |
| `breadcrumb_chain` | Inline chain |
| `boxed_grid` | Cards with thumbnails |

### archive_h1_treatment `secondary`

| Value | Style |
|---|---|
| `h1_only` | Just the category name as h1 |
| `h1_with_count` | "Saúde (127 artigos)" |
| `h1_with_description` | h1 + lead paragraph |
| `h1_with_featured_post` | h1 + featured post hero block |

## Required schema for archive pages

CollectionPage with hasPart entries pointing to each post listed:

```json
{
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Saúde",
    "description": "Artigos sobre saúde e bem-estar",
    "url": "https://portal.com.br/categoria/saude",
    "hasPart": [
        { "@type": "NewsArticle", "headline": "...", "url": "..." },
        ...
    ]
}
```

Schema choice for archives is its own variable: `CollectionPage`, `ItemList`, or `WebPage` (no list).

## What varies inside archive archetypes

- Whether to show category description at top, in sidebar, or hide
- Whether to show subcategory navigation
- Whether to show "most read" sidebar
- In-feed ad position (after 3rd, 5th, 7th post)
- Whether the first post is featured (larger card) or treated like the rest
- How pagination renders

## Cross-template consistency

`class_naming`, `wrapper_semantics`, `image_ratio`, `font_strategy`, `php_comments` follow the same values used in front-page.php and single.php. Pick once per portal, apply everywhere.
