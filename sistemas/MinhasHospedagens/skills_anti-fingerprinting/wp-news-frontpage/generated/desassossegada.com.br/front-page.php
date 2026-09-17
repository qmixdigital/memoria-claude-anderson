<?php
// Front-page Archetype E (Topical Hub) — v1.1 editorial pink+black
//   1. Intro (kicker + frase italic)
//   2. Hero triptych (1 grande + 2 stacked)
//   3. Layout 2col: main + sidebar 320px
//      Main:
//        - Breaking strip horizontal (grid 2 col)
//        - Cluster grid (2 colunas de categoria, cada uma com feature + 2 mini)
//        - Featured category banner (full-bleed blush, 6 cards image_top)
//      Sidebar:
//        - Editorias (slim)
//        - Mais lidos (ranked)

if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

// Pre-collect 3 hero IDs (com thumb)
$hero_ids = array();
$hq = dsg_query_for_section( array( 'posts_per_page' => 10 ) );
while ( $hq->have_posts() ) {
  $hq->the_post();
  if ( ! has_post_thumbnail() ) { continue; }
  $hero_ids[] = get_the_ID();
  if ( count( $hero_ids ) >= 3 ) { break; }
}
wp_reset_postdata();
?>

<section class="dsg-intro" aria-label="Apresentação">
  <span class="dsg-kicker">Edição diária</span>
  <h1>Notícias, saúde e entretenimento <em>sem censura.</em></h1>
  <p>Cobertura plural de comportamento, novelas, filmes, fofocas e o que move o meio artístico. Redação independente, leitura rápida.</p>
</section>

<?php if ( count( $hero_ids ) >= 1 ) : ?>
<section class="dsg-hero" aria-label="Destaques principais">
  <div class="dsg-hero__grid">

    <!-- Primary (manchete grande) -->
    <?php
    $GLOBALS['post'] = get_post( $hero_ids[0] );
    setup_postdata( $GLOBALS['post'] );
    $hcats = get_the_category();
    ?>
    <article class="dsg-hero__item dsg-hero__primary">
      <a class="dsg-hero__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
        <?php the_post_thumbnail( 'dsg-hero', array( 'loading' => 'eager', 'decoding' => 'async', 'fetchpriority' => 'high' ) ); ?>
      </a>
      <?php if ( $hcats ) : ?>
        <span class="dsg-kicker dsg-card__cat"><a href="<?php echo esc_url( get_category_link( $hcats[0] ) ); ?>"><?php echo esc_html( $hcats[0]->name ); ?></a></span>
      <?php endif; ?>
      <h2 class="dsg-hero__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
      <p class="dsg-hero__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 32 ) ); ?></p>
      <span class="dsg-hero__meta"><?php echo esc_html( dsg_post_date() ); ?></span>
    </article>
    <?php wp_reset_postdata(); ?>

    <!-- Side (2 stacked) -->
    <div class="dsg-hero__side">
      <?php foreach ( array_slice( $hero_ids, 1, 2 ) as $hid ) :
        $GLOBALS['post'] = get_post( $hid );
        setup_postdata( $GLOBALS['post'] );
        $scats = get_the_category();
        ?>
        <article class="dsg-hero__item">
          <a class="dsg-hero__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
            <?php the_post_thumbnail( 'dsg-card', array( 'loading' => 'eager', 'decoding' => 'async' ) ); ?>
          </a>
          <?php if ( $scats ) : ?>
            <span class="dsg-kicker dsg-card__cat"><a href="<?php echo esc_url( get_category_link( $scats[0] ) ); ?>"><?php echo esc_html( $scats[0]->name ); ?></a></span>
          <?php endif; ?>
          <h3 class="dsg-hero__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
          <span class="dsg-hero__meta"><?php echo esc_html( dsg_post_date() ); ?></span>
        </article>
      <?php endforeach; wp_reset_postdata(); ?>
    </div>
  </div>
</section>
<?php endif; ?>

<div class="dsg-layout">

  <!-- MAIN COLUMN -->
  <div class="dsg-main-col">

    <!-- Breaking strip (grid 2 col) -->
    <?php
    $brk = dsg_query_for_section( array(
      'posts_per_page' => 18,
      'post__not_in'   => $hero_ids,
      'orderby'        => 'date',
      'order'          => 'DESC',
    ) );
    $brk_ids = array();
    while ( $brk->have_posts() ) {
      $brk->the_post();
      if ( ! has_post_thumbnail() ) { continue; }
      $brk_ids[] = get_the_ID();
      if ( count( $brk_ids ) >= 6 ) { break; }
    }
    wp_reset_postdata();
    if ( ! empty( $brk_ids ) ) : ?>
    <section class="dsg-breaking" aria-label="Em pauta">
      <h4>Em pauta agora</h4>
      <ul>
        <?php foreach ( $brk_ids as $bid ) : ?>
          <li>
            <time><?php echo esc_html( dsg_post_date( $bid ) ); ?></time>
            <a href="<?php echo esc_url( get_permalink( $bid ) ); ?>"><?php echo esc_html( get_the_title( $bid ) ); ?></a>
          </li>
        <?php endforeach; ?>
      </ul>
    </section>
    <?php endif; ?>

    <!-- featured-cat = sempre Noticias (notica chama mais atencao no nicho). Clusters = top 4 outras categorias. -->
    <?php
    $featured_cat = get_category_by_slug( 'noticias' );
    // Fallback se nao houver categoria Noticias
    if ( ! $featured_cat ) {
      $fallback = get_categories( array(
        'orderby'    => 'count', 'order' => 'DESC', 'number' => 1, 'hide_empty' => true,
        'exclude'    => array_merge( dsg_excluded_lang_cat_ids(), array_filter( array(
          ( $tmp = get_category_by_slug( 'insights' ) ) ? $tmp->term_id : 0,
        ) ) ),
      ) );
      $featured_cat = ! empty( $fallback ) ? $fallback[0] : null;
    }
    // Excluir Insights + Noticias dos clusters (Noticias ja eh featured; Insights too generic)
    $exclude_cat_ids = dsg_excluded_lang_cat_ids();
    $insights = get_category_by_slug( 'insights' );
    if ( $insights ) { $exclude_cat_ids[] = $insights->term_id; }
    if ( $featured_cat ) { $exclude_cat_ids[] = $featured_cat->term_id; }
    $cluster_cats = get_categories( array(
      'orderby'    => 'count',
      'order'      => 'DESC',
      'number'     => 4,
      'hide_empty' => true,
      'exclude'    => array_unique( $exclude_cat_ids ),
    ) );
    $exclude_used = array_merge( $hero_ids, $brk_ids );
    ?>

    <?php if ( ! empty( $cluster_cats ) ) : ?>
    <section class="dsg-cluster-grid" aria-label="Editorias em destaque">
      <?php foreach ( $cluster_cats as $cat ) :
        $cq = dsg_query_for_section( array(
          'posts_per_page' => 9,
          'cat'            => $cat->term_id,
          'post__not_in'   => $exclude_used,
        ) );
        $cids = array();
        while ( $cq->have_posts() ) {
          $cq->the_post();
          if ( ! has_post_thumbnail() ) { continue; }
          $cids[] = get_the_ID();
          if ( count( $cids ) >= 3 ) { break; }
        }
        wp_reset_postdata();
        // Cluster so renderiza se tiver 3 posts recentes com thumb (caso contrario, skip)
        if ( count( $cids ) < 3 ) { continue; }
        $exclude_used = array_merge( $exclude_used, $cids );
        ?>
        <article class="dsg-cluster">
          <header class="dsg-cluster__head">
            <h3><?php echo esc_html( $cat->name ); ?></h3>
            <a href="<?php echo esc_url( get_category_link( $cat ) ); ?>">Ver tudo</a>
          </header>

          <?php
          $GLOBALS['post'] = get_post( $cids[0] );
          setup_postdata( $GLOBALS['post'] );
          ?>
          <a class="dsg-cluster__feature" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
            <?php the_post_thumbnail( 'dsg-card', array( 'loading' => 'eager', 'decoding' => 'async' ) ); ?>
          </a>
          <h4 class="dsg-cluster__feature-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h4>
          <?php wp_reset_postdata(); ?>

          <?php foreach ( array_slice( $cids, 1, 2 ) as $pid ) :
            $GLOBALS['post'] = get_post( $pid );
            setup_postdata( $GLOBALS['post'] );
            dsg_card( 'mini' );
          endforeach;
          wp_reset_postdata(); ?>
        </article>
      <?php endforeach; ?>
    </section>
    <?php endif; ?>

    <?php
    // Pre-collect IDs da featured cat (renderizada fora do dsg-layout, full-width do shell)
    $featured_fids = array();
    if ( $featured_cat ) {
      $fq = dsg_query_for_section( array(
        'posts_per_page' => 18,
        'cat'            => $featured_cat->term_id,
        'post__not_in'   => $exclude_used,
      ) );
      while ( $fq->have_posts() ) {
        $fq->the_post();
        if ( ! has_post_thumbnail() ) { continue; }
        $featured_fids[] = get_the_ID();
        if ( count( $featured_fids ) >= 6 ) { break; }
      }
      wp_reset_postdata();
    }
    ?>
  </div>

  <!-- SIDEBAR -->
  <aside class="dsg-sidebar" role="complementary">
    <?php
    $wcats = get_categories( array(
      'orderby'    => 'count',
      'order'      => 'DESC',
      'number'     => 9,
      'hide_empty' => true,
      'exclude'    => dsg_excluded_lang_cat_ids(),
    ) );
    if ( $wcats ) : ?>
      <div class="dsg-widget dsg-widget--editorias">
        <h4>Editorias</h4>
        <ul>
          <?php foreach ( $wcats as $c ) : ?>
            <li><a href="<?php echo esc_url( get_category_link( $c ) ); ?>"><?php echo esc_html( $c->name ); ?></a></li>
          <?php endforeach; ?>
        </ul>
      </div>
    <?php endif; ?>

    <?php
    // Mais lidos: dedup contra TUDO que ja foi exibido no main (hero + breaking + clusters + featured)
    $all_shown = array_merge( $exclude_used, $featured_fids );
    $mr = dsg_query_for_section( array(
      'posts_per_page' => 25,
      'orderby'        => 'comment_count',
      'order'          => 'DESC',
      'post__not_in'   => $all_shown,
    ) );
    $mr_items = '';
    $mc = 0;
    while ( $mr->have_posts() ) {
      $mr->the_post();
      if ( ! has_post_thumbnail() ) { continue; }
      if ( $mc >= 5 ) { break; }
      $mr_items .= '<li><a href="' . esc_url( get_permalink() ) . '">' . esc_html( get_the_title() ) . '</a></li>';
      $mc++;
    }
    wp_reset_postdata();
    if ( $mr_items ) : ?>
      <div class="dsg-widget dsg-widget--ranked">
        <h4>Mais lidos</h4>
        <ol><?php echo $mr_items; ?></ol>
      </div>
    <?php endif; ?>

    <?php dynamic_sidebar( 'sidebar-1' ); ?>
  </aside>
</div>

<!-- Featured category — full-width do shell, ocupa toda a area onde a sidebar ja terminou -->
<?php if ( $featured_cat && ! empty( $featured_fids ) ) : ?>
<section class="dsg-feature-cat" aria-label="Editoria em foco: <?php echo esc_attr( $featured_cat->name ); ?>">
  <header class="dsg-feature-cat__head">
    <h2><?php echo esc_html( $featured_cat->name ); ?></h2>
    <a href="<?php echo esc_url( get_category_link( $featured_cat ) ); ?>">Mais matérias</a>
  </header>
  <div class="dsg-feature-cat__grid">
    <?php
    global $post;
    $_orig_post = $post;
    foreach ( $featured_fids as $pid ) {
      $post = get_post( $pid );
      setup_postdata( $post );
      dsg_card( 'default' );
    }
    $post = $_orig_post;
    wp_reset_postdata();
    ?>
  </div>
</section>
<?php endif; ?>

<?php get_footer();
