<?php
/**
 * Viaje no Detalhe — archive (gamma editorial column + load_more pagination + density 4-2-1).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
$obj = is_category() || is_tag() || is_tax() ? get_queried_object() : null;
?>
<div class="vd-shell">
  <header class="vd-archive__head">
    <nav class="vd-breadcrumb" aria-label="Localização">
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>">início</a>
      <span class="vd-breadcrumb__sep" aria-hidden="true"></span>
      <span><?php echo esc_html( strtolower( wp_strip_all_tags( get_the_archive_title() ) ) ); ?></span>
    </nav>
    <span class="vd-archive__kicker">
      <?php
      if ( is_category() ) echo '// caderno';
      elseif ( is_tag() ) echo '// tag';
      elseif ( is_author() ) echo '// autor';
      else echo '// arquivo';
      ?>
    </span>
    <h1 class="vd-archive__h1">
      <?php
      $title = get_the_archive_title();
      $title = preg_replace( '/^(Categoria|Tag|Autor):\s*/i', '', $title );
      echo esc_html( strtolower( wp_strip_all_tags( $title ) ) );
      ?>
    </h1>
    <?php
    // Featured post (h1_with_featured_post)
    if ( have_posts() ) {
      $main = $GLOBALS['wp_query'];
      $first = $main->posts[0] ?? null;
      if ( $first && has_post_thumbnail( $first ) ) :
    ?>
      <article class="vd-archive__featured">
        <a class="vd-archive__featured-media" href="<?php echo esc_url( get_permalink( $first ) ); ?>" aria-hidden="true" tabindex="-1">
          <?php echo get_the_post_thumbnail( $first, 'large', array( 'loading' => 'eager' ) ); ?>
        </a>
        <div class="vd-archive__featured-body">
          <span class="vd-archive__featured-tag">// destaque</span>
          <h2 class="vd-archive__featured-title">
            <a href="<?php echo esc_url( get_permalink( $first ) ); ?>"><?php echo esc_html( get_the_title( $first ) ); ?></a>
          </h2>
          <p class="vd-archive__featured-meta"><?php echo esc_html( strtolower( vd_post_date( $first ) ) ); ?></p>
        </div>
      </article>
    <?php
      endif;
    }
    ?>
  </header>

  <?php if ( have_posts() ) : ?>
    <div class="vd-archive__grid" id="vd-archive-grid">
      <?php
      $shown = 0;
      while ( have_posts() ) : the_post();
        if ( $shown === 0 && has_post_thumbnail() ) { $shown++; continue; }
      ?>
        <article class="vd-card">
          <?php if ( has_post_thumbnail() ) : ?>
          <a class="vd-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
            <?php the_post_thumbnail( 'medium', array( 'alt' => '', 'decoding' => 'async' ) ); ?>
          </a>
          <?php endif; ?>
          <div class="vd-card__body">
            <?php $cc = get_the_category(); if ( ! empty( $cc ) ) : ?>
            <span class="vd-card__cat"><?php echo esc_html( strtolower( $cc[0]->name ) ); ?></span>
            <?php endif; ?>
            <h2 class="vd-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
            <p class="vd-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 18, '…' ) ); ?></p>
            <p class="vd-card__meta"><?php echo esc_html( strtolower( vd_post_date() ) ); ?></p>
          </div>
        </article>
      <?php
        $shown++;
      endwhile;
      ?>
    </div>

    <?php $next = get_next_posts_page_link(); if ( $next ) : ?>
    <nav class="vd-pagination" id="vd-archive-loadmore" data-vd-next="<?php echo esc_url( $next ); ?>">
      <a class="vd-btn" href="<?php echo esc_url( $next ); ?>" id="vd-loadmore-trigger">carregar mais →</a>
    </nav>
    <?php else : ?>
    <nav class="vd-pagination" aria-label="Paginação">
      <span style="font-family:var(--vd-mono); font-size:11px; color:var(--vd-muted); letter-spacing:.22em;">// fim do caderno</span>
    </nav>
    <?php endif; ?>
  <?php else : ?>
    <div style="padding:var(--vd-sp-7) 0; text-align:center;">
      <h2 style="font-family:var(--vd-display); font-style:italic;">Caderno vazio</h2>
      <p>Esse arquivo ainda não tem ensaios. Volte ao <a href="<?php echo esc_url( home_url( '/' ) ); ?>">índice principal</a>.</p>
    </div>
  <?php endif; ?>
</div>

<style>
.vd-archive__head { padding: var(--vd-sp-5) 0 var(--vd-sp-4); margin-bottom: var(--vd-sp-5); border-bottom: 3px double var(--vd-line-strong); }
.vd-archive__kicker { display: inline-block; font-family: var(--vd-mono); font-size: 11px; color: var(--vd-coral); letter-spacing: .22em; text-transform: lowercase; font-weight: 600; margin-bottom: var(--vd-sp-2); }
.vd-archive__h1 { font-family: var(--vd-display); font-size: clamp(34px, 5vw, 56px); font-weight: 800; letter-spacing: -0.024em; margin: 0 0 var(--vd-sp-4); }

.vd-archive__featured { display: grid; grid-template-columns: minmax(0,1.4fr) minmax(0,1fr); gap: var(--vd-sp-4); margin-top: var(--vd-sp-4); padding-top: var(--vd-sp-4); border-top: 1px solid var(--vd-line); align-items: center; }
.vd-archive__featured-media img { width: 100%; aspect-ratio: 16/10; object-fit: cover; }
.vd-archive__featured-tag { display: block; font-family: var(--vd-mono); font-size: 10px; color: var(--vd-coral); letter-spacing: .22em; text-transform: lowercase; font-weight: 600; margin-bottom: 8px; }
.vd-archive__featured-title { font-family: var(--vd-display); font-size: clamp(22px, 2.6vw, 30px); margin: 0 0 var(--vd-sp-2); font-weight: 800; letter-spacing: -0.018em; }
.vd-archive__featured-title a { color: var(--vd-ink); text-decoration: none !important; }
html[data-theme="dark"] .vd-archive__featured-title a { color: var(--vd-dark-ink); }
.vd-archive__featured-title a:hover { color: var(--vd-coral); }
.vd-archive__featured-meta { margin: 0; font-family: var(--vd-mono); font-size: 11px; color: var(--vd-muted); letter-spacing: .14em; text-transform: lowercase; }
@media (max-width: 720px) { .vd-archive__featured { grid-template-columns: 1fr; } }

.vd-archive__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--vd-sp-3); }
@media (max-width: 980px) { .vd-archive__grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 540px) { .vd-archive__grid { grid-template-columns: 1fr; } }
</style>

<?php get_footer();
