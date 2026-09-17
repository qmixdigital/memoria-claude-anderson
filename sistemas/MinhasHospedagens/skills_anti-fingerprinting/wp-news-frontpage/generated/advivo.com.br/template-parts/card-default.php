<?php
/**
 * Portal: AdVivo (advivo.com.br) - Card padrao
 * Gerado: 09/08/2026
 *
 * A renderizacao vive em inc/helpers.php (av_card), que recebe o ID
 * explicitamente. Este arquivo existe para quem procurar o card pelo
 * caminho convencional do tema.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$av_id = isset( $args['id'] ) ? (int) $args['id'] : get_the_ID();
av_card( $av_id, isset( $args['variacao'] ) ? $args['variacao'] : 'default', isset( $args['opcoes'] ) ? $args['opcoes'] : array() );
