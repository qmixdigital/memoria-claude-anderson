<?php
/**
 * Single — Archetype II_longform.
 * Byline above_title, deck (sub-headline italic), parallax featured,
 * AdSense every 5 paragraphs (ad set B), share top+bottom (sem redes),
 * related vertical_list_5, sem author_bio_box, sem breadcrumb.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

while ( have_posts() ) : the_post();
    $post_id = get_the_ID();
    $cats    = get_the_category();
    $cat     = $cats ? $cats[0] : null;
?>

<div class="rde-layout--single">

    <!-- Sidebar à esquerda -->
    <aside class="rde-sidebar" role="complementary">
        <?php
        // Render manual — não confia em sidebar-1 estar populado.
        $render_widget = function ( $title, $args ) {
            $defaults = array(
                'posts_per_page'      => 15,
                'no_found_rows'       => true,
                'ignore_sticky_posts' => true,
                'meta_query'          => array(
                    array( 'key' => '_thumbnail_id', 'value' => '0', 'compare' => '>', 'type' => 'NUMERIC' ),
                ),
            );
            $q = new WP_Query( wp_parse_args( $args, $defaults ) );
            $items = ''; $count = 0;
            while ( $q->have_posts() ) {
                $q->the_post();
                if ( ! has_post_thumbnail() ) { continue; }
                if ( $count >= 5 ) { break; }
                $items .= '<li><a href="' . esc_url( get_permalink() ) . '">' . esc_html( get_the_title() ) . '</a></li>';
                $count++;
            }
            wp_reset_postdata();
            if ( ! $items ) { return; }
            echo '<div class="rde-widget"><h4>' . esc_html( $title ) . '</h4><ol>' . $items . '</ol></div>';
        };

        $render_widget( 'Mais lidos', array(
            'orderby'      => 'comment_count',
            'order'        => 'DESC',
            'post__not_in' => array( $post_id ),
        ) );
        if ( $cat ) {
            $render_widget( 'Mais de ' . $cat->name, array(
                'cat'          => $cat->term_id,
                'post__not_in' => array( $post_id ),
            ) );
        }

        // Lista de editorias sempre presente
        $cats_w = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 8, 'hide_empty' => true ) );
        if ( $cats_w ) {
            echo '<div class="rde-widget"><h4>Editorias</h4><ul>';
            foreach ( $cats_w as $c ) {
                echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
            }
            echo '</ul></div>';
        }

        if ( defined( 'RDE_ADSENSE_CLIENT' ) && RDE_ADSENSE_CLIENT ) : ?>
            <div class="rde-widget rde-widget--ad">
                <ins class="adsbygoogle" style="display:block" data-ad-client="<?php echo esc_attr( RDE_ADSENSE_CLIENT ); ?>" data-ad-format="auto" data-full-width-responsive="true"></ins>
                <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
            </div>
        <?php endif; ?>
    </aside>

    <!-- Article -->
    <article id="post-<?php the_ID(); ?>" <?php post_class( 'rde-post' ); ?>>

        <!-- byline_position: above_title -->
        <p class="rde-post__byline">
            Por <strong><?php the_author(); ?></strong>
            <span> · </span>
            <span><?php echo esc_html( rde_post_date( $post_id ) ); ?></span>
        </p>

        <?php if ( $cat ) : ?>
            <span class="rde-post__kicker"><a href="<?php echo esc_url( get_category_link( $cat ) ); ?>"><?php echo esc_html( $cat->name ); ?></a></span>
        <?php endif; ?>

        <h1 class="rde-post__title"><?php the_title(); ?></h1>

        <?php if ( get_the_excerpt() ) : ?>
            <p class="rde-post__deck"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 32 ) ); ?></p>
        <?php endif; ?>

        <div class="rde-post__meta">
            <?php echo esc_html( rde_read_time( $post_id ) ); ?> min de leitura
            <?php if ( get_comments_number() > 0 ) : ?>
                <span> · </span>
                <span><?php echo esc_html( number_format_i18n( get_comments_number() ) ); ?> comentários</span>
            <?php endif; ?>
        </div>

        <!-- Share top -->
        <div class="rde-post__sharebar" role="toolbar" aria-label="Compartilhar">
            <button type="button" data-action="copy-link" data-url="<?php echo esc_attr( get_permalink() ); ?>">Copiar link</button>
            <button type="button" onclick="window.print()">Imprimir</button>
        </div>

        <?php if ( has_post_thumbnail() ) : ?>
            <figure class="rde-post__featured">
                <?php the_post_thumbnail( 'rde-card', array( 'fetchpriority' => 'high', 'loading' => 'eager' ) ); ?>
                <?php $caption = get_the_post_thumbnail_caption(); if ( $caption ) : ?>
                    <figcaption><?php echo esc_html( $caption ); ?></figcaption>
                <?php endif; ?>
            </figure>
        <?php endif; ?>

        <div class="rde-post__content">
            <?php the_content(); ?>
        </div>

        <?php
        $tags = get_the_tags();
        if ( ! empty( $tags ) ) : ?>
            <div class="rde-post__tags">
                <?php foreach ( $tags as $t ) : ?>
                    <a href="<?php echo esc_url( get_tag_link( $t ) ); ?>"><?php echo esc_html( $t->name ); ?></a>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <!-- Share bottom -->
        <div class="rde-post__sharebar" role="toolbar" aria-label="Compartilhar">
            <button type="button" data-action="copy-link" data-url="<?php echo esc_attr( get_permalink() ); ?>">Copiar link</button>
            <button type="button" onclick="window.print()">Imprimir</button>
        </div>

        <?php if ( get_comments_number() > 0 || comments_open() ) : ?>
            <section class="rde-comments" aria-label="Comentários">
                <h3>Comentários</h3>
                <?php comments_template( '', true ); ?>
            </section>
        <?php endif; ?>

        <!-- Related vertical_list_5 -->
        <?php
        $rel_args = array(
            'posts_per_page'      => 15,
            'post__not_in'        => array( $post_id ),
            'no_found_rows'       => true,
            'ignore_sticky_posts' => true,
            'orderby'             => 'rand',
        );
        if ( $cat ) { $rel_args['cat'] = $cat->term_id; }
        $rel = new WP_Query( $rel_args );
        $rel_ids = array();
        while ( $rel->have_posts() ) {
            $rel->the_post();
            if ( ! has_post_thumbnail() ) { continue; }
            $rel_ids[] = get_the_ID();
            if ( count( $rel_ids ) >= 5 ) { break; }
        }
        wp_reset_postdata();
        if ( ! empty( $rel_ids ) ) :
            ?>
            <section class="rde-related" aria-label="Leia também">
                <header class="rde-section__h">
                    <h2>Leia também</h2>
                </header>
                <div class="rde-related__list">
                    <?php foreach ( $rel_ids as $rid ) :
                        $GLOBALS['post'] = get_post( $rid );
                        setup_postdata( $GLOBALS['post'] );
                        rde_card( 'default' );
                    endforeach; wp_reset_postdata(); ?>
                </div>
            </section>
        <?php endif; ?>
    </article>
</div>

<?php
endwhile;
get_footer();
