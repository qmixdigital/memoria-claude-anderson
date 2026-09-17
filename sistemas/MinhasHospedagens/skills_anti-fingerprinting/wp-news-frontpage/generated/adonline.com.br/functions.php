<?php
/**
 * Portal: AdOnline (adonline.com.br)
 * Parent theme: Astra
 * Front-page archetype: A (classic newspaper, print-matched)
 * Single archetype: I (classic news article)
 * Archive archetype: alpha (simple list)
 * Header archetype: H1 (classic 3-row)
 * Footer archetype: F2 (4-column)
 * Visual: palette=P02_modern font=F08 spacing=default radius=subtle shadow=subtle
 * Generated: 2026-05-02
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

/* ============================================================
 * Theme support
 * ============================================================ */
add_action( 'after_setup_theme', function () {
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'responsive-embeds' );

	register_nav_menus( array(
		'primary'   => 'Menu principal',
		'utility'   => 'Topbar (Termos, Política, Sobre, Contato)',
		'footer'    => 'Categorias do rodapé',
		'institutional' => 'Institucional do rodapé',
	) );

	add_image_size( 'adon-hero', 1200, 800, true );
	add_image_size( 'adon-card', 600, 400, true );
	add_image_size( 'adon-compact', 180, 180, true );
} );

/* ============================================================
 * Enqueues: fontes Google + child theme css com filemtime cache-bust
 * ============================================================ */
add_action( 'wp_enqueue_scripts', function () {
	// Dropa enqueue duplicado do parent (Astra child auto-load)
	wp_dequeue_style( 'astra-theme-css' );
	wp_dequeue_style( 'astra-child' );

	// Parent style (handle único)
	wp_enqueue_style( 'adon-parent', get_template_directory_uri() . '/style.css', array(), null );

	// Child style com cache-bust real
	$child = get_stylesheet_directory() . '/style.css';
	$ver   = file_exists( $child ) ? filemtime( $child ) : '1';
	wp_enqueue_style( 'adon-child', get_stylesheet_directory_uri() . '/style.css', array( 'adon-parent' ), $ver );

	// Google Fonts (preconnect + display swap, single request)
	wp_enqueue_style(
		'adon-fonts',
		'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:<<REMOVIDO>>;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap',
		array(),
		null
	);
}, 100 );

// Cache-bust filter para LiteSpeed/CDN qs_rm
add_filter( 'style_loader_src',  'adon_cache_bust_asset', 9999, 2 );
add_filter( 'script_loader_src', 'adon_cache_bust_asset', 9999, 2 );
function adon_cache_bust_asset( $src, $handle ) {
	if ( strpos( $src, 'wp-content/themes/' ) === false ) { return $src; }
	$path = str_replace( site_url( '/' ), ABSPATH, strtok( $src, '?' ) );
	if ( file_exists( $path ) ) {
		$src = add_query_arg( 'v', filemtime( $path ), strtok( $src, '?' ) );
	}
	return $src;
}

// dns-prefetch leve (preconnect virava unused após inline-cache do LiteSpeed)
add_action( 'wp_head', function () {
	echo "<link rel=\"dns-prefetch\" href=\"//fonts.googleapis.com\">\n";
	echo "<link rel=\"dns-prefetch\" href=\"//fonts.gstatic.com\">\n";
}, 1 );

/* ============================================================
 * Disable lazy on home (regra 3 do skill)
 * ============================================================ */
add_filter( 'wp_lazy_loading_enabled', function ( $default, $tag, $context ) {
	if ( is_front_page() || is_home() ) { return false; }
	return $default;
}, 10, 3 );

add_filter( 'wp_get_attachment_image_attributes', function ( $attr ) {
	if ( is_front_page() || is_home() ) {
		$attr['loading']  = 'eager';
		$attr['decoding'] = 'async';
	}
	// Imagens com fetchpriority=high nunca devem ser lazyloaded (LiteSpeed/native)
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

/* ============================================================
 * Body class: limpar fingerprint (remove wp-theme-* e wp-child-theme-*)
 * ============================================================ */
add_filter( 'body_class', function ( $classes ) {
	return array_filter( $classes, function ( $c ) {
		return strpos( $c, 'wp-theme-' ) !== 0 && strpos( $c, 'wp-child-theme-' ) !== 0;
	} );
}, 100 );

/* ============================================================
 * Helpers (queries + cards)
 * ============================================================ */
require_once get_stylesheet_directory() . '/inc/helpers.php';

/* ============================================================
 * Multi-language exclusion (pattern: skill references/multilang-exclusion.md)
 * Hide brazil-news (cat 92, en-US) from main query do home.
 * Archive/category page de brazil-news continua acessível direto.
 * ============================================================ */
add_action( 'pre_get_posts', function ( $query ) {
	if ( is_admin() || ! $query->is_main_query() ) { return; }
	if ( ! ( $query->is_home() || $query->is_front_page() ) ) { return; }
	$ids = adon_excluded_lang_cat_ids();
	if ( empty( $ids ) ) { return; }
	$neg = array_map( function ( $id ) { return -$id; }, $ids );
	$existing = $query->get( 'cat' );
	$query->set( 'cat', $existing ? $existing . ',' . implode( ',', $neg ) : implode( ',', $neg ) );
} );

/* ============================================================
 * Slim WordPress core (regra 12 do skill)
 * ============================================================ */
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

/* ============================================================
 * Schema breadcrumb + Article (single)
 * ============================================================ */
add_action( 'wp_head', function () {
	if ( is_singular( 'post' ) ) {
		global $post;
		$cats = get_the_category( $post->ID );
		$cat  = ! empty( $cats ) ? $cats[0] : null;
		$thumb = get_the_post_thumbnail_url( $post->ID, 'full' );
		$author = get_the_author_meta( 'display_name', $post->post_author );
		$pub  = get_the_date( 'c', $post );
		$mod  = get_the_modified_date( 'c', $post );
		$json = array(
			'@context' => 'https://schema.org',
			'@type'    => 'NewsArticle',
			'headline' => get_the_title( $post ),
			'datePublished' => $pub,
			'dateModified'  => $mod,
			'author' => array( '@type' => 'Person', 'name' => $author ?: 'Redação AdOnline' ),
			'publisher' => array(
				'@type' => 'Organization',
				'name'  => 'AdOnline',
				'logo'  => array( '@type' => 'ImageObject', 'url' => 'https://adonline.com.br/wp-content/uploads/2025/10/adonline-logomarca.webp' ),
			),
			'mainEntityOfPage' => get_permalink( $post ),
		);
		if ( $thumb ) { $json['image'] = $thumb; }
		if ( $cat )   { $json['articleSection'] = $cat->name; }
		echo "<script type=\"application/ld+json\">" . wp_json_encode( $json, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . "</script>\n";
	}
	if ( is_front_page() ) {
		$json = array(
			'@context' => 'https://schema.org',
			'@type'    => 'WebSite',
			'name'     => 'AdOnline',
			'url'      => home_url( '/' ),
			'publisher' => array(
				'@type' => 'Organization',
				'name'  => 'AdOnline',
				'logo'  => array( '@type' => 'ImageObject', 'url' => 'https://adonline.com.br/wp-content/uploads/2025/10/adonline-logomarca.webp' ),
			),
		);
		echo "<script type=\"application/ld+json\">" . wp_json_encode( $json, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . "</script>\n";
	}
}, 5 );

/* ============================================================
 * AdOnline Link Audit Command (regra 14 do skill)
 * ============================================================ */
if ( defined( 'WP_CLI' ) && WP_CLI ) {
	require_once get_stylesheet_directory() . '/inc/link-audit.php';
}

/* ============================================================
 * Header inline brand-color hint (PWA theme color)
 * ============================================================ */
add_action( 'wp_head', function () {
	echo "<meta name=\"theme-color\" content=\"#21A745\">\n";
	echo "<meta name=\"format-detection\" content=\"telephone=no\">\n";
}, 2 );

/* ============================================================
 * SECURITY HARDENING (wordpress-master)
 * ============================================================ */

// Kill XML-RPC completely (já 403 em .htaccess, reforça em PHP)
add_filter( 'xmlrpc_enabled', '__return_false' );
add_filter( 'wp_xmlrpc_server_class', '__return_false' );
remove_action( 'wp_head', 'rsd_link' );

// Disable Application Passwords (não usamos REST API auth com password)
add_filter( 'wp_is_application_passwords_available', '__return_false' );

// Esconder erros de login (não revelar se username existe)
add_filter( 'login_errors', function () { return 'Credenciais inválidas.'; } );

// Bloquear REST /wp/v2/users para não-admins (defesa em profundidade: author-privacy.php tb faz)
add_filter( 'rest_endpoints', function ( $endpoints ) {
	if ( ! current_user_can( 'list_users' ) ) {
		unset( $endpoints['/wp/v2/users'] );
		unset( $endpoints['/wp/v2/users/(?P<id>[\d]+)'] );
	}
	return $endpoints;
}, 20 );

// Security headers (HSTS, frame, content-type, referrer, permissions)
add_action( 'send_headers', function () {
	if ( is_admin() ) { return; }
	header( 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' );
	header( 'X-Content-Type-Options: nosniff' );
	header( 'X-Frame-Options: SAMEORIGIN' );
	header( 'Referrer-Policy: strict-origin-when-cross-origin' );
	header( 'Permissions-Policy: interest-cohort=(), browsing-topics=()' );
	header( 'X-Permitted-Cross-Domain-Policies: none' );
} );

// Limitar tentativas de login fora do Wordfence (fallback simples)
add_action( 'wp_login_failed', function ( $username ) {
	$ip = $_SERVER['REMOTE_ADDR'] ?? '';
	if ( ! $ip ) { return; }
	$key = 'adon_lf_' . md5( $ip );
	$tries = (int) get_transient( $key );
	$tries++;
	set_transient( $key, $tries, HOUR_IN_SECONDS );
	if ( $tries >= 8 ) {
		http_response_code( 429 );
		exit( 'Muitas tentativas. Tente novamente mais tarde.' );
	}
} );

/* ============================================================
 * PERFORMANCE: autoload trim + DB hygiene
 * ============================================================ */

// Limitar revisions como fallback (constant também faz)
add_filter( 'wp_revisions_to_keep', function ( $num ) { return 3; }, 99 );

// Reduzir heartbeat no front e no editor (60s → 120s)
add_filter( 'heartbeat_settings', function ( $s ) {
	$s['interval'] = 120;
	return $s;
} );

// Desativar heartbeat fora do post editor (economiza CPU)
add_action( 'init', function () {
	global $pagenow;
	if ( ! in_array( $pagenow, array( 'post.php', 'post-new.php' ), true ) ) {
		wp_deregister_script( 'heartbeat' );
	}
}, 1 );

/* ============================================================
 * Form de contato: AdOnline (padrão skill wp-news-portal-fullsetup)
 * Action: adon_envio_pauta=enviar, honeypot: numero_assinatura.
 * Roteia para inbox oiempreendedores com tag [ADONLINE].
 * ============================================================ */
define( 'ADON_REDACAO_TO',  'contato@oiempreendedores.com.br' );
define( 'ADON_REDACAO_TAG', '[ADONLINE]' );

add_action( 'init', 'adon_handle_pauta_form' );
function adon_handle_pauta_form() {
	if ( empty( $_POST['adon_envio_pauta'] ) || $_POST['adon_envio_pauta'] !== 'enviar' ) { return; }

	$back = function ( $st, $m = '' ) {
		$u = add_query_arg( array(
			'st' => $st,
			'm'  => $m ? rawurlencode( $m ) : null,
		), wp_get_referer() ?: home_url( '/contato/' ) );
		wp_safe_redirect( $u );
		exit;
	};

	if ( ! wp_verify_nonce( $_POST['adon_pauta_nonce'] ?? '', 'adon_pauta' ) ) {
		$back( 'erro', 'Sessão expirou. Recarregue a página.' );
	}
	if ( ! empty( $_POST['numero_assinatura'] ) ) { $back( 'recebido' ); }
	$elapsed = time() - (int) ( $_POST['adon_pauta_ts'] ?? 0 );
	if ( $elapsed < 3 || $elapsed > 3600 ) { $back( 'recebido' ); }

	$ip  = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '0';
	$key = 'adon_pauta_' . md5( $ip );
	if ( get_transient( $key ) ) { $back( 'erro', 'Aguarde alguns minutos antes de enviar outra mensagem.' ); }

	$assinante = sanitize_text_field( wp_unslash( $_POST['assinante']        ?? '' ) );
	$email     = sanitize_email(      wp_unslash( $_POST['endereco_retorno'] ?? '' ) );
	$motivo    = sanitize_key(        wp_unslash( $_POST['motivo']           ?? '' ) );
	$texto     = sanitize_textarea_field( wp_unslash( $_POST['texto']        ?? '' ) );

	$valid_motivos = array( 'pauta', 'correcao', 'leitura', 'release', 'parceria', 'outro' );
	if ( ! $assinante || ! is_email( $email ) || ! in_array( $motivo, $valid_motivos, true ) ) {
		$back( 'erro', 'Preencha os campos obrigatórios corretamente.' );
	}
	$len = mb_strlen( $texto );
	if ( $len < 40 || $len > 4000 ) {
		$back( 'erro', 'A mensagem precisa ter entre 40 e 4000 caracteres.' );
	}
	if ( preg_match_all( '#https?://#i', $texto ) > 3 ) {
		set_transient( $key, '1', 5 * MINUTE_IN_SECONDS );
		$back( 'erro', 'Mensagem com excesso de links (máximo 3).' );
	}

	$labels = array(
		'pauta'    => 'Sugestão de pauta',
		'correcao' => 'Correção',
		'leitura'  => 'Indicação de leitura',
		'release'  => 'Release / lançamento',
		'parceria' => 'Parceria editorial',
		'outro'    => 'Outro',
	);

	$body  = "Mensagem para a redação do AdOnline\n";
	$body .= str_repeat( '=', 60 ) . "\n\n";
	$body .= "Nome:    {$assinante}\n";
	$body .= "E-mail:  {$email}\n";
	$body .= "Motivo:  " . $labels[ $motivo ] . "\n";
	$body .= "IP:      {$ip}\n\n";
	$body .= str_repeat( '-', 60 ) . "\n\n";
	$body .= $texto;
	$body .= "\n\n" . str_repeat( '=', 60 ) . "\n";
	$body .= 'Enviada em ' . wp_date( 'd/m/Y H:i:s' );

	$subject = sprintf( '%s [%s] %s: %s',
		ADON_REDACAO_TAG, get_bloginfo( 'name' ), $labels[ $motivo ], $assinante
	);

	$sent = wp_mail(
		ADON_REDACAO_TO,
		$subject,
		"*** ESTE EMAIL VEIO DO PORTAL ADONLINE.COM.BR ***\n"
		. "*** (form roteado para oiempreendedores via mailer único QMIX) ***\n\n"
		. $body,
		array(
			'Reply-To: ' . $assinante . ' <' . $email . '>',
			'Content-Type: text/plain; charset=UTF-8',
			'X-ADON-Origin: adonline.com.br',
		)
	);

	if ( $sent ) {
		set_transient( $key, '1', 5 * MINUTE_IN_SECONDS );
		$back( 'recebido' );
	} else {
		$back( 'erro', 'Falha temporária no envio. Tente novamente em alguns minutos.' );
	}
}
