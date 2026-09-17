<?php
/**
 * Portal: Revista Rumo (revistarumo.com.br)
 * Template part: post-meta (date_format=j_F_Y + read_time).
 * post_meta_visibility=classic (data + categoria).
 * Espera que global $post esteja setado e estar dentro do loop.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$rr_cat = rr_primary_category();
?>
<div class="rr-single__date-strip">
	<time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><strong><?php echo esc_html( rr_date_pt() ); ?></strong></time>
	<?php if ( $rr_cat ) : ?>
		<a href="<?php echo esc_url( get_category_link( $rr_cat->term_id ) ); ?>"><?php echo esc_html( $rr_cat->name ); ?></a>
	<?php endif; ?>
	<?php if ( get_the_modified_date( 'Y-m-d' ) !== get_the_date( 'Y-m-d' ) ) : ?>
		<span>Atualizado em <?php echo esc_html( rr_date_pt() ); ?></span>
	<?php endif; ?>
	<span><?php echo esc_html( rr_read_time() ); ?> de leitura</span>
</div>
