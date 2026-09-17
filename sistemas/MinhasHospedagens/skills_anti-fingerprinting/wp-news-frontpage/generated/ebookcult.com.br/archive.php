<?php
/**
 * Portal: ebookcult.com.br
 * Archive archetype: alpha_dense_list (dense, header-first list)
 * Sidebar: right
 * Pagination: numbered_top_bottom
 * Card density: 4-3-2 (4 desktop / 3 tablet / 2 mobile)
 * Category description: top_inside_box
 * H1 treatment: h1_with_featured_post (top featured + dense list below)
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

$obj = is_category() || is_tag() || is_tax() ? get_queried_object() : null;
?>

<div class="ec-layout">
    <div class="ec-main">

        <header class="ec-archive__head">
            <nav class="ec-breadcrumb" aria-label="Localização">
                <a href="<?php echo esc_url( home_url( '/' ) ); ?>">Início</a>
                <span class="ec-breadcrumb__sep">|</span>
                <span><?php echo esc_html( wp_strip_all_tags( get_the_archive_title() ) ); ?></span>
            </nav>

            <span class="ec-archive__kicker">
                <?php
                if ( is_category() ) { echo 'Categoria'; }
                elseif ( is_tag() ) { echo 'Tag'; }
                elseif ( is_author() ) { echo 'Autor'; }
                elseif ( is_year() || is_month() || is_day() ) { echo 'Arquivo'; }
                else { echo 'Arquivo'; }
                ?>
            </span>
            <h1 class="ec-archive__h1">
                <?php
                $title = get_the_archive_title();
                $title = preg_replace( '/^Categoria:\s*/i', '', $title );
                $title = preg_replace( '/^Tag:\s*/i', '', $title );
                $title = preg_replace( '/^Autor:\s*/i', '', $title );
                echo esc_html( wp_strip_all_tags( $title ) );
                ?>
            </h1>

            <?php
            $desc = get_the_archive_description();
            if ( $desc ) :
            ?>
                <div class="ec-archive__desc"><?php echo wp_kses_post( $desc ); ?></div>
            <?php endif; ?>
        </header>

        <?php if ( have_posts() ) : ?>

            <?php
            // Featured post: show first one full-width with image, then list below
            the_post();
            ?>
            <article class="ec-archive__featured">
                <?php if ( has_post_thumbnail() ) : ?>
                <a class="ec-archive__featured-media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
                    <?php the_post_thumbnail( 'large', array( 'loading' => 'eager', 'fetchpriority' => 'high', 'decoding' => 'async' ) ); ?>
                </a>
                <?php endif; ?>
                <div class="ec-archive__featured-body">
                    <span class="ec-archive__featured-cat">Em destaque</span>
                    <h2 class="ec-archive__featured-title">
                        <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                    </h2>
                    <?php if ( has_excerpt() ) : ?>
                    <p class="ec-archive__featured-lead"><?php echo esc_html( get_the_excerpt() ); ?></p>
                    <?php endif; ?>
                    <p class="ec-archive__featured-meta">
                        <?php echo esc_html( ec_post_date() ); ?>
                        <span aria-hidden="true"> | </span>
                        <?php the_author(); ?>
                    </p>
                </div>
            </article>

            <?php if ( function_exists( 'paginate_links' ) ) : ?>
            <nav class="ec-pagination" aria-label="Paginação topo">
                <?php echo paginate_links( array( 'mid_size' => 1 ) ); ?>
            </nav>
            <?php endif; ?>

            <div class="ec-archive__grid">
                <?php while ( have_posts() ) : the_post(); ?>
                    <article class="ec-archive__item">
                        <?php if ( has_post_thumbnail() ) : ?>
                        <a class="ec-archive__item-media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
                            <?php the_post_thumbnail( 'medium', array( 'alt' => '', 'decoding' => 'async' ) ); ?>
                        </a>
                        <?php endif; ?>
                        <div class="ec-archive__item-body">
                            <?php
                            $ic = get_the_category();
                            if ( ! empty( $ic ) ) {
                                echo '<span class="ec-archive__item-cat">' . esc_html( $ic[0]->name ) . '</span>';
                            }
                            ?>
                            <h3 class="ec-archive__item-title">
                                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                            </h3>
                            <p class="ec-archive__item-meta">
                                <?php echo esc_html( ec_post_date() ); ?>
                            </p>
                        </div>
                    </article>
                <?php endwhile; ?>
            </div>

            <nav class="ec-pagination" aria-label="Paginação rodapé">
                <?php echo paginate_links( array( 'mid_size' => 1 ) ); ?>
            </nav>

        <?php else : ?>
            <div class="ec-empty">
                <h2>Nada por aqui ainda</h2>
                <p>Esse arquivo não tem posts publicados. Tente uma <a href="<?php echo esc_url( home_url( '/' ) ); ?>">leitura na página inicial</a> ou explore outras categorias no menu.</p>
            </div>
        <?php endif; ?>

    </div>

    <aside class="ec-sidebar" role="complementary">
        <div class="ec-widget">
            <h4>Sobre esta categoria</h4>
            <p style="font-size:13px; line-height:1.6; color:var(--ec-muted); margin:0;">
                <?php
                if ( $obj && ! empty( $obj->description ) ) {
                    echo esc_html( wp_trim_words( strip_tags( $obj->description ), 36, '…' ) );
                } else {
                    echo 'Conteúdo organizado por temas que costumamos cobrir: leitura aplicada, formação online, marketing digital e produtividade.';
                }
                ?>
            </p>
        </div>

        <div class="ec-widget">
            <h4>Outras categorias</h4>
            <ul>
                <?php
                $cur = is_category() ? get_queried_object_id() : 0;
                $sb_cats = get_categories( array(
                    'orderby'    => 'count',
                    'order'      => 'DESC',
                    'number'     => 8,
                    'hide_empty' => true,
                    'exclude'    => $cur,
                ) );
                foreach ( $sb_cats as $sc ) {
                    echo '<li><a href="' . esc_url( get_category_link( $sc ) ) . '">' . esc_html( $sc->name ) . '</a></li>';
                }
                ?>
            </ul>
        </div>

        <?php if ( is_active_sidebar( 'sidebar-1' ) ) : ?>
            <?php dynamic_sidebar( 'sidebar-1' ); ?>
        <?php endif; ?>
    </aside>
</div>

<style>
/* Archive-specific (inline because no separate CSS file) */
.ec-archive__head { padding: var(--ec-sp-5) 0 var(--ec-sp-4); border-bottom: 2px solid var(--ec-ink); margin-bottom: var(--ec-sp-5); }
.ec-archive__kicker { display: inline-block; font-size: 11px; color: var(--ec-paper); background: var(--ec-grad); padding: 4px 12px; font-weight: 700; letter-spacing: 0.14em; margin-bottom: var(--ec-sp-3); }
.ec-archive__h1 { font-size: clamp(28px, 4vw, 40px); margin: 0 0 var(--ec-sp-2); letter-spacing: -0.02em; }
.ec-archive__desc { font-size: 15px; color: var(--ec-muted); max-width: 64ch; line-height: 1.6; padding: var(--ec-sp-3); background: var(--ec-bg-warm); border-left: 4px solid var(--ec-secondary); margin-top: var(--ec-sp-3); }

.ec-archive__featured { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: var(--ec-sp-4); margin-bottom: var(--ec-sp-6); padding-bottom: var(--ec-sp-5); border-bottom: 1px solid var(--ec-line); }
.ec-archive__featured-media img { width: 100%; aspect-ratio: 16/10; object-fit: cover; }
.ec-archive__featured-cat { display: inline-block; font-size: 10px; color: var(--ec-secondary); font-weight: 700; letter-spacing: 0.18em; font-family: var(--ec-mono); margin-bottom: 10px; }
.ec-archive__featured-title { font-size: clamp(22px, 2.6vw, 28px); margin: 0 0 var(--ec-sp-3); line-height: 1.2; }
.ec-archive__featured-title a { color: var(--ec-ink); }
.ec-archive__featured-title a:hover { color: var(--ec-primary); }
.ec-archive__featured-lead { font-size: 15px; color: var(--ec-muted); line-height: 1.55; margin: 0 0 var(--ec-sp-3); }
.ec-archive__featured-meta { font-family: var(--ec-mono); font-size: 12px; color: var(--ec-muted); margin: 0; letter-spacing: 0.04em; }
@media (max-width: 720px) { .ec-archive__featured { grid-template-columns: 1fr; } }

.ec-archive__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--ec-sp-4); }
@media (max-width: 1100px) { .ec-archive__grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 760px)  { .ec-archive__grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px)  { .ec-archive__grid { grid-template-columns: 1fr; } }

.ec-archive__item { display: flex; flex-direction: column; background: var(--ec-paper); box-shadow: var(--ec-shadow-flat); transition: box-shadow .2s; }
.ec-archive__item:hover { box-shadow: var(--ec-shadow-neu); }
.ec-archive__item-media img { width: 100%; aspect-ratio: 1/1; object-fit: cover; }
.ec-archive__item-body { padding: var(--ec-sp-3); flex: 1; display: flex; flex-direction: column; }
.ec-archive__item-cat { font-size: 10px; color: var(--ec-secondary); font-weight: 700; letter-spacing: 0.14em; margin-bottom: 6px; font-family: var(--ec-mono); }
.ec-archive__item-title { font-size: 15px; line-height: 1.32; margin: 0 0 8px; flex: 1; font-weight: 700; }
.ec-archive__item-title a { color: var(--ec-ink); }
.ec-archive__item-title a:hover { color: var(--ec-primary); }
.ec-archive__item-meta { font-size: 11px; color: var(--ec-muted); font-family: var(--ec-mono); margin: 0; }

.ec-empty { padding: var(--ec-sp-7) var(--ec-sp-4); text-align: center; }
</style>

<?php
get_footer();
