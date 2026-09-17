<?php
/**
 * Portal: AdVivo (advivo.com.br)
 * Parent theme: OceanWP
 * Front-page archetype: B, Single: III, Archive: gamma, Header: H3, Footer: F3
 * Visual: palette=P14 font=F05 spacing=comfortable radius=mixed shadow=bold
 * Gerado: 09/08/2026
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

require_once get_stylesheet_directory() . '/inc/helpers.php';

/* ============================================================
   Suporte do tema
   ============================================================ */
add_action( 'after_setup_theme', function () {
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'html5', array( 'search-form', 'caption', 'gallery' ) );
	add_theme_support( 'custom-logo', array( 'height' => 60, 'width' => 320, 'flex-height' => true, 'flex-width' => true ) );
	add_image_size( 'av-hero', 1200, 750, true );
	add_image_size( 'av-card', 720, 540, true );
	add_image_size( 'av-thumb', 200, 200, true );
	register_nav_menus( array(
		'primary'   => 'Menu principal',
		'editorias' => 'Barra de editorias',
		'rodape'    => 'Rodape',
	) );
} );

/* ============================================================
   Assets. filemtime no lugar da versao do tema porque o LiteSpeed
   remove query string estatica e serve bundle velho por dias.
   ============================================================ */
add_action( 'wp_enqueue_scripts', function () {
	// OceanWP e plugins enfileiram muita coisa que o child nao usa
	foreach ( array( 'oceanwp-style', 'oceanwp-google-font', 'font-awesome', 'simple-line-icons' ) as $h ) {
		wp_dequeue_style( $h );
	}

	wp_enqueue_style(
		'av-fonts',
		'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Roboto:<<REMOVIDO>>;500;700&display=swap',
		array(),
		null
	);

	// O child nao usa nada do bundle do OceanWP: menu, busca, lightbox, slider e
	// scroll-effect sao proprios. Deixar carregado custa 12 requisicoes por pagina.
	foreach ( array(
		'oceanwp-main', 'oceanwp-lightbox', 'magnific-popup', 'ow-magnific-popup', 'ow-lightbox',
		'oceanwp-drop-down-mobile-menu', 'oceanwp-drop-down-search',
		'ow-flickity', 'flickity', 'oceanwp-slider', 'ow-slider',
		'oceanwp-scroll-effect', 'oceanwp-scroll-top', 'oceanwp-select',
		'imagesloaded',
	) as $h ) {
		wp_dequeue_script( $h );
		wp_deregister_script( $h );
	}

	// jQuery so entra se algum plugin realmente depender dele
	if ( ! wp_script_is( 'jquery', 'enqueued' ) || ! av_alguem_precisa_de_jquery() ) {
		wp_dequeue_script( 'jquery' );
		wp_dequeue_script( 'jquery-core' );
	}

	$css = get_stylesheet_directory() . '/style.css';
	wp_enqueue_style( 'av-child', get_stylesheet_directory_uri() . '/style.css', array( 'av-fonts' ), file_exists( $css ) ? filemtime( $css ) : '2.0.0' );
}, 100 );

add_action( 'wp_head', function () {
	echo "<link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>\n";
}, 1 );

/* Algum script enfileirado declara jquery como dependencia? */
function av_alguem_precisa_de_jquery() {
	global $wp_scripts;
	if ( ! $wp_scripts ) { return true; }
	foreach ( $wp_scripts->queue as $h ) {
		if ( $h === 'jquery' || $h === 'jquery-core' ) { continue; }
		$reg = isset( $wp_scripts->registered[ $h ] ) ? $wp_scripts->registered[ $h ] : null;
		if ( $reg && $reg->deps && array_intersect( array( 'jquery', 'jquery-core' ), $reg->deps ) ) { return true; }
	}
	return false;
}

/* Reinjeta ?v=mtime depois que o LiteSpeed limpa a query string. */
function av_cache_bust( $src, $handle ) {
	if ( strpos( $handle, 'av-' ) !== 0 || strpos( $src, '?' ) !== false ) { return $src; }
	$rel = str_replace( get_stylesheet_directory_uri(), '', $src );
	$abs = get_stylesheet_directory() . $rel;
	return file_exists( $abs ) ? $src . '?v=' . filemtime( $abs ) : $src;
}
add_filter( 'style_loader_src', 'av_cache_bust', 9999, 2 );
add_filter( 'script_loader_src', 'av_cache_bust', 9999, 2 );

/* ============================================================
   Home sem lazy-load: com 30 imagens o efeito de "pipoca" ao rolar
   parece bug de animacao.
   ============================================================ */
add_filter( 'wp_lazy_loading_enabled', function ( $default, $tag, $context ) {
	if ( is_front_page() || is_home() ) { return false; }
	return $default;
}, 10, 3 );

add_filter( 'wp_get_attachment_image_attributes', function ( $attr ) {
	// O template decide o que e eager. Forcar eager nas 47 imagens da home
	// levava o LCP de laboratorio pra 6,7s no mobile simulado.
	if ( is_front_page() || is_home() ) {
		$attr['decoding'] = 'async';
		if ( empty( $attr['loading'] ) ) { $attr['loading'] = 'lazy'; }
	}
	return $attr;
}, 99 );

/* ============================================================
   Enxugar o core no front-end
   ============================================================ */
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
remove_action( 'admin_print_styles', 'print_emoji_styles' );
remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
add_filter( 'tiny_mce_plugins', function ( $p ) {
	return is_array( $p ) ? array_diff( $p, array( 'wpemoji' ) ) : $p;
} );
add_filter( 'emoji_svg_url', '__return_false' );

add_action( 'wp_default_scripts', function ( $scripts ) {
	if ( ! is_admin() && isset( $scripts->registered['jquery'] ) ) {
		$jq = $scripts->registered['jquery'];
		if ( $jq->deps ) { $jq->deps = array_diff( $jq->deps, array( 'jquery-migrate' ) ); }
	}
} );

remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
remove_action( 'wp_head', 'wp_oembed_add_host_js' );
add_filter( 'embed_oembed_discover', '__return_false' );
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'wp_shortlink_wp_head' );
remove_action( 'template_redirect', 'wp_shortlink_header', 11 );
remove_action( 'wp_head', 'rest_output_link_wp_head', 10 );
remove_action( 'wp_head', 'feed_links_extra', 3 );

add_action( 'wp_enqueue_scripts', function () {
	if ( ! is_user_logged_in() ) {
		wp_dequeue_style( 'dashicons' );
		wp_deregister_style( 'dashicons' );
	}
	foreach ( array(
		'wp-block-library', 'wp-block-library-theme', 'wc-block-style',
		'classic-theme-styles', 'global-styles', 'wp-img-auto-sizes-contain',
	) as $h ) { wp_dequeue_style( $h ); }
}, 200 );
remove_action( 'wp_enqueue_scripts', 'wp_enqueue_global_styles' );
remove_action( 'wp_footer', 'wp_enqueue_global_styles', 1 );
remove_action( 'wp_body_open', 'wp_global_styles_render_svg_filters' );

/* ============================================================
   Conteudo
   ============================================================ */
add_filter( 'excerpt_length', function () { return 26; }, 999 );
add_filter( 'excerpt_more', function () { return ''; } );

/* Arquivo com densidade de revista. */
add_action( 'pre_get_posts', function ( $q ) {
	if ( is_admin() || ! $q->is_main_query() ) { return; }
	if ( $q->is_category() || $q->is_tag() || $q->is_search() ) {
		$q->set( 'posts_per_page', 8 );
	}
} );

/* Comentario desligado: portal nao modera fila de comentario. */
add_filter( 'comments_open', '__return_false', 20 );
add_filter( 'pings_open', '__return_false', 20 );

/* ============================================================
   Favicon
   ============================================================
   O WordPress monta o icone de 32px reduzindo a arte de 512, e "AD VIVO" em
   duas linhas vira borrao nesse tamanho. Os tamanhos pequenos apontam para o
   monograma desenhado a mao; de 48px pra cima, que e o que o Google usa no
   resultado de busca, fica a marca completa.
*/
add_filter( 'site_icon_meta_tags', function ( $tags ) {
	$base = get_stylesheet_directory_uri() . '/assets/icones/';
	$ver  = '?v=' . ( file_exists( get_stylesheet_directory() . '/assets/icones/favicon-32.png' )
		? filemtime( get_stylesheet_directory() . '/assets/icones/favicon-32.png' ) : '1' );

	return array(
		sprintf( '<link rel="icon" href="%s" sizes="16x16" type="image/png" />', esc_url( $base . 'favicon-16.png' . $ver ) ),
		sprintf( '<link rel="icon" href="%s" sizes="32x32" type="image/png" />', esc_url( $base . 'favicon-32.png' . $ver ) ),
		sprintf( '<link rel="icon" href="%s" sizes="48x48" type="image/png" />', esc_url( $base . 'favicon-48.png' . $ver ) ),
		sprintf( '<link rel="icon" href="%s" sizes="192x192" type="image/png" />', esc_url( $base . 'favicon-192.png' . $ver ) ),
		sprintf( '<link rel="apple-touch-icon" href="%s" />', esc_url( $base . 'favicon-180.png' . $ver ) ),
		'<meta name="theme-color" content="#19d64b" />',
	);
} );
