# Multi-language Category Exclusion

Some portals in the QMIX network publish content in multiple languages: `pt-BR` (default), `pt-PT` (Português de Portugal), and `en-US` (English). Each language is contained in its own category. The home page must show only the default-language posts, never mixing languages on the front page.

This is not a fingerprint variable. It is a functional rule that the front-page generation must respect when the portal has multilingual categories.

## Common multilingual category slugs

When the operator says the portal has multilingual content, expect category slugs like:

| Language | Likely slug names |
|---|---|
| Português de Portugal | `pt-pt`, `portugues-portugal`, `portugal`, `pt-portugal` |
| English (US/UK) | `en-us`, `english`, `en`, `ingles` |
| Spanish | `es`, `espanol`, `spanish`, `es-es` |

The operator passes the explicit list of slugs to exclude. Do not guess.

## Implementation pattern: pre_get_posts hook in functions.php

This is the cleanest place to enforce exclusion across the home, archive, and search results without touching every template loop.

```php
/**
 * Exclude language-segregated categories from the home page main query.
 * The default language stays visible. The translations live in their own
 * dedicated category and are accessed via direct URL only, never on the home.
 */
add_action( 'pre_get_posts', function ( $query ) {
    if ( is_admin() || ! $query->is_main_query() ) {
        return;
    }
    if ( ! ( $query->is_home() || $query->is_front_page() ) ) {
        return;
    }
    $excluded_slugs = array( 'pt-pt', 'en-us' ); // operator-provided
    $cat_ids = array();
    foreach ( $excluded_slugs as $slug ) {
        $term = get_category_by_slug( $slug );
        if ( $term ) {
            $cat_ids[] = - (int) $term->term_id; // negative to exclude
        }
    }
    if ( ! empty( $cat_ids ) ) {
        $query->set( 'cat', implode( ',', $cat_ids ) );
    }
} );
```

The negative-id trick is the legacy WP way of saying "exclude these category IDs from the main query".

## Implementation pattern: secondary loops in front-page.php

For custom WP_Query loops on the front-page (hero block, category strips, latest posts, most-read), you need to add a `category__not_in` argument explicitly. The pre_get_posts hook only catches the main query, not secondary queries you build manually.

Helper function in `functions.php`:

```php
/**
 * Returns category IDs that should be excluded from front-page queries
 * because they hold non-default-language content.
 *
 * @return int[] Array of category IDs.
 */
function portal_excluded_lang_cat_ids() {
    static $cache = null;
    if ( $cache !== null ) {
        return $cache;
    }
    $slugs = array( 'pt-pt', 'en-us' ); // operator-provided
    $ids = array();
    foreach ( $slugs as $slug ) {
        $term = get_category_by_slug( $slug );
        if ( $term ) {
            $ids[] = (int) $term->term_id;
        }
    }
    $cache = $ids;
    return $ids;
}
```

Use it in every secondary loop in `front-page.php`:

```php
$latest = new WP_Query( array(
    'posts_per_page'      => 8,
    'category__not_in'    => portal_excluded_lang_cat_ids(),
    'ignore_sticky_posts' => true,
) );
```

For child terms (some portals split deeper):

```php
$args['category__not_in'] = portal_excluded_lang_cat_ids();
$args['tax_query'] = array(
    array(
        'taxonomy'         => 'category',
        'field'            => 'term_id',
        'terms'            => portal_excluded_lang_cat_ids(),
        'operator'         => 'NOT IN',
        'include_children' => true,
    ),
);
```

The `include_children => true` matters when the language category has sub-categories (e.g. `pt-pt > saude-pt`).

## What to do with archive and category pages

Archive and category pages should NOT exclude these categories. Users who land directly on `/category/pt-pt/saude-pt/` expect to see Portuguese content. Only the home / front-page filters out non-default languages.

The `pre_get_posts` hook above already restricts to home only via `is_home() || is_front_page()` check.

## What about the breaking-news strip and "most read" widget

These are usually secondary loops queried from `front-page.php`. Apply `category__not_in` per the helper function. Anything rendered above the fold on the home must respect the language filter.

## Sitemap and SEO

The hidden categories should still:

- Be indexed by Google (each language version of a post is canonical content)
- Appear in the XML sitemap
- Be linked from the secondary navigation (footer or hidden menu) so Google discovers them
- Have proper `<link rel="alternate" hreflang="...">` set if SEO plugin (Rank Math / Yoast) supports it

The hreflang setup is outside this skill's scope, but if the portal already has a multilingual SEO plugin configured, do not interfere with its `<head>` output.

## Roll variable

A new variable on the roll captures whether multilingual exclusion is active and which slugs:

```json
{
  "excluded_lang_categories": ["pt-pt", "en-us"]
}
```

This is not picked from a matrix (every portal has its own list). The operator passes it via `--exclude-lang-categories=slug1,slug2` on `roll.py`. If empty, the helper function returns an empty array and no posts get filtered (no-op).

## Default behavior

If the operator does not pass `--exclude-lang-categories`, the generated `functions.php` still includes the helper function with an empty `$slugs` array. This makes future enablement a one-line edit: add the slugs to the array.

## Verification after deploy

After installing the portal, verify:

1. Open the home URL. None of the posts should be from `/category/pt-pt/...` or `/category/en-us/...`.
2. Open `/category/pt-pt/`. Portuguese posts should still load.
3. Check `wp-admin -> Posts -> Filter by category -> pt-pt`. Posts should still exist (they are not deleted, only filtered from home).
