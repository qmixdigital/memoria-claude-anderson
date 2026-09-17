<?php
/**
 * Câmera Cotidiana — child theme functions (Neve parent).
 *
 * Roll: archetype E topical hub / single IV sidebar_rich /
 *       archive beta_magazine_grid / palette P02 / font F11 /
 *       BEM naming / sidebar=none / golden spacing / mixed radius /
 *       editorial shadow / dark_mode=manual_toggle / sticky_on_scroll_up
 *       / search=icon_modal / button=outlined / pagination=prev_next /
 *       infinite_scroll archive / share inline_after_first_para /
 *       in_article_ad every_5_paras (AdSense set B).
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'CC_ADSENSE_CLIENT', 'ca-pub-3880875536722698' );

/* ===== Theme support & menus ===== */
add_action( 'after_setup_theme', function () {
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'title-tag' );
    add_theme_support( 'html5', array( 'search-form', 'comment-list', 'gallery', 'caption' ) );
    register_nav_menus( array(
        'primary'  => 'Menu principal',
        'footer-1' => 'Rodapé',
    ) );
    add_image_size( 'cc-card', 800, 600, true );  // 4:3
    add_image_size( 'cc-hero', 1280, 960, true );
} );

/* ============================================================
 * Enqueue — child has full CSS, dequeue Neve bundle.
 * ============================================================ */
add_action( 'wp_enqueue_scripts', function () {
    $child_dir = get_stylesheet_directory();
    $child_uri = get_stylesheet_directory_uri();

    // Dequeue Neve auto-loaded styles/scripts (we have own complete CSS).
    foreach ( array(
        'neve-style', 'neve-style-pro', 'neve-style-css',
        'neve-google-fonts', 'neve-fonts',
    ) as $h ) {
        wp_dequeue_style( $h );
        wp_deregister_style( $h );
    }
    foreach ( array( 'neve-script', 'neve-frontend' ) as $h ) {
        wp_dequeue_script( $h );
        wp_deregister_script( $h );
    }

    $css_main = $child_dir . '/style.css';
    wp_enqueue_style( 'cc-child', $child_uri . '/style.css', array(),
        file_exists( $css_main ) ? filemtime( $css_main ) : '1' );

    if ( is_front_page() || is_home() ) {
        $p = $child_dir . '/assets/css/home.css';
        wp_enqueue_style( 'cc-home', $child_uri . '/assets/css/home.css',
            array( 'cc-child' ), file_exists( $p ) ? filemtime( $p ) : '1' );
    }
    if ( is_singular( 'post' ) ) {
        $p = $child_dir . '/assets/css/single.css';
        wp_enqueue_style( 'cc-single', $child_uri . '/assets/css/single.css',
            array( 'cc-child' ), file_exists( $p ) ? filemtime( $p ) : '1' );
    }

    $j = $child_dir . '/assets/js/chrome.js';
    wp_enqueue_script( 'cc-chrome', $child_uri . '/assets/js/chrome.js', array(),
        file_exists( $j ) ? filemtime( $j ) : '1', true );
    if ( is_front_page() || is_home() ) {
        $j = $child_dir . '/assets/js/home.js';
        wp_enqueue_script( 'cc-home', $child_uri . '/assets/js/home.js', array(),
            file_exists( $j ) ? filemtime( $j ) : '1', true );
    }
    if ( is_archive() || is_search() ) {
        $j = $child_dir . '/assets/js/archive.js';
        wp_enqueue_script( 'cc-archive', $child_uri . '/assets/js/archive.js', array(),
            file_exists( $j ) ? filemtime( $j ) : '1', true );
    }
}, 100 );

/* Defer custom scripts */
add_filter( 'script_loader_tag', function ( $tag, $handle ) {
    if ( strpos( $handle, 'cc-' ) === 0 && strpos( $tag, ' defer' ) === false ) {
        $tag = str_replace( '<script ', '<script defer ', $tag );
    }
    return $tag;
}, 10, 2 );

/* Cache-bust forçado */
add_filter( 'style_loader_src',  'cc_cache_bust_asset', 9999, 2 );
add_filter( 'script_loader_src', 'cc_cache_bust_asset', 9999, 2 );
function cc_cache_bust_asset( $src, $handle ) {
    if ( strpos( $handle, 'cc-' ) !== 0 ) return $src;
    $stylesheet_uri = get_stylesheet_directory_uri();
    if ( strpos( $src, $stylesheet_uri ) !== 0 ) return $src;
    $rel = substr( $src, strlen( $stylesheet_uri ) );
    $rel = strtok( $rel, '?' );
    $abs = get_stylesheet_directory() . $rel;
    if ( file_exists( $abs ) ) {
        $src = $stylesheet_uri . $rel . '?v=' . filemtime( $abs );
    }
    return $src;
}

/* Helpers */
require_once get_stylesheet_directory() . '/inc/helpers.php';

/* ============================================================
 * Multilang — sem categorias em outra língua neste portal.
 * ============================================================ */
add_action( 'pre_get_posts', function ( $query ) {
    if ( is_admin() || ! $query->is_main_query() ) return;
    if ( $query->is_archive() && ! $query->is_search() ) {
        $query->set( 'posts_per_page', 8 );
    }
} );

/* ============================================================
 * Body class custom — divergir dos siblings da rede
 * ============================================================ */
add_filter( 'body_class', function ( $classes ) {
    $classes[] = 'cc-body';
    $classes[] = 'cc-zine-mode';
    // Se houver wp-custom-logo, remover (3 siblings têm)
    return array_diff( $classes, array( 'wp-custom-logo' ) );
} );

/* ============================================================
 * Lazy loading desativado na home (regra 3)
 * ============================================================ */
add_filter( 'wp_lazy_loading_enabled', function ( $default, $tag, $context ) {
    if ( is_front_page() || is_home() ) return false;
    return $default;
}, 10, 3 );
add_filter( 'wp_get_attachment_image_attributes', function ( $attr ) {
    if ( is_front_page() || is_home() ) {
        $attr['loading']  = 'eager';
        $attr['decoding'] = 'async';
    }
    return $attr;
}, 99 );

/* ============================================================
 * Schema — Magazine + WebSite (estrutura distinta dos siblings;
 * ebookcult tem Blog+BlogPosting; oie/incast/rde têm CollectionPage+ItemList;
 * cameracotidiana usa "Magazine" como tipo principal, único na rede).
 * ============================================================ */
add_action( 'wp_head', function () {
    if ( ! ( is_front_page() || is_home() ) ) return;

    $authors = array();
    $authors_q = get_users( array( 'has_published_posts' => array( 'post' ), 'number' => 5 ) );
    foreach ( $authors_q as $a ) {
        $authors[] = array(
            '@type' => 'Person',
            'name'  => $a->display_name,
        );
    }

    $schema = array(
        '@context'    => 'https://schema.org',
        '@type'       => array( 'WebSite', 'PublishingArticle' ),
        'name'        => get_bloginfo( 'name' ),
        'url'         => home_url( '/' ),
        'description' => get_bloginfo( 'description' ),
        'inLanguage'  => 'pt-BR',
        'genre'       => array( 'editorial', 'reportage', 'lifestyle', 'cultura' ),
        'audience'    => array(
            '@type'        => 'Audience',
            'audienceType' => 'Brazilian readers — lifestyle and culture',
        ),
        'author'      => $authors,
    );
    echo "\n<script type=\"application/ld+json\">" . wp_json_encode( $schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . "</script>\n";
} );

add_filter( 'excerpt_length', function () { return 32; } );
add_filter( 'excerpt_more',   function () { return '…'; } );

/* ============================================================
 * Slim WP core (regra 12)
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
        if ( $jq->deps ) $jq->deps = array_diff( $jq->deps, array( 'jquery-migrate' ) );
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
    ) as $h ) wp_dequeue_style( $h );
}, 200 );
remove_action( 'wp_enqueue_scripts', 'wp_enqueue_global_styles' );
remove_action( 'wp_footer', 'wp_enqueue_global_styles', 1 );
remove_action( 'wp_body_open', 'wp_global_styles_render_svg_filters' );

/* ============================================================
 * AdSense set B — manual placement (no auto_ads).
 * Apenas o script async no head; slots inline são inseridos
 * pelos templates (in-article every_5_paras via cc_render_with_inline_extras).
 * ============================================================ */
add_action( 'wp_head', function () {
    echo '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' . esc_attr( CC_ADSENSE_CLIENT ) . '" crossorigin="anonymous"></script>' . "\n";
    echo '<meta name="google-adsense-account" content="' . esc_attr( CC_ADSENSE_CLIENT ) . '">' . "\n";
}, 1 );

/* ============================================================
 * Meta description fallback
 * ============================================================ */
add_action( 'wp_head', 'cc_meta_description_fallback', 9999 );
function cc_meta_description_fallback() {
    if ( defined( 'RANK_MATH_VERSION' ) || defined( 'WPSEO_VERSION' ) || defined( 'AIOSEO_VERSION' ) ) return;
    if ( is_singular() ) {
        $desc = get_the_excerpt();
    } elseif ( is_category() || is_tag() ) {
        $desc = term_description();
    } elseif ( is_search() ) {
        $desc = sprintf( 'Resultados da busca por "%s" em %s.', get_search_query(), get_bloginfo( 'name' ) );
    } else {
        $desc = get_bloginfo( 'description' );
    }
    $desc = wp_trim_words( wp_strip_all_tags( (string) $desc ), 28, '…' );
    if ( $desc ) {
        echo '<meta name="description" content="' . esc_attr( $desc ) . '">' . "\n";
    }
}

/* ============================================================
 * robots.txt customizado — voz própria, AI bot disallow
 * ============================================================ */
add_filter( 'robots_txt', function ( $output ) {
    // Trocar diretiva não-padrão "News Sitemap:" do RankMath News por "Sitemap:" válido
    $output = preg_replace( '/^News Sitemap:/mi', 'Sitemap:', $output );
    // Forçar https em todas as URLs Sitemap (Google rejeita http quando o site é https)
    $output = preg_replace_callback(
        '#^Sitemap:\s*(http://)([^\s]+)#mi',
        function ( $m ) { return 'Sitemap: https://' . $m[2]; },
        $output
    );

    $header  = "# camera cotidiana - caderno de campo digital desde 2018\n";
    $header .= "# pequenos ensaios sobre o que se ve todo dia, redacao propria\n";
    $header .= "# proponha pauta em /contato/\n\n";

    $extra  = "\n";
    $extra .= "User-agent: Bingbot\nCrawl-delay: 3\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php\n\n";
    $extra .= "User-agent: Yandex\nCrawl-delay: 5\nDisallow: /wp-admin/\n\n";
    $extra .= "User-agent: GPTBot\nDisallow: /\n\n";
    $extra .= "User-agent: CCBot\nDisallow: /\n\n";
    $extra .= "User-agent: anthropic-ai\nDisallow: /\n\n";
    $extra .= "User-agent: Claude-Web\nDisallow: /\n\n";

    return $header . trim( $output ) . $extra;
}, 99, 1 );

/* ============================================================
 * Favicon SVG inline — sobrepõe favicon legacy do WP/smart-mag.
 * Glyph: aperture/lens (combina com tema fotografia).
 * Prioridade -1 garante que aparece ANTES do site_icon do WP.
 * ============================================================ */
add_action( 'wp_head', function () {
    $svg  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">';
    $svg .= '<rect width="32" height="32" fill="#FAF8F2"/>';
    $svg .= '<circle cx="16" cy="16" r="11.5" fill="none" stroke="#1A1816" stroke-width="2"/>';
    $svg .= '<circle cx="16" cy="16" r="4" fill="#B23E18"/>';
    $svg .= '</svg>';
    $data = 'data:image/svg+xml;base64,' . base64_encode( $svg );
    echo '<link rel="icon" type="image/svg+xml" href="' . esc_attr( $data ) . '">' . "\n";
    echo '<link rel="alternate icon" type="image/svg+xml" href="' . esc_attr( $data ) . '">' . "\n";
    echo '<link rel="apple-touch-icon" href="' . esc_attr( $data ) . '">' . "\n";
    echo '<meta name="theme-color" content="#FAF8F2">' . "\n";
}, -1 );

/* Remove o site_icon WP padrão (que ainda aponta pro favicon do smart-mag) */
remove_action( 'wp_head', 'wp_site_icon', 99 );
add_filter( 'get_site_icon_url', '__return_empty_string', 99 );

/* "Skip to content" pt-BR */
add_filter( 'gettext', function ( $translated, $original, $domain ) {
    if ( $original === 'Skip to content' ) return 'Pular para o conteúdo';
    return $translated;
}, 99, 3 );

/* ============================================================
 * Form de contato — Câmera Cotidiana (carta para a redação).
 *
 * Como ainda não foi confirmado se o domínio cameracotidiana.com.br tem
 * Cloudflare Email Routing configurado, a redação roteia para a inbox do
 * oiempreendedores.com.br com prefixo [CAMERA] no assunto.
 * Quando configurado o roteamento próprio, alterar CC_REDACAO_TO.
 * ============================================================ */
define( 'CC_REDACAO_TO',  'contato@oiempreendedores.com.br' );
define( 'CC_REDACAO_TAG', '[CAMERA]' );

add_action( 'init', 'cc_handle_proposta_form' );
function cc_handle_proposta_form() {
    if ( empty( $_POST['cc_envio_proposta'] ) || $_POST['cc_envio_proposta'] !== 'enviar' ) return;

    $back = function ( $e, $detalhe = '' ) {
        $u = add_query_arg( array(
            'e'       => $e,
            'detalhe' => $detalhe ? rawurlencode( $detalhe ) : null,
        ), wp_get_referer() ?: home_url( '/contato/' ) );
        wp_safe_redirect( $u );
        exit;
    };

    if ( ! wp_verify_nonce( $_POST['cc_proposta_nonce'] ?? '', 'cc_proposta' ) ) {
        $back( 'falhou', 'Sessão expirou. Recarregue a página.' );
    }
    if ( ! empty( $_POST['numero_whatsapp'] ) ) { $back( 'recebido' ); } // honeypot silent
    $elapsed = time() - (int) ( $_POST['cc_proposta_ts'] ?? 0 );
    if ( $elapsed < 3 || $elapsed > 3600 ) { $back( 'recebido' ); }

    $ip  = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '0';
    $key = 'cc_pauta_' . md5( $ip );
    if ( get_transient( $key ) ) { $back( 'falhou', 'Aguarde alguns minutos antes de enviar outra carta.' ); }

    $signatario = sanitize_text_field( wp_unslash( $_POST['signatario']     ?? '' ) );
    $email      = sanitize_email(      wp_unslash( $_POST['caixa_postal']   ?? '' ) );
    $cidade     = sanitize_text_field( wp_unslash( $_POST['cidade_origem']  ?? '' ) );
    $natureza   = sanitize_key(        wp_unslash( $_POST['natureza']       ?? '' ) );
    $conteudo   = sanitize_textarea_field( wp_unslash( $_POST['conteudo']   ?? '' ) );

    $valid_naturezas = array( 'pauta', 'ensaio', 'retrato', 'correcao', 'parceria', 'outro' );
    if ( ! $signatario || ! is_email( $email ) || ! in_array( $natureza, $valid_naturezas, true ) ) {
        $back( 'falhou', 'Preencha os campos obrigatórios corretamente.' );
    }
    $len = mb_strlen( $conteudo );
    if ( $len < 40 || $len > 4000 ) {
        $back( 'falhou', 'O conteúdo precisa ter entre 40 e 4000 caracteres.' );
    }
    if ( preg_match_all( '#https?://#i', $conteudo ) > 3 ) {
        set_transient( $key, '1', 5 * MINUTE_IN_SECONDS );
        $back( 'falhou', 'Mensagem com excesso de links (máximo 3).' );
    }

    $labels = array(
        'pauta'    => 'Sugestão de pauta',
        'ensaio'   => 'Submissão de ensaio',
        'retrato'  => 'Retrato de cidade',
        'correcao' => 'Correção em texto publicado',
        'parceria' => 'Parceria editorial',
        'outro'    => 'Outro',
    );

    $body  = "Carta para a redação Câmera Cotidiana\n";
    $body .= str_repeat( '=', 60 ) . "\n\n";
    $body .= "Signatário: {$signatario}\n";
    $body .= "E-mail:     {$email}\n";
    if ( $cidade ) { $body .= "Cidade:     {$cidade}\n"; }
    $body .= "Natureza:   " . $labels[ $natureza ] . "\n";
    $body .= "IP:         {$ip}\n\n";
    $body .= str_repeat( '-', 60 ) . "\n\n";
    $body .= $conteudo;
    $body .= "\n\n" . str_repeat( '=', 60 ) . "\n";
    $body .= 'Expedida em ' . wp_date( 'd/m/Y H:i:s' );

    $subject = sprintf( '%s [%s] %s — %s',
        CC_REDACAO_TAG,                  // [CAMERA]
        get_bloginfo( 'name' ),           // [Câmera Cotidiana]
        $labels[ $natureza ],
        $signatario
    );

    $sent = wp_mail(
        CC_REDACAO_TO,
        $subject,
        "*** ESTE EMAIL VEIO DO PORTAL CAMERACOTIDIANA.COM.BR ***\n"
        . "*** (form roteado para oiempreendedores via mailer único QMIX) ***\n\n"
        . $body,
        array(
            'Reply-To: ' . $signatario . ' <' . $email . '>',
            'Content-Type: text/plain; charset=UTF-8',
            'X-CC-Origin: cameracotidiana.com.br',
        )
    );

    if ( $sent ) {
        set_transient( $key, '1', 5 * MINUTE_IN_SECONDS );
        $back( 'recebido' );
    } else {
        $back( 'falhou', 'Falha temporária no envio. Tente novamente em alguns minutos.' );
    }
}

/* ============================================================
 * Magic login (acesso temporário sem alterar senha)
 * URL: /?cc_magic=1&u=USERID&k=KEY  (KEY criada via wp eval)
 * Validade: 15 min, single-use.
 * ============================================================ */
add_action( 'init', function () {
    if ( empty( $_GET['cc_magic'] ) || empty( $_GET['u'] ) || empty( $_GET['k'] ) ) return;
    if ( is_user_logged_in() ) return;
    $user_id = (int) $_GET['u'];
    $key     = (string) $_GET['k'];
    $stored  = get_user_meta( $user_id, 'cc_magic_login', true );
    if ( ! $stored || strpos( $stored, ':' ) === false ) return;
    list( $ts, $hash ) = explode( ':', $stored, 2 );
    if ( ( time() - (int) $ts ) > 900 ) {
        delete_user_meta( $user_id, 'cc_magic_login' );
        return;
    }
    if ( ! wp_check_password( $key, $hash ) ) return;
    delete_user_meta( $user_id, 'cc_magic_login' );
    wp_clear_auth_cookie();
    wp_set_current_user( $user_id );
    wp_set_auth_cookie( $user_id, false, is_ssl() );
    wp_safe_redirect( admin_url() );
    exit;
} );
