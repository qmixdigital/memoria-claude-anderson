<?php
/**
 * Portal: DF8 News (df8.com.br)
 * Parent theme: GeneratePress
 * Front-page archetype: B (Magazine Feature)
 * Single archetype: I (classic)
 * Archive archetype: beta (magazine grid)
 * Header archetype: H5 (magazine masthead)
 * Footer archetype: F5 (sticky bar)
 * Visual: palette=P10 font=F02 spacing=tight radius=sharp shadow=subtle
 * Generated: 2026-06-05
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

/* Theme support */
add_action( 'after_setup_theme', function () {
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'responsive-embeds' );

	register_nav_menus( array(
		'primary'       => 'Menu principal',
		'utility'       => 'Topbar institucional',
		'footer'        => 'Rodapé sticky',
		'institutional' => 'Rodapé institucional',
	) );

	add_image_size( 'd8-hero',    1200, 800, true );
	add_image_size( 'd8-card',    600, 450, true );
	add_image_size( 'd8-compact', 160, 160, true );
} );

/* Enqueues + Google Fonts + filemtime cache-bust */
add_action( 'wp_enqueue_scripts', function () {
	wp_dequeue_style( 'generate-child' );
	wp_deregister_style( 'generate-child' );

	wp_enqueue_style( 'd8-parent', get_template_directory_uri() . '/style.css', array(), null );

	$child = get_stylesheet_directory() . '/style.css';
	$ver   = file_exists( $child ) ? filemtime( $child ) : '1';
	wp_enqueue_style( 'd8-child', get_stylesheet_directory_uri() . '/style.css', array( 'd8-parent' ), $ver );

	wp_enqueue_style(
		'd8-fonts',
		'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:<<REMOVIDO>>;500;600;700;800&display=swap',
		array(),
		null
	);
}, 100 );

add_filter( 'style_loader_src',  'd8_cache_bust_asset', 9999, 2 );
add_filter( 'script_loader_src', 'd8_cache_bust_asset', 9999, 2 );
function d8_cache_bust_asset( $src, $handle ) {
	if ( strpos( $src, 'wp-content/themes/' ) === false ) { return $src; }
	$path = str_replace( site_url( '/' ), ABSPATH, strtok( $src, '?' ) );
	if ( file_exists( $path ) ) {
		$src = add_query_arg( 'v', filemtime( $path ), strtok( $src, '?' ) );
	}
	return $src;
}

/* dns-prefetch leve */
add_action( 'wp_head', function () {
	echo "<link rel=\"dns-prefetch\" href=\"//fonts.googleapis.com\">\n";
	echo "<link rel=\"dns-prefetch\" href=\"//fonts.gstatic.com\">\n";
}, 1 );

/* Disable lazy on home (regra 3) + LCP image high-priority */
add_filter( 'wp_lazy_loading_enabled', function ( $default, $tag, $context ) {
	if ( is_front_page() || is_home() ) { return false; }
	return $default;
}, 10, 3 );

add_filter( 'wp_get_attachment_image_attributes', function ( $attr ) {
	if ( is_front_page() || is_home() ) {
		$attr['loading']  = 'eager';
		$attr['decoding'] = 'async';
	}
	if ( isset( $attr['fetchpriority'] ) && $attr['fetchpriority'] === 'high' ) {
		$attr['loading']      = 'eager';
		$attr['data-no-lazy'] = '1';
		$class = isset( $attr['class'] ) ? $attr['class'] : '';
		if ( strpos( $class, 'no-lazyload' ) === false ) {
			$attr['class'] = trim( $class . ' no-lazyload' );
		}
	}
	return $attr;
}, 99 );

/* Body class limpa (anti-fingerprint) */
add_filter( 'body_class', function ( $classes ) {
	return array_filter( $classes, function ( $c ) {
		return strpos( $c, 'wp-theme-' ) !== 0 && strpos( $c, 'wp-child-theme-' ) !== 0;
	} );
}, 100 );

/* Helpers */
require_once get_stylesheet_directory() . '/inc/helpers.php';

/* Multi-language exclusion: home only (slugs actualidade, life) */
add_action( 'pre_get_posts', function ( $query ) {
	if ( is_admin() || ! $query->is_main_query() ) { return; }
	if ( ! ( $query->is_home() || $query->is_front_page() ) ) { return; }
	$ids = d8_excluded_lang_cat_ids();
	if ( empty( $ids ) ) { return; }
	$neg = array_map( function ( $id ) { return -$id; }, $ids );
	$existing = $query->get( 'cat' );
	$query->set( 'cat', $existing ? $existing . ',' . implode( ',', $neg ) : implode( ',', $neg ) );
} );

/* Slim WordPress core (regra 12) */
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
remove_action( 'rest_api_init', 'wp_oembed_register_route' );
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
}, 200 );

add_action( 'wp_enqueue_scripts', function () {
	foreach ( array(
		'wp-block-library', 'wp-block-library-theme', 'wc-block-style',
		'classic-theme-styles', 'global-styles', 'wp-img-auto-sizes-contain',
	) as $h ) { wp_dequeue_style( $h ); }
}, 200 );
remove_action( 'wp_enqueue_scripts', 'wp_enqueue_global_styles' );
remove_action( 'wp_footer', 'wp_enqueue_global_styles', 1 );
remove_action( 'wp_body_open', 'wp_global_styles_render_svg_filters' );

/* Schema NewsArticle + WebSite */
add_action( 'wp_head', function () {
	if ( is_singular( 'post' ) ) {
		global $post;
		$cats   = get_the_category( $post->ID );
		$cat    = ! empty( $cats ) ? $cats[0] : null;
		$thumb  = get_the_post_thumbnail_url( $post->ID, 'full' );
		$author = get_the_author_meta( 'display_name', $post->post_author );
		$pub    = get_the_date( 'c', $post );
		$mod    = get_the_modified_date( 'c', $post );
		$json   = array(
			'@context'      => 'https://schema.org',
			'@type'         => 'NewsArticle',
			'headline'      => get_the_title( $post ),
			'datePublished' => $pub,
			'dateModified'  => $mod,
			'author'        => array( '@type' => 'Person', 'name' => $author ?: 'Redação DF8' ),
			'publisher'     => array(
				'@type' => 'Organization',
				'name'  => 'DF8 News',
				'logo'  => array(
					'@type' => 'ImageObject',
					'url'   => 'https://df8.com.br/wp-content/uploads/2025/01/df8-logo.png',
				),
			),
			'mainEntityOfPage' => get_permalink( $post ),
		);
		if ( $thumb ) { $json['image'] = $thumb; }
		if ( $cat )   { $json['articleSection'] = $cat->name; }
		echo "<script type=\"application/ld+json\">" . wp_json_encode( $json, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . "</script>\n";
	}
	if ( is_front_page() ) {
		$json = array(
			'@context'  => 'https://schema.org',
			'@type'     => 'WebSite',
			'name'      => 'DF8 News',
			'url'       => home_url( '/' ),
			'publisher' => array(
				'@type' => 'Organization',
				'name'  => 'DF8 News',
				'logo'  => array(
					'@type' => 'ImageObject',
					'url'   => 'https://df8.com.br/wp-content/uploads/2025/01/df8-logo.png',
				),
			),
		);
		echo "<script type=\"application/ld+json\">" . wp_json_encode( $json, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . "</script>\n";
	}
}, 5 );

/* OIE Link Audit (regra 14) */
if ( defined( 'WP_CLI' ) && WP_CLI ) {
	require_once get_stylesheet_directory() . '/inc/link-audit.php';
}

/* Theme color + format-detection */
add_action( 'wp_head', function () {
	echo "<meta name=\"theme-color\" content=\"#1F4068\">\n";
	echo "<meta name=\"format-detection\" content=\"telephone=no\">\n";
}, 2 );

/* SECURITY HARDENING (wordpress-master) */
add_filter( 'xmlrpc_enabled', '__return_false' );
add_filter( 'wp_xmlrpc_server_class', '__return_false' );
add_filter( 'wp_is_application_passwords_available', '__return_false' );
add_filter( 'login_errors', function () { return 'Credenciais inválidas.'; } );
add_filter( 'rest_endpoints', function ( $endpoints ) {
	if ( ! current_user_can( 'list_users' ) ) {
		unset( $endpoints['/wp/v2/users'] );
		unset( $endpoints['/wp/v2/users/(?P<id>[\d]+)'] );
	}
	return $endpoints;
}, 20 );
add_action( 'send_headers', function () {
	if ( is_admin() ) { return; }
	header( 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' );
	header( 'X-Content-Type-Options: nosniff' );
	header( 'X-Frame-Options: SAMEORIGIN' );
	header( 'Referrer-Policy: strict-origin-when-cross-origin' );
	header( 'Permissions-Policy: interest-cohort=(), browsing-topics=()' );
	header( 'X-Permitted-Cross-Domain-Policies: none' );
} );
add_action( 'wp_login_failed', function ( $username ) {
	$ip = $_SERVER['REMOTE_ADDR'] ?? '';
	if ( ! $ip ) { return; }
	$key = 'd8_lf_' . md5( $ip );
	$tries = (int) get_transient( $key );
	$tries++;
	set_transient( $key, $tries, HOUR_IN_SECONDS );
	if ( $tries >= 8 ) {
		http_response_code( 429 );
		exit( 'Muitas tentativas. Tente novamente mais tarde.' );
	}
} );

/* Performance: revisions + heartbeat */
add_filter( 'wp_revisions_to_keep', function ( $num ) { return 3; }, 99 );
add_filter( 'heartbeat_settings', function ( $s ) { $s['interval'] = 120; return $s; } );
add_action( 'init', function () {
	global $pagenow;
	if ( ! in_array( $pagenow, array( 'post.php', 'post-new.php' ), true ) ) {
		wp_deregister_script( 'heartbeat' );
	}
}, 1 );
