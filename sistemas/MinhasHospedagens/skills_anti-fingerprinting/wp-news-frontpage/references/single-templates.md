# single.php Template Guide

`single.php` is the post-detail template. It receives 80%+ of the SEO traffic for a news portal because that is the URL that ranks on Google. Detection tools (Ahrefs, Semrush, Spamzilla, manual analysts) sample single posts to compare network similarity. Diversifying single.php is at least as important as diversifying front-page.php.

## 4 single archetypes

### Single Archetype I: Classic news article

Standard newsroom layout. Title, byline, lead image, body, related posts, comments. Inspired by G1, Folha de S. Paulo.

```
+-------------------------------------------+
|              HEADER + MENU                |
+-------------------------------------------+
|              BREADCRUMB                   |
+-------------------------------------------+
|         CATEGORY LABEL + DATE             |
|         POST TITLE (h1)                   |
|         BYLINE / AUTHOR                   |
+-------------------------------------------+
|         LEAD IMAGE (full width)           |
|         CAPTION                           |
+-------------------------------------------+
|     POST CONTENT (single column)          |
|     [in-article ad slot 1]                |
|     ... continue body ...                 |
|     [in-article ad slot 2]                |
+-------------------------------------------+
|         SHARE BUTTONS                     |
+-------------------------------------------+
|         AUTHOR BIO BOX                    |
+-------------------------------------------+
|         RELATED POSTS (4 cards)           |
+-------------------------------------------+
|         COMMENTS                          |
+-------------------------------------------+
|              FOOTER                       |
+-------------------------------------------+
```

**Best for:** Regional news, general news.

### Single Archetype II: Longform editorial

Magazine-style. Lots of whitespace, large typography, drop caps, pull quotes. Inspired by The Atlantic, Medium.

```
+-------------------------------------------+
|              HEADER + MENU                |
+-------------------------------------------+
|                                           |
|         FULL-BLEED HERO IMAGE             |
|                                           |
+-------------------------------------------+
|     CATEGORY                              |
|     LARGE TITLE                           |
|     SUBTITLE / DECK                       |
|     BYLINE + DATE + READ TIME             |
+-------------------------------------------+
|                                           |
|     CONTENT (narrow column, drop cap)     |
|                                           |
|     [pull quote section break]            |
|                                           |
|     ... continue ...                      |
|                                           |
|     [in-article ad slot]                  |
|                                           |
+-------------------------------------------+
|         AUTHOR BIO (large, sidebar)       |
+-------------------------------------------+
|         RELATED POSTS (3 large cards)     |
+-------------------------------------------+
|              FOOTER                       |
+-------------------------------------------+
```

**Best for:** Editorial portals (saude, estilo de vida, opinion).

### Single Archetype III: Tabloid / news-flash

Fast-loading, mobile-first, lots of ads, condensed. Inspired by tabloids and aggregator portals.

```
+-------------------------------------------+
|              HEADER + MENU                |
+-------------------------------------------+
|         BREADCRUMB                        |
|         CATEGORY + DATE                   |
|         TITLE (h1)                        |
+-------------------------------------------+
|         [AD SLOT - in-line]               |
+-------------------------------------------+
|         LEAD IMAGE                        |
+-------------------------------------------+
|     CONTENT (single column)               |
|     [ad slot every 2 paragraphs]          |
|     ... body ...                          |
+-------------------------------------------+
|         "VEJA TAMBÉM" inline grid         |
+-------------------------------------------+
|         [AD SLOT - bottom]                |
+-------------------------------------------+
|         COMMENTS (collapsed by default)   |
+-------------------------------------------+
|              FOOTER                       |
+-------------------------------------------+
```

**Best for:** High-traffic aggregator portals, automotive, entertainment.

### Single Archetype IV: Sidebar-rich classic

Two-column with active sidebar. Trending posts, ads, newsletter, all visible while reading.

```
+-------------------------------------------+
|              HEADER + MENU                |
+-----------------------+-------------------+
|     BREADCRUMB        |                   |
|     TITLE (h1)        |   POPULAR POSTS   |
|     META              |                   |
|                       |   AD              |
|     LEAD IMAGE        |                   |
|                       |   NEWSLETTER      |
|     CONTENT           |                   |
|     [in-article ad]   |   AD              |
|                       |                   |
|     ...               |   TAGS / TOPICS   |
|                       |                   |
+-----------------------+-------------------+
|         RELATED POSTS                     |
+-------------------------------------------+
|         COMMENTS                          |
+-------------------------------------------+
|              FOOTER                       |
+-------------------------------------------+
```

**Best for:** Portals with mature archive, high return-visit traffic.

## Single-specific fingerprint variables

These are independent from the front-page roll. A portal can have front-page Archetype A and single Archetype II.

### single_archetype `critical`

| Value | Description |
|---|---|
| `I_classic` | Classic newsroom |
| `II_longform` | Magazine editorial |
| `III_tabloid` | Tabloid / news-flash |
| `IV_sidebar_rich` | Two-column with active sidebar |

### byline_position `critical`

| Value | Layout |
|---|---|
| `under_title` | Author name and date below the title |
| `above_title` | Compact metadata strip above title |
| `floating_left` | Sticky author card on left margin |
| `inline_first_para` | Embedded in opening paragraph |
| `hidden` | No visible byline |

### related_posts_layout `critical`

| Value | Layout |
|---|---|
| `grid_4` | 4 cards in horizontal grid |
| `grid_6` | 6 cards in 2x3 grid |
| `vertical_list_5` | Vertical list with thumbnails |
| `inline_3_during_content` | Injected mid-article |
| `popup_after_scroll` | Modal after 80% scroll (rarely) |
| `none` | No related posts section |

### comments_treatment `critical`

| Value | Behavior |
|---|---|
| `wp_native` | Default WordPress comments |
| `disqus` | Disqus embed |
| `facebook` | Facebook comments plugin |
| `lazy_native` | Native, but loaded only on click |
| `disabled` | Comments closed |

### share_buttons_position `secondary`

| Value | Position |
|---|---|
| `top_only` | Above content |
| `bottom_only` | Below content |
| `top_and_bottom` | Both |
| `floating_left_sticky` | Sticky bar on left |
| `floating_right_sticky` | Sticky bar on right |
| `inline_after_first_para` | Embedded |
| `none` | No share buttons |

### in_article_ad_pattern `critical`

| Value | Pattern |
|---|---|
| `none` | No in-article ads |
| `after_2nd_para` | Single ad after 2nd paragraph |
| `every_3_paras` | Every 3 paragraphs |
| `every_5_paras` | Every 5 paragraphs |
| `auto_ads` | Google Auto Ads only |
| `mid_only` | Single ad at content midpoint |

### breadcrumb_style `secondary`

| Value | Style |
|---|---|
| `text_arrows` | Home > Category > Post |
| `text_slashes` | Home / Category / Post |
| `text_pipes` | Home \| Category \| Post |
| `chevron_icons` | Visual icons between |
| `none` | No breadcrumb |

### featured_image_treatment `critical`

| Value | Treatment |
|---|---|
| `full_bleed` | Edge-to-edge of viewport |
| `boxed_max_width` | Inside content max-width |
| `parallax` | Parallax scroll on hero |
| `cropped_aspect` | Cropped to fixed aspect |
| `none` | No featured image (rare) |

### post_meta_visibility `secondary`

Combinations of: author, date, modified date, category, tags, read time, view count, comments count.

| Value | Shown |
|---|---|
| `minimal` | Date only |
| `classic` | Date + Category |
| `tech_blog` | Date + Read time + Category |
| `news_full` | Author + Date + Category + Tags |
| `engagement` | Date + Comments + Views |
| `none` | No meta visible |

### author_bio_box `secondary`

| Value | Treatment |
|---|---|
| `compact` | Avatar + 1-line bio |
| `expanded` | Avatar + multi-line bio + social |
| `card_style` | Boxed with border + CTA |
| `none` | Hidden |

### content_typography `critical`

| Value | Style |
|---|---|
| `news_compact` | Small body (16px), tight line-height |
| `news_comfortable` | Standard 18px, line-height 1.6 |
| `editorial_large` | 20-22px body, line-height 1.8, drop cap |
| `magazine_serif` | Serif font, large body |
| `mono_minimal` | Monospaced or near-mono, restrained |

## Required structure for every single.php

1. Title (`<h1>`) — exactly one h1 per page
2. Featured image with `width`/`height` attributes (CLS prevention)
3. Schema.org Article markup (JSON-LD or microdata)
4. Open Graph + Twitter Card meta in `<head>` (theme usually handles this)
5. Reset post data after any secondary loop
6. Disable WP autoembed if you don't use it (small perf gain)

## Related posts loop: `$post` global gotcha

See SKILL.md hard-won bug #16 for the canonical version. Short form for single-template authors:

The "Leia também" / related-posts block is the place where this bug bites hardest, because the single page already has the global `$post` set to the current post. If the loop only updates a local variable, every card renders the current post repeatedly.

**DO NOT WRITE THIS:**
```php
foreach ( $rel_ids as $rid ) :
    $rp = get_post( $rid );
    setup_postdata( $rp );      // does NOT update $GLOBALS['post']
    oie_card( 'default' );       // helper reads global → renders current single
endforeach;
```

**Acceptable patterns (pick one per portal):**

1. Update the global and restore after the loop:
```php
global $post;
$_orig_post = $post;
foreach ( $rel_ids as $rid ) {
    $post = get_post( $rid );
    setup_postdata( $post );
    oie_card( 'default' );
}
$post = $_orig_post;
wp_reset_postdata();
```

2. Pass the ID explicitly to every WP function (no `setup_postdata` needed):
```php
foreach ( $rel_ids as $rid ) {
    $thumb = get_the_post_thumbnail( $rid, 'medium', array( 'alt' => '' ) );
    $title = get_the_title( $rid );
    $url   = get_permalink( $rid );
    // ... render inline
}
```

3. `$GLOBALS['post']` variant of (1):
```php
foreach ( $rel_ids as $rid ) {
    $GLOBALS['post'] = get_post( $rid );
    setup_postdata( $GLOBALS['post'] );
    oie_card( 'default' );
}
wp_reset_postdata();
```

Audit check after writing single.php:
```bash
grep -nE 'setup_postdata\s*\(\s*\$' generated/<portal>/single.php
```
If the variable inside `setup_postdata()` is not `$post` or `$GLOBALS['post']`, inspect the helper called next: if it relies on `the_title()`/`the_permalink()`/`the_post_thumbnail()` without an ID arg, this is the bug.

## What varies inside single archetypes

Within a single archetype, vary:
- Where the lead image sits (above title, below title, between subtitle and body)
- How the byline renders (simple text, with avatar, with icons, sidebar block)
- Whether the breadcrumb appears at top or after title
- Where in-article ads inject
- Pull quote treatment (border style, icon, alignment)

## Cross-template consistency rules

The `class_naming` and `wrapper_semantics` chosen for front-page.php should also apply to single.php. Reusing the same convention internally is fine, the goal is differentiation across portals (network), not across templates within one portal.

The `font_strategy`, `image_ratio`, `php_comments`, and `indentation` rolls also apply consistently across templates in the same portal.
