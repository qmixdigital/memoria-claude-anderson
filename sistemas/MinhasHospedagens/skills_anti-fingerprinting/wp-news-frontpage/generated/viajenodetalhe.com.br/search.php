<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<div class="vd-shell">
  <header class="vd-archive__head">
    <nav class="vd-breadcrumb" aria-label="Localização">
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>">início</a>
      <span class="vd-breadcrumb__sep" aria-hidden="true"></span>
      <span>busca</span>
    </nav>
    <span class="vd-archive__kicker">// resultados</span>
    <h1 class="vd-archive__h1">"<?php echo esc_html( get_search_query() ); ?>"</h1>
  </header>

  <?php if ( have_posts() ) : ?>
    <div class="vd-archive__grid">
      <?php while ( have_posts() ) : the_post(); ?>
        <article class="vd-card">
          <?php if ( has_post_thumbnail() ) : ?>
          <a class="vd-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
            <?php the_post_thumbnail( 'medium', array( 'alt' => '' ) ); ?>
          </a>
          <?php endif; ?>
          <div class="vd-card__body">
            <?php $cc = get_the_category(); if ( ! empty( $cc ) ) : ?>
            <span class="vd-card__cat"><?php echo esc_html( strtolower( $cc[0]->name ) ); ?></span>
            <?php endif; ?>
            <h2 class="vd-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
            <p class="vd-card__meta"><?php echo esc_html( strtolower( vd_post_date() ) ); ?></p>
          </div>
        </article>
      <?php endwhile; ?>
    </div>
  <?php else : ?>
    <div style="padding:var(--vd-sp-7) 0; text-align:center;">
      <h2 style="font-family:var(--vd-display); font-style:italic;">Sem resultados</h2>
      <p>Tente palavras-chave mais curtas ou explore um caderno no índice.</p>
    </div>
  <?php endif; ?>
</div>
<?php get_footer();
