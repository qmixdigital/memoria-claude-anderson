# Fingerprint Variable Matrix

This is the core of the skill. For every portal, roll values from this matrix to ensure structural distinctness across the network. Sibling portals on the same VPS, same Cloudflare account, or same hosting cluster need maximum variation. Portals on different infrastructure can share more values, but never copy a full roll.

## How to use this matrix

For each variable below, choose one value. Record the chosen values in the file header comment. When generating a new portal, look at the previous portal's header (if available) and pick different values for at least 7 of the 12 main variables. If you cannot see previous portals, randomize broadly.

Variables marked `critical` should always vary across sibling portals. Variables marked `secondary` can repeat with lower risk.

## Main variable matrix

### 1. Class naming convention `critical`

How CSS classes are named throughout the template. Choose one and apply consistently within the file.

| Value | Pattern | Example |
|---|---|---|
| `bem` | Block Element Modifier | `news-card__title news-card__title--featured` |
| `utility` | Tailwind-style atomic | `text-lg font-bold mb-4 text-gray-900` |
| `semantic` | Plain semantic names | `headline-major`, `category-title`, `lead-image` |
| `prefixed` | Portal-prefix BEM hybrid | `gx-card`, `gx-card__title`, `nx-grid--3col` |

Mixing two conventions in the same file is itself a fingerprint variable. Sometimes do it.

### 2. Sidebar position `critical`

| Value | Notes |
|---|---|
| `right` | Most common, use sparingly across the network |
| `left` | Less common, classic newspaper feel |
| `none` | Full-width content, modern feel, faster LCP |
| `dual` | Two sidebars, classic magazine, heavier |
| `floating` | Sticky right sidebar, single column on tablet |

### 3. Card style `critical`

| Value | Layout |
|---|---|
| `image_top` | Image above title, classic blog |
| `image_left` | Image left, text right (horizontal card) |
| `image_right` | Image right, text left |
| `overlay` | Title overlaid on image with gradient |
| `text_only` | No image, headline-driven (works for opinion or breaking strips) |
| `mixed` | Different cards in same grid use different styles |

### 4. Hero variant `critical`

| Value | Layout |
|---|---|
| `single` | One large featured post, full width |
| `dual` | Two side-by-side featured posts |
| `triptych` | One large left, two stacked right |
| `slider` | Carousel of 3 to 5 featured posts (heavier, hurts LCP, use rarely) |
| `grid` | 4 to 6 posts in a grid, no single hero |
| `boxed` | Hero inside a max-width container, not full-bleed |
| `bleed` | Hero extends edge to edge of viewport |

### 5. Breaking news strip `critical`

| Value | Treatment |
|---|---|
| `ticker` | Auto-scrolling horizontal text |
| `static_strip` | Fixed bar with 3 to 5 latest headlines |
| `vertical_list` | Compact list above fold |
| `tab_filter` | Tabs to filter by category |
| `none` | Omit entirely |

### 6. Schema.org markup `secondary`

| Value | Output |
|---|---|
| `itemlist` | Single ItemList schema for the front-page feed |
| `collectionpage` | CollectionPage with hasPart entries |
| `both` | Both, nested |
| `webpage_only` | Just WebPage, no list schema |
| `none` | No schema at all on front-page (rare, only if generating from plugin) |

### 7. Pagination style `secondary`

| Value | Behavior |
|---|---|
| `numbered` | 1, 2, 3, ... Next, classic |
| `prev_next` | Just prev / next links |
| `load_more` | JS button to append more |
| `infinite` | Auto-load on scroll |
| `none` | Front-page is curated, no pagination |

### 8. Posts per category block `secondary`

Pick a number that is not a typical default. Avoid 6 if every other portal uses 6.

| Value | Density |
|---|---|
| 4 | Sparse, magazine feel |
| 5 | Odd number, asymmetric grids |
| 7 | Odd, taller blocks |
| 8 | Dense, traffic-driven feel |
| 9 | 3x3 grid |

### 9. Excerpt length `secondary`

| Value | Words |
|---|---|
| `none` | Title only |
| `short` | 12 to 18 words |
| `medium` | 25 to 40 words |
| `long` | 50 to 70 words |
| `mixed` | Featured posts get long, grid posts get short |

### 10. Meta visibility `secondary`

For each card, decide which of these to show: author, date, category, comment count, read time. Common defaults are date plus category. Vary by hiding one, adding read time, hiding all but date, etc.

### 11. Image aspect ratio `critical`

| Value | Ratio |
|---|---|
| `16x9` | Most common, video-style |
| `4x3` | Classic photo |
| `3x2` | Photojournalism |
| `1x1` | Square, modern |
| `21x9` | Cinematic, hero only |
| `mixed` | Different ratios in different sections |

Always set explicit width and height attributes to prevent CLS. Different aspect ratios across portals reduce footprint.

### 12. AdSense slot set `critical` (when AdSense is enabled)

See `assets/adsense-patterns.md` for the three sets. Rotate A, B, C across sibling portals.

## Secondary structural variables

These do not change visual layout but contribute to footprint reduction in the source HTML.

### Wrapper element semantics

For each main section, choose between `<section>`, `<article>`, `<div role="region">`, or `<aside>` where semantically valid. Different choices across portals shift the DOM signature.

### Heading hierarchy

Some portals use `<h2>` for category titles, others use `<h3>`. Some use `<h1>` for the site logo line, others use `<p class="logo">`. Vary deliberately.

### Comment style in PHP

| Style | Example |
|---|---|
| `phpdoc` | `/** Hero section */` |
| `inline` | `// Hero section` |
| `hash` | `# Hero section` |
| `none` | No comments, code only |
| `verbose_phpdoc` | Full DocBlock with @since, @author |

### Indentation

Tabs vs 2-space vs 4-space. WordPress core uses tabs. Some portals can deviate.

### Function and variable naming inside the template

| Style | Example |
|---|---|
| `wp_native` | `$wp_query`, `the_post()` |
| `custom_helpers` | `qmix_get_featured()`, `gx_render_card()` |
| `inline_only` | All logic inline, no helper functions |

### CSS handle naming when enqueuing

When the front-page enqueues its own stylesheet, the handle name is itself a fingerprint. Avoid `frontpage-style` on every portal. Use names tied to the niche (`auto-front`, `saude-home`, `regional-capa`).

### Hidden HTML comments

Some templates ship with `<!-- Built with QMIX network template v2 -->` style comments. Never do this. Either use unrelated comments or none.

## Anti-patterns to avoid across the network

These signatures are network-wide footprints regardless of variation. Eliminate them entirely:

- Same default WordPress menu IDs across portals (rename menus per portal)
- Identical custom CSS class prefixes like `qmix-` on every portal (use portal-specific prefixes)
- Same set of enqueued Google Fonts on every portal (use 3 to 4 different font pairings across the network)
- Identical favicon dimensions across portals (vary 16x16, 32x32, 48x48 sources)
- Same Open Graph image dimensions across portals
- Same theme.json customizations copy-pasted between portals
- Same Cloudflare page rules signatures (this is infra-level, but worth noting)

## Roll example

For Portal Alpha (regional news, GeneratePress):

```
class_naming: utility
sidebar: none
card_style: image_top
hero_variant: triptych
breaking_strip: ticker
schema: itemlist
pagination: load_more
posts_per_category: 5
excerpt: short
image_ratio: 16x9
adsense_set: A
```

For Portal Beta (sibling of Alpha, also regional, GeneratePress):

```
class_naming: bem
sidebar: right
card_style: image_left
hero_variant: dual
breaking_strip: vertical_list
schema: both
pagination: numbered
posts_per_category: 7
excerpt: medium
image_ratio: 4x3
adsense_set: B
```

11 of 12 variables differ. This is the goal.
