<?php
/**
 * Portal: Revista Rumo (revistarumo.com.br)
 * Template part: card-default (image_top, 16x9).
 * Usado via get_template_part('template-parts/card', 'default').
 * Espera que global $post esteja setado.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! has_post_thumbnail() ) { return; }
$cat = rr_primary_category();
?>
<article class="rr-card">
	<a class="rr-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
		<?php the_post_thumbnail( 'rr-card', array( 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
	</a>
	<div class="rr-card__body">
		<?php if ( $cat ) : ?>
			<a class="rr-card__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
		<?php endif; ?>
		<h3 class="rr-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
		<div class="rr-card__meta">
			<?php echo esc_html( rr_relative_time() ); ?>
			<span> | <?php echo esc_html( rr_read_time() ); ?> de leitura</span>
		</div>
	</div>
</article>
