<?php
# Front-page Archetype D: Feature-Led Stream
#   1. Hero boxed (1 single feature dentro de container)
#   2. Breaking strip static (faixa preta com 5 manchetes em scroll horizontal)
#   3. Stream principal (cards alternating image_left/image_right) - 6 stream cards
#   4. Popular rail (most read inline, grid)
#   5. Stream continuação - 4 cards
#   6. Cat showcase - 3 categorias em colunas (com feature + lista)
#
# Sem sidebar (sidebar=none no roll). Tudo full-width do shell.

if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

# Pre-collect hero (1 post mais recente com thumb)
$hero_id = null;
$hq = qmix_query_for_section( array( 'posts_per_page' => 5 ) );
while ( $hq->have_posts() ) {
  $hq->the_post();
  if ( ! has_post_thumbnail() ) { continue; }
  $hero_id = get_the_ID();
  break;
}
wp_reset_postdata();

# Breaking strip: 5 mais recentes (excluindo hero)
$brk_q = qmix_query_for_section( array(
  'posts_per_page' => 15,
  'post__not_in'   => array_filter( array( $hero_id ) ),
  'orderby'        => 'date',
  'order'          => 'DESC',
) );
$brk_ids = array();
while ( $brk_q->have_posts() ) {
  $brk_q->the_post();
  if ( ! has_post_thumbnail() ) { continue; }
  $brk_ids[] = get_the_ID();
  if ( count( $brk_ids ) >= 5 ) { break; }
}
wp_reset_postdata();
?>

<?php if ( $hero_id ) :
  $GLOBALS['post'] = get_post( $hero_id );
  setup_postdata( $GLOBALS['post'] );
  $hcats = get_the_category();
?>
<section class="hero-boxed" aria-label="Manchete principal">
  <a class="hero-boxed__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
    <?php the_post_thumbnail( 'qmix-hero', array( 'loading' => 'eager', 'decoding' => 'async', 'fetchpriority' => 'high' ) ); ?>
  </a>
  <div class="hero-boxed__body">
    <?php if ( $hcats ) : ?>
      <span class="kicker"><a href="<?php echo esc_url( get_category_link( $hcats[0] ) ); ?>"><?php echo esc_html( $hcats[0]->name ); ?></a></span>
    <?php endif; ?>
    <h1 class="hero-boxed__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1>
    <p class="hero-boxed__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 38 ) ); ?></p>
    <div class="hero-boxed__meta"><?php echo esc_html( qmix_post_date() ); ?> &middot; <?php echo (int) qmix_read_time(); ?> min</div>
  </div>
</section>
<?php wp_reset_postdata(); endif; ?>

<?php if ( ! empty( $brk_ids ) ) : ?>
<aside class="breaking-strip" aria-label="Em pauta">
  <div class="shell">
    <span class="breaking-strip__label">Em pauta</span>
    <div class="breaking-strip__items">
      <?php foreach ( $brk_ids as $bid ) : ?>
        <a href="<?php echo esc_url( get_permalink( $bid ) ); ?>"><?php echo esc_html( wp_trim_words( get_the_title( $bid ), 12 ) ); ?></a>
      <?php endforeach; ?>
    </div>
  </div>
</aside>
<?php endif; ?>

<?php
# Stream main: 6 stream cards alternando esquerda/direita
$exclude_used = array_filter( array_merge( array( $hero_id ), $brk_ids ) );
$stream_q = qmix_query_for_section( array(
  'posts_per_page' => 14,
  'post__not_in'   => $exclude_used,
  'orderby'        => 'date',
  'order'          => 'DESC',
) );
$stream_ids = array();
while ( $stream_q->have_posts() ) {
  $stream_q->the_post();
  if ( ! has_post_thumbnail() ) { continue; }
  $stream_ids[] = get_the_ID();
  if ( count( $stream_ids ) >= 6 ) { break; }
}
wp_reset_postdata();
$exclude_used = array_merge( $exclude_used, $stream_ids );

if ( ! empty( $stream_ids ) ) : ?>
<section class="stream-section" aria-label="Últimas publicações">
  <header class="section-head">
    <h2>Últimas</h2>
    <a href="<?php echo esc_url( home_url( '/blog/' ) ); ?>">Todas as matérias</a>
  </header>
  <div class="stream">
    <?php
    global $post;
    $_orig = $post;
    foreach ( $stream_ids as $i => $sid ) {
      $post = get_post( $sid );
      setup_postdata( $post );
      $variant = ( $i % 2 === 0 ) ? 'left' : 'right';
      qmix_stream_card( $variant );
    }
    $post = $_orig;
    wp_reset_postdata();
    ?>
  </div>
</section>
<?php endif; ?>

<?php
# Popular rail (5 most-commented, dedupando)
$pop_q = qmix_query_for_section( array(
  'posts_per_page' => 15,
  'post__not_in'   => $exclude_used,
  'orderby'        => 'comment_count',
  'order'          => 'DESC',
) );
$pop_items = '';
$pc = 0;
while ( $pop_q->have_posts() ) {
  $pop_q->the_post();
  if ( ! has_post_thumbnail() ) { continue; }
  if ( $pc >= 5 ) { break; }
  $pop_items .= '<li><a href="' . esc_url( get_permalink() ) . '">' . esc_html( get_the_title() ) . '</a></li>';
  $exclude_used[] = get_the_ID();
  $pc++;
}
wp_reset_postdata();

if ( $pop_items ) : ?>
<section class="popular-rail" aria-label="Mais lidos">
  <header class="popular-rail__head">
    <h3>Mais lidos da semana</h3>
  </header>
  <ol class="popular-rail__list"><?php echo $pop_items; ?></ol>
</section>
<?php endif; ?>

<?php
# Stream continuação: mais 4 cards
$stream2_q = qmix_query_for_section( array(
  'posts_per_page' => 12,
  'post__not_in'   => $exclude_used,
  'orderby'        => 'date',
  'order'          => 'DESC',
) );
$stream2_ids = array();
while ( $stream2_q->have_posts() ) {
  $stream2_q->the_post();
  if ( ! has_post_thumbnail() ) { continue; }
  $stream2_ids[] = get_the_ID();
  if ( count( $stream2_ids ) >= 4 ) { break; }
}
wp_reset_postdata();
$exclude_used = array_merge( $exclude_used, $stream2_ids );

if ( ! empty( $stream2_ids ) ) : ?>
<section class="stream-section" aria-label="Mais notícias">
  <header class="section-head">
    <h2>Em destaque</h2>
  </header>
  <div class="stream">
    <?php
    $post = null;
    $_orig = $post;
    foreach ( $stream2_ids as $i => $sid ) {
      $GLOBALS['post'] = get_post( $sid );
      setup_postdata( $GLOBALS['post'] );
      $variant = ( $i % 2 === 0 ) ? 'left' : 'right';
      qmix_stream_card( $variant );
    }
    wp_reset_postdata();
    ?>
  </div>
</section>
<?php endif; ?>

<?php
# Cat showcase: 3 categorias por count (excluindo Insights que é genérico) + 1 feature + 4 títulos
$insights = get_category_by_slug( 'insights' );
$exclude_cat_ids = qmix_excluded_lang_cat_ids();
if ( $insights ) { $exclude_cat_ids[] = $insights->term_id; }
$show_cats = get_categories( array(
  'orderby' => 'count', 'order' => 'DESC', 'number' => 3,
  'hide_empty' => true,
  'exclude' => array_unique( $exclude_cat_ids ),
) );
if ( ! empty( $show_cats ) ) : ?>
<section class="cat-showcase" aria-label="Editorias em foco">
  <?php foreach ( $show_cats as $cat ) :
    $cq = qmix_query_for_section( array(
      'posts_per_page' => 8,
      'cat'            => $cat->term_id,
      'post__not_in'   => $exclude_used,
    ) );
    $cids = array();
    while ( $cq->have_posts() ) {
      $cq->the_post();
      if ( ! has_post_thumbnail() ) { continue; }
      $cids[] = get_the_ID();
      if ( count( $cids ) >= 5 ) { break; }
    }
    wp_reset_postdata();
    if ( count( $cids ) < 3 ) { continue; }
    $exclude_used = array_merge( $exclude_used, $cids );
    ?>
    <article class="cat-showcase__block">
      <header class="section-head">
        <h2><?php echo esc_html( $cat->name ); ?></h2>
        <a href="<?php echo esc_url( get_category_link( $cat ) ); ?>">Ver tudo</a>
      </header>
      <?php
      $GLOBALS['post'] = get_post( $cids[0] );
      setup_postdata( $GLOBALS['post'] );
      ?>
      <a class="cat-showcase__hero" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
        <?php the_post_thumbnail( 'qmix-card', array( 'loading' => 'eager', 'decoding' => 'async' ) ); ?>
      </a>
      <h3 class="cat-showcase__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
      <?php wp_reset_postdata(); ?>

      <ul class="cat-showcase__list">
        <?php foreach ( array_slice( $cids, 1, 4 ) as $pid ) : ?>
          <li><a href="<?php echo esc_url( get_permalink( $pid ) ); ?>"><?php echo esc_html( get_the_title( $pid ) ); ?></a></li>
        <?php endforeach; ?>
      </ul>
    </article>
  <?php endforeach; ?>
</section>
<?php endif; ?>

<?php
# Schema ItemList (roll: schema=itemlist) - apenas se RankMath nao injetar
$rank_math_active = function_exists( 'rank_math_the_breadcrumbs' ) || class_exists( 'RankMath\\Helper' );
if ( ! $rank_math_active && ! empty( $stream_ids ) ) {
  $items = array();
  $pos = 0;
  foreach ( array_merge( array_filter( array( $hero_id ) ), $stream_ids, $stream2_ids ) as $pid ) {
    $pos++;
    $items[] = array(
      '@type' => 'ListItem',
      'position' => $pos,
      'url' => get_permalink( $pid ),
      'name' => wp_strip_all_tags( get_the_title( $pid ) ),
    );
  }
  $schema = array(
    '@context' => 'https://schema.org',
    '@type' => 'ItemList',
    'itemListElement' => $items,
  );
  echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
}

get_footer();
