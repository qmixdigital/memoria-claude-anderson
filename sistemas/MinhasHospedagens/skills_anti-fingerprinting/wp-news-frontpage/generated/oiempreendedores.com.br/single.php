<?php
/**
 * Single — Archetype IV (Sidebar-rich).
 *
 * Layout: article (coluna fluida) + sidebar 320px à direita.
 * Sem share rail, sem redes sociais. Comments fica oculto se vazio.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

while ( have_posts() ) : the_post();
    $post_id = get_the_ID();
    $cats    = get_the_category();
    $cat     = $cats ? $cats[0] : null;
?>

<div class="oie-layout--single">

    <!-- ============== COLUNA 1: ARTIGO ============== -->
    <article id="post-<?php the_ID(); ?>" <?php post_class( 'oie-post' ); ?>>
        <?php oie_breadcrumb_slashes(); ?>

        <?php if ( $cat ) : ?>
            <span class="oie-post__kicker">
                <a href="<?php echo esc_url( get_category_link( $cat ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
            </span>
        <?php endif; ?>

        <h1 class="oie-post__title"><?php the_title(); ?></h1>

        <p class="oie-post__lead">
            Por <strong><?php the_author(); ?></strong>
            <span class="oie-dot">·</span>
            <?php echo esc_html( oie_post_date( $post_id ) ); ?>
            <span class="oie-dot">·</span>
            <?php echo esc_html( oie_read_time( $post_id ) ); ?> min de leitura
        </p>

        <?php if ( has_post_thumbnail() ) : ?>
            <figure class="oie-post__featured">
                <?php the_post_thumbnail( 'large', array( 'fetchpriority' => 'high', 'loading' => 'eager' ) ); ?>
                <?php $caption = get_the_post_thumbnail_caption(); if ( $caption ) : ?>
                    <figcaption><?php echo esc_html( $caption ); ?></figcaption>
                <?php endif; ?>
            </figure>
        <?php endif; ?>

        <div class="oie-post__content">
            <?php the_content(); ?>
        </div>

        <?php
        // Tags (se houver) como chips no fim do conteúdo
        $tags = get_the_tags();
        if ( ! empty( $tags ) ) : ?>
            <div class="oie-post__tags">
                <?php foreach ( $tags as $t ) : ?>
                    <a href="<?php echo esc_url( get_tag_link( $t ) ); ?>"><?php echo esc_html( $t->name ); ?></a>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <!-- Caixa do autor — substitui o plugin Starbox usando dados nativos do WP -->
        <?php
        $author_id   = get_the_author_meta( 'ID' );
        $author_bio  = get_the_author_meta( 'description', $author_id );
        $author_name = get_the_author_meta( 'display_name', $author_id );
        $author_url  = get_author_posts_url( $author_id );
        ?>
        <aside class="oie-authorbox" aria-label="Sobre o autor">
            <a class="oie-authorbox__avatar" href="<?php echo esc_url( $author_url ); ?>" aria-hidden="true" tabindex="-1">
                <?php echo oie_author_avatar( $author_id, 120, $author_name ); ?>
            </a>
            <div class="oie-authorbox__body">
                <span class="oie-authorbox__label">Sobre o autor</span>
                <h4 class="oie-authorbox__name"><a href="<?php echo esc_url( $author_url ); ?>"><?php echo esc_html( $author_name ); ?></a></h4>
                <?php if ( $author_bio ) : ?>
                    <p class="oie-authorbox__bio"><?php echo esc_html( $author_bio ); ?></p>
                <?php endif; ?>
                <a class="oie-authorbox__link" href="<?php echo esc_url( $author_url ); ?>">Ver todas as publicações →</a>
            </div>
        </aside>

        <!-- Comentários nativos: só renderiza se já houver pelo menos um -->
        <?php if ( get_comments_number() > 0 || comments_open() ) : ?>
            <section class="oie-comments" aria-label="Comentários">
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
            'category__not_in'    => oie_excluded_lang_cat_ids(),
        );
        if ( $cat ) { $rel_args['cat'] = $cat->term_id; }
        $rel = new WP_Query( $rel_args );
        $rel_collected = array();
        while ( $rel->have_posts() ) {
            $rel->the_post();
            if ( ! has_post_thumbnail() ) { continue; }
            $rel_collected[] = get_the_ID();
            if ( count( $rel_collected ) >= 4 ) { break; }
        }
        wp_reset_postdata();
        if ( ! empty( $rel_collected ) ) :
            ?>
            <section class="oie-related" aria-label="Leia também">
                <header class="oie-section__h">
                    <h2>Leia também</h2>
                </header>
                <div class="oie-related__grid">
                    <?php foreach ( $rel_collected as $rid ) :
                        $GLOBALS['post'] = get_post( $rid );
                        setup_postdata( $GLOBALS['post'] );
                        oie_card( 'default' );
                    endforeach; wp_reset_postdata(); ?>
                </div>
            </section>
        <?php endif; ?>
    </article>

    <!-- ============== COLUNA 2: SIDEBAR ============== -->
    <aside class="oie-sidebar" role="complementary">
        <?php
        // Renderiza um widget de lista a partir de WP_Query args.
        $render_list_widget = function ( $title, $args ) {
            $defaults = array(
                'posts_per_page'      => 15,
                'no_found_rows'       => true,
                'ignore_sticky_posts' => true,
                'meta_query'          => array(
                    array( 'key' => '_thumbnail_id', 'value' => '0', 'compare' => '>', 'type' => 'NUMERIC' ),
                ),
            );
            $q = new WP_Query( wp_parse_args( $args, $defaults ) );
            $items = '';
            $count = 0;
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
            echo '<div class="oie-widget"><h4>' . esc_html( $title ) . '</h4><ol>' . $items . '</ol></div>';
        };

        $excl_cats = oie_excluded_lang_cat_ids();

        $render_list_widget( 'Mais lidos', array(
            'orderby'          => 'comment_count',
            'order'            => 'DESC',
            'post__not_in'     => array( $post_id ),
            'category__not_in' => $excl_cats,
        ) );

        if ( $cat ) {
            $render_list_widget( 'Mais de ' . $cat->name, array(
                'cat'              => $cat->term_id,
                'post__not_in'     => array( $post_id ),
                'category__not_in' => $excl_cats,
            ) );
        }
        ?>
    </aside>

</div>

<?php
endwhile;
get_footer();
