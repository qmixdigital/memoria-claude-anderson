<?php
/**
 * Portal: Revista Rumo (revistarumo.com.br)
 * Template part: card-featured (hero feature do slider, LCP image).
 * Espera que global $post esteja setado.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! has_post_thumbnail() ) { return; }
$cat = rr_primary_category();
?>
<article class="rr-hero__feature">
	<a class="rr-hero__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
		<?php the_post_thumbnail( 'rr-hero', array( 'loading' => 'eager', 'fetchpriority' => 'high', 'decoding' => 'async' ) ); ?>
	</a>
	<div class="rr-hero__body">
		<?php if ( $cat ) : ?>
			<a class="rr-hero__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
		<?php endif; ?>
		<h2 class="rr-hero__feature-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
		<p class="rr-hero__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 28 ) ); ?></p>
	</div>
</article>
