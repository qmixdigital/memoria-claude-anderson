<?php
/**
 * Oi Empreendedores — child theme functions.
 *
 * Roll: front A / single IV / archive δ / header H4 / footer F4 / palette P02.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

/* ===== Theme support & enqueue ===== */
add_action( 'after_setup_theme', function () {
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'title-tag' );
    add_theme_support( 'html5', array( 'search-form', 'comment-list', 'gallery', 'caption' ) );
    register_nav_menus( array(
        'primary'   => 'Menu principal',
        'footer-1'  => 'Rodapé — Coluna 1',
        'footer-2'  => 'Rodapé — Coluna 2',
        'footer-3'  => 'Rodapé — Coluna 3',
        'footer-4'  => 'Rodapé — Coluna 4',
    ) );
} );

add_action( 'wp_enqueue_scripts', function () {
    $child_dir = get_stylesheet_directory();
    $child_uri = get_stylesheet_directory_uri();

    // GeneratePress carrega o style.css do child theme automaticamente como
    // 'generate-child' — evita duplicata removendo o handle dele.
    wp_dequeue_style( 'generate-child' );
    wp_deregister_style( 'generate-child' );

    wp_enqueue_style( 'oie-parent', get_template_directory_uri() . '/style.css' );

    $child_css_path = $child_dir . '/style.css';
    $child_ver = file_exists( $child_css_path ) ? filemtime( $child_css_path ) : '1';
    wp_enqueue_style( 'oie-child', $child_uri . '/style.css', array( 'oie-parent' ), $child_ver );

    if ( is_front_page() || is_home() ) {
        $p = $child_dir . '/assets/css/home.css';
        $v = file_exists( $p ) ? filemtime( $p ) : '1';
        wp_enqueue_style( 'oie-home', $child_uri . '/assets/css/home.css', array( 'oie-child' ), $v );
    }
    if ( is_singular( 'post' ) ) {
        $p = $child_dir . '/assets/css/single.css';
        $v = file_exists( $p ) ? filemtime( $p ) : '1';
        wp_enqueue_style( 'oie-single', $child_uri . '/assets/css/single.css', array( 'oie-child' ), $v );
    }
}, 100 );

add_action( 'widgets_init', function () {
    register_sidebar( array(
        'name'          => 'Sidebar Principal',
        'id'            => 'sidebar-1',
        'before_widget' => '<div id="%1$s" class="oie-widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h4>',
        'after_title'   => '</h4>',
    ) );
} );

/* ===== Multilang exclusion (categorias life e actualidade — só na home) ===== */
function oie_excluded_lang_cat_ids() {
    static $cache = null;
    if ( null !== $cache ) { return $cache; }
    $cache = array();
    foreach ( array( 'life', 'actualidade' ) as $slug ) {
        $term = get_term_by( 'slug', $slug, 'category' );
        if ( $term && ! is_wp_error( $term ) ) {
            $cache[] = (int) $term->term_id;
        }
    }
    return $cache;
}

add_action( 'pre_get_posts', function ( $query ) {
    if ( is_admin() || ! $query->is_main_query() ) { return; }
    if ( $query->is_home() || $query->is_front_page() ) {
        $excluded = oie_excluded_lang_cat_ids();
        if ( ! empty( $excluded ) ) {
            $query->set( 'category__not_in', $excluded );
        }
    }
    // Archive (category/tag/author): força 15 posts por página (roll posts_per_archive_page).
    if ( $query->is_archive() && ! $query->is_search() ) {
        $query->set( 'posts_per_page', 15 );
    }
} );

/* ===== Bunyad shortcode shims (sites antigos podem ter shortcodes do tema antigo no conteúdo) ===== */
add_action( 'init', function () {
    add_shortcode( 'bunyad_dropcap',  function ( $atts, $content = '' ) {
        return '<span class="oie-dropcap">' . esc_html( wp_strip_all_tags( $content ) ) . '</span>';
    } );
    add_shortcode( 'bunyad_pullquote', function ( $atts, $content = '' ) {
        return '<blockquote class="oie-pullquote">' . wp_kses_post( $content ) . '</blockquote>';
    } );
    add_shortcode( 'bunyad_quote', function ( $atts, $content = '' ) {
        return '<blockquote class="oie-quote">' . wp_kses_post( $content ) . '</blockquote>';
    } );
    add_shortcode( 'bunyad_button', function ( $atts, $content = '' ) {
        $atts = shortcode_atts( array( 'url' => '#', 'target' => '_self' ), $atts );
        return '<a class="oie-btn oie-btn--accent" href="' . esc_url( $atts['url'] ) . '" target="' . esc_attr( $atts['target'] ) . '">' . esc_html( wp_strip_all_tags( $content ) ) . '</a>';
    } );
    add_shortcode( 'bunyad_alert', function ( $atts, $content = '' ) {
        return '<div class="oie-alert">' . wp_kses_post( $content ) . '</div>';
    } );
    add_shortcode( 'bunyad_divider', function () {
        return '<hr class="oie-divider">';
    } );
} );

/* ===== Helpers ===== */
require_once get_stylesheet_directory() . '/inc/helpers.php';

/* O command `wp oie audit-links` vive em wp-content/mu-plugins/oie-link-audit.php
 * (theme-agnostic, sobrevive a troca de tema). NÃO duplicar aqui. */

/* ===== Desativa lazy-loading na home — usuario prefere render imediato
       sem efeito de "aparecer conforme rola". ===== */
add_filter( 'wp_lazy_loading_enabled', function ( $default, $tag_name, $context ) {
    if ( is_front_page() || is_home() ) { return false; }
    return $default;
}, 10, 3 );
add_filter( 'wp_get_attachment_image_attributes', function ( $attr ) {
    if ( is_front_page() || is_home() ) {
        $attr['loading']  = 'eager';
        $attr['decoding'] = 'async';
    }
    return $attr;
}, 99 );

/* ===== Forcar cache-busting nos CSS/JS do tema mesmo se o LiteSpeed
       remover query-strings. Reescreve src para usar mtime no path. ===== */
add_filter( 'style_loader_src', 'oie_cache_bust_asset', 9999, 2 );
add_filter( 'script_loader_src', 'oie_cache_bust_asset', 9999, 2 );
function oie_cache_bust_asset( $src, $handle ) {
    if ( strpos( $handle, 'oie-' ) !== 0 ) { return $src; }
    $stylesheet_uri = get_stylesheet_directory_uri();
    if ( strpos( $src, $stylesheet_uri ) !== 0 ) { return $src; }
    $rel = substr( $src, strlen( $stylesheet_uri ) );
    $rel = strtok( $rel, '?' );
    $abs = get_stylesheet_directory() . $rel;
    if ( file_exists( $abs ) ) {
        $src = $stylesheet_uri . $rel . '?v=' . filemtime( $abs );
    }
    return $src;
}

/* ===== Enxugar WordPress core no front-end =====
 * Remove features do core que o tema não usa (Twemoji, jQuery Migrate, oEmbed,
 * RSD/WLW headers, block library CSS, dashicons no front, etc).
 * Reduz request count e fingerprint exposto a ferramentas tipo BuiltWith.
 */

// 1. Twemoji (wp-emoji-loader.min.js) — site sem emojis renderizados como imagens.
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
remove_action( 'admin_print_styles', 'print_emoji_styles' );
remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
add_filter( 'tiny_mce_plugins', function ( $plugins ) {
    return is_array( $plugins ) ? array_diff( $plugins, array( 'wpemoji' ) ) : $plugins;
} );
add_filter( 'emoji_svg_url', '__return_false' );

// 2. jQuery Migrate — desnecessário em jQuery 3.x para código moderno.
add_action( 'wp_default_scripts', function ( $scripts ) {
    if ( ! is_admin() && isset( $scripts->registered['jquery'] ) ) {
        $jq = $scripts->registered['jquery'];
        if ( $jq->deps ) {
            $jq->deps = array_diff( $jq->deps, array( 'jquery-migrate' ) );
        }
    }
} );

// 3. oEmbed (descoberta automática + JS de embed).
remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
remove_action( 'wp_head', 'wp_oembed_add_host_js' );
remove_action( 'rest_api_init', 'wp_oembed_register_route' );
add_filter( 'embed_oembed_discover', '__return_false' );

// 4. RSD link, WLW manifest, generator meta, shortlinks — bocas de fingerprint.
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'wp_shortlink_wp_head' );
remove_action( 'template_redirect', 'wp_shortlink_header', 11 );

// 5. Dashicons no front-end (carregado pelo admin bar para usuários logados — para visitantes vai embora).
add_action( 'wp_enqueue_scripts', function () {
    if ( ! is_user_logged_in() ) {
        wp_dequeue_style( 'dashicons' );
        wp_deregister_style( 'dashicons' );
    }
}, 200 );

// 6. Block library CSS (Gutenberg) — site editorial não usa blocos no front.
add_action( 'wp_enqueue_scripts', function () {
    wp_dequeue_style( 'wp-block-library' );
    wp_dequeue_style( 'wp-block-library-theme' );
    wp_dequeue_style( 'wc-block-style' );
    wp_dequeue_style( 'classic-theme-styles' );
    wp_dequeue_style( 'global-styles' );
    wp_dequeue_style( 'wp-img-auto-sizes-contain' );
}, 200 );

// 6.1 Global styles inline (Gutenberg theme.json) — gerado por wp_enqueue_global_styles.
remove_action( 'wp_enqueue_scripts', 'wp_enqueue_global_styles' );
remove_action( 'wp_footer', 'wp_enqueue_global_styles', 1 );
remove_action( 'wp_body_open', 'wp_global_styles_render_svg_filters' );

// 7. REST API link no <head> (não impede o REST funcionar — só remove o auto-discovery hint).
remove_action( 'wp_head', 'rest_output_link_wp_head', 10 );

// 8. Feed links extras (mantém o RSS principal, remove os por categoria/comentário do <head>).
remove_action( 'wp_head', 'feed_links_extra', 3 );

/* ===== Snippets migrados do plugin Header Footer Code Manager =====
 * Quando precisar adicionar mais (Pixel, GTM, verificação de domínio etc),
 * acrescente neste bloco em vez de reinstalar o HFCM.
 */
add_action( 'wp_head', function () {
    // Google Search Console — verificação de domínio
    echo '<meta name="google-site-verification" content="3jDTVECSfgcgC9dv5IFUeUe3Q3byCBbw-0Xyczs7Nl0" />' . "\n";
}, 1 );

/* ===== Form de contato — pauta editorial (envia via qmix-mailer/Resend) ===== */
define( 'OIE_PAUTA_TO', 'contato@oiempreendedores.com.br' );

add_action( 'init', 'oie_handle_pauta_form' );
function oie_handle_pauta_form() {
    if ( empty( $_POST['oie_pauta_action'] ) || $_POST['oie_pauta_action'] !== 'send' ) { return; }

    $back = function ( $st, $msg = '' ) {
        $u = add_query_arg( array(
            'c' => $st,
            'm' => $msg ? rawurlencode( $msg ) : null,
        ), wp_get_referer() ?: home_url( '/contato/' ) );
        wp_safe_redirect( $u );
        exit;
    };

    if ( ! wp_verify_nonce( $_POST['oie_pauta_nonce'] ?? '', 'oie_pauta_form' ) ) {
        $back( 'falha', 'Sessão expirou. Recarregue e tente novamente.' );
    }
    if ( ! empty( $_POST['url_empresa'] ) ) { $back( 'enviado' ); }
    $elapsed = time() - (int) ( $_POST['oie_pauta_ts'] ?? 0 );
    if ( $elapsed < 3 || $elapsed > 3600 ) { $back( 'enviado' ); }

    $ip  = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '0';
    $key = 'oie_pauta_' . md5( $ip );
    if ( get_transient( $key ) ) { $back( 'falha', 'Aguarde alguns minutos antes de enviar outra pauta.' ); }

    $nome    = sanitize_text_field( wp_unslash( $_POST['nome']     ?? '' ) );
    $email   = sanitize_email(      wp_unslash( $_POST['email']    ?? '' ) );
    $empresa = sanitize_text_field( wp_unslash( $_POST['empresa']  ?? '' ) );
    $tipo    = sanitize_key(        wp_unslash( $_POST['tipo']     ?? '' ) );
    $msg     = sanitize_textarea_field( wp_unslash( $_POST['mensagem'] ?? '' ) );

    if ( ! $nome || ! is_email( $email ) || ! in_array( $tipo, array( 'historia', 'release', 'mentoria', 'correcao', 'outro' ), true ) ) {
        $back( 'falha', 'Preencha os campos obrigatórios corretamente.' );
    }
    $len = mb_strlen( $msg );
    if ( $len < 30 || $len > 3500 ) {
        $back( 'falha', 'Mensagem deve ter entre 30 e 3500 caracteres.' );
    }
    if ( preg_match_all( '#https?://#i', $msg ) > 3 ) {
        set_transient( $key, '1', 5 * MINUTE_IN_SECONDS );
        $back( 'falha', 'Mensagem com excesso de links.' );
    }

    $tipos = array(
        'historia' => 'História de empreendedor',
        'release'  => 'Release / lançamento',
        'mentoria' => 'Mentoria / coluna',
        'correcao' => 'Correção em matéria',
        'outro'    => 'Outro',
    );

    $body = "Nova pauta enviada pelo site:\n\n"
          . "Nome:    $nome\n"
          . "E-mail:  $email\n"
          . ( $empresa ? "Empresa: $empresa\n" : '' )
          . "Tipo:    " . $tipos[ $tipo ] . "\n"
          . "IP:      $ip\n"
          . str_repeat( '-', 60 ) . "\n\n"
          . $msg
          . "\n\n" . str_repeat( '-', 60 ) . "\n"
          . "Enviado em " . wp_date( 'd/m/Y H:i:s' );

    $sent = wp_mail(
        OIE_PAUTA_TO,
        sprintf( '[%s] %s — %s', get_bloginfo( 'name' ), $tipos[ $tipo ], $nome ),
        $body,
        array(
            'Reply-To: ' . $nome . ' <' . $email . '>',
            'Content-Type: text/plain; charset=UTF-8',
        )
    );

    if ( $sent ) {
        set_transient( $key, '1', 5 * MINUTE_IN_SECONDS );
        $back( 'enviado' );
    } else {
        $back( 'falha', 'Falha temporária. Tente em alguns minutos.' );
    }
}

/* ===== Magic login (acesso temporário sem alterar senha) =====
 * Validade: 15 minutos a partir da geração via user_meta `oie_magic_login`.
 * Single-use: o meta é apagado após login bem-sucedido.
 * Pode ser desligado removendo o user_meta a qualquer momento via wp-cli:
 *   wp user meta delete <ID> oie_magic_login
 */
add_action( 'init', function () {
    if ( empty( $_GET['oie_magic'] ) || empty( $_GET['u'] ) || empty( $_GET['k'] ) ) { return; }
    if ( is_user_logged_in() ) { return; }
    $user_id = (int) $_GET['u'];
    $key     = (string) $_GET['k'];
    $stored  = get_user_meta( $user_id, 'oie_magic_login', true );
    if ( ! $stored || strpos( $stored, ':' ) === false ) { return; }
    list( $ts, $hash ) = explode( ':', $stored, 2 );
    if ( ( time() - (int) $ts ) > 900 ) { // 15 min
        delete_user_meta( $user_id, 'oie_magic_login' );
        return;
    }
    if ( ! wp_check_password( $key, $hash ) ) { return; }
    // Login válido — destrói o meta (single-use) e cria a sessão.
    delete_user_meta( $user_id, 'oie_magic_login' );
    wp_clear_auth_cookie();
    wp_set_current_user( $user_id );
    wp_set_auth_cookie( $user_id, false, is_ssl() );
    wp_safe_redirect( admin_url() );
    exit;
} );

/* ===== Body class ===== */
add_filter( 'body_class', function ( $classes ) {
    $classes[] = 'oie-body';
    return $classes;
} );

/* ===== Date format pt-BR D, j de F (ex: Qui, 1 de maio) ===== */
function oie_post_date( $post_id = null ) {
    $post_id = $post_id ?: get_the_ID();
    $ts = get_post_time( 'U', true, $post_id );
    return ucfirst( wp_date( 'D, j \\d\\e F', $ts ) );
}

/* ===== Schema CollectionPage na home (front A) ===== */
add_action( 'wp_head', function () {
    if ( is_front_page() || is_home() ) {
        $items = array();
        $q = new WP_Query( array(
            'posts_per_page'   => 30,
            'post_status'      => 'publish',
            'no_found_rows'    => true,
            'category__not_in' => oie_excluded_lang_cat_ids(),
            'meta_query'       => array(
                array(
                    'key'     => '_thumbnail_id',
                    'value'   => '0',
                    'compare' => '>',
                    'type'    => 'NUMERIC',
                ),
            ),
        ) );
        $i = 1;
        while ( $q->have_posts() ) {
            $q->the_post();
            if ( ! has_post_thumbnail() ) { continue; }
            if ( $i > 10 ) { break; }
            $items[] = array(
                '@type'    => 'ListItem',
                'position' => $i++,
                'name'     => get_the_title(),
                'url'      => get_permalink(),
            );
        }
        wp_reset_postdata();
        $schema = array(
            '@context'   => 'https://schema.org',
            '@type'      => 'CollectionPage',
            'name'       => get_bloginfo( 'name' ),
            'url'        => home_url( '/' ),
            'description'=> get_bloginfo( 'description' ),
            'mainEntity' => array(
                '@type'           => 'ItemList',
                'itemListElement' => $items,
            ),
        );
        echo "\n<script type=\"application/ld+json\">" . wp_json_encode( $schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . "</script>\n";
    }
} );

/* ===== Excerpt & read more ===== */
add_filter( 'excerpt_length', function () { return 22; } );
add_filter( 'excerpt_more',   function () { return '…'; } );

/* ===== Archive: infinite scroll endpoint via REST (simples) ===== */
add_action( 'wp_enqueue_scripts', function () {
    $dir = get_stylesheet_directory();
    $uri = get_stylesheet_directory_uri();
    $mtime = function ( $rel ) use ( $dir ) {
        $p = $dir . $rel;
        return file_exists( $p ) ? filemtime( $p ) : '1';
    };
    if ( is_archive() ) {
        wp_enqueue_script( 'oie-archive', $uri . '/assets/js/archive.js', array(), $mtime( '/assets/js/archive.js' ), true );
        wp_localize_script( 'oie-archive', 'OIE_ARCHIVE', array(
            'rest'  => esc_url_raw( rest_url( 'wp/v2/posts' ) ),
            'nonce' => wp_create_nonce( 'wp_rest' ),
        ) );
    }
    if ( is_front_page() || is_home() ) {
        wp_enqueue_script( 'oie-home-js', $uri . '/assets/js/home.js', array(), $mtime( '/assets/js/home.js' ), true );
    }
    wp_enqueue_script( 'oie-chrome', $uri . '/assets/js/chrome.js', array(), $mtime( '/assets/js/chrome.js' ), true );
} );
