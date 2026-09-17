<?php
/**
 * Portal: AdVivo (advivo.com.br) - Meta do post
 * Gerado: 09/08/2026
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$av_id = isset( $args['id'] ) ? (int) $args['id'] : get_the_ID();
?>
<div class="av-card__meta">
	<span><?php echo esc_html( get_the_date( 'j \d\e F', $av_id ) ); ?></span>
	<span><?php echo esc_html( av_tempo_leitura( $av_id ) ); ?> min de leitura</span>
</div>
