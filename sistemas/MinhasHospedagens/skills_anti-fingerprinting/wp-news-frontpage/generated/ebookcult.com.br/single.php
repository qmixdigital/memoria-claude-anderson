<?php
/**
 * Portal: ebookcult.com.br
 * Single archetype: II_longform
 * Byline position: under_title
 * Related layout: inline_3_during_content
 * Comments: facebook (placeholder div, opt-in via plugin)
 * Share buttons: floating_left_sticky
 * Schema: Article (emitted via wp_head action)
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();
?>

<div class="ec-layout ec-layout--single">
    <article class="ec-main ec-post" id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

        <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>

            <nav class="ec-breadcrumb" aria-label="Localização">
                <a href="<?php echo esc_url( home_url( '/' ) ); ?>">Início</a>
                <?php
                $bc = get_the_category();
                if ( ! empty( $bc ) ) {
                    echo '<span class="ec-breadcrumb__sep">|</span>';
                    echo '<a href="' . esc_url( get_category_link( $bc[0] ) ) . '">' . esc_html( $bc[0]->name ) . '</a>';
                }
                ?>
                <span class="ec-breadcrumb__sep">|</span>
                <span><?php echo esc_html( wp_trim_words( get_the_title(), 8, '…' ) ); ?></span>
            </nav>

            <header class="ec-post__header">
                <?php
                $cats = get_the_category();
                if ( ! empty( $cats ) ) {
                    echo '<a class="ec-post__kicker" href="' . esc_url( get_category_link( $cats[0] ) ) . '">' . esc_html( $cats[0]->name ) . '</a>';
                }
                ?>
                <h1 class="ec-post__title"><?php the_title(); ?></h1>
                <?php if ( has_excerpt() ) : ?>
                    <p class="ec-post__lead"><?php echo esc_html( get_the_excerpt() ); ?></p>
                <?php endif; ?>

                <div class="ec-post__byline">
                    <span class="ec-post__author">Por <strong><?php the_author(); ?></strong></span>
                    <span class="ec-post__sep" aria-hidden="true">|</span>
                    <time class="ec-post__date" datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>">
                        <?php echo esc_html( ec_post_date() ); ?>
                    </time>
                    <?php
                    $reading = ec_reading_time();
                    if ( $reading ) :
                    ?>
                        <span class="ec-post__sep" aria-hidden="true">|</span>
                        <span class="ec-post__reading"><?php echo esc_html( $reading ); ?></span>
                    <?php endif; ?>
                </div>
            </header>

            <?php if ( has_post_thumbnail() ) : ?>
                <figure class="ec-post__cover">
                    <?php
                    the_post_thumbnail( 'large', array(
                        'fetchpriority' => 'high',
                        'decoding'      => 'async',
                    ) );
                    $cap = get_the_post_thumbnail_caption();
                    if ( $cap ) :
                    ?>
                        <figcaption><?php echo esc_html( $cap ); ?></figcaption>
                    <?php endif; ?>
                </figure>
            <?php endif; ?>

            <div class="ec-share" aria-label="Compartilhar este artigo">
                <a class="ec-share__btn" href="https://wa.me/?text=<?php echo rawurlencode( get_the_title() . ' ' . get_permalink() ); ?>" target="_blank" rel="noopener nofollow" aria-label="Compartilhar no WhatsApp">WhatsApp</a>
                <a class="ec-share__btn" href="https://www.facebook.com/sharer/sharer.php?u=<?php echo rawurlencode( get_permalink() ); ?>" target="_blank" rel="noopener nofollow" aria-label="Compartilhar no Facebook">Facebook</a>
                <a class="ec-share__btn" href="https://twitter.com/intent/tweet?url=<?php echo rawurlencode( get_permalink() ); ?>&text=<?php echo rawurlencode( get_the_title() ); ?>" target="_blank" rel="noopener nofollow" aria-label="Compartilhar no Twitter/X">Twitter/X</a>
                <a class="ec-share__btn" href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo rawurlencode( get_permalink() ); ?>" target="_blank" rel="noopener nofollow" aria-label="Compartilhar no LinkedIn">LinkedIn</a>
            </div>

            <div class="ec-post__body ec-prose">
                <?php
                /* Inline_3 related — split content at 1/3, 2/3 marks. */
                $content = apply_filters( 'the_content', get_the_content() );
                $content = str_replace( ']]>', ']]&gt;', $content );
                ec_render_with_inline_related( $content, get_the_ID() );
                ?>
            </div>

            <?php
            $tags = get_the_tags();
            if ( ! empty( $tags ) ) :
            ?>
            <div class="ec-post__tags">
                <span class="ec-post__tags-label">Assuntos relacionados</span>
                <?php
                foreach ( $tags as $t ) {
                    echo '<a href="' . esc_url( get_tag_link( $t ) ) . '" class="ec-post__tag">' . esc_html( $t->name ) . '</a>';
                }
                ?>
            </div>
            <?php endif; ?>

            <?php
            $author_id = get_the_author_meta( 'ID' );
            $bio       = get_the_author_meta( 'description' );
            if ( $bio ) :
            ?>
            <aside class="ec-author-card" aria-label="Sobre o autor">
                <?php echo get_avatar( $author_id, 84, '', get_the_author(), array( 'class' => 'ec-author-card__avatar' ) ); ?>
                <div class="ec-author-card__body">
                    <span class="ec-author-card__role">Por quem assina</span>
                    <h3 class="ec-author-card__name"><?php the_author(); ?></h3>
                    <p class="ec-author-card__bio"><?php echo esc_html( $bio ); ?></p>
                    <a class="ec-author-card__link" href="<?php echo esc_url( get_author_posts_url( $author_id ) ); ?>">Ver outros textos deste autor</a>
                </div>
            </aside>
            <?php endif; ?>

            <?php
            // "Veja também" footer block — 3 related (não usados no inline)
            $tail_related = ec_related_posts( get_the_ID(), 3, ec_inline_related_used_ids() );
            if ( ! empty( $tail_related ) ) :
            ?>
            <section class="ec-post__related" aria-label="Veja também">
                <h3>Veja também</h3>
                <div class="ec-post__related-grid">
                    <?php foreach ( $tail_related as $rid ) : ?>
                    <a class="ec-post__related-card" href="<?php echo esc_url( get_permalink( $rid ) ); ?>">
                        <span class="ec-post__related-thumb">
                            <?php echo get_the_post_thumbnail( $rid, 'medium', array( 'alt' => '' ) ); ?>
                        </span>
                        <span class="ec-post__related-title"><?php echo esc_html( get_the_title( $rid ) ); ?></span>
                    </a>
                    <?php endforeach; ?>
                </div>
            </section>
            <?php endif; ?>

            <div class="ec-post__comments" id="comentarios">
                <h3>Comentários</h3>
                <div class="fb-comments"
                     data-href="<?php echo esc_url( get_permalink() ); ?>"
                     data-numposts="6"
                     data-width="100%"
                     data-order-by="reverse_time"></div>
                <p style="font-size:12px; color:var(--ec-muted); margin-top:10px;">
                    Comentários via Facebook Social Plugin. Suas opiniões aparecem com seu perfil público.
                </p>
            </div>

        <?php endwhile; endif; ?>

    </article>

    <aside class="ec-sidebar" role="complementary">

        <div class="ec-widget">
            <h4>Mais lidas</h4>
            <?php
            $sb = ec_query_for_section( array(
                'posts_per_page' => 12,
                'orderby'        => 'comment_count',
                'order'          => 'DESC',
                'post__not_in'   => array( get_the_ID() ),
            ), false );
            $sb_ids = array();
            while ( $sb->have_posts() ) {
                $sb->the_post();
                if ( ! has_post_thumbnail() ) { continue; }
                $sb_ids[] = get_the_ID();
                if ( count( $sb_ids ) >= 5 ) { break; }
            }
            wp_reset_postdata();
            ?>
            <ul class="ec-widget__compact">
                <?php foreach ( $sb_ids as $sid ) : ?>
                <li>
                    <a href="<?php echo esc_url( get_permalink( $sid ) ); ?>">
                        <span class="ec-widget__thumb">
                            <?php echo get_the_post_thumbnail( $sid, array( 60, 60 ), array( 'alt' => '' ) ); ?>
                        </span>
                        <span class="ec-widget__txt">
                            <span class="ec-widget__title"><?php echo esc_html( wp_trim_words( get_the_title( $sid ), 10, '…' ) ); ?></span>
                            <span class="ec-widget__date"><?php echo esc_html( ec_post_date( $sid ) ); ?></span>
                        </span>
                    </a>
                </li>
                <?php endforeach; ?>
            </ul>
        </div>

        <?php if ( is_active_sidebar( 'sidebar-1' ) ) : ?>
            <?php dynamic_sidebar( 'sidebar-1' ); ?>
        <?php endif; ?>

    </aside>

</div>

<?php
get_footer();
