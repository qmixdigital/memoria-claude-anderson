<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! has_post_thumbnail() ) return;
?>
<article class="vd-card">
  <a class="vd-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
    <?php the_post_thumbnail( 'medium', array( 'alt' => '' ) ); ?>
  </a>
  <div class="vd-card__body">
    <?php $cc = get_the_category(); if ( ! empty( $cc ) ) : ?>
    <span class="vd-card__cat"><?php echo esc_html( strtolower( $cc[0]->name ) ); ?></span>
    <?php endif; ?>
    <h3 class="vd-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
    <p class="vd-card__meta"><?php echo esc_html( strtolower( vd_post_date() ) ); ?></p>
  </div>
</article>
