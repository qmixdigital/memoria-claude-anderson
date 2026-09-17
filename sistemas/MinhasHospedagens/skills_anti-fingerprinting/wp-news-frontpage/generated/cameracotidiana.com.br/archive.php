<?php
/**
 * Câmera Cotidiana — archive (beta_magazine_grid + infinite_scroll + tabs subcategory).
 * Density 2_2_1, no sidebar.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();
?>

<div class="cc__shell">

    <header class="cc__archive__head">
        <nav class="cc__breadcrumb" aria-label="Localização">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>">início</a>
            <span class="cc__breadcrumb__sep" aria-hidden="true"></span>
            <span><?php echo esc_html( strtolower( wp_strip_all_tags( get_the_archive_title() ) ) ); ?></span>
        </nav>

        <span class="cc__archive__kicker">
            <?php
            if ( is_category() ) echo 'caderno';
            elseif ( is_tag() ) echo 'tag';
            elseif ( is_author() ) echo 'autor';
            else echo 'arquivo';
            ?>
        </span>

        <h1 class="cc__archive__h1">
            <?php
            $title = get_the_archive_title();
            $title = preg_replace( '/^(Categoria|Tag|Autor):\s*/i', '', $title );
            echo esc_html( strtolower( wp_strip_all_tags( $title ) ) );
            ?>
        </h1>

        <?php if ( is_category() ) :
            $term = get_queried_object();
            if ( $term && ! empty( $term->description ) ) : ?>
            <p class="cc__archive__desc"><?php echo esc_html( wp_trim_words( strip_tags( $term->description ), 32, '…' ) ); ?></p>
            <?php endif;
            // Subcategory tabs
            $children = get_terms( array( 'taxonomy' => 'category', 'parent' => $term->term_id, 'hide_empty' => true ) );
            if ( ! empty( $children ) && ! is_wp_error( $children ) ) :
            ?>
            <nav class="cc__archive__tabs" aria-label="Subcategorias">
                <?php foreach ( $children as $ch ) : ?>
                    <a href="<?php echo esc_url( get_category_link( $ch ) ); ?>"><?php echo esc_html( strtolower( $ch->name ) ); ?></a>
                <?php endforeach; ?>
            </nav>
            <?php endif;
        endif; ?>
    </header>

    <?php if ( have_posts() ) : ?>
        <div class="cc__archive__grid" id="cc-archive-grid">
            <?php while ( have_posts() ) : the_post(); ?>
                <article class="cc__archive__item">
                    <?php if ( has_post_thumbnail() ) : ?>
                    <a class="cc__archive__item-media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
                        <?php the_post_thumbnail( 'medium_large', array( 'alt' => '', 'decoding' => 'async' ) ); ?>
                    </a>
                    <?php endif; ?>
                    <div class="cc__archive__item-body">
                        <p class="cc__archive__item-byline">
                            por <strong><?php the_author(); ?></strong> · <?php echo esc_html( cc_post_date() ); ?>
                        </p>
                        <h2 class="cc__archive__item-title">
                            <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                        </h2>
                        <p class="cc__archive__item-excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 24, '…' ) ); ?></p>
                    </div>
                </article>
            <?php endwhile; ?>
        </div>

        <?php
        $next_url = get_next_posts_page_link();
        if ( $next_url ) :
        ?>
        <nav class="cc__archive__loadmore" data-cc-next="<?php echo esc_url( $next_url ); ?>">
            <a class="cc__btn" href="<?php echo esc_url( $next_url ); ?>" id="cc-loadmore-trigger">› carregar mais</a>
        </nav>
        <?php endif; ?>

    <?php else : ?>
        <div class="cc__empty">
            <h2>nada por aqui ainda</h2>
            <p>Esse arquivo não tem ensaios publicados. Volte à <a href="<?php echo esc_url( home_url( '/' ) ); ?>">página inicial</a> ou explore um caderno no menu.</p>
        </div>
    <?php endif; ?>

</div>

<style>
.cc__archive__head { padding: var(--cc-sp-5) 0 var(--cc-sp-4); margin-bottom: var(--cc-sp-5); border-bottom: 3px double var(--cc-line-strong); }
.cc__archive__kicker { display: inline-block; font-family: var(--cc-mono); font-size: 10px; color: var(--cc-accent); letter-spacing: .26em; text-transform: lowercase; font-weight: 700; border-bottom: 1.5px solid var(--cc-accent); padding-bottom: 2px; margin-bottom: var(--cc-sp-3); }
.cc__archive__h1 { font-family: var(--cc-display); font-size: clamp(36px, 6vw, 64px); font-weight: 800; font-style: italic; letter-spacing: -0.03em; text-transform: lowercase; margin: 0 0 var(--cc-sp-3); }
.cc__archive__desc { font-family: var(--cc-serif); font-size: 17px; color: var(--cc-muted); font-style: italic; max-width: 60ch; margin: 0 0 var(--cc-sp-3); }
.cc__archive__tabs { display: flex; flex-wrap: wrap; gap: 18px; padding-top: var(--cc-sp-3); border-top: 1px solid var(--cc-line); margin-top: var(--cc-sp-3); }
.cc__archive__tabs a { font-family: var(--cc-mono); font-size: 11px; letter-spacing: .14em; text-transform: lowercase; color: var(--cc-ink-2); border-bottom: 1px solid transparent; padding-bottom: 2px; transition: all .15s; }
html[data-theme="dark"] .cc__archive__tabs a { color: var(--cc-dark-ink-2); }
.cc__archive__tabs a:hover { color: var(--cc-accent); border-bottom-color: var(--cc-accent); }

.cc__archive__grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--cc-sp-5) var(--cc-sp-4); }
@media (max-width: 720px) { .cc__archive__grid { grid-template-columns: 1fr; gap: var(--cc-sp-4); } }

.cc__archive__item { display: flex; flex-direction: column; }
.cc__archive__item-media { display: block; overflow: hidden; background: var(--cc-bg); margin-bottom: var(--cc-sp-3); }
.cc__archive__item-media img { width: 100%; aspect-ratio: 4/3; object-fit: cover; filter: contrast(1.04) saturate(.97); transition: filter .35s, transform .4s; }
.cc__archive__item:hover .cc__archive__item-media img { filter: contrast(1.08) saturate(1.05); transform: scale(1.02); }
.cc__archive__item-byline { margin: 0 0 8px; font-family: var(--cc-mono); font-size: 10px; color: var(--cc-muted); letter-spacing: .14em; text-transform: lowercase; }
.cc__archive__item-byline strong { color: var(--cc-ink); font-weight: 700; }
html[data-theme="dark"] .cc__archive__item-byline strong { color: var(--cc-dark-ink); }
.cc__archive__item-title { font-family: var(--cc-display); font-size: clamp(20px, 2.4vw, 26px); font-weight: 700; line-height: 1.18; margin: 0 0 var(--cc-sp-2); letter-spacing: -0.01em; }
.cc__archive__item-title a { color: var(--cc-ink); }
html[data-theme="dark"] .cc__archive__item-title a { color: var(--cc-dark-ink); }
.cc__archive__item-title a:hover { color: var(--cc-accent); }
.cc__archive__item-excerpt { font-family: var(--cc-serif); font-size: 15px; color: var(--cc-muted); font-style: italic; line-height: 1.5; margin: 0; }

.cc__archive__loadmore { text-align: center; margin: var(--cc-sp-6) 0; }
.cc__empty { padding: var(--cc-sp-7) 0; text-align: center; }
.cc__empty h2 { font-family: var(--cc-display); font-style: italic; text-transform: lowercase; }
</style>

<?php
get_footer();
