<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! has_post_thumbnail() ) return;
?>
<article class="vd-card">
  <a class="vd-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
    <?php the_post_thumbnail( 'large', array( 'alt' => '', 'loading' => 'eager' ) ); ?>
  </a>
  <div class="vd-card__body">
    <?php $cc = get_the_category(); if ( ! empty( $cc ) ) : ?>
    <span class="vd-card__cat"><?php echo esc_html( strtolower( $cc[0]->name ) ); ?></span>
    <?php endif; ?>
    <h2 class="vd-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
    <p class="vd-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 22, '…' ) ); ?></p>
    <p class="vd-card__meta">por <?php the_author(); ?> · <?php echo esc_html( strtolower( vd_post_date() ) ); ?></p>
  </div>
</article>
