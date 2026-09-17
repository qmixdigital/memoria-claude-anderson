<?php
/**
 * Viaje no Detalhe — front-page (archetype A: Newspaper Grid).
 * Hero triptych + breaking ticker + 4 category blocks + sidebar floating.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>

<?php
$used = array();

// Ticker — 8 últimas manchetes
$tk = vd_query_for_section( array( 'posts_per_page' => 18 ) );
$tk_ids = array();
while ( $tk->have_posts() ) {
  $tk->the_post();
  if ( ! has_post_thumbnail() ) continue;
  $tk_ids[] = get_the_ID();
  if ( count( $tk_ids ) >= 8 ) break;
}
wp_reset_postdata();
?>

<?php if ( ! empty( $tk_ids ) ) : ?>
<div class="vd-ticker" aria-label="Manchetes em destaque">
  <div class="vd-ticker__row">
    <span class="vd-ticker__label">// últimas</span>
    <div class="vd-ticker__track">
      <div class="vd-ticker__inner">
        <?php
        // Duplicar pra loop suave
        for ( $i = 0; $i < 2; $i++ ) :
          foreach ( $tk_ids as $tid ) :
        ?>
          <a href="<?php echo esc_url( get_permalink( $tid ) ); ?>"><?php echo esc_html( get_the_title( $tid ) ); ?></a>
        <?php
          endforeach;
        endfor;
        ?>
      </div>
    </div>
  </div>
</div>
<?php endif; ?>

<div class="vd-shell">

<?php
// Hero — 1 lead + 4 supports (5 destaques)
$hero_q = vd_query_for_section( array( 'posts_per_page' => 14, 'post__not_in' => $used ) );
$hero_ids = array();
while ( $hero_q->have_posts() ) {
  $hero_q->the_post();
  if ( ! has_post_thumbnail() ) continue;
  $hero_ids[] = get_the_ID();
  if ( count( $hero_ids ) >= 5 ) break;
}
wp_reset_postdata();
$used = array_merge( $used, $hero_ids );
?>

<?php if ( ! empty( $hero_ids ) ) : ?>
<section class="vd-hero" aria-label="Capa do almanaque">
  <?php
  $lead = $hero_ids[0];
  $supports = array_slice( $hero_ids, 1, 4 );
  ?>
  <article class="vd-hero__lead">
    <a class="vd-hero__media" href="<?php echo esc_url( get_permalink( $lead ) ); ?>" aria-hidden="true" tabindex="-1">
      <?php echo get_the_post_thumbnail( $lead, 'large', array( 'loading' => 'eager', 'fetchpriority' => 'high' ) ); ?>
    </a>
    <div class="vd-hero__body">
      <?php
      $cats = get_the_category( $lead );
      if ( ! empty( $cats ) ) {
        echo '<a class="vd-hero__cat" href="' . esc_url( get_category_link( $cats[0] ) ) . '">' . esc_html( $cats[0]->name ) . '</a>';
      }
      ?>
      <h2 class="vd-hero__title">
        <a href="<?php echo esc_url( get_permalink( $lead ) ); ?>"><?php echo esc_html( get_the_title( $lead ) ); ?></a>
      </h2>
      <?php
      $hex = get_the_excerpt( $lead );
      if ( ! $hex ) $hex = wp_trim_words( strip_tags( get_post_field( 'post_content', $lead ) ), 30, '…' );
      ?>
      <p class="vd-hero__excerpt"><?php echo esc_html( $hex ); ?></p>
      <p class="vd-hero__meta">
        <span class="vd-hero__num">i.</span>
        Por <strong><?php echo esc_html( get_the_author_meta( 'display_name', get_post_field( 'post_author', $lead ) ) ); ?></strong>
        · <?php echo esc_html( vd_post_date( $lead ) ); ?>
      </p>
    </div>
  </article>

  <?php if ( ! empty( $supports ) ) : ?>
  <div class="vd-hero__supports">
    <?php $idx = 2; foreach ( $supports as $sid ) : ?>
      <article class="vd-hero__support">
        <a class="vd-hero__support-media" href="<?php echo esc_url( get_permalink( $sid ) ); ?>" aria-hidden="true" tabindex="-1">
          <?php echo get_the_post_thumbnail( $sid, 'medium_large', array( 'loading' => 'eager' ) ); ?>
        </a>
        <div class="vd-hero__support-body">
          <?php
          $sc = get_the_category( $sid );
          if ( ! empty( $sc ) ) {
            echo '<span class="vd-hero__support-cat">' . esc_html( $sc[0]->name ) . '</span>';
          }
          ?>
          <h3 class="vd-hero__support-title">
            <a href="<?php echo esc_url( get_permalink( $sid ) ); ?>"><?php echo esc_html( get_the_title( $sid ) ); ?></a>
          </h3>
          <?php
          $sex = get_the_excerpt( $sid );
          if ( ! $sex ) $sex = wp_trim_words( strip_tags( get_post_field( 'post_content', $sid ) ), 16, '…' );
          ?>
          <p class="vd-hero__support-excerpt"><?php echo esc_html( $sex ); ?></p>
          <p class="vd-hero__support-meta"><?php
            $rom = array( 2 => 'ii.', 3 => 'iii.', 4 => 'iv.', 5 => 'v.' );
            echo esc_html( ( isset( $rom[ $idx ] ) ? $rom[ $idx ] : '' ) . ' ' . vd_post_date( $sid ) );
          ?></p>
        </div>
      </article>
    <?php $idx++; endforeach; ?>
  </div>
  <?php endif; ?>
</section>
<?php endif; ?>

<div class="vd-layout">
  <div class="vd-main">

    <?php
    // Blocos de caderno (estilo portal): 1 destaque + lista de manchetes.
    $top_cats = get_categories( array(
      'orderby'    => 'count',
      'order'      => 'DESC',
      'number'     => 4,
      'hide_empty' => true,
      'exclude'    => vd_excluded_lang_cat_ids(),
    ) );

    foreach ( $top_cats as $cat ) :
      $cq = vd_query_for_section( array(
        'posts_per_page' => 18,
        'cat'            => $cat->term_id,
        'post__not_in'   => $used,
      ) );
      $cat_ids = array();
      while ( $cq->have_posts() ) {
        $cq->the_post();
        if ( ! has_post_thumbnail() ) continue;
        $cat_ids[] = get_the_ID();
        if ( count( $cat_ids ) >= 6 ) break;
      }
      wp_reset_postdata();
      if ( count( $cat_ids ) < 4 ) continue;
      $used = array_merge( $used, $cat_ids );

      $lead = $cat_ids[0];
      $rows = array_slice( $cat_ids, 1, 5 );
      $lex  = get_the_excerpt( $lead );
      if ( ! $lex ) $lex = wp_trim_words( strip_tags( get_post_field( 'post_content', $lead ) ), 26, '…' );
    ?>

    <section class="vd-section">
      <div class="vd-section__head">
        <h2><em><?php echo esc_html( $cat->name ); ?></em></h2>
        <a class="vd-section__head__more" href="<?php echo esc_url( get_category_link( $cat ) ); ?>">ver caderno (<?php echo (int) $cat->count; ?>) ↗</a>
      </div>
      <div class="vd-cluster">

        <article class="vd-card vd-card--lead">
          <a class="vd-card__media" href="<?php echo esc_url( get_permalink( $lead ) ); ?>" aria-hidden="true" tabindex="-1">
            <?php echo get_the_post_thumbnail( $lead, 'vd-card', array( 'alt' => '', 'loading' => 'eager' ) ); ?>
          </a>
          <div class="vd-card__body">
            <span class="vd-card__cat"><?php echo esc_html( $cat->name ); ?></span>
            <h3 class="vd-card__title"><a href="<?php echo esc_url( get_permalink( $lead ) ); ?>"><?php echo esc_html( get_the_title( $lead ) ); ?></a></h3>
            <p class="vd-card__excerpt"><?php echo esc_html( $lex ); ?></p>
            <p class="vd-card__meta"><?php echo esc_html( vd_post_date( $lead ) ); ?></p>
          </div>
        </article>

        <div class="vd-cluster__list">
          <?php foreach ( $rows as $rid ) : ?>
          <article class="vd-card vd-card--row">
            <a class="vd-card__media" href="<?php echo esc_url( get_permalink( $rid ) ); ?>" aria-hidden="true" tabindex="-1">
              <?php echo get_the_post_thumbnail( $rid, array( 160, 160 ), array( 'alt' => '' ) ); ?>
            </a>
            <div class="vd-card__body">
              <h3 class="vd-card__title"><a href="<?php echo esc_url( get_permalink( $rid ) ); ?>"><?php echo esc_html( get_the_title( $rid ) ); ?></a></h3>
              <p class="vd-card__meta"><?php echo esc_html( vd_post_date( $rid ) ); ?></p>
            </div>
          </article>
          <?php endforeach; ?>
        </div>

      </div>
    </section>

    <?php endforeach; ?>

  </div><!-- /.vd-main -->

  <aside class="vd-sidebar vd-sidebar--floating" role="complementary">
    <div class="vd-widget">
      <h4>// mais lidos</h4>
      <?php
      $sb = vd_query_for_section( array(
        'posts_per_page' => 14,
        'orderby'        => 'comment_count',
        'order'          => 'DESC',
        'post__not_in'   => $used,
      ) );
      $sb_ids = array();
      while ( $sb->have_posts() ) {
        $sb->the_post();
        if ( ! has_post_thumbnail() ) continue;
        $sb_ids[] = get_the_ID();
        if ( count( $sb_ids ) >= 6 ) break;
      }
      wp_reset_postdata();
      ?>
      <ol class="vd-ranked">
        <?php $rk = 1; foreach ( $sb_ids as $sid ) : ?>
        <li class="vd-ranked__item">
          <span class="vd-ranked__num"><?php echo esc_html( $rk ); ?></span>
          <a class="vd-ranked__link" href="<?php echo esc_url( get_permalink( $sid ) ); ?>"><?php echo esc_html( get_the_title( $sid ) ); ?></a>
        </li>
        <?php $rk++; endforeach; ?>
      </ol>
    </div>

    <div class="vd-widget">
      <h4>// cadernos</h4>
      <ul>
        <?php
        $sb_cats = get_categories( array(
          'orderby'    => 'count',
          'order'      => 'DESC',
          'number'     => 8,
          'hide_empty' => true,
          'exclude'    => vd_excluded_lang_cat_ids(),
        ) );
        foreach ( $sb_cats as $sc ) {
          echo '<li><a href="' . esc_url( get_category_link( $sc ) ) . '">' . esc_html( strtolower( $sc->name ) ) . ' <span style="font-family:var(--vd-mono); font-size:10px; color:var(--vd-muted); float:right;">' . (int) $sc->count . '</span></a></li>';
        }
        ?>
      </ul>
    </div>
  </aside>

</div>

</div><!-- /.vd-shell -->

<?php
get_footer();
