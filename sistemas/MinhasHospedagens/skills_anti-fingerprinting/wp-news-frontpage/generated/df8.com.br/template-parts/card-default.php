<?php
/**
 * Portal: DF8 News (df8.com.br)
 * Template part: card-default
 * Card padrão (text_only com has-media quando ha thumb).
 * Usado via get_template_part('template-parts/card', 'default').
 * Espera que global $post esteja setado.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! has_post_thumbnail() ) { return; }
$cat = d8_primary_category();
?>
<article class="d8-card has-media">
	<a class="d8-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
		<?php the_post_thumbnail( 'd8-card', array( 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
	</a>
	<?php if ( $cat ) : ?>
		<a class="d8-card__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
	<?php endif; ?>
	<h3 class="d8-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
	<div class="d8-card__meta"><?php echo esc_html( d8_relative_time() ); ?></div>
</article>
