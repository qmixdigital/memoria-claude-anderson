---
name: wp-news-portal-fullsetup
description: Generate a complete, fingerprint-diversified WordPress news portal package (theme, front-page, single, archive, header/footer, visual identity) for QMIX Digital's network. Use whenever Anderson or Guilherme asks to create, edit, refactor, redesign, or "diversify" a portal in the network. Triggers on "novo portal", "diferenciar portal", "trocar tema", "front page", "single", "category", "homepage do portal", "página principal", "deixar diferente", "fingerprint", or when GeneratePress, Blocksy, Kadence, or SmartMag are named in portal-network context. Produces ready-to-deploy PHP/CSS files that can be uploaded via scripts/install_portal.py. Enforces structural distinctness across the 100+ portal network across every layer that detection tools fingerprint (DOM, CSS, palette, fonts, menu structure, permalink, schema, ad placement). Targets Core Web Vitals (LCP under 2.0s, CLS under 0.05, INP under 150ms). Always use for full-portal work even when diversification is not explicitly requested.
---

# WordPress News Portal Full Setup

This skill generates a complete portal package for QMIX Digital's network of 100+ Brazilian news portals. It is no longer just a `front-page.php` generator: it produces theme + front-page + single + archive + header + footer + visual-identity CSS, all rolled to be visibly and structurally distinct from sibling portals on the same VPS or niche.

## Critical context

The network runs editorial backlinks. Footprint reduction is core risk management. Detection tools (Ahrefs, Semrush, Spamzilla, Majestic, manual SEO analysts) sample multiple pages of multiple portals to compute similarity. They fingerprint:

- DOM structure (front-page, single, archive)
- CSS class names + computed-style hashes
- Color palette and font family
- Schema.org markup type and shape
- Menu structure and order
- Footer text and links
- Permalink format
- AdSense slot positions
- Plugin signatures (REST routes that leak)
- Image dimensions and aspect ratios

Every output of this skill must vary every layer above for the new portal vs neighbors.

Anderson dislikes em dashes. Never use `—` anywhere in code, comments, fallback strings, placeholder content, or examples. Use commas, colons, parentheses, or sentence breaks.

## Workflow when triggered

Follow these steps in order. Do not skip steps even when the user gives a short prompt.

**1. Gather portal context.** Confirm or infer:
- Portal domain (e.g. `novoportal.com.br`)
- Parent theme (GeneratePress, Blocksy, Kadence, or SmartMag for legacy work)
- Niche (general news, regional, saude, automotivo, esportes, etc.)
- VPS / hosting bucket (h-anderson, h-vps1, hostverge, opengravity)
- Any explicit neighbor portals to avoid copying
- Whether AdSense slots are needed
- Approximate post archive size (affects how many sections make sense)
- **Whether the portal has multilingual categories** (pt-PT, en-US, etc.) that must be hidden from the home. If yes, ask which slugs.

If any of the above are not stated, ask once briefly and proceed with stated assumptions.

**2. Roll the fingerprint, do not invent it.** Run `scripts/roll.py` first:

```bash
python scripts/roll.py --portal=<domain> --vps=<vps> --niche=<niche> \
    --theme=<theme> [--archetype=<A|B|C|D|E>] \
    [--exclude-lang-categories=pt-pt,en-us] --append
```

The `--exclude-lang-categories` flag tells the skill to inject the multi-language exclusion code into `functions.php` and the secondary loops in `front-page.php`. Pass empty (or omit) for portals with single-language content.

The script reads `data/fingerprint-rolls.json`, identifies neighbor portals (same VPS, same niche, plus any explicit list), and chooses values that diverge from neighbors in at least 18 of 24+ critical variables. The output is the PHP comment header. Append with `--append` so the next portal sees this roll as a neighbor.

If the operator already ran `roll.py` and pasted the header, take the values from there and skip the LLM-side randomization. **Never re-randomize values that were already rolled by the script.**

**3. Validate the roll against the matrices.** Read every reference file once:
- `references/fingerprint-vars.md`: front-page-level vars
- `references/multilang-exclusion.md`: how to hide non-default-language categories from the home (when applicable)
- `references/single-templates.md`: single.php archetypes and vars
- `references/archive-templates.md`: archive/category vars
- `references/chrome.md`: header + footer vars
- `references/visual-identity.md`: palette, fonts, spacing, radius, shadow
- `references/structure.md`: permalink, menu, widgets, date format
- `references/theme-management.md`: theme install/switch via wp-cli
- `references/performance.md`: LCP/CLS/INP targets
- `references/layouts.md`: 5 front-page archetypes
- `assets/adsense-patterns.md`: 3 ad slot sets
- `assets/example-frontpage.md`: complete example output

Confirm every chosen value is in the matrix and divergence vs neighbors is acceptable. If anything is off, escalate to the operator before generating files.

**4. Generate the file set in `generated/<portal>/`** (ready for upload):

```
generated/<portal>/
├── style.css            (child theme metadata + CSS variables block)
├── functions.php        (enqueues + theme support + menus + widgets)
├── header.php           (chrome variant from chrome.md)
├── footer.php           (chrome variant from chrome.md)
├── front-page.php       (front archetype from layouts.md)
├── single.php           (single archetype from single-templates.md)
├── archive.php          (archive archetype from archive-templates.md)
├── search.php           (simple, follows archive patterns)
├── 404.php              (simple, follows chrome patterns)
├── template-parts/
│   ├── card-default.php
│   ├── card-featured.php
│   └── post-meta.php
├── inc/
│   └── helpers.php      (helper functions used by templates)
└── assets/css/
    ├── home.css         (front-page-only CSS)
    └── single.css       (single-post-only CSS)
```

Every file starts with the same header comment listing the roll, so future edits can see the choices at a glance.

**4.5. Compatibility with Antonio (QMIX content reception).**

Antonio is the REST endpoint that the QMIX platform uses to push articles into each portal. It lives in a mu-plugin (`wp-content/mu-plugins/...`) registered REST namespace per-portal. **The full-portal generation does NOT touch mu-plugins**, so Antonio survives a theme switch as long as the operator runs `install_portal.py` correctly. Three rules:

1. The generated `functions.php` must include `add_theme_support('post-thumbnails')` so featured images that Antonio sets via `set_post_thumbnail()` continue to render. The generation rules already enforce this.
2. The generated `single.php` must call `the_post_thumbnail()` (or render the featured image markup) so Antonio-imported posts display the thumbnail. The single-templates.md archetypes already enforce this.
2.1. **Front-page MUST hide posts without a real featured image — two-layer defense.** Cards on the home depend on `the_post_thumbnail()`. A card without an image looks broken and dilutes editorial quality. Apply BOTH filters together — neither one alone is sufficient:

   **Layer 1 — `meta_query` at the SQL level.** Every home query (hero, "em alta"/trending, per-category blocks, "últimas", sidebar "mais lidos", breaking strip panes, schema CollectionPage `mainEntity`) must filter by `_thumbnail_id` greater than zero. **`compare => 'EXISTS'` is NOT enough**: WordPress + plugins (Elementor, importers like Antonio, deleted attachments) frequently leave `_thumbnail_id` rows with empty string `''` or value `0`, which all pass `EXISTS`. Use numeric comparison:

   ```php
   function oie_query_for_section( $args = array() ) {
       $defaults = array(
           'posts_per_page'      => 5,
           'no_found_rows'       => true,
           'ignore_sticky_posts' => true,
           'category__not_in'    => oie_excluded_lang_cat_ids(),
           'meta_query'          => array(
               array(
                   'key'     => '_thumbnail_id',
                   'value'   => '0',
                   'compare' => '>',
                   'type'    => 'NUMERIC',
               ),
           ),
       );
       return new WP_Query( wp_parse_args( $args, $defaults ) );
   }
   ```

   **Layer 2 — `has_post_thumbnail()` skip inside every loop.** The `_thumbnail_id` may point to a deleted/missing attachment, so even a numeric ID > 0 can fail at render time. Always wrap the loop body and request a 3× over-fetch so you can drop bad rows and still hit the target count:

   ```php
   $trend = oie_query_for_section( array(
       'posts_per_page' => 18,           // 3× the 6 we want to display
       'post__not_in'   => $hero_ids,
   ) );
   $shown = 0;
   while ( $trend->have_posts() ) {
       $trend->the_post();
       if ( ! has_post_thumbnail() ) { continue; }
       if ( $shown >= 6 ) { break; }
       oie_card( 'default' );
       $shown++;
   }
   wp_reset_postdata();
   ```

   For per-category blocks where the layout assigns specific positions (1 featured + 2 mid + 2 compact), pre-collect the surviving IDs, then render by index — do NOT mix `setup_postdata()` with mid-loop `continue` on positional templates:

   ```php
   $q = oie_query_for_section( array( 'posts_per_page' => 15, 'cat' => $cat->term_id ) );
   $ids = array();
   while ( $q->have_posts() ) {
       $q->the_post();
       if ( ! has_post_thumbnail() ) { continue; }
       $ids[] = get_the_ID();
       if ( count( $ids ) >= 5 ) { break; }
   }
   wp_reset_postdata();
   if ( empty( $ids ) ) { continue; }
   // Then render $ids[0] as featured, array_slice($ids,1,2) as mid, etc.
   ```

   **Scope.** This rule applies **only to the front page** (and its sub-blocks: hero, breaking strip, trending, per-category, latest, sidebar mais-lidos, schema). Archives, single-post related-posts blocks, search results, internal-page widgets and the RSS feed remain unfiltered — they exist to surface every post regardless of media. Do not propagate the meta_query to archive.php, single.php related blocks, or search.php.

2.2. **The card template MUST render the featured image when card_style includes media.** Hiding posts without thumbnails (rule 2.1) is necessary but **not sufficient**: if the card template itself never calls `the_post_thumbnail()`, every card will look "imageless" to the operator regardless of what the query returned. Two failure modes to avoid:

   - **`card_style: text_only` + image-rich content** — looks broken on portals where every post has a real cover. Reserve `text_only` for portals that explicitly want a wire-style minimal feed; otherwise default to the `has-media` variant.
   - **The card helper must short-circuit when no thumbnail.** Even after rule 2.1, defense-in-depth means the helper itself should `return` early on `! has_post_thumbnail()`:

     ```php
     function oie_card( $density = 'default' ) {
         if ( ! has_post_thumbnail() ) { return; }   // hard stop, never render an empty-image card
         // … rest renders the image first, then body
     }
     ```

   Layout variants:
   - **default / lg / xl**: image on top (16:10 or 4:3), body below.
   - **compact**: image left (1:1, 110px), body right — used in dense category sub-grids and "mais de [categoria]" sidebar lists.
   - **ranked (em alta)**: image full-bleed top, the counter renders absolute over the top-left corner with a stroke for legibility (`-webkit-text-stroke`).

   Add `aria-hidden="true" tabindex="-1"` on the image link so screen-reader users only encounter the headline link once (the image link duplicates the destination).
3. **NEVER change permalinks on any portal of the network — full stop.** Anderson's instruction is absolute: every portal must always be deployed with `--preserve-permalink`. URLs are sacred even when the existing structure looks ugly or non-default. Reason: each portal in the network has indexed URLs in Google, inbound editorial backlinks, Antonio's stored `permalink` references, and SEO equity tied to the exact path. A single URL change cascades into 404s, lost rankings, broken backlinks, and Antonio post-creation drift. If the operator forgets the flag, the script falls back to the rolled `permalink_structure` value, which is wrong. **Always pass `--preserve-permalink`**:

```bash
python scripts/install_portal.py --portal=<domain> ... --preserve-permalink
```

`install_portal.py` runs an Antonio health check before and after deploy: lists REST routes, looks for `/artigos` endpoints, warns if missing.

**5. Apply Anderson's content rules**:
- No em dashes anywhere.
- Brazilian Portuguese for user-facing strings, including aria-labels and alt text.
- QMIX Digital opera desde 2020 if the portal references the agency.
- Editorial backlinks default to dofollow, permanent, contextual.
- `qmix.com.br` (not qmixdigital.com.br) when referencing the domain.

**6. Report a sibling-diff summary.** After generating, output a short table: variable, value, and what neighbor uses (if any). One line per critical variable. Lets the operator sanity-check at a glance.

**7. Suggest the deploy command.** After generation, remind the operator:

```bash
python scripts/install_portal.py --portal=<domain> \
    --ssh-host=<ssh_alias> --ssh-port=<port> \
    --wp-path=<absolute_path_to_wp> [--allow-root]
```

`install_portal.py` handles theme install, child-theme creation, file upload via SSH, theme activation, permalink/date/posts-per-page settings.

## Required structure of every portal

Independent of archetype rolls, every portal must produce:

**front-page.php** (see references/layouts.md for archetypes A-E):
- Hero/featured area
- Breaking strip (or omitted, per roll)
- At least 2 category blocks
- Most-read or trending block
- Pagination or load-more (per roll)
- Schema.org markup

**single.php** (see references/single-templates.md for archetypes I-IV):
- Title (one h1)
- Featured image with explicit width/height
- Body content
- Byline (per roll position)
- In-article ads (per roll pattern)
- Related posts (per roll layout)
- Comments (per roll treatment)
- Schema.org Article markup

**archive.php** (see references/archive-templates.md for archetypes α-δ):
- Category title (h1)
- Optional category description
- Post list (style per roll)
- Pagination (per roll)
- Schema.org CollectionPage or ItemList

**header.php** (see references/chrome.md for archetypes H1-H5):
- DOCTYPE, html lang, viewport, charset
- wp_head() before </head>
- Logo and primary menu
- Skip link (a11y)

**footer.php** (see references/chrome.md for archetypes F1-F5):
- Footer content per archetype
- wp_footer() before </body>

**style.css** (see references/visual-identity.md):
- Theme metadata block
- :root CSS variables for palette + fonts + spacing + radius + shadow
- Global resets and layout primitives
- Component classes that use the variables

## Anti-fingerprint cross-template consistency

Some values pick once per portal and apply to every template. Others vary per template.

| Variable | Picked once per portal | Same across templates? |
|---|---|---|
| class_naming | yes | yes |
| wrapper_semantics | yes | yes |
| image_ratio | yes | yes |
| font_strategy | yes | yes |
| php_comments | yes | yes |
| indentation | yes | yes |
| palette | yes | yes |
| font_pairing | yes | yes |
| spacing_scale | yes | yes |
| border_radius | yes | yes |
| shadow_style | yes | yes |
| sidebar (front-page) | yes | n/a |
| hero_variant | yes | n/a |
| single_archetype | yes | n/a |
| archive_archetype | yes | n/a |
| header_archetype | yes | n/a |
| footer_archetype | yes | n/a |

The roll.py output covers all of these in one record.

## Hard-won bugs (read before generating ANY portal)

These eight rules came from a real first-portal deploy that took several hours of debugging. Apply them upfront — they are not optional.

**1. Layout grid order matches HTML source order.** When using a 2-column grid like `grid-template-columns: minmax(0, 1fr) 320px`, the FIRST element in the HTML lands in the FIRST column (1fr, wide) and the SECOND lands in the SECOND column (320px, narrow). Therefore in `front-page.php` and any page using `oie-layout`/`oie-layout--single`, **the main content `<div>` MUST come before the `<aside class="oie-sidebar">` in the source**, regardless of which side the sidebar visually sits on. Do NOT try to reorder via `grid-column: 1` / `grid-column: 2` overrides — they are unreliable when other plugins inject grid styles. Source order = visual order.

**2. No `position: sticky` on the front-page sidebar.** Causes layout-shift bugs on pages with mixed-height columns and `align-items: start`. Keep sidebar `position: static`. Acceptable on internal pages (single, archive) only after smoke-testing.

**3. Disable lazy-loading on the front page.** WordPress core injects `loading="lazy"` on every image. With a long home (hero + trending + 4 category blocks + latest = 30+ images) the user sees images "popping in" as they scroll. Anderson reads this as a buggy animation. Always include in `functions.php`:
```php
add_filter( 'wp_lazy_loading_enabled', function ( $default, $tag, $context ) {
    if ( is_front_page() || is_home() ) { return false; }
    return $default;
}, 10, 3 );
add_filter( 'wp_get_attachment_image_attributes', function ( $attr ) {
    if ( is_front_page() || is_home() ) {
        $attr['loading']  = 'eager';
        $attr['decoding'] = 'async';
    }
    return $attr;
}, 99 );
```
And pass `'loading' => 'eager'` to `the_post_thumbnail()` in the front-page hero and `oie_card()`. Internal pages keep lazy normal.

**4. Force `content-visibility: visible` on every front-page region.** Newer browsers (Chrome 100+) and some plugins inject `content-visibility: auto` which skips rendering of off-screen elements until close to the viewport — visually identical to scroll-reveal animation, with no JS involved. Add a closing block to `style.css`:
```css
.oie-main, .oie-main-col, .oie-section,
.oie-front__row-three, .oie-front__cat-block, .oie-front__cat-grid,
.oie-card, .oie-card__body, .oie-card__media,
.oie-sidebar, .oie-widget {
    content-visibility: visible !important;
    opacity: 1 !important;
    visibility: visible !important;
}
```

**5. CSS/JS enqueues MUST cache-bust via `filemtime()`, not theme version.** LiteSpeed (and most CDN page caches) drops static `?ver=1.0.0` query strings via `optm-qs_rm`. Bump the file on every change with a server-side timestamp:
```php
$ver = file_exists( $abs ) ? filemtime( $abs ) : '1';
wp_enqueue_style( 'oie-child', $uri, array( 'oie-parent' ), $ver );
```
And install a backup filter that re-injects `?v=mtime` after LiteSpeed runs (priority 9999):
```php
add_filter( 'style_loader_src',  'oie_cache_bust_asset', 9999, 2 );
add_filter( 'script_loader_src', 'oie_cache_bust_asset', 9999, 2 );
```
Without both layers, edits ship to disk but the browser/CDN keeps serving the old bundle for up to 7 days.

**6. LiteSpeed Cache CSS optimizations break the editorial loop.** When a portal uses LiteSpeed, deploy with the following options pre-flipped to `0`:
```
litespeed.conf.optm-css_min, optm-css_comb, optm-css_async, optm-ucss,
litespeed.conf.optm-js_min, optm-js_comb, optm-qs_rm, optm-html_min
```
The combine/minify pipeline rebuilds a stale bundle on first request after deploy and serves it cached for a week even after `wp eval do_action('litespeed_purge_all')`. Keep page cache (`litespeed.conf.cache`) on for performance, kill only the asset-rewriting features.

**7. Title-Case category text everywhere on the front page — no `strtolower`/`strtoupper` in PHP, no `text-transform: uppercase` / `lowercase` in CSS.** Anderson rejects both extremes (lowercase looks "ridiculous", all-caps "looks shouty"). Every kicker, section h2, link, widget title outputs the original WP value (`$cat->name`, "Em alta", "Últimas", "Mais lidos"). The CSS `letter-spacing: .14-.18em` on kickers is fine and gives the editorial feel without changing case. **Do NOT** apply `text-transform` to any `.oie-section__h h2`, `.oie-card__cat`, `.oie-hero__cat`, footer h4, or section link.

**8. Hide front-page cards without a real featured image — TWO layers.** See rule 2.1 (Antonio compatibility section above). `compare => 'EXISTS'` is insufficient because importers leave `_thumbnail_id` rows with `''` or `'0'`. Use `compare => '>', value => '0', type => 'NUMERIC'` AND a `has_post_thumbnail()` skip inside every loop with 3× over-fetch (`posts_per_page` 3× target).

**9. Internalize Header/Footer Code Manager (HFCM) snippets — never keep the plugin.** Many portals in the network ship with HFCM holding 1-3 small snippets (Google Search Console verification, Meta Pixel, GTM, custom analytics). Read the snippets directly from the database and migrate them to `functions.php` so the plugin can be deleted:

```bash
# Inspect what HFCM has
wp db query "SELECT name, location, status, snippet FROM wp_hfcm_scripts" --skip-column-names
```

Then in `functions.php`:

```php
/* ===== Snippets migrados do plugin Header Footer Code Manager ===== */
add_action( 'wp_head', function () {
    // Google Search Console — verificação de domínio
    echo '<meta name="google-site-verification" content="..." />' . "\n";
}, 1 );  // priority 1 = top of <head>, same as HFCM did

add_action( 'wp_footer', function () {
    // GTM, Pixel, custom analytics, etc.
}, 99 );
```

After deploy, `wp plugin deactivate header-footer-code-manager && wp plugin delete header-footer-code-manager`. Confirm via curl that the snippet still appears in the rendered HTML before removing the plugin. Document each migrated snippet with a one-line comment so the next operator knows what is what.

**10. The portal theme is ALWAYS a child theme of the parent — verify before any work.** The skill always generates a child theme (`Template: generatepress` line in `style.css`), but operators sometimes panic-ask "shouldn't we make a child theme?" thinking the parent IS the working theme. Always confirm with one wp-cli call:

```bash
wp eval 'echo "template=" . get_template() . PHP_EOL; echo "stylesheet=" . get_stylesheet() . PHP_EOL; echo "is_child=" . ( get_template() === get_stylesheet() ? "NAO" : "SIM" ) . PHP_EOL;'
```

Expected output:
```
template=generatepress
stylesheet=portal-<dominio>
is_child=SIM
```

If `is_child=NAO`, the operator activated the parent by mistake (or the install_portal.py activate step failed) — fix immediately. **Also enqueue de-dup the GP auto-load.** GeneratePress auto-enqueues the child theme's `style.css` as handle `generate-child` regardless of whether you also enqueued it as `oie-child`, causing a duplicate request. The generated `functions.php` MUST drop the GP handle:

```php
add_action( 'wp_enqueue_scripts', function () {
    wp_dequeue_style( 'generate-child' );
    wp_deregister_style( 'generate-child' );
    wp_enqueue_style( 'oie-parent', get_template_directory_uri() . '/style.css' );
    wp_enqueue_style( 'oie-child',  get_stylesheet_directory_uri() . '/style.css',
                      array( 'oie-parent' ), filemtime( get_stylesheet_directory() . '/style.css' ) );
    // ...
}, 100 );  // priority 100 > GP's default 10, so dequeue runs after GP enqueues
```

PageSpeed catches this immediately as "Render-blocking requests" with the same URL repeated.

**11. Antonio sanity-check is MANDATORY after every plugin removal/deactivation, not only after deploy.** When cleaning up plugins (smartmag-core, sphere-core, starbox, debloat, HFCM, elementor, etc.), one of them MAY have been silently registering or guarding the Antonio mu-plugins, and removing it can break content reception from the QMIX platform. Always run the same two checks `install_portal.py` runs, manually:

```bash
ls /home/<user>/domains/<portal>/public_html/wp-content/mu-plugins/*766b2a*
# Expect: hf-766b2a.php, lg-766b2a.php, s766b2a-bind.php, s766b2a-bind-pt.php,
#         s766b2a-i18n.php, s766b2a-links.php, s766b2a-shield.php, stats-766b2a.php

wp eval '$srv = rest_get_server();
         foreach ($srv->get_namespaces() as $ns)
             if (preg_match("/766b2a|b61b|qmix|artigo/", $ns))
                 echo $ns . PHP_EOL;'
# Expect at minimum: stats-766b2a/v1, b61b-api/v1
```

If any mu-plugin is missing or any namespace is gone, **rollback the plugin removal immediately** (`wp plugin install <slug> --activate`) and investigate which plugin's deactivation hook was tearing down the integration. Do not present the deploy as "complete" without these two checks passing.

**12. Slim WordPress core front-end output — every portal MUST ship with these dequeues in `functions.php`.** WordPress core injects a long list of features that an editorial portal does not use, but each one shows up on BuiltWith / Wappalyzer / detection tools as a fingerprint signal AND adds bytes/requests. The generated `functions.php` must always include the slim block below. It removes nothing the editorial template needs — only Gutenberg/oEmbed/legacy emoji bloat that was never used:

```php
/* ===== Enxugar WordPress core no front-end ===== */

// Twemoji (wp-emoji-loader.min.js)
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
remove_action( 'admin_print_styles', 'print_emoji_styles' );
remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
add_filter( 'tiny_mce_plugins', function ( $p ) {
    return is_array( $p ) ? array_diff( $p, array( 'wpemoji' ) ) : $p;
} );
add_filter( 'emoji_svg_url', '__return_false' );

// jQuery Migrate
add_action( 'wp_default_scripts', function ( $scripts ) {
    if ( ! is_admin() && isset( $scripts->registered['jquery'] ) ) {
        $jq = $scripts->registered['jquery'];
        if ( $jq->deps ) { $jq->deps = array_diff( $jq->deps, array( 'jquery-migrate' ) ); }
    }
} );

// oEmbed discovery + JS
remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
remove_action( 'wp_head', 'wp_oembed_add_host_js' );
remove_action( 'rest_api_init', 'wp_oembed_register_route' );
add_filter( 'embed_oembed_discover', '__return_false' );

// RSD, WLW manifest, generator meta, shortlinks, REST link, feed-links-extra
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'wp_shortlink_wp_head' );
remove_action( 'template_redirect', 'wp_shortlink_header', 11 );
remove_action( 'wp_head', 'rest_output_link_wp_head', 10 );
remove_action( 'wp_head', 'feed_links_extra', 3 );

// Dashicons no front (admin bar usa só pra logged-in)
add_action( 'wp_enqueue_scripts', function () {
    if ( ! is_user_logged_in() ) {
        wp_dequeue_style( 'dashicons' );
        wp_deregister_style( 'dashicons' );
    }
}, 200 );

// Gutenberg block library + classic-themes + global-styles + wp-img-auto-sizes-contain
add_action( 'wp_enqueue_scripts', function () {
    foreach ( array(
        'wp-block-library', 'wp-block-library-theme', 'wc-block-style',
        'classic-theme-styles', 'global-styles', 'wp-img-auto-sizes-contain',
    ) as $h ) { wp_dequeue_style( $h ); }
}, 200 );
remove_action( 'wp_enqueue_scripts', 'wp_enqueue_global_styles' );
remove_action( 'wp_footer', 'wp_enqueue_global_styles', 1 );
remove_action( 'wp_body_open', 'wp_global_styles_render_svg_filters' );
```

After applying, the home should serve **ONE `<link rel="stylesheet">` external** (the child theme), **ONE `<style>` inline** (`generate-style-inline-css`), and **ONE `<script src=...>`** (chrome.js or equivalent). If any of these counts grows back, a plugin re-enqueued the bloat — chase the offender. Validate with:

```bash
HTML=$(curl -s "https://<portal>/?nc=$(date +%s)")
echo "$HTML" | grep -oE "<style[^>]*id='[^']+'" | sed "s/.*id='//;s/'.*//" | sort | uniq -c
echo "$HTML" | grep -oE "<link[^>]*\.css[^>]*>" | wc -l
echo "$HTML" | grep -oE "<script[^>]*src=" | wc -l
```

**13. Inventory the site at deploy end — confirm zero zombie folders.** Detection tools (BuiltWith, Wappalyzer) and operators reading the file system both see leftover plugins/themes/cache folders as PBN signals or as security risks. Final sweep before declaring done:

```bash
# Plugins instalados vs pastas no disco — devem bater 1:1
wp plugin list --format=csv | tail -n +2 | cut -d, -f1 > /tmp/plugins-db.txt
ls /home/<user>/.../public_html/wp-content/plugins/ | grep -v 'index.php\|^\.' > /tmp/plugins-fs.txt
diff /tmp/plugins-db.txt /tmp/plugins-fs.txt   # vazio = ok

# Temas instalados vs pastas — devem bater 1:1 (apenas parent + child)
wp theme list --format=csv | tail -n +2 | cut -d, -f1 > /tmp/themes-db.txt
ls /home/<user>/.../public_html/wp-content/themes/ | grep -v 'index.php\|^\.' > /tmp/themes-fs.txt
diff /tmp/themes-db.txt /tmp/themes-fs.txt     # vazio = ok

# Pastas residuais conhecidas em wp-content/
du -sh wp-content/upgrade/ wp-content/cache/ wp-content/litespeed/ \
       wp-content/wflogs/ wp-content/uploads/imagify-backup/ \
       wp-content/backups-* 2>/dev/null
# upgrade/ deve estar vazia (resíduo de updates antigos: rm -rf wp-content/upgrade/*)
# cache/ idealmente não existe (LiteSpeed usa /litespeed/, não /cache/)
# imagify-backup/ deve ser limpo: rm -rf wp-content/uploads/backup wp-content/uploads/imagify-backup
# litespeed/ é runtime, manter
# wflogs/ é runtime do Wordfence, manter
```

Backups locais do tema antigo (criados pelo `install_portal.py` antes da troca) ficam em `~/backups-skill/`. **Manter por 30 dias** após deploy bem-sucedido, depois apagar para não acumular GB de tgz na conta. Documente isto no checkpoint final reportado ao operador.

**14. Every portal MUST ship the `wp oie audit-links` WP-CLI command for network-wide external-link cleanup.** Anderson does outbound-link audits across the 100+ portal network when a partner site is decommissioned, fails legal review, or starts ranking poorly enough to drag PageRank. Without a unified tool the operator would have to SSH into each portal individually with bespoke search-and-replace, which is slow and HTML-unsafe (`wp search-replace` is string-level, not DOM-level). The skill's `functions.php` template MUST always include the command below — and **for legacy portals that don't use this skill, the same command MUST be deployed as a mu-plugin** (`wp-content/mu-plugins/oie-link-audit.php`) so it works regardless of theme.

The command spec:

```
wp oie audit-links --domain=alvo.com                       # audit only, table output
wp oie audit-links --domain=a.com,b.com                    # multiple targets
wp oie audit-links --domain=alvo.com --remove              # strip <a>, keep anchor text
wp oie audit-links --domain=alvo.com --remove --dry-run    # preview removal
wp oie audit-links --domain=alvo.com --remove --replacement=nofollow      # add rel="nofollow noopener"
wp oie audit-links --domain=alvo.com --remove --replacement=placeholder   # convert href to "#"
wp oie audit-links --domain=alvo.com --json                # JSON output for aggregation
wp oie audit-links --domain=alvo.com --post_status=any     # include drafts/pending
```

Implementation requirements (apply ALL):

a) **DOM-aware extraction**, not LIKE matching. Use regex `<a\s[^>]*?\bhref\s*=\s*(["\'])(.*?)\1` plus a second pass for raw `https?://...` text. Compare hosts with `wp_parse_url(..., PHP_URL_HOST)` after stripping `www.`; consider sub-matches via `str_ends_with($host, '.' . $domain)`.

b) **Backup before mutating.** Save the original `post_content` to `update_post_meta( $id, 'oie_link_removed_' . time(), $original )` before writing. Reversible per-post.

c) **Preserve `post_modified`.** Use `$wpdb->update($wpdb->posts, ['post_content' => $new], ['ID' => $id])` directly — NOT `wp_update_post()`. Updating `post_modified` on 100 portals at the same time is the #1 PBN fingerprint that Google's crawl-clustering tools detect.

d) **Replacement modes** (preserve flexibility):
   - `text` (default): strip the entire `<a ...>X</a>`, keep `X`. Cleanest.
   - `nofollow`: add `rel="nofollow noopener"` to the existing `<a>`. Use when removal would break sentence flow.
   - `placeholder`: convert `href` to `#` so the visual stays but the link dies.

e) **Cache flush per post.** `clean_post_cache( $id )` after each `$wpdb->update` so RankMath sitemap/object cache pick up immediately.

f) **JSON output**. Required for the "varra a rede inteira" workflow. Each portal returns `{site, domains, matches:[{ID,title,url,links,removed?}], removed, dry_run}` — orchestrator (the VS Code agent) aggregates across hostings.

g) **Mu-plugin variant** for legacy portals. Same code, file at `wp-content/mu-plugins/oie-link-audit.php`. Skill must auto-install this mu-plugin when running `install_portal.py` on a portal that doesn't yet have it (idempotent: skip if file exists with matching version header).

Network-wide orchestration rules (when the operator says "varra a rede atrás de alvo.com"):

i) **Pace deletions across days, not minutes.** Iterate the 100 portals over **3-7 days** with random jitter (4-12h between portals). All-at-once timestamping creates a clusterable signal even with `post_modified` preserved (HTTP `Last-Modified` from CDN, sitemap last-mod, etc.).

ii) **Anchor-text variance check.** Before removing, check if the anchor text on the matched links is identical across portals. If yes, the agent should warn the operator and propose either: (1) running Antonio rewrite on the surrounding paragraph after link removal, or (2) using `--replacement=nofollow` instead of `text` for that batch.

iii) **Two-step audit always.** First pass `wp oie audit-links --domain=X --json` everywhere (no `--remove`), aggregate, present a per-portal count to the operator. Wait for confirmation. Then run `--remove` in the paced rollout. Never auto-remove on the first sweep.

iv) **Network credentials known to the agent.** The orchestrator iterates `D:\SISTEMAS\MinhasHospedagens\Hostinger-*/CONEXAO.md` files (host, port, user, password) to know where to SSH. Each `CONEXAO.md` lists which portals live on that account.

v) **Post-removal report.** After the rollout completes, output a markdown summary: portal | posts touched | links removed | replacement mode | timestamp window. Save in `D:\SISTEMAS\MinhasHospedagens\link-audits\<domain>-<date>.md` so the operator has an audit trail.

The reference command implementation lives in this skill's generated `functions.php` (search for `OIE_Link_Audit_Command` class). When a portal is generated, that class is included verbatim. Do not "improve" it ad-hoc per portal — keep it identical so the rollout script can rely on the exact same flag surface everywhere.

**15. Auto-update do parent theme — sempre ON, child theme sempre OFF.** Toda hospedagem de portal recebe atualização automática do theme parent (Astra, Blocksy, GeneratePress, Kadence, Neve, OceanWP) habilitada via `wp theme auto-updates enable <parent>`. Isso é defesa em profundidade contra zero-days nos themes (Astra teve CVE-2024-3923, Kadence teve CVE-2023-42789). O risco de quebra é baixíssimo na arquitetura desta skill porque o child theme já dequeue 90% dos assets do parent (regra 12 + filemtime cache-bust regra 5), então major bumps do parent praticamente não afetam o front-end.

**Regras aplicadas:**

a) **Parent theme: auto-update ON sempre.** O `install_portal.py` agora dispara `enable_parent_auto_update()` automaticamente após `activate_child_theme()` (passo 4.5/6 do deploy). Se o portal é redeployado, o estado é re-aplicado idempotentemente.

b) **Child theme: auto-update OFF sempre.** O `portal-<dominio>-com-br` não existe no wp.org — ligar auto-update tentaria reinstalar do nada e geraria warning no admin. Ele é gerenciado manualmente via skill regenerate + `install_portal.py`.

c) **Mu-plugins (Antonio + qmix-mailer + audit-links): NUNCA auto-update.** Esses são mantidos pela QMIX, sem repo público. Updates são pushados manualmente pelo orchestrator ao detectar nova versão.

d) **WP core major: OFF (mantém default).** Auto-update minor (6.9.4 → 6.9.5) é seguro. Major (6.9 → 7.0) requer teste manual: alguns hooks podem mudar comportamento, AdSense pode reagir, RankMath pode precisar update prévio. A skill não força major auto-update.

e) **Plugins essenciais (LiteSpeed, RankMath, Wordfence): auto-update já vem ON pela hospedagem.** Skill não toca, mas confirma o estado durante deploy. Se algum essencial estiver OFF, log warning.

f) **Verificação no deploy.** Após install_portal.py rodar, o estado esperado é:
```
wp theme list --fields=name,status,auto_update --format=table
+--------------------------------+--------+-------------+
| name                           | status | auto_update |
+--------------------------------+--------+-------------+
| <parent>                       | parent | on          |
| portal-<dominio>-com-br        | active | off         |
+--------------------------------+--------+-------------+
```

g) **Para portais já deployados antes desta regra**, rodar uma vez manualmente:
```bash
PARENT=$(wp --path=$WP_PATH --allow-root eval 'echo get_template();')
wp --path=$WP_PATH --allow-root theme auto-updates enable $PARENT
```

**16. Toda instalação de portal MUST terminar com `cleanup-and-harden` automático — não delegue ao operador.** Esta foi extraída de operação manual recorrente: o operador precisava pedir explicitamente "limpe plugins, deixe auto-update ON, remova tema antigo" depois de cada deploy. Inaceitável: a skill já tem todo o conhecimento, deve aplicar sozinha. **`install_portal.py` agora executa esta rotina obrigatoriamente após o passo 6 (theme activate)**, sem flag pra desligar (não é opcional). A rotina é IDEMPOTENTE: rodar de novo num portal já limpo é no-op.

**Implementação canônica:** `scripts/cleanup_harden.sh` (shell puro com awk + sed + wp-cli). NÃO depende de python no host (Hostinger qmix não tem python instalado), NÃO depende de wp-cli novo (hostverge tem 2.5.0 que aceita os comandos usados). O `install_portal.py` apenas faz `scp` do script + `ssh bash /tmp/cleanup_harden.sh <WP_PATH> <PARENT> <CHILD>`. Mudanças no comportamento de cleanup-and-harden devem ser feitas no `cleanup_harden.sh`, não no install_portal.py.

**Whitelist + Blacklist de plugins (skill regra 16, sub-item h):**

Os portais da rede chegam à skill carregando plugins legacy de temas anteriores (SmartMag, Sphere, Bunyad, Cinderfolio). Esses NÃO são usados pelo child theme da skill e geram bloat (assets enqueued, REST routes desnecessárias, fingerprint detectável). O cleanup automaticamente remove os abaixo, sempre com Antonio sanity-check ANTES e DEPOIS (rollback se sumir namespace QMIX).

**Whitelist (NUNCA remover):**
- `litespeed-cache` (cache premium)
- `seo-by-rank-math` (SEO core)
- `wordfence` (security)
- `wp-cli-login-server` (magic-login dev tool)
- `hostinger` (Hostinger native, em hosts Hostinger)
- `all-in-one-wp-migration` + extensions (backup do operador)
- Qualquer mu-plugin com sufixo `c5cf|fad0|r6a5|t225|8014|d0af|a29889|b1421e|b3727|e68af|qmix|artigo|engine|stats-` (Antonio QMIX)

**Blacklist (deletar sempre que presente, ativos ou inativos):**
- `bunyad-demo-import` (importer SmartMag)
- `bunyad-amp` (AMP variant)
- `debloat` (anti-bloat irônico, adiciona overhead)
- `elementor` (page builder, child theme não usa)
- `simple-local-avatars` (causou avatares quebrados em vários portais; Gravatar nativo é fallback)
- `smartmag-core` (theme core legacy)
- `sphere-core` (theme core legacy)
- `starbox` (author bio plugin custom)
- `xanderpress-contact` (form contact legacy; form nativo no tema)
- `xml-sitemap-feed` (RankMath já gera sitemap; remove duplicação)
- `cinderfolio-contact` (form contact legacy)

**Adicionar à blacklist** quando descobrir novo plugin legacy comum à rede. NÃO add plugins que algum operador pode usar (page builders, form custom genérico): só plugins claramente vinculados a temas QMIX antigos.

**Antonio sanity wrapper:** o script captura `rest_get_server()->get_namespaces()` ANTES, executa todos os deactivate/delete, captura DEPOIS, e ABORTA com `exit 1` se a string mudou. Isso resolve o caso onde um plugin desconhecido estava silenciosamente registrando guard pra mu-plugin Antonio.

**Bug histórico (corrigido):** a primeira versão do cleanup_and_harden() em install_portal.py tentava executar comandos awk inline com escape duplo de quotes, e usava `wp theme list --field=auto_update` que NÃO existe em wp-cli < 2.6. Resultado: comandos quebravam silenciosamente (script seguia adiante), e portais ficavam com cleanup parcial. Diagnóstico só apareceu ao auditar wp-config (sem ADON_HARDENING marker). Lição: para operações que envolvem manipulação de file no servidor remoto, sempre delegar pra um shell script versionado (testável, debuggable com `bash -x`), não tentar embutir lógica complexa em strings via SSH.

**Steps que TODO deploy/regenerate dispara automaticamente:**

a) **Constantes de hardening em `wp-config.php`** (idempotente, só insere se faltar):
```php
define( 'WP_AUTO_UPDATE_CORE', 'minor' );  // sobrescreve o `true` default do WP
define( 'DISALLOW_FILE_EDIT', true );
define( 'FORCE_SSL_ADMIN', true );
define( 'EMPTY_TRASH_DAYS', 7 );
define( 'AUTOSAVE_INTERVAL', 120 );
define( 'WP_DEBUG_DISPLAY', false );
define( 'SCRIPT_DEBUG', false );
define( 'CONCATENATE_SCRIPTS', false );
```
Faz `cp wp-config.php wp-config.php.bak-DATE` antes. Bloco delimitado por marcador `/* ===== ADON_HARDENING (wordpress-master) ===== */` para detectar idempotência.

b) **Auto-update ligado em todos os plugins regulares** (não mu-plugins, não dropins, não child theme):
```bash
wp plugin auto-updates enable --all
PARENT=$(wp eval 'echo get_template();')
wp theme auto-updates enable $PARENT
# Child theme (`folha-magazine-fn`, `adonline-wire`, etc.) MANTER OFF — gerenciado pela skill, não wp.org
```

c) **Remover temas inativos** (sobra apenas parent + child):
```bash
ACTIVE=$(wp eval 'echo get_stylesheet();')
PARENT=$(wp eval 'echo get_template();')
wp theme list --status=inactive --field=name | grep -v -E "^($ACTIVE|$PARENT)$" | xargs -r wp theme delete
```
Default themes do WP (`twentytwentyfive`, `twentytwentyfour`, etc.) caem aqui — Astra/Blocksy/Kadence/Neve já são fallback robusto.

d) **Inventory check 1:1** plugins DB vs FS, themes DB vs FS. Diff diferente de zero abre warning para operador investigar (pode ter plugin órfão na pasta).

e) **Pastas residuais limpas**:
```bash
rm -rf wp-content/upgrade/*
rm -rf wp-content/cache  # LiteSpeed usa /litespeed/, não /cache/
rm -rf wp-content/uploads/imagify-backup
rm -rf wp-content/uploads/backup
# Manter: wp-content/litespeed/ (runtime), wp-content/wflogs/ (Wordfence runtime), wp-content/upgrade/ vazio mantém
```

f) **DB cleanup mínimo** (apenas no primeiro deploy do portal — seguro idempotente):
```bash
wp post delete $(wp post list --post_status=trash --format=ids) --force
wp post delete $(wp post list --post_status=auto-draft --format=ids) --force
wp transient delete --expired
wp db query "OPTIMIZE TABLE wp_posts, wp_postmeta, wp_options, wp_comments, wp_users;"
```

g) **Antonio sanity ANTES e DEPOIS** (regra 11) — não opcional. Se contagem de namespaces ou mu-plugins QMIX cair entre antes/depois, ABORTAR e rollback.

h) **Estado esperado pós-deploy** (output amigável ao operador):
```
[OK] core auto-update: minor
[OK] DISALLOW_FILE_EDIT, FORCE_SSL_ADMIN, EMPTY_TRASH_DAYS=7
[OK] plugins auto-update: 6/6 enabled
[OK] themes: parent (auto on) + child (auto off) — 2 total, 1:1 com FS
[OK] mu-plugins QMIX intactos: 9 files, 1 namespace REST
[OK] cleaned: trash 12, drafts 2, transients 5, optimized 5 tables
```

**17. Loops de related posts no single MUST update the global `$post`, not a local variable.** Esta foi descoberta no adonline.com.br: o "Leia também" mostrava 4 cards idênticos, todos repetindo o post atual do single, mesmo a query `WP_Query` retornando 4 IDs distintos. Causa: o template usava `$rp = get_post($rid); setup_postdata($rp);` com variável local. Funções WP como `the_title()`, `the_post_thumbnail()`, `the_permalink()` chamadas dentro do helper de card (`oie_card_default()`, `vd_card`, etc.) leem a global `$post`, NÃO a `$rp`. Como o single já tinha `$post` setado para o post atual antes do loop, todas as functions do helper renderizavam o post atual repetidamente.

**Três padrões aceitos para related posts loops** (escolha um por portal e mantenha consistente):

a) **Padrão "global $post"** — sobrescrever a global e restaurar no final. Necessário se o helper de card depende de `the_title()` / `the_post_thumbnail()` / `the_permalink()` sem argumentos:
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
Restaurar `$post = $_orig_post` é importante: blocos posteriores na página (share buttons, comentários, schema do final) podem ler a global e ficariam apontando para o último related em vez do post do single.

b) **Padrão "pass $rid explicitly"** — todas as funções WP recebem o ID como argumento, sem `setup_postdata`. Ideal quando o card é renderizado inline no template, sem helper:
```php
foreach ( $rel_ids as $rid ) {
    $thumb = get_the_post_thumbnail( $rid, 'medium', array( 'alt' => '' ) );
    $title = get_the_title( $rid );
    $url   = get_permalink( $rid );
    $cats  = get_the_category( $rid );
    // ... render manual
}
```
Sem efeitos colaterais na global, mas cada função aceita ID. Não funciona com `the_excerpt()` (não aceita ID; precisa montar via `get_the_excerpt( $rid )`).

c) **Padrão `$GLOBALS['post']`** — variante explícita do padrão (a). Igual ao (a) na semântica, sintaxe um pouco diferente:
```php
foreach ( $rel_ids as $rid ) {
    $GLOBALS['post'] = get_post( $rid );
    setup_postdata( $GLOBALS['post'] );
    oie_card( 'default' );
}
wp_reset_postdata();
```

**ANTI-PATTERN proibido:**
```php
foreach ( $rel_ids as $rid ) {
    $rp = get_post( $rid );    // variável local, NÃO atualiza global
    setup_postdata( $rp );      // setup_postdata aceita o post mas não muda $GLOBALS['post']
    oie_card( 'default' );      // helper lê a global → renderiza o post atual do single
}
```
`setup_postdata()` configura variáveis adjacentes (`$id`, `$pages`, `$authordata`, `$currentday`) mas NÃO reescreve `$GLOBALS['post']`. Confiar nele para "switch context" é o bug deste item.

**Onde aplicar:** TODOS os loops manuais com `WP_Query` ou array de IDs no `single.php`, `front-page.php`, `archive.php`, `page-*.php`, `template-parts/*.php`. O `while ( have_posts() ) { the_post(); ... }` do main loop nativo não tem este bug porque `the_post()` sim sobrescreve a global.

**Verificação rápida em portais existentes:**
```bash
grep -nE 'setup_postdata\s*\(\s*\$' generated/<portal>/single.php
```
Se aparecer `setup_postdata( $rp )`, `setup_postdata( $r )`, `setup_postdata( $item )` ou similar com variável que NÃO seja `$post` ou `$GLOBALS['post']`, há possível bug. Confirmar lendo o helper de card chamado depois.

**18. O portal é um veículo de notícias, não um blog: `NewsArticle` + publisher `NewsMediaOrganization` + sitemap de notícias.** Auditoria de 04/08/2026 nos 104 sites WP da rede encontrou 72 que não eram lidos como notícia apesar de publicarem diariamente: 31 marcados como `BlogPosting`/`Article` no Rank Math, 32 com SEOPress emitindo só `BreadcrumbList` (nenhum schema de artigo) e 9 sem plugin de SEO. A skill exigia "Schema.org markup" no single/front/archive sem nunca dizer o tipo, então portal regerado continuava herdando o que estivesse configurado no plugin.

**a) Tipo de artigo.** Todo portal da rede usa `NewsArticle`. Nos sites com Rank Math é configuração nativa, não código de tema:

```bash
wp eval '$t = get_option("rank-math-options-titles");
         $t["pt_post_default_rich_snippet"] = "article";
         $t["pt_post_default_article_type"] = "NewsArticle";
         $t["knowledgegraph_type"] = "company";
         update_option("rank-math-options-titles", $t);'
```

`knowledgegraph_type` estava em `person` em 42 de 43 sites, o que fazia o `publisher` sair como `Person`. Veículo de notícia precisa de organização. O logo sai de `custom_logo` do tema, com fallback para o ícone do site.

**b) Nunca gerar schema de artigo no tema.** Os templates da skill emitem apenas microdados de `ImageObject` e `Person` (foto e autor). NÃO adicionar `itemtype="https://schema.org/Article"` no `<article>` nem bloco JSON-LD de artigo no `single.php`: isso duplicaria o nó que o Rank Math (ou o mu-plugin abaixo) já emite. Verificação: `grep -rhoE 'itemtype="https://schema.org/[A-Za-z]+"' generated/<portal>/` deve retornar só `Person` e `ImageObject`.

**c) ARMADILHA: o módulo News Sitemap do Rank Math é recurso Pro.** Nenhum site da rede tem Rank Math Pro. O módulo aparecia ativo em 16 portais sem gerar nada, e vários `robots.txt` anunciavam um `/news-sitemap.xml` que respondia **404**. Isso também qualifica a regra 16: quando ela manda deletar `xml-sitemap-feed` porque "RankMath já gera sitemap", vale para o sitemap comum e **não** para o de notícias. Ligar o módulo não resolve.

**d) O sitemap de notícias vem do mu-plugin `qmix-news-portal.php`** (fonte em `D:\SISTEMAS\MinhasHospedagens\scripts\`), instalado nos 91 sites da rede em 04/08/2026. Ele faz três coisas: serve `/news-sitemap.xml` com janela de 48h e o namespace `sitemap-news/0.9`, converte `Organization` para `NewsMediaOrganization` no grafo do Rank Math via filtro `rank_math/json_ld`, e emite `NewsArticle` completo **somente** onde nenhum plugin de SEO emite artigo (guarda por `class_exists('RankMath')` mais `snippet === 'article'`, para nunca duplicar).

Detalhe de implementação que importa em rede grande: o sitemap é servido por hook `parse_request` comparando `REQUEST_URI`, **sem `add_rewrite_rule`**. Rewrite rule exigiria `flush_rewrite_rules()` em cada site, operação cara e arriscada em massa.

**e) Por ser mu-plugin, sobrevive à regeneração do portal.** A regra 4.5 já garante que a geração não toca em `mu-plugins`, e o cleanup da regra 16 também não. Ao regerar um portal, conferir que o arquivo continua lá:

```bash
ls wp-content/mu-plugins/qmix-news-portal.php
curl -s -o /dev/null -w "%{http_code}\n" https://<portal>/news-sitemap.xml   # espera 200
```

**f) Sites de cliente ficam de fora.** Esta regra vale para a rede de publicação. Todo script que varre a rede precisa da lista de exclusão de clientes ANTES do primeiro loop: na aplicação original o script rodou sem a guarda e alterou `itacaiugo.com.br`, que teve de ser revertido para `BlogPosting`/`person`.

**g) O que isto não faz.** Marcação correta ajuda em Discover e em rich results, mas entrar no Google Notícias depende de aprovação manual no Publisher Center, por site. Não existe caminho em massa para isso.

## Output format

The deliverable is a complete directory under `generated/<portal>/`, ready to be uploaded by `install_portal.py`. Files must be production-ready: no TODOs, no placeholders except the AdSense client/slot IDs (use `data-ad-client="ca-pub-PORTAL_PUB_ID"` style placeholders so the operator fills them in once).

Every PHP file starts with this header:

```php
<?php
/**
 * Portal: <portal name>
 * Parent theme: <theme>
 * Front-page archetype: <A-E>
 * Single archetype: <I-IV>
 * Archive archetype: <alpha-delta>
 * Header archetype: <H1-H5>
 * Footer archetype: <F1-F5>
 * Visual: palette=<P##> font=<F##> spacing=<scale> radius=<style>
 * Generated: <date>
 */
?>
```

## Reference files

Read these as needed during generation. Do not read all upfront for trivial single-variable questions.

- `references/fingerprint-vars.md`: front-page variable matrix.
- `references/multilang-exclusion.md`: hide non-default-language categories from home.
- `references/single-templates.md`: single.php archetypes I-IV and single-specific vars.
- `references/archive-templates.md`: archive archetypes alpha-delta.
- `references/chrome.md`: header H1-H5 and footer F1-F5.
- `references/visual-identity.md`: 20 palettes, 20 font pairings, spacing/radius/shadow.
- `references/structure.md`: permalink, category slugs, menus, widgets, date format.
- `references/theme-management.md`: wp-cli sequences for theme install/switch.
- `references/layouts.md`: 5 front-page archetypes A-E.
- `references/theme-integration.md`: hooks per parent theme.
- `references/performance.md`: LCP/CLS/INP targets and rules.
- `assets/adsense-patterns.md`: AdSense slot sets A, B, C.
- `assets/example-frontpage.md`: complete worked front-page example.
- `data/fingerprint-rolls.json`: registry of all rolls applied (read-only here).
- `scripts/roll.py`: generates the roll. Run before generation.
- `scripts/install_portal.py`: applies the generated package via SSH+wp-cli.
- `scripts/append_roll.py`: records a manually-built roll.
- `scripts/README.md`: usage docs for scripts.

## When this skill should defer to general WordPress knowledge

The skill enforces network-wide rules and the full-portal generation protocol. For lower-level WordPress questions (custom post types, taxonomy queries, REST API endpoints, plugin development, block editor patterns) outside the portal-template context, fall back to general WordPress knowledge without forcing skill rules.
