# Example: Generated front-page.php

This is what a complete output from this skill should look like. Use as calibration when generating new files. The example below is for a hypothetical regional news portal using GeneratePress, Archetype A, AdSense Set B.

```php
<?php
/**
 * Portal: noticias-goias-regional (placeholder)
 * Parent theme: GeneratePress
 * Layout archetype: A (Classic Newspaper)
 * Fingerprint roll:
 *   class_naming: bem
 *   sidebar: right
 *   card_style: image_top
 *   hero_variant: triptych
 *   breaking_strip: ticker
 *   schema: itemlist
 *   pagination: numbered
 *   posts_per_category: 5
 *   excerpt: short
 *   image_ratio: 16x9
 *   adsense_set: B
 *   font_strategy: self_hosted_single
 *   wrapper_semantics: section
 *   heading_hierarchy: h2_for_categories
 *   php_comments: phpdoc
 * Generated: 2026-04-30
 */

// Disable GeneratePress sidebar layout for the front-page only
add_filter( 'generate_sidebar_layout', function() {
    return 'right-sidebar';
});

// Preload hero image for LCP
add_action( 'wp_head', function() {
    $hero_posts = get_posts( array(
        'numberposts' => 1,
        'category_name' => 'destaque',
    ) );
    if ( ! empty( $hero_posts ) ) {
        $hero_url = get_the_post_thumbnail_url( $hero_posts[0]->ID, 'large' );
        if ( $hero_url ) {
            echo '<link rel="preload" as="image" href="' . esc_url( $hero_url ) . '" fetchpriority="high">';
        }
    }
}, 1 );

// Conditional stylesheet enqueue
add_action( 'wp_enqueue_scripts', function() {
    if ( is_front_page() ) {
        wp_enqueue_style(
            'regional-capa',
            get_stylesheet_directory_uri() . '/assets/home.css',
            array(),
            filemtime( get_stylesheet_directory() . '/assets/home.css' )
        );
    }
});

get_header();
?>

<main class="capa-regional" role="main">

    <?php /** Breaking news ticker */ ?>
    <section class="ticker-bar" aria-label="Últimas notícias">
        <div class="ticker-bar__label">URGENTE</div>
        <div class="ticker-bar__track">
            <?php
            $latest = new WP_Query( array(
                'posts_per_page' => 6,
                'orderby' => 'date',
                'order' => 'DESC',
            ) );
            while ( $latest->have_posts() ) :
                $latest->the_post();
                ?>
                <a class="ticker-bar__item" href="<?php the_permalink(); ?>">
                    <?php the_title(); ?>
                </a>
                <?php
            endwhile;
            wp_reset_postdata();
            ?>
        </div>
    </section>

    <?php /** Hero triptych */ ?>
    <section class="hero-triptych" aria-label="Destaques">
        <?php
        $featured = new WP_Query( array(
            'posts_per_page' => 3,
            'category_name' => 'destaque',
        ) );
        $i = 0;
        while ( $featured->have_posts() ) :
            $featured->the_post();
            $i++;
            $modifier = ( $i === 1 ) ? 'hero-triptych__card--main' : 'hero-triptych__card--secondary';
            $img_size = ( $i === 1 ) ? 'large' : 'medium';
            ?>
            <article class="hero-triptych__card <?php echo esc_attr( $modifier ); ?>">
                <a href="<?php the_permalink(); ?>" class="hero-triptych__link">
                    <?php if ( has_post_thumbnail() ) : ?>
                        <?php
                        $img_id = get_post_thumbnail_id();
                        $img_alt = get_post_meta( $img_id, '_wp_attachment_image_alt', true );
                        $img_alt = $img_alt ? $img_alt : get_the_title();
                        the_post_thumbnail( $img_size, array(
                            'class' => 'hero-triptych__image',
                            'loading' => ( $i === 1 ) ? 'eager' : 'lazy',
                            'fetchpriority' => ( $i === 1 ) ? 'high' : 'auto',
                            'alt' => esc_attr( $img_alt ),
                        ) );
                        ?>
                    <?php endif; ?>
                    <div class="hero-triptych__overlay">
                        <span class="hero-triptych__category">
                            <?php
                            $cats = get_the_category();
                            if ( ! empty( $cats ) ) {
                                echo esc_html( $cats[0]->name );
                            }
                            ?>
                        </span>
                        <h2 class="hero-triptych__title"><?php the_title(); ?></h2>
                    </div>
                </a>
            </article>
            <?php
        endwhile;
        wp_reset_postdata();
        ?>
    </section>

    <div class="capa-grid">

        <div class="capa-grid__main">

            <?php /** Politica category block */ ?>
            <section class="cat-block cat-block--politica" aria-label="Política">
                <h2 class="cat-block__title">
                    <a href="<?php echo esc_url( get_category_link( get_category_by_slug( 'politica' )->term_id ) ); ?>">
                        Política
                    </a>
                </h2>
                <div class="cat-block__grid">
                    <?php
                    $politica = new WP_Query( array(
                        'posts_per_page' => 5,
                        'category_name' => 'politica',
                    ) );
                    while ( $politica->have_posts() ) :
                        $politica->the_post();
                        ?>
                        <article class="news-card news-card--image-top">
                            <a href="<?php the_permalink(); ?>">
                                <?php if ( has_post_thumbnail() ) :
                                    the_post_thumbnail( 'medium', array(
                                        'class' => 'news-card__image',
                                        'loading' => 'lazy',
                                        'alt' => esc_attr( get_the_title() ),
                                    ) );
                                endif; ?>
                                <h3 class="news-card__title"><?php the_title(); ?></h3>
                                <p class="news-card__excerpt">
                                    <?php echo esc_html( wp_trim_words( get_the_excerpt(), 14 ) ); ?>
                                </p>
                            </a>
                        </article>
                        <?php
                    endwhile;
                    wp_reset_postdata();
                    ?>
                </div>
            </section>

            <?php /** In-feed AdSense (Set B, after first category block) */ ?>
            <div class="ad-slot ad-slot--in-feed">
                <span class="ad-label">Publicidade</span>
                <ins class="adsbygoogle"
                     style="display:block; min-height:250px;"
                     data-ad-format="fluid"
                     data-ad-layout-key="PORTAL_LAYOUT_KEY"
                     data-ad-client="ca-pub-PORTAL_PUB_ID"
                     data-ad-slot="PORTAL_SLOT_INFEED_1"></ins>
                <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
            </div>

            <?php /** Economia category block */ ?>
            <section class="cat-block cat-block--economia" aria-label="Economia">
                <h2 class="cat-block__title">
                    <a href="<?php echo esc_url( get_category_link( get_category_by_slug( 'economia' )->term_id ) ); ?>">
                        Economia
                    </a>
                </h2>
                <div class="cat-block__grid">
                    <?php
                    $economia = new WP_Query( array(
                        'posts_per_page' => 5,
                        'category_name' => 'economia',
                    ) );
                    while ( $economia->have_posts() ) :
                        $economia->the_post();
                        ?>
                        <article class="news-card news-card--image-top">
                            <a href="<?php the_permalink(); ?>">
                                <?php if ( has_post_thumbnail() ) :
                                    the_post_thumbnail( 'medium', array(
                                        'class' => 'news-card__image',
                                        'loading' => 'lazy',
                                        'alt' => esc_attr( get_the_title() ),
                                    ) );
                                endif; ?>
                                <h3 class="news-card__title"><?php the_title(); ?></h3>
                                <p class="news-card__excerpt">
                                    <?php echo esc_html( wp_trim_words( get_the_excerpt(), 14 ) ); ?>
                                </p>
                            </a>
                        </article>
                        <?php
                    endwhile;
                    wp_reset_postdata();
                    ?>
                </div>
            </section>

            <?php /** Esportes category block */ ?>
            <section class="cat-block cat-block--esportes" aria-label="Esportes">
                <h2 class="cat-block__title">
                    <a href="<?php echo esc_url( get_category_link( get_category_by_slug( 'esportes' )->term_id ) ); ?>">
                        Esportes
                    </a>
                </h2>
                <div class="cat-block__grid">
                    <?php
                    $esportes = new WP_Query( array(
                        'posts_per_page' => 5,
                        'category_name' => 'esportes',
                    ) );
                    while ( $esportes->have_posts() ) :
                        $esportes->the_post();
                        ?>
                        <article class="news-card news-card--image-top">
                            <a href="<?php the_permalink(); ?>">
                                <?php if ( has_post_thumbnail() ) :
                                    the_post_thumbnail( 'medium', array(
                                        'class' => 'news-card__image',
                                        'loading' => 'lazy',
                                        'alt' => esc_attr( get_the_title() ),
                                    ) );
                                endif; ?>
                                <h3 class="news-card__title"><?php the_title(); ?></h3>
                                <p class="news-card__excerpt">
                                    <?php echo esc_html( wp_trim_words( get_the_excerpt(), 14 ) ); ?>
                                </p>
                            </a>
                        </article>
                        <?php
                    endwhile;
                    wp_reset_postdata();
                    ?>
                </div>
            </section>

        </div>

        <aside class="capa-grid__sidebar" role="complementary">

            <?php /** Sidebar AdSense top (Set B) */ ?>
            <div class="ad-slot ad-slot--sidebar-sticky">
                <span class="ad-label">Publicidade</span>
                <ins class="adsbygoogle"
                     style="display:block; min-height:250px;"
                     data-ad-client="ca-pub-PORTAL_PUB_ID"
                     data-ad-slot="PORTAL_SLOT_SIDEBAR_TOP"
                     data-ad-format="auto"></ins>
                <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
            </div>

            <?php /** Most read */ ?>
            <section class="most-read" aria-label="Mais lidas">
                <h2 class="most-read__title">Mais lidas</h2>
                <ol class="most-read__list">
                    <?php
                    $popular = new WP_Query( array(
                        'posts_per_page' => 7,
                        'meta_key' => 'post_views_count',
                        'orderby' => 'meta_value_num',
                        'order' => 'DESC',
                    ) );
                    while ( $popular->have_posts() ) :
                        $popular->the_post();
                        ?>
                        <li class="most-read__item">
                            <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                        </li>
                        <?php
                    endwhile;
                    wp_reset_postdata();
                    ?>
                </ol>
            </section>

            <?php /** Sidebar AdSense bottom */ ?>
            <div class="ad-slot ad-slot--sidebar">
                <span class="ad-label">Publicidade</span>
                <ins class="adsbygoogle"
                     style="display:block; min-height:250px;"
                     data-ad-client="ca-pub-PORTAL_PUB_ID"
                     data-ad-slot="PORTAL_SLOT_SIDEBAR_BOTTOM"
                     data-ad-format="auto"></ins>
                <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
            </div>

        </aside>

    </div>

</main>

<?php /** ItemList schema for the front-page feed */ ?>
<script type="application/ld+json">
<?php
$schema_items = array();
$schema_query = new WP_Query( array( 'posts_per_page' => 10 ) );
$pos = 1;
while ( $schema_query->have_posts() ) :
    $schema_query->the_post();
    $schema_items[] = array(
        '@type' => 'ListItem',
        'position' => $pos,
        'url' => get_permalink(),
        'name' => get_the_title(),
    );
    $pos++;
endwhile;
wp_reset_postdata();

echo wp_json_encode( array(
    '@context' => 'https://schema.org',
    '@type' => 'ItemList',
    'itemListElement' => $schema_items,
) );
?>
</script>

<?php
get_footer();
```

## Notes about this example

1. The roll header at the top is a quick reference for any future edit. It documents the choices.
2. All images have explicit alt text logic, lazy loading except the hero, and proper aspect-ratio handling via WordPress's built-in `the_post_thumbnail` (which adds width and height attributes when the image was uploaded normally).
3. The sidebar AdSense slot uses `position: sticky` via CSS (not shown here, in the stylesheet).
4. The schema JSON-LD is built dynamically from the same posts shown on the page.
5. AdSense client and slot IDs are placeholders. The operator fills them in per portal.
6. No em dashes anywhere.
7. The CSS class names follow BEM (chosen by the roll). A sibling portal would use a different convention.

## What changes for a sibling portal

If the next portal uses the same Archetype A but a different fingerprint roll, the structural skeleton stays the same, but:

- BEM becomes utility classes (e.g., `news-card__title` becomes `text-lg font-bold mb-2`)
- `image-top` cards become `image-left` (image float-left, text right)
- 5 posts per category becomes 7
- Triptych hero becomes dual hero
- Most Read becomes Newsletter signup in sidebar top position
- ItemList schema becomes CollectionPage
- AdSense Set B becomes Set A or C

The diff between the two front-pages would be substantial despite both being Archetype A. That is the goal.
