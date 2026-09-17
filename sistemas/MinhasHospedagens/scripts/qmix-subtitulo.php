<?php
/**
 * Plugin Name: QMIX - Subtítulo do artigo
 * Description: Exibe o subtítulo enviado pelo sistema Antônio (postmeta qmix_subtitle) logo abaixo do título, no artigo. Sem subtítulo gravado, não faz nada.
 * Version: 1.0
 * Author: QMIX
 *
 * POR QUE UM MU-PLUGIN E NAO EDICAO DE TEMA
 * Sao 89 instalacoes WordPress com temas diferentes. Um filtro em `the_content`
 * funciona em todas sem tocar em nenhum tema, e desligar e apagar este arquivo.
 *
 * O subtitulo so existe nos poucos artigos que o modulo de editores externos
 * envia com o campo `subtitle` — os outros seguem exatamente como hoje.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

add_filter( 'the_content', function ( $content ) {
	if ( ! is_singular( 'post' ) || ! in_the_loop() || ! is_main_query() ) {
		return $content;
	}

	$sub = get_post_meta( get_the_ID(), 'qmix_subtitle', true );
	if ( ! is_string( $sub ) || trim( $sub ) === '' ) {
		return $content;
	}

	$html = '<p class="qmix-subtitulo">' . esc_html( trim( $sub ) ) . '</p>';

	return $html . $content;
}, 9 );

// Estilo discreto: herda a cor do tema, so muda peso e tamanho. Fica no rodape
// da pagina do artigo para nao pesar o <head> de quem nao tem subtitulo.
add_action( 'wp_footer', function () {
	if ( ! is_singular( 'post' ) ) { return; }
	$sub = get_post_meta( get_the_ID(), 'qmix_subtitle', true );
	if ( ! is_string( $sub ) || trim( $sub ) === '' ) { return; }
	echo '<style>.qmix-subtitulo{font-size:1.15em;line-height:1.5;font-weight:500;opacity:.85;margin:0 0 1.2em;max-width:62ch}</style>';
} );

/**
 * O subtitulo tambem entra no schema do Rank Math como `alternativeHeadline`,
 * que e o campo que o Google entende para "linha fina".
 */
add_filter( 'rank_math/json_ld', function ( $data, $jsonld ) {
	if ( ! is_singular( 'post' ) ) { return $data; }
	$sub = get_post_meta( get_the_ID(), 'qmix_subtitle', true );
	if ( ! is_string( $sub ) || trim( $sub ) === '' ) { return $data; }
	foreach ( $data as $k => $v ) {
		if ( isset( $v['@type'] ) && in_array( $v['@type'], array( 'Article', 'NewsArticle', 'BlogPosting' ), true ) ) {
			$data[ $k ]['alternativeHeadline'] = trim( $sub );
		}
	}
	return $data;
}, 20, 2 );
