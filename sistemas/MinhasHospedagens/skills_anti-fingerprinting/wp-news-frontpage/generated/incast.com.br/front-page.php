<?php
/**
 * Front Page — Archetype B (Magazine Grid).
 *
 * Estrutura:
 *  1. Hero dual (2 manchetes lado a lado)
 *  2. Layout 2 col (main 1fr + sidebar 320px floating)
 *     2.1 Main-col PRIMEIRO no source order (regra 1 da SKILL)
 *  3. Em alta rankeado | blocos de categoria | Últimas
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

$excl = ic_excluded_lang_cat_ids();

// Hero dual — 2 manchetes mais recentes
$hero_q   = ic_query_for_section( array( 'posts_per_page' => 6 ) );
$hero_ids = array();
while ( $hero_q->have_posts() ) {
    $hero_q->the_post();
    if ( ! has_post_thumbnail() ) { continue; }
    $hero_ids[] = get_the_ID();
    if ( count( $hero_ids ) >= 2 ) { break; }
}
wp_reset_postdata();
?>

<?php if ( ! empty( $hero_ids ) ) : ?>
<section class="ic-hero" aria-label="Manchetes principais">
    <article class="ic-hero__primary">
        <?php $GLOBALS['post'] = get_post( $hero_ids[0] ); setup_postdata( $GLOBALS['post'] ); ?>
        <a class="ic-hero__media" href="<?php the_permalink(); ?>">
            <?php the_post_thumbnail( 'ic-hero', array( 'fetchpriority' => 'high', 'loading' => 'eager' ) ); ?>
        </a>
        <?php $cats = get_the_category(); if ( $cats ) : ?>
            <span class="ic-hero__cat"><?php echo esc_html( $cats[0]->name ); ?></span>
        <?php endif; ?>
        <h2 class="ic-hero__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
        <p class="ic-hero__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 28 ) ); ?></p>
        <?php wp_reset_postdata(); ?>
    </article>

    <?php if ( isset( $hero_ids[1] ) ) :
        $GLOBALS['post'] = get_post( $hero_ids[1] ); setup_postdata( $GLOBALS['post'] ); ?>
        <article class="ic-hero__secondary">
            <a class="ic-hero__media" href="<?php the_permalink(); ?>">
                <?php the_post_thumbnail( 'ic-hero', array( 'loading' => 'eager' ) ); ?>
            </a>
            <?php $cats = get_the_category(); if ( $cats ) : ?>
                <span class="ic-hero__cat"><?php echo esc_html( $cats[0]->name ); ?></span>
            <?php endif; ?>
            <h2 class="ic-hero__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
            <p class="ic-hero__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 18 ) ); ?></p>
        </article>
        <?php wp_reset_postdata();
    endif; ?>
</section>
<?php endif; ?>

<div class="ic-layout">

    <!-- COLUNA 1: MAIN -->
    <div class="ic-main-col">

        <!-- Em alta rankeado -->
        <section class="ic-section" aria-label="Em alta">
            <header class="ic-section__h">
                <h2>Em alta</h2>
                <a href="<?php echo esc_url( home_url( '/blog/' ) ); ?>">Ver tudo →</a>
            </header>
            <div class="ic-front__row-three ic-front__row-three--ranked">
                <?php
                $trend = ic_query_for_section( array( 'posts_per_page' => 12, 'post__not_in' => $hero_ids, 'orderby' => 'date' ) );
                $tc = 0;
                while ( $trend->have_posts() ) {
                    $trend->the_post();
                    if ( ! has_post_thumbnail() ) { continue; }
                    if ( $tc >= 3 ) { break; }
                    ic_card( 'lg' );
                    $tc++;
                }
                wp_reset_postdata();
                ?>
            </div>
        </section>

        <?php
        // Blocos por categoria — top 4 mais ativas
        $top_cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 4, 'hide_empty' => true, 'exclude' => $excl ) );
        foreach ( $top_cats as $cat ) :
            $q = ic_query_for_section( array(
                'posts_per_page' => 15,
                'cat'            => $cat->term_id,
                'post__not_in'   => $hero_ids,
            ) );
            $cat_ids = array();
            while ( $q->have_posts() ) {
                $q->the_post();
                if ( ! has_post_thumbnail() ) { continue; }
                $cat_ids[] = get_the_ID();
                if ( count( $cat_ids ) >= 5 ) { break; }
            }
            wp_reset_postdata();
            if ( empty( $cat_ids ) ) { continue; }
            ?>
            <section class="ic-front__cat-block" aria-label="<?php echo esc_attr( $cat->name ); ?>">
                <header class="ic-section__h">
                    <h2><?php echo esc_html( $cat->name ); ?></h2>
                    <a href="<?php echo esc_url( get_category_link( $cat ) ); ?>">Mais de <?php echo esc_html( $cat->name ); ?> →</a>
                </header>
                <div class="ic-front__cat-grid">
                    <div>
                        <?php
                        $GLOBALS['post'] = get_post( $cat_ids[0] );
                        setup_postdata( $GLOBALS['post'] );
                        ic_card( 'featured' );
                        wp_reset_postdata();
                        ?>
                    </div>
                    <div>
                        <?php
                        foreach ( array_slice( $cat_ids, 1, 4 ) as $pid ) {
                            $GLOBALS['post'] = get_post( $pid );
                            setup_postdata( $GLOBALS['post'] );
                            ic_card( 'default' );
                        }
                        wp_reset_postdata();
                        ?>
                    </div>
                </div>
            </section>
        <?php endforeach; ?>

        <!-- Últimas -->
        <section class="ic-section" aria-label="Últimas publicações">
            <header class="ic-section__h">
                <h2>Últimas</h2>
                <a href="<?php echo esc_url( home_url( '/blog/' ) ); ?>">Ver tudo →</a>
            </header>
            <div class="ic-front__row-three">
                <?php
                $latest = ic_query_for_section( array( 'posts_per_page' => 18, 'post__not_in' => $hero_ids, 'offset' => 3 ) );
                $lc = 0;
                while ( $latest->have_posts() ) {
                    $latest->the_post();
                    if ( ! has_post_thumbnail() ) { continue; }
                    if ( $lc >= 6 ) { break; }
                    ic_card( 'lg' );
                    $lc++;
                }
                wp_reset_postdata();
                ?>
            </div>
        </section>
    </div>

    <!-- COLUNA 2: SIDEBAR floating -->
    <aside class="ic-sidebar" role="complementary">
        <?php if ( is_active_sidebar( 'sidebar-1' ) ) :
            dynamic_sidebar( 'sidebar-1' );
        else : ?>
            <div class="ic-widget">
                <h4>Editorias</h4>
                <ul>
                    <?php
                    $cats_w = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 8, 'hide_empty' => true, 'exclude' => $excl ) );
                    foreach ( $cats_w as $c ) {
                        echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
                    }
                    ?>
                </ul>
            </div>
            <div class="ic-widget">
                <h4>Mais lidos</h4>
                <?php
                $pop = ic_query_for_section( array( 'posts_per_page' => 15, 'orderby' => 'comment_count', 'order' => 'DESC' ) );
                $items = '';
                $pc = 0;
                while ( $pop->have_posts() ) {
                    $pop->the_post();
                    if ( ! has_post_thumbnail() ) { continue; }
                    if ( $pc >= 5 ) { break; }
                    $items .= '<li><a href="' . esc_url( get_permalink() ) . '">' . esc_html( get_the_title() ) . '</a></li>';
                    $pc++;
                }
                wp_reset_postdata();
                if ( $items ) { echo '<ol>' . $items . '</ol>'; }
                ?>
            </div>
            <?php if ( defined( 'INCAST_ADSENSE_CLIENT' ) && INCAST_ADSENSE_CLIENT ) : ?>
                <div class="ic-widget--ad">
                    <ins class="adsbygoogle" style="display:block" data-ad-client="<?php echo esc_attr( INCAST_ADSENSE_CLIENT ); ?>" data-ad-format="auto" data-full-width-responsive="true"></ins>
                    <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
                </div>
            <?php endif; ?>
        <?php endif; ?>
    </aside>

</div>

<?php get_footer();
