<?php
/**
 * Portal: DF8 News (df8.com.br)
 * Template part: post-meta
 * Byline + data + atualizacao (single page header).
 * Espera que global $post esteja setado e estar dentro do loop.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$d8_author = get_the_author();
?>
<div class="d8-single__byline">
	<span><strong>Por <?php echo esc_html( $d8_author ); ?></strong></span>
	<time class="d8-single__time" datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( get_the_date( 'd/m/Y, H:i' ) ); ?></time>
	<?php if ( get_the_modified_date( 'Y-m-d' ) !== get_the_date( 'Y-m-d' ) ) : ?>
		<span class="d8-single__time">Atualizado em <?php echo esc_html( get_the_modified_date( 'd/m/Y' ) ); ?></span>
	<?php endif; ?>
</div>
