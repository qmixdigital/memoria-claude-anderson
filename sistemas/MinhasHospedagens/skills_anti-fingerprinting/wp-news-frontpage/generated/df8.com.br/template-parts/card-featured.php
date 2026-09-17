<?php
/**
 * Portal: DF8 News (df8.com.br)
 * Template part: card-featured
 * Hero featured card com imagem maior + excerpt. Usado em hero lead da home e archive hero.
 * Espera que global $post esteja setado.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! has_post_thumbnail() ) { return; }
$cat = d8_primary_category();
?>
<div class="d8-hero__lead">
	<a class="d8-hero__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
		<?php the_post_thumbnail( 'd8-hero', array( 'loading' => 'eager', 'fetchpriority' => 'high', 'decoding' => 'async' ) ); ?>
	</a>
	<div class="d8-hero__body">
		<?php if ( $cat ) : ?>
			<a class="d8-hero__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
		<?php endif; ?>
		<h2 class="d8-hero__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
		<p class="d8-hero__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 30 ) ); ?></p>
	</div>
</div>
