<?php
/**
 * Front Page — Archetype C (Magazine institucional).
 *
 * 1. Hero bleed (full-width, aplicado via CSS no .rde-hero__bleed, não quebrando o main)
 * 2. Layout 2 col (sidebar 300px à ESQUERDA + main 1fr)
 * 3. Em destaque (4 cards) | Blocos por categoria | Últimas (3 cards)
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

// Hero — manchete principal
$hero_q  = rde_query_for_section( array( 'posts_per_page' => 6 ) );
$hero_id = null;
while ( $hero_q->have_posts() ) {
    $hero_q->the_post();
    if ( ! has_post_thumbnail() ) { continue; }
    $hero_id = get_the_ID();
    break;
}
wp_reset_postdata();
?>

<?php if ( $hero_id ) :
    $GLOBALS['post'] = get_post( $hero_id );
    setup_postdata( $GLOBALS['post'] );
    $hcats = get_the_category();
    ?>
    <section class="rde-hero" aria-label="Manchete principal">
        <div class="rde-hero__bleed">
            <?php the_post_thumbnail( 'rde-hero', array( 'fetchpriority' => 'high', 'loading' => 'eager' ) ); ?>
            <div class="rde-hero__overlay">
                <div class="rde-hero__body">
                    <?php if ( $hcats ) : ?>
                        <span class="rde-hero__cat"><?php echo esc_html( $hcats[0]->name ); ?></span>
                    <?php endif; ?>
                    <h1 class="rde-hero__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1>
                    <p class="rde-hero__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 32 ) ); ?></p>
                </div>
            </div>
        </div>
    </section>
    <?php wp_reset_postdata();
endif; ?>

<div class="rde-layout">

    <!-- COLUNA 1 (esquerda): SIDEBAR -->
    <aside class="rde-sidebar" role="complementary">
        <?php
        // Render manual de widgets — não confia em sidebar-1 estar populado.
        $cats_w = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 8, 'hide_empty' => true ) );
        if ( $cats_w ) {
            echo '<div class="rde-widget"><h4>Editorias</h4><ul>';
            foreach ( $cats_w as $c ) {
                echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
            }
            echo '</ul></div>';
        }

        $pop = rde_query_for_section( array( 'posts_per_page' => 15, 'orderby' => 'comment_count', 'order' => 'DESC', 'post__not_in' => array( $hero_id ) ) );
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
        if ( $items ) { echo '<div class="rde-widget"><h4>Mais lidos</h4><ol>' . $items . '</ol></div>'; }

        if ( defined( 'RDE_ADSENSE_CLIENT' ) && RDE_ADSENSE_CLIENT ) : ?>
            <div class="rde-widget rde-widget--ad">
                <ins class="adsbygoogle" style="display:block" data-ad-client="<?php echo esc_attr( RDE_ADSENSE_CLIENT ); ?>" data-ad-format="auto" data-full-width-responsive="true"></ins>
                <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
            </div>
        <?php endif; ?>
    </aside>

    <!-- COLUNA 2 (direita): MAIN -->
    <div class="rde-main-col">

        <!-- Em destaque — 4 cards -->
        <section class="rde-section" aria-label="Em destaque">
            <header class="rde-section__h">
                <h2>Em destaque</h2>
                <a href="<?php echo esc_url( home_url( '/blog/' ) ); ?>">Ver tudo →</a>
            </header>
            <div class="rde-front__row-four">
                <?php
                $feat = rde_query_for_section( array( 'posts_per_page' => 12, 'post__not_in' => array( $hero_id ), 'orderby' => 'date' ) );
                $fc = 0;
                while ( $feat->have_posts() ) {
                    $feat->the_post();
                    if ( ! has_post_thumbnail() ) { continue; }
                    if ( $fc >= 4 ) { break; }
                    rde_card( 'default' );
                    $fc++;
                }
                wp_reset_postdata();
                ?>
            </div>
        </section>

        <?php
        // Blocos por categoria — top 3 categorias, 5 posts cada
        $top_cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 3, 'hide_empty' => true ) );
        foreach ( $top_cats as $cat ) :
            $q = rde_query_for_section( array(
                'posts_per_page' => 15,
                'cat'            => $cat->term_id,
                'post__not_in'   => array( $hero_id ),
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
            <section class="rde-front__cat-block" aria-label="<?php echo esc_attr( $cat->name ); ?>">
                <header class="rde-section__h">
                    <h2><?php echo esc_html( $cat->name ); ?></h2>
                    <a href="<?php echo esc_url( get_category_link( $cat ) ); ?>">Mais de <?php echo esc_html( $cat->name ); ?> →</a>
                </header>
                <div class="rde-front__cat-grid">
                    <div class="rde-cat-col rde-cat-col--featured">
                        <?php
                        $GLOBALS['post'] = get_post( $cat_ids[0] );
                        setup_postdata( $GLOBALS['post'] );
                        rde_card( 'overlay' );
                        wp_reset_postdata();
                        ?>
                    </div>
                    <div class="rde-cat-col rde-cat-col--list">
                        <?php
                        foreach ( array_slice( $cat_ids, 1, 4 ) as $pid ) {
                            $GLOBALS['post'] = get_post( $pid );
                            setup_postdata( $GLOBALS['post'] );
                            ?>
                            <article class="rde-mini-card">
                                <a class="rde-mini-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
                                    <?php the_post_thumbnail( 'rde-card', array( 'class' => 'rde-mini-card__img', 'loading' => 'eager' ) ); ?>
                                </a>
                                <div class="rde-mini-card__body">
                                    <span class="rde-mini-card__cat"><?php echo esc_html( $cat->name ); ?></span>
                                    <h3 class="rde-mini-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
                                    <div class="rde-mini-card__meta"><?php echo esc_html( rde_post_date() ); ?></div>
                                </div>
                            </article>
                            <?php
                        }
                        wp_reset_postdata();
                        ?>
                    </div>
                </div>
            </section>
        <?php endforeach; ?>

        <!-- Últimas — 3 cards -->
        <section class="rde-section" aria-label="Últimas publicações">
            <header class="rde-section__h">
                <h2>Últimas</h2>
                <a href="<?php echo esc_url( home_url( '/blog/' ) ); ?>">Ver tudo →</a>
            </header>
            <div class="rde-front__row-three">
                <?php
                $latest = rde_query_for_section( array( 'posts_per_page' => 18, 'post__not_in' => array( $hero_id ), 'offset' => 4 ) );
                $lc = 0;
                while ( $latest->have_posts() ) {
                    $latest->the_post();
                    if ( ! has_post_thumbnail() ) { continue; }
                    if ( $lc >= 3 ) { break; }
                    rde_card( 'default' );
                    $lc++;
                }
                wp_reset_postdata();
                ?>
            </div>
        </section>
    </div>
</div>

<?php get_footer();
