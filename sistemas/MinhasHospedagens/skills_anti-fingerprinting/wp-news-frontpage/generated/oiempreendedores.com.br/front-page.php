<?php
/**
 * Front Page — Archetype A (Classic Newspaper).
 *
 * Estrutura:
 *  1. Hero (full width, 3 manchetes navegáveis)
 *  2. Layout 2 colunas (main 1fr + sidebar 320px à direita)
 *     2.1 Main-col vem PRIMEIRO no HTML para o grid colocá-lo
 *         na coluna 1 (1fr, larga). Sidebar segue na coluna 2.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

$excl = oie_excluded_lang_cat_ids();

// Hero — 3 manchetes mais recentes
$hero_q   = oie_query_for_section( array( 'posts_per_page' => 3 ) );
$hero_ids = array();
?>

<?php if ( $hero_q->have_posts() ) : ?>
<section class="oie-hero" aria-label="Manchetes principais">
    <div class="oie-hero__slides">
        <?php $idx = 0; while ( $hero_q->have_posts() ) : $hero_q->the_post();
            if ( ! has_post_thumbnail() ) { continue; }
            $idx++; $hero_ids[] = get_the_ID(); ?>
        <article class="oie-hero__slide<?php echo $idx === 1 ? ' is-active' : ''; ?>" data-slide="<?php echo $idx; ?>" <?php echo $idx > 1 ? 'hidden' : ''; ?>>
            <a class="oie-hero__media" href="<?php the_permalink(); ?>" aria-label="<?php the_title_attribute(); ?>">
                <?php the_post_thumbnail( 'large', array(
                    'fetchpriority' => $idx === 1 ? 'high' : 'auto',
                    'loading'       => 'eager',
                ) ); ?>
            </a>
            <div class="oie-hero__body">
                <?php $cats = get_the_category(); if ( $cats ) : ?>
                    <span class="oie-hero__cat"><?php echo esc_html( $cats[0]->name ); ?></span>
                <?php endif; ?>
                <h2 class="oie-hero__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                <p class="oie-hero__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 28 ) ); ?></p>
                <p>
                    <a class="oie-btn" href="<?php the_permalink(); ?>">Ler reportagem →</a>
                </p>
            </div>
        </article>
        <?php endwhile; wp_reset_postdata(); ?>
    </div>
    <nav class="oie-hero__nav" aria-label="Navegação do destaque">
        <?php for ( $n = 1; $n <= count( $hero_ids ); $n++ ) :
            $title = get_the_title( $hero_ids[ $n - 1 ] );
            ?>
            <button type="button" data-target="<?php echo $n; ?>" class="<?php echo $n === 1 ? 'is-active' : ''; ?>"><?php echo esc_html( wp_trim_words( $title, 6 ) ); ?></button>
        <?php endfor; ?>
    </nav>
</section>
<?php endif; ?>

<div class="oie-layout">

    <!-- ============== COLUNA 1: MAIN ============== -->
    <div class="oie-main-col">
        <!-- Em alta -->
        <section class="oie-section" aria-label="Em alta">
            <header class="oie-section__h">
                <h2>Em alta</h2>
                <a href="<?php echo esc_url( home_url( '/blog/' ) ); ?>">Ver tudo →</a>
            </header>
            <div class="oie-front__row-three oie-front__row-three--ranked">
                <?php
                $trend = oie_query_for_section( array( 'posts_per_page' => 12, 'post__not_in' => $hero_ids, 'orderby' => 'date' ) );
                $trend_count = 0;
                while ( $trend->have_posts() ) {
                    $trend->the_post();
                    if ( ! has_post_thumbnail() ) { continue; }
                    if ( $trend_count >= 3 ) { break; }
                    oie_card( 'default' );
                    $trend_count++;
                }
                wp_reset_postdata();
                ?>
            </div>
        </section>

        <?php
        // Blocos por categoria — top 4 mais ativas, 5 posts cada
        $top_cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 4, 'hide_empty' => true, 'exclude' => $excl ) );
        foreach ( $top_cats as $cat ) :
            $q = oie_query_for_section( array(
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
            <section class="oie-front__cat-block" aria-label="<?php echo esc_attr( $cat->name ); ?>">
                <header class="oie-section__h">
                    <h2><?php echo esc_html( $cat->name ); ?></h2>
                    <a href="<?php echo esc_url( get_category_link( $cat ) ); ?>">Mais de <?php echo esc_html( $cat->name ); ?> →</a>
                </header>
                <div class="oie-front__cat-grid">
                    <div>
                        <?php
                        $GLOBALS['post'] = get_post( $cat_ids[0] );
                        setup_postdata( $GLOBALS['post'] );
                        get_template_part( 'template-parts/card-featured' );
                        wp_reset_postdata();
                        ?>
                    </div>
                    <div class="oie-cat-col">
                        <?php
                        foreach ( array_slice( $cat_ids, 1, 2 ) as $pid ) {
                            $GLOBALS['post'] = get_post( $pid );
                            setup_postdata( $GLOBALS['post'] );
                            oie_card( 'compact' );
                        }
                        wp_reset_postdata();
                        ?>
                    </div>
                    <div class="oie-cat-col">
                        <?php
                        foreach ( array_slice( $cat_ids, 3, 2 ) as $pid ) {
                            $GLOBALS['post'] = get_post( $pid );
                            setup_postdata( $GLOBALS['post'] );
                            oie_card( 'compact' );
                        }
                        wp_reset_postdata();
                        ?>
                    </div>
                </div>
            </section>
        <?php endforeach; ?>

        <!-- Últimas -->
        <section class="oie-section" aria-label="Últimas publicações">
            <header class="oie-section__h">
                <h2>Últimas</h2>
                <a href="<?php echo esc_url( home_url( '/blog/' ) ); ?>">Ver tudo →</a>
            </header>
            <div class="oie-front__row-three">
                <?php
                $latest = oie_query_for_section( array( 'posts_per_page' => 18, 'post__not_in' => $hero_ids, 'offset' => 3 ) );
                $latest_count = 0;
                while ( $latest->have_posts() ) {
                    $latest->the_post();
                    if ( ! has_post_thumbnail() ) { continue; }
                    if ( $latest_count >= 6 ) { break; }
                    oie_card( 'default' );
                    $latest_count++;
                }
                wp_reset_postdata();
                ?>
            </div>
        </section>
    </div>

    <!-- ============== COLUNA 2: SIDEBAR ============== -->
    <aside class="oie-sidebar" role="complementary">
        <?php if ( is_active_sidebar( 'sidebar-1' ) ) : ?>
            <?php dynamic_sidebar( 'sidebar-1' ); ?>
        <?php else : ?>
            <div class="oie-widget">
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
            <div class="oie-widget">
                <h4>Mais lidos</h4>
                <?php
                $pop = oie_query_for_section( array( 'posts_per_page' => 15, 'orderby' => 'comment_count', 'order' => 'DESC', 'post__not_in' => $hero_ids ) );
                if ( $pop->have_posts() ) {
                    echo '<ol>';
                    $pop_count = 0;
                    while ( $pop->have_posts() ) {
                        $pop->the_post();
                        if ( ! has_post_thumbnail() ) { continue; }
                        if ( $pop_count >= 5 ) { break; }
                        echo '<li><a href="' . esc_url( get_permalink() ) . '">' . esc_html( get_the_title() ) . '</a></li>';
                        $pop_count++;
                    }
                    echo '</ol>';
                    wp_reset_postdata();
                }
                ?>
            </div>
        <?php endif; ?>
    </aside>

</div>

<?php get_footer();
