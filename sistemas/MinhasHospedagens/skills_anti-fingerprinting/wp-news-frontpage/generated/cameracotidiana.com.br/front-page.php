<?php
/**
 * Câmera Cotidiana — front-page (archetype E: Topical Hub).
 * Layout: hero single full-width + breaking strip static + topic clusters
 * por categoria (4 categorias, 8 posts cada, formato "magazine grid").
 * Sidebar: NONE.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();
?>

<div class="cc__shell">

<?php
$used_ids = array();

// HERO single — uma foto enorme, um post dominante.
$hero_q = cc_query_for_section( array( 'posts_per_page' => 8 ) );
$hero_id = 0;
while ( $hero_q->have_posts() ) {
    $hero_q->the_post();
    if ( has_post_thumbnail() ) { $hero_id = get_the_ID(); break; }
}
wp_reset_postdata();
if ( $hero_id ) { $used_ids[] = $hero_id; }
?>

<?php if ( $hero_id ) : ?>
<section class="cc__hero" aria-label="Em destaque">
    <a class="cc__hero__media" href="<?php echo esc_url( get_permalink( $hero_id ) ); ?>" aria-hidden="true" tabindex="-1">
        <?php echo get_the_post_thumbnail( $hero_id, 'large', array( 'loading' => 'eager', 'fetchpriority' => 'high', 'decoding' => 'async' ) ); ?>
        <span class="cc__hero__frame-tl"></span>
        <span class="cc__hero__frame-tr"></span>
        <span class="cc__hero__frame-bl"></span>
        <span class="cc__hero__frame-br"></span>
    </a>

    <div class="cc__hero__body">
        <?php
        // Byline — above_title
        ?>
        <p class="cc__hero__byline">
            por <strong><?php echo esc_html( get_the_author_meta( 'display_name', get_post_field( 'post_author', $hero_id ) ) ); ?></strong>
            <span aria-hidden="true">·</span>
            <time datetime="<?php echo esc_attr( get_the_date( 'c', $hero_id ) ); ?>"><?php echo esc_html( cc_post_date( $hero_id ) ); ?></time>
        </p>

        <?php
        $cats = get_the_category( $hero_id );
        if ( ! empty( $cats ) ) {
            echo '<a class="cc__hero__cat" href="' . esc_url( get_category_link( $cats[0] ) ) . '">' . esc_html( strtolower( $cats[0]->name ) ) . '</a>';
        }
        ?>

        <h2 class="cc__hero__title">
            <a href="<?php echo esc_url( get_permalink( $hero_id ) ); ?>"><?php echo esc_html( get_the_title( $hero_id ) ); ?></a>
        </h2>

        <?php
        $hero_excerpt = get_the_excerpt( $hero_id );
        if ( ! $hero_excerpt ) {
            $hero_excerpt = wp_trim_words( strip_tags( get_post_field( 'post_content', $hero_id ) ), 38, '…' );
        }
        ?>
        <p class="cc__hero__excerpt"><?php echo esc_html( $hero_excerpt ); ?></p>

        <a class="cc__btn" href="<?php echo esc_url( get_permalink( $hero_id ) ); ?>">ler ensaio</a>
    </div>
</section>
<?php endif; ?>

<?php
/* ============================================================
 * Breaking strip estático — 6 manchetes secundárias em scroll horizontal
 * ============================================================ */
$strip_q = cc_query_for_section( array(
    'posts_per_page' => 18,
    'post__not_in'   => $used_ids,
) );
$strip_ids = array();
while ( $strip_q->have_posts() ) {
    $strip_q->the_post();
    if ( ! has_post_thumbnail() ) { continue; }
    $strip_ids[] = get_the_ID();
    if ( count( $strip_ids ) >= 6 ) { break; }
}
wp_reset_postdata();
$used_ids = array_merge( $used_ids, $strip_ids );
?>

<?php if ( ! empty( $strip_ids ) ) : ?>
<aside class="cc__strip" aria-label="Manchetes do dia">
    <div class="cc__shell">
        <div class="cc__strip__inner">
            <span class="cc__strip__label">› hoje</span>
            <ul class="cc__strip__items">
                <?php foreach ( $strip_ids as $sid ) : ?>
                    <li><a href="<?php echo esc_url( get_permalink( $sid ) ); ?>"><?php echo esc_html( wp_trim_words( get_the_title( $sid ), 12, '…' ) ); ?></a></li>
                <?php endforeach; ?>
            </ul>
        </div>
    </div>
</aside>
<?php endif; ?>

<?php
/* ============================================================
 * Topic clusters — 4 categorias top, cada uma com 8 cards image_right
 * (densidade arquive 2_2_1: 2 cards desktop, 2 tablet, 1 mobile)
 * Mas a home dá uma vista mais densa: 4 cards por bloco em 2 colunas.
 * ============================================================ */
$top_cats = get_categories( array(
    'orderby'    => 'count',
    'order'      => 'DESC',
    'number'     => 4,
    'hide_empty' => true,
    'exclude'    => cc_excluded_lang_cat_ids(),
) );

$cluster_idx = 0;
foreach ( $top_cats as $cat ) :
    $cq = cc_query_for_section( array(
        'posts_per_page' => 12,
        'cat'            => $cat->term_id,
        'post__not_in'   => $used_ids,
    ) );
    $cat_ids = array();
    while ( $cq->have_posts() ) {
        $cq->the_post();
        if ( ! has_post_thumbnail() ) { continue; }
        $cat_ids[] = get_the_ID();
        if ( count( $cat_ids ) >= 4 ) { break; }
    }
    wp_reset_postdata();
    if ( empty( $cat_ids ) ) { continue; }
    $used_ids = array_merge( $used_ids, $cat_ids );
    $cluster_idx++;
?>

<section class="cc__section cc__cluster" aria-label="Cluster <?php echo esc_attr( $cat->name ); ?>">
    <div class="cc__section__head">
        <h2><span class="cc__cluster__num">0<?php echo (int) $cluster_idx; ?></span> caderno <em><?php echo esc_html( strtolower( $cat->name ) ); ?></em></h2>
        <span class="cc__section__head__meta">
            <a href="<?php echo esc_url( get_category_link( $cat ) ); ?>">› ver tudo (<?php echo (int) $cat->count; ?>)</a>
        </span>
    </div>

    <div class="cc__cluster__grid">
        <?php
        $first = array_shift( $cat_ids );
        ?>
        <article class="cc__cluster__featured">
            <a class="cc__cluster__featured-media" href="<?php echo esc_url( get_permalink( $first ) ); ?>" aria-hidden="true" tabindex="-1">
                <?php echo get_the_post_thumbnail( $first, 'large', array( 'loading' => 'eager', 'decoding' => 'async' ) ); ?>
            </a>
            <div class="cc__cluster__featured-body">
                <p class="cc__cluster__byline">
                    por <strong><?php echo esc_html( get_the_author_meta( 'display_name', get_post_field( 'post_author', $first ) ) ); ?></strong>
                    <span aria-hidden="true">·</span>
                    <?php echo esc_html( cc_post_date( $first ) ); ?>
                </p>
                <h3 class="cc__cluster__featured-title">
                    <a href="<?php echo esc_url( get_permalink( $first ) ); ?>"><?php echo esc_html( get_the_title( $first ) ); ?></a>
                </h3>
                <?php
                $f_ex = get_the_excerpt( $first );
                if ( ! $f_ex ) { $f_ex = wp_trim_words( strip_tags( get_post_field( 'post_content', $first ) ), 28, '…' ); }
                ?>
                <p class="cc__cluster__featured-excerpt"><?php echo esc_html( $f_ex ); ?></p>
            </div>
        </article>

        <ul class="cc__cluster__list">
            <?php foreach ( $cat_ids as $cid ) : ?>
            <li class="cc__cluster__item">
                <a class="cc__cluster__item-media" href="<?php echo esc_url( get_permalink( $cid ) ); ?>" aria-hidden="true" tabindex="-1">
                    <?php echo get_the_post_thumbnail( $cid, 'medium', array( 'alt' => '', 'decoding' => 'async' ) ); ?>
                </a>
                <div class="cc__cluster__item-body">
                    <p class="cc__cluster__item-meta"><?php echo esc_html( cc_post_date( $cid ) ); ?></p>
                    <h4 class="cc__cluster__item-title">
                        <a href="<?php echo esc_url( get_permalink( $cid ) ); ?>"><?php echo esc_html( get_the_title( $cid ) ); ?></a>
                    </h4>
                </div>
            </li>
            <?php endforeach; ?>
        </ul>
    </div>
</section>

<?php endforeach; ?>

</div><!-- /.cc__shell -->

<?php
get_footer();
