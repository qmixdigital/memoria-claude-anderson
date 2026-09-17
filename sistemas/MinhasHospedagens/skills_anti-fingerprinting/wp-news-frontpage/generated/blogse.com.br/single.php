<?php
/**
 * Single Archetype IV: Sidebar-rich
 *   - Layout 2-col (content esquerda + sidebar direita 320px)
 *   - byline floating_left (avatar + nome + role inline)
 *   - share_buttons inline_after_first_para
 *   - related inline 3 mid-content
 *   - author_bio expanded card_style fora do <article>
 *   - sidebar widgets: trending + newsletter + tags + ad
 *   - breadcrumb text_pipes
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

while ( have_posts() ) : the_post();
    $post_id     = get_the_ID();
    $cats        = get_the_category();
    $primary_cat = $cats ? $cats[0] : null;
    $author_id   = get_the_author_meta( 'ID' );
    $author      = get_the_author_meta( 'display_name', $author_id );
    $author_link = get_author_posts_url( $author_id );
    $has_grav    = bx_user_has_gravatar( $author_id );

    /* Inline related: 3 posts da mesma categoria, exclui o atual */
    $rel_ids = array();
    $rel_args = array(
        'posts_per_page'      => 12,
        'post__not_in'        => array( $post_id ),
        'ignore_sticky_posts' => true,
        'orderby'             => 'rand',
        'category__not_in'    => bx_excluded_lang_cat_ids(),
        'meta_query'          => array(
            array( 'key' => '_thumbnail_id', 'value' => '0', 'compare' => '>', 'type' => 'NUMERIC' ),
        ),
    );
    if ( $primary_cat ) {
        $rel_args['tax_query'] = array( array( 'taxonomy' => 'category', 'field' => 'term_id', 'terms' => array( $primary_cat->term_id ) ) );
    }
    $rel_q = new WP_Query( $rel_args );
    while ( $rel_q->have_posts() ) {
        $rel_q->the_post();
        if ( ! has_post_thumbnail() ) { continue; }
        $rel_ids[] = get_the_ID();
        if ( count( $rel_ids ) >= 3 ) { break; }
    }
    wp_reset_postdata();
    $GLOBALS['post'] = get_post( $post_id );
    setup_postdata( $GLOBALS['post'] );

    /* Render inline-related HTML to inject mid-content */
    $inline_html = '';
    if ( ! empty( $rel_ids ) ) {
        ob_start();
        ?>
        <aside class="bx-inline-related" aria-label="Leia também">
            <div class="bx-inline-related__label">Leia também</div>
            <div class="bx-inline-related__grid">
                <?php
                global $post;
                $_o = $post;
                foreach ( $rel_ids as $rid ) {
                    $post = get_post( $rid );
                    setup_postdata( $post );
                    ?>
                    <article class="bx-inline-related__card">
                        <a class="bx-inline-related__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
                            <?php the_post_thumbnail( 'bx-card', array( 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
                        </a>
                        <h4 class="bx-inline-related__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h4>
                    </article>
                    <?php
                }
                $post = $_o;
                wp_reset_postdata();
                ?>
            </div>
        </aside>
        <?php
        $inline_html = ob_get_clean();
    }
    $GLOBALS['post'] = get_post( $post_id );
    setup_postdata( $GLOBALS['post'] );

    $bio = get_the_author_meta( 'description', $author_id );
?>

<div class="bx-single-layout">
    <article class="bx-single" id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

        <?php bx_breadcrumb( $post_id ); ?>

        <?php if ( $primary_cat ) : ?>
            <div class="bx-post-cat"><a href="<?php echo esc_url( get_category_link( $primary_cat ) ); ?>"><?php echo esc_html( $primary_cat->name ); ?></a></div>
        <?php endif; ?>

        <h1 class="bx-post-title"><?php the_title(); ?></h1>

        <div class="bx-post-meta">
            <time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>" itemprop="datePublished"><?php echo esc_html( get_the_date( 'd/m/Y' ) ); ?></time>
            <span class="sep">|</span>
            <span><?php echo (int) bx_read_time(); ?> min de leitura</span>
            <?php if ( ( get_the_modified_time( 'U' ) - get_the_time( 'U' ) ) > DAY_IN_SECONDS ) : ?>
                <span class="sep">|</span>
                <span>Atualizado em <time datetime="<?php echo esc_attr( get_the_modified_date( 'c' ) ); ?>" itemprop="dateModified"><?php echo esc_html( get_the_modified_date( 'd/m/Y' ) ); ?></time></span>
            <?php endif; ?>
        </div>

        <div class="bx-byline-float">
            <div class="bx-byline-float__avatar">
                <?php if ( $has_grav ) : ?>
                    <?php echo get_avatar( $author_id, 44 ); ?>
                <?php else : ?>
                    <span class="bx-byline-float__avatar-fallback" aria-hidden="true"><?php echo esc_html( mb_strtoupper( mb_substr( $author, 0, 1 ) ) ); ?></span>
                <?php endif; ?>
            </div>
            <div>
                <div class="bx-byline-float__name">Por <a href="<?php echo esc_url( $author_link ); ?>" rel="author" itemprop="author"><?php echo esc_html( $author ); ?></a></div>
                <div class="bx-byline-float__role">Redação Blog-Se</div>
            </div>
        </div>

        <?php if ( has_post_thumbnail() ) : ?>
            <figure class="bx-post-image">
                <?php the_post_thumbnail( 'full', array( 'fetchpriority' => 'high', 'loading' => 'eager', 'decoding' => 'async' ) ); ?>
            </figure>
        <?php endif; ?>

        <div class="bx-post-body" itemprop="articleBody">
            <?php
            /* Inject share after 1st para + inline-related no meio */
            $content = apply_filters( 'the_content', get_the_content() );
            $paras = explode( '</p>', $content );

            /* share after 1st para */
            ob_start();
            bx_share_inline();
            $share_html = ob_get_clean();
            if ( count( $paras ) >= 2 ) {
                array_splice( $paras, 1, 0, array( $share_html ) );
            }

            /* inline-related no meio */
            $mid = (int) floor( count( $paras ) / 2 );
            if ( $inline_html && $mid >= 3 ) {
                array_splice( $paras, $mid, 0, array( $inline_html ) );
            }
            echo implode( '</p>', $paras );
            ?>
        </div>

        <?php
        $tags = get_the_tags( $post_id );
        if ( $tags && ! is_wp_error( $tags ) ) : ?>
            <nav class="bx-tags" aria-label="Etiquetas">
                <span class="bx-tags__label">Tags</span>
                <ul>
                    <?php foreach ( $tags as $tag ) : ?>
                        <li><a href="<?php echo esc_url( get_tag_link( $tag ) ); ?>" rel="tag"><?php echo esc_html( $tag->name ); ?></a></li>
                    <?php endforeach; ?>
                </ul>
            </nav>
        <?php endif; ?>
    </article>

    <!-- Sidebar (single layout) -->
    <aside class="bx-sidebar" role="complementary">
        <?php
        $tr_q = bx_query_for_section( array(
            'posts_per_page' => 12,
            'post__not_in'   => array( $post_id ),
            'orderby'        => 'comment_count',
            'order'          => 'DESC',
        ) );
        $tr_items = '';
        $tc = 0;
        while ( $tr_q->have_posts() ) {
            $tr_q->the_post();
            if ( ! has_post_thumbnail() ) { continue; }
            if ( $tc >= 5 ) { break; }
            $tr_items .= '<li><a href="' . esc_url( get_permalink() ) . '">' . esc_html( get_the_title() ) . '</a></li>';
            $tc++;
        }
        wp_reset_postdata();
        if ( $tr_items ) : ?>
            <div class="bx-widget bx-widget--ranked">
                <h4>Trending</h4>
                <ol><?php echo $tr_items; ?></ol>
            </div>
        <?php endif; ?>

        <div class="bx-newsletter" style="margin: 0;">
            <h3>Newsletter</h3>
            <p>O melhor do Blog-Se no seu e-mail.</p>
            <form method="post" action="<?php echo esc_url( home_url( '/?bx_subscribe=1' ) ); ?>">
                <input type="email" name="bx_email" placeholder="seu@email.com" required aria-label="E-mail">
                <button type="submit">Assinar</button>
            </form>
        </div>

        <?php
        $popular_cats = get_categories( array(
            'orderby' => 'count', 'order' => 'DESC', 'number' => 8,
            'hide_empty' => true, 'exclude' => bx_excluded_lang_cat_ids(),
        ) );
        if ( $popular_cats ) : ?>
            <div class="bx-widget">
                <h4>Editorias</h4>
                <ul>
                    <?php foreach ( $popular_cats as $c ) : ?>
                        <li><a href="<?php echo esc_url( get_category_link( $c ) ); ?>"><?php echo esc_html( $c->name ); ?> <span style="color:var(--bx-muted);font-family:var(--bx-font-mono);font-size:10px;">(<?php echo (int) $c->count; ?>)</span></a></li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>
    </aside>
</div>

<?php if ( $bio ) : ?>
    <div class="bx-author-bio" itemprop="author" itemscope itemtype="https://schema.org/Person">
        <div class="bx-author-bio__avatar">
            <?php if ( $has_grav ) : ?>
                <?php echo get_avatar( $author_id, 80 ); ?>
            <?php else : ?>
                <span class="bx-avatar-fb" aria-hidden="true"><?php echo esc_html( mb_strtoupper( mb_substr( $author, 0, 1 ) ) ); ?></span>
            <?php endif; ?>
        </div>
        <div class="bx-author-bio__content">
            <span class="bx-author-bio__label">Escrito por</span>
            <h4 itemprop="name"><a href="<?php echo esc_url( $author_link ); ?>" rel="author"><?php echo esc_html( $author ); ?></a></h4>
            <p itemprop="description"><?php echo esc_html( $bio ); ?></p>
        </div>
    </div>
<?php endif; ?>

<?php endwhile; ?>

<?php get_footer();
