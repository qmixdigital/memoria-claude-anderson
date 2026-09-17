<?php
/**
 * Front-page Archetype C: Grid Aggregator
 *   1. Hero single overlay (1 manchete fullwidth)
 *   2. Category tabs (top filter)
 *   3. Grid 4-col cards overlay (1st featured spans 2x2)
 *   4. Breaking vertical_list (2 cols)
 *   5. Stream continuação (mais grid)
 *   6. Newsletter CTA
 *   7. Top 10 mais lidos (ranked)
 *
 * Sem sidebar (archetype C é feed puro). Dedup contra todos os posts ja exibidos.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

/* Hero (1 post mais recente com thumb) */
$hero_id = null;
$hq = bx_query_for_section( array( 'posts_per_page' => 5 ) );
while ( $hq->have_posts() ) {
    $hq->the_post();
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
<section class="bx-hero" aria-label="Manchete principal">
    <span class="bx-hero__media">
        <?php the_post_thumbnail( 'bx-hero', array( 'loading' => 'eager', 'decoding' => 'async', 'fetchpriority' => 'high' ) ); ?>
    </span>
    <span class="bx-hero__overlay" aria-hidden="true"></span>
    <div class="bx-hero__body">
        <?php if ( $hcats ) : ?>
            <span class="bx-hero__cat"><a href="<?php echo esc_url( get_category_link( $hcats[0] ) ); ?>"><?php echo esc_html( $hcats[0]->name ); ?></a></span>
        <?php endif; ?>
        <h1 class="bx-hero__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1>
        <div class="bx-hero__meta"><?php echo esc_html( bx_post_date() ); ?> &nbsp;·&nbsp; <?php echo (int) bx_read_time(); ?> min de leitura</div>
    </div>
</section>
<?php wp_reset_postdata(); endif; ?>

<?php
/* Tabs de categorias (filtro visual top) */
$insights = get_category_by_slug( 'insights' );
$exclude_cat_ids = bx_excluded_lang_cat_ids();
if ( $insights ) { $exclude_cat_ids[] = $insights->term_id; }
$tab_cats = get_categories( array(
    'orderby' => 'count', 'order' => 'DESC', 'number' => 8,
    'hide_empty' => true, 'exclude' => array_unique( $exclude_cat_ids ),
) );
if ( ! empty( $tab_cats ) ) : ?>
<nav class="bx-tabs" aria-label="Filtrar por editoria">
    <?php foreach ( $tab_cats as $cat ) : ?>
        <a href="<?php echo esc_url( get_category_link( $cat ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
    <?php endforeach; ?>
</nav>
<?php endif; ?>

<?php
/* Grid principal — 9 cards overlay (1o spans 2x2 = featured + 8 cards normais = grade 4x3 completa) */
$exclude_used = array_filter( array( $hero_id ) );
$grid_q = bx_query_for_section( array(
    'posts_per_page' => 24,
    'post__not_in'   => $exclude_used,
    'orderby'        => 'date',
    'order'          => 'DESC',
) );
$grid_ids = array();
while ( $grid_q->have_posts() ) {
    $grid_q->the_post();
    if ( ! has_post_thumbnail() ) { continue; }
    $grid_ids[] = get_the_ID();
    if ( count( $grid_ids ) >= 9 ) { break; }
}
wp_reset_postdata();
$exclude_used = array_merge( $exclude_used, $grid_ids );

if ( ! empty( $grid_ids ) ) : ?>
<section class="bx-section" aria-label="Posts recentes">
    <header class="bx-section__h">
        <h2>Posts recentes</h2>
        <a href="<?php echo esc_url( home_url( '/blog/' ) ); ?>">Todos &rsaquo;</a>
    </header>
    <div class="bx-grid bx-grid--featured">
        <?php
        global $post;
        $_orig = $post;
        foreach ( $grid_ids as $pid ) {
            $post = get_post( $pid );
            setup_postdata( $post );
            bx_card_overlay();
        }
        $post = $_orig;
        wp_reset_postdata();
        ?>
    </div>
</section>
<?php endif; ?>

<?php
/* Breaking vertical_list - 8 itens em 2 cols */
$brk_q = bx_query_for_section( array(
    'posts_per_page' => 16,
    'post__not_in'   => $exclude_used,
    'orderby'        => 'date',
    'order'          => 'DESC',
) );
$brk_ids = array();
while ( $brk_q->have_posts() ) {
    $brk_q->the_post();
    if ( ! has_post_thumbnail() ) { continue; }
    $brk_ids[] = get_the_ID();
    if ( count( $brk_ids ) >= 8 ) { break; }
}
wp_reset_postdata();
$exclude_used = array_merge( $exclude_used, $brk_ids );

if ( ! empty( $brk_ids ) ) : ?>
<section class="bx-breaking" aria-label="Atualizações em tempo real">
    <h4>Em pauta agora</h4>
    <ul>
        <?php foreach ( $brk_ids as $bid ) : ?>
            <li>
                <time><?php echo esc_html( bx_post_date( $bid ) ); ?></time>
                <a href="<?php echo esc_url( get_permalink( $bid ) ); ?>"><?php echo esc_html( get_the_title( $bid ) ); ?></a>
            </li>
        <?php endforeach; ?>
    </ul>
</section>
<?php endif; ?>

<?php
/* Stream continuação - mais 8 cards */
$str2_q = bx_query_for_section( array(
    'posts_per_page' => 18,
    'post__not_in'   => $exclude_used,
    'orderby'        => 'date',
    'order'          => 'DESC',
) );
$str2_ids = array();
while ( $str2_q->have_posts() ) {
    $str2_q->the_post();
    if ( ! has_post_thumbnail() ) { continue; }
    $str2_ids[] = get_the_ID();
    if ( count( $str2_ids ) >= 8 ) { break; }
}
wp_reset_postdata();
$exclude_used = array_merge( $exclude_used, $str2_ids );

if ( ! empty( $str2_ids ) ) : ?>
<section class="bx-section" aria-label="Mais matérias">
    <header class="bx-section__h">
        <h2>Mais matérias</h2>
    </header>
    <div class="bx-grid">
        <?php
        $_orig = $post;
        foreach ( $str2_ids as $pid ) {
            $post = get_post( $pid );
            setup_postdata( $post );
            bx_card_overlay();
        }
        $post = $_orig;
        wp_reset_postdata();
        ?>
    </div>
</section>
<?php endif; ?>

<!-- Newsletter CTA -->
<section class="bx-newsletter" aria-label="Newsletter">
    <h3>Receba o melhor do Blog-Se no seu e-mail</h3>
    <p>Cultura, comportamento e o que está acontecendo. Uma vez por semana.</p>
    <form method="post" action="<?php echo esc_url( home_url( '/?bx_subscribe=1' ) ); ?>">
        <input type="email" name="bx_email" placeholder="seu@email.com" required aria-label="E-mail">
        <button type="submit">Assinar</button>
    </form>
</section>

<?php
/* Mais lidos rank (5, dedup) */
$mr_q = bx_query_for_section( array(
    'posts_per_page' => 20,
    'post__not_in'   => $exclude_used,
    'orderby'        => 'comment_count',
    'order'          => 'DESC',
) );
$mr_items = '';
$mc = 0;
while ( $mr_q->have_posts() ) {
    $mr_q->the_post();
    if ( ! has_post_thumbnail() ) { continue; }
    if ( $mc >= 5 ) { break; }
    $mr_items .= '<li><a href="' . esc_url( get_permalink() ) . '">' . esc_html( get_the_title() ) . '</a></li>';
    $mc++;
}
wp_reset_postdata();

if ( $mr_items ) : ?>
<section class="bx-widget bx-widget--ranked" aria-label="Mais lidos">
    <h4>Mais lidos da semana</h4>
    <ol><?php echo $mr_items; ?></ol>
</section>
<?php endif;

get_footer();
