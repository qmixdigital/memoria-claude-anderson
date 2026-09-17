# Theme Management: Install, Switch, Provision

How to install a parent theme, switch from the existing theme, and provision a child theme on a target portal. Run via wp-cli over SSH.

## Supported parent themes

| Theme | Slug | License | Recommended for |
|---|---|---|---|
| GeneratePress | `generatepress` | Free + Premium | Lean / fast portals |
| Blocksy | `blocksy` | Free + Premium | Visual / styled portals |
| Kadence | `kadence` | Free + Premium | Block-editor heavy |
| SmartMag | `smart-mag` | Paid (legacy) | Existing portals only |

## Installation script (wp-cli)

```bash
# 1. Install parent theme from wp.org
wp theme install <theme-slug> --activate-network=false

# 2. Generate child theme dir
CHILD_SLUG="portal-$(echo $DOMAIN | tr '.' '-')"
mkdir -p wp-content/themes/$CHILD_SLUG/{assets/{css,js,fonts},template-parts,inc}

# 3. Create child theme style.css
cat > wp-content/themes/$CHILD_SLUG/style.css <<EOF
/*
Theme Name: $PORTAL_NAME
Template: <theme-slug>
Author: QMIX Digital
Version: 1.0.0
Description: Tema customizado para $DOMAIN.
*/
EOF

# 4. Create functions.php that enqueues parent style
cat > wp-content/themes/$CHILD_SLUG/functions.php <<'EOF'
<?php
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css');
    wp_enqueue_style(
        'child-style',
        get_stylesheet_directory_uri() . '/style.css',
        ['parent-style'],
        wp_get_theme()->get('Version')
    );
});
EOF

# 5. Activate child
wp theme activate $CHILD_SLUG
```

## Switching theme on existing portal

If portal currently runs SmartMag and you want to migrate to GeneratePress:

```bash
# 1. Backup the current theme settings (Customizer mods are in DB)
wp option get theme_mods_<old-theme-slug> --format=json > /tmp/old-mods.json

# 2. Install and activate new theme as above

# 3. Delete old theme files (after confirming migration worked)
wp theme delete <old-theme-slug>
```

Customizer mods do not transfer between themes (they are theme-specific). You will reset visual identity from scratch, which is fine for a diversification migration.

## Provisioning template files

After the child theme is active, copy generated templates into:

```
wp-content/themes/$CHILD_SLUG/
├── style.css                (visual identity CSS variables block)
├── functions.php            (enqueues + theme support)
├── header.php               (chrome variant)
├── footer.php               (chrome variant)
├── front-page.php           (homepage variant)
├── single.php               (single post variant)
├── archive.php              (category/archive variant)
├── category.php             (optional, if archive.php is generic)
├── search.php               (search results)
├── 404.php                  (not found)
├── template-parts/
│   ├── card-default.php
│   ├── card-featured.php
│   └── ...
├── inc/
│   ├── customizer.php       (any Customizer registrations)
│   └── helpers.php          (custom functions used by templates)
└── assets/
    ├── css/home.css         (front-page-specific CSS)
    ├── css/single.css       (single-specific CSS)
    ├── js/main.js           (deferred custom JS)
    └── fonts/               (self-hosted fonts)
```

## Required functions.php for child theme

```php
<?php
/**
 * Functions for <Portal Name>
 */

// Enqueue parent + child styles
add_action('wp_enqueue_scripts', function () {
    $version = wp_get_theme()->get('Version');
    wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css', [], $version);
    wp_enqueue_style('child-style',  get_stylesheet_directory_uri() . '/style.css', ['parent-style'], $version);

    // Conditional: enqueue front-page CSS only on front
    if (is_front_page()) {
        wp_enqueue_style(
            '<HANDLE_FROM_ROLL>',
            get_stylesheet_directory_uri() . '/assets/css/home.css',
            [],
            filemtime(get_stylesheet_directory() . '/assets/css/home.css')
        );
    }

    // Conditional: enqueue single-post CSS only on single
    if (is_single()) {
        wp_enqueue_style(
            '<HANDLE_FROM_ROLL>-single',
            get_stylesheet_directory_uri() . '/assets/css/single.css',
            [],
            filemtime(get_stylesheet_directory() . '/assets/css/single.css')
        );
    }
});

// Theme support
add_action('after_setup_theme', function () {
    add_theme_support('post-thumbnails');
    add_theme_support('title-tag');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption']);
    add_theme_support('responsive-embeds');
    add_image_size('hero-1200', 1200, 675, true);
    add_image_size('hero-900', 900, 506, true);
    add_image_size('card-medium', 600, 338, true);
});

// Register menus
register_nav_menus([
    'primary' => 'Menu Principal',
    'footer'  => 'Menu Rodapé',
]);

// Register widget areas
register_sidebar([
    'name'          => 'Sidebar Principal',
    'id'            => 'sidebar-1',
    'before_widget' => '<div class="widget %2$s">',
    'after_widget'  => '</div>',
    'before_title'  => '<h3 class="widget-title">',
    'after_title'   => '</h3>',
]);
```

## Recommended baseline plugins

These should always be active on a new portal:

| Plugin | Slug | Purpose |
|---|---|---|
| Rank Math (or Yoast) | `seo-by-rank-math` | SEO meta + schema |
| LiteSpeed Cache (or W3 Total Cache) | `litespeed-cache` | Performance |
| Independent Analytics | `independent-analytics` | First-party traffic data |
| Imagify (or ShortPixel) | `imagify` | Image optimization |
| Wordfence (lite) | `wordfence` | Security |

## Optional plugins (vary across siblings)

Don't activate the same exact set on every portal. Rotate:

| Group | Options |
|---|---|
| Forms | Contact Form 7, WPForms, Fluent Forms |
| Newsletter | MailPoet, MailerLite, Brevo, Sendy |
| Comments enhancement | wpDiscuz (heavy), native, Disqus |
| Schema enhancers | Schema Pro, Rank Math (built-in), KK Star Ratings |
| Related posts | Yarpp, Inline Related Posts, Contextual Related Posts, native |

A given portal might have: Contact Form 7 + MailerLite + native comments + Yarpp.
A sibling: WPForms + Brevo + wpDiscuz + Inline Related Posts.

This avoids identical plugin activelist signatures, which detection tools enumerate via `/wp-json/wp/v2/types` or by probing known plugin paths.

## What this skill does NOT install automatically

The skill generates code and configuration. It does not:

- Install premium themes (those need licenses)
- Install paid plugins
- Configure paid plugins (Rank Math Pro, Yoast Premium)
- Buy domains or set up DNS
- Configure the host (PHP version, OPcache, Redis)

For all the above, follow the standard QMIX provisioning playbook.
