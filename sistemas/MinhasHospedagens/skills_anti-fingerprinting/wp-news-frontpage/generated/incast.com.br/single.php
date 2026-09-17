<?php
/**
 * Single post — Archetype I_classic.
 * Byline hidden, share top_only (apenas copiar/imprimir, sem redes sociais),
 * author_bio_box compact, comments_template nativo opcional.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

while ( have_posts() ) : the_post();
    $post_id = get_the_ID();
    $cats    = get_the_category();
    $cat     = $cats ? $cats[0] : null;
?>

<div class="ic-layout--single">

    <article id="post-<?php the_ID(); ?>" <?php post_class( 'ic-post' ); ?>>

        <?php if ( $cat ) : ?>
            <span class="ic-post__kicker">
                <a href="<?php echo esc_url( get_category_link( $cat ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
            </span>
        <?php endif; ?>

        <h1 class="ic-post__title"><?php the_title(); ?></h1>

        <div class="ic-post__meta">
            <strong><?php the_author(); ?></strong>
            <span class="ic-dot">·</span>
            <span><?php echo esc_html( ic_post_date( $post_id ) ); ?></span>
            <span class="ic-dot">·</span>
            <span><?php echo esc_html( ic_read_time( $post_id ) ); ?> min de leitura</span>
            <?php if ( get_comments_number() > 0 ) : ?>
                <span class="ic-dot">·</span>
                <span><?php echo esc_html( number_format_i18n( get_comments_number() ) ); ?> comentários</span>
            <?php endif; ?>
        </div>

        <?php if ( has_post_thumbnail() ) : ?>
            <figure class="ic-post__featured">
                <?php the_post_thumbnail( 'ic-card', array( 'fetchpriority' => 'high', 'loading' => 'eager' ) ); ?>
                <?php $caption = get_the_post_thumbnail_caption(); if ( $caption ) : ?>
                    <figcaption><?php echo esc_html( $caption ); ?></figcaption>
                <?php endif; ?>
            </figure>
        <?php endif; ?>

        <!-- Share top_only — sem redes sociais (apenas link copy + imprimir) -->
        <div class="ic-post__sharebar" role="toolbar" aria-label="Compartilhar">
            <button type="button" data-action="copy-link" data-url="<?php echo esc_attr( get_permalink() ); ?>">
                Copiar link
            </button>
            <button type="button" onclick="window.print()">Imprimir</button>
        </div>

        <div class="ic-post__content">
            <?php the_content(); ?>
        </div>

        <?php
        $tags = get_the_tags();
        if ( ! empty( $tags ) ) : ?>
            <div class="ic-post__tags">
                <?php foreach ( $tags as $t ) : ?>
                    <a href="<?php echo esc_url( get_tag_link( $t ) ); ?>"><?php echo esc_html( $t->name ); ?></a>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <!-- Author bio compact -->
        <?php
        $aid = get_the_author_meta( 'ID' );
        $bio = get_the_author_meta( 'description', $aid );
        ?>
        <aside class="ic-authorbox" aria-label="Autor">
            <a class="ic-authorbox__avatar" href="<?php echo esc_url( get_author_posts_url( $aid ) ); ?>" aria-hidden="true" tabindex="-1">
                <?php echo ic_author_avatar( $aid, 56, get_the_author_meta( 'display_name', $aid ) ); ?>
            </a>
            <div class="ic-authorbox__body">
                <p class="ic-authorbox__name"><a href="<?php echo esc_url( get_author_posts_url( $aid ) ); ?>"><?php echo esc_html( get_the_author_meta( 'display_name', $aid ) ); ?></a></p>
                <?php if ( $bio ) : ?>
                    <p class="ic-authorbox__meta"><?php echo esc_html( wp_trim_words( $bio, 22 ) ); ?></p>
                <?php else : ?>
                    <p class="ic-authorbox__meta">Editor(a) do <?php bloginfo( 'name' ); ?>.</p>
                <?php endif; ?>
            </div>
        </aside>

        <?php if ( get_comments_number() > 0 || comments_open() ) : ?>
            <section class="ic-comments" aria-label="Comentários">
                <h3>Comentários</h3>
                <?php comments_template( '', true ); ?>
            </section>
        <?php endif; ?>

        <!-- Leia também -->
        <?php
        $rel_args = array(
            'posts_per_page'      => 12,
            'post__not_in'        => array( $post_id ),
            'no_found_rows'       => true,
            'ignore_sticky_posts' => true,
            'orderby'             => 'rand',
            'category__not_in'    => ic_excluded_lang_cat_ids(),
        );
        if ( $cat ) { $rel_args['cat'] = $cat->term_id; }
        $rel = new WP_Query( $rel_args );
        $rel_ids = array();
        while ( $rel->have_posts() ) {
            $rel->the_post();
            if ( ! has_post_thumbnail() ) { continue; }
            $rel_ids[] = get_the_ID();
            if ( count( $rel_ids ) >= 4 ) { break; }
        }
        wp_reset_postdata();
        if ( ! empty( $rel_ids ) ) :
            ?>
            <section class="ic-related" aria-label="Leia também">
                <header class="ic-section__h">
                    <h2>Leia também</h2>
                </header>
                <div class="ic-related__grid">
                    <?php foreach ( $rel_ids as $rid ) :
                        $GLOBALS['post'] = get_post( $rid );
                        setup_postdata( $GLOBALS['post'] );
                        ic_card( 'featured' );
                    endforeach; wp_reset_postdata(); ?>
                </div>
            </section>
        <?php endif; ?>
    </article>

    <!-- Sidebar floating -->
    <aside class="ic-sidebar" role="complementary">
        <?php if ( is_active_sidebar( 'sidebar-1' ) ) :
            dynamic_sidebar( 'sidebar-1' );
        else :
            $excl_ids = ic_excluded_lang_cat_ids();
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
                if ( $q instanceof WP_Query ) {
                    while ( $q->have_posts() ) {
                        $q->the_post();
                        if ( ! has_post_thumbnail() ) { continue; }
                        if ( $count >= 5 ) { break; }
                        $items .= '<li><a href="' . esc_url( get_permalink() ) . '">' . esc_html( get_the_title() ) . '</a></li>';
                        $count++;
                    }
                    wp_reset_postdata();
                }
                if ( ! $items ) { return; }
                echo '<div class="ic-widget"><h4>' . esc_html( $title ) . '</h4><ol>' . $items . '</ol></div>';
            };
            $render_widget( 'Mais lidos', array(
                'orderby'          => 'comment_count',
                'order'            => 'DESC',
                'post__not_in'     => array( $post_id ),
                'category__not_in' => $excl_ids,
            ) );
            if ( $cat ) {
                $render_widget( 'Mais de ' . $cat->name, array(
                    'cat'              => $cat->term_id,
                    'post__not_in'     => array( $post_id ),
                    'category__not_in' => $excl_ids,
                ) );
            }
            if ( defined( 'INCAST_ADSENSE_CLIENT' ) && INCAST_ADSENSE_CLIENT ) : ?>
                <div class="ic-widget--ad">
                    <ins class="adsbygoogle" style="display:block" data-ad-client="<?php echo esc_attr( INCAST_ADSENSE_CLIENT ); ?>" data-ad-format="auto" data-full-width-responsive="true"></ins>
                    <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
                </div>
            <?php endif;
        endif; ?>
    </aside>

</div>

<?php
endwhile;
get_footer();
