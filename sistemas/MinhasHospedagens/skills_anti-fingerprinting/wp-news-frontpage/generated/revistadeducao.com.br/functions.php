<?php
/**
 * Revista de Educação — child theme functions.
 *
 * Roll: front C / single II_longform / archive alpha_dense_list / header H3 centered_split / footer F2 4col
 * Palette P12, font_pairing F05 (system_only), card overlay, hero bleed, AdSense set B (every_5_paras).
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'RDE_ADSENSE_CLIENT', 'ca-pub-3880875536722698' );

/* ===== Theme support & menus ===== */
add_action( 'after_setup_theme', function () {
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'title-tag' );
    add_theme_support( 'html5', array( 'search-form', 'comment-list', 'gallery', 'caption' ) );
    register_nav_menus( array(
        'primary'   => 'Menu principal',
        'footer-1'  => 'Rodapé — Coluna 1',
        'footer-2'  => 'Rodapé — Coluna 2',
        'footer-3'  => 'Rodapé — Coluna 3',
    ) );
    add_image_size( 'rde-card', 800, 343, true );  // 21:9
    add_image_size( 'rde-hero', 1600, 686, true );
} );

/* ===== Enqueue com cache-bust + dequeue do auto-load do parent (Kadence) ===== */
add_action( 'wp_enqueue_scripts', function () {
    $child_dir = get_stylesheet_directory();
    $child_uri = get_stylesheet_directory_uri();

    foreach ( array(
        'kadence-child', 'kadence-style', 'kadence-global',
        'kadence-fonts', 'kadence-icons', 'kadence-content', 'kadence-header',
    ) as $h ) {
        wp_dequeue_style( $h );
        wp_deregister_style( $h );
    }
    foreach ( array( 'kadence-script', 'kadence-toggle-js' ) as $h ) {
        wp_dequeue_script( $h );
        wp_deregister_script( $h );
    }

    $css = $child_dir . '/style.css';
    wp_enqueue_style( 'rde-child', $child_uri . '/style.css', array(),
        file_exists( $css ) ? filemtime( $css ) : '1' );

    if ( is_front_page() || is_home() ) {
        $p = $child_dir . '/assets/css/home.css';
        if ( file_exists( $p ) ) {
            wp_enqueue_style( 'rde-home', $child_uri . '/assets/css/home.css', array( 'rde-child' ), filemtime( $p ) );
        }
    }
    if ( is_singular( 'post' ) ) {
        $p = $child_dir . '/assets/css/single.css';
        if ( file_exists( $p ) ) {
            wp_enqueue_style( 'rde-single', $child_uri . '/assets/css/single.css', array( 'rde-child' ), filemtime( $p ) );
        }
    }
}, 100 );

add_action( 'wp_enqueue_scripts', function () {
    $dir = get_stylesheet_directory();
    $uri = get_stylesheet_directory_uri();
    $mt = function ( $rel ) use ( $dir ) {
        $p = $dir . $rel;
        return file_exists( $p ) ? filemtime( $p ) : '1';
    };
    wp_enqueue_script( 'rde-chrome', $uri . '/assets/js/chrome.js', array(), $mt( '/assets/js/chrome.js' ), true );
    if ( is_archive() ) {
        wp_enqueue_script( 'rde-archive', $uri . '/assets/js/archive.js', array(), $mt( '/assets/js/archive.js' ), true );
    }
} );

add_filter( 'script_loader_tag', function ( $tag, $handle ) {
    if ( strpos( $handle, 'rde-' ) === 0 && strpos( $tag, ' defer' ) === false ) {
        $tag = str_replace( '<script ', '<script defer ', $tag );
    }
    return $tag;
}, 10, 2 );

/* Cache-bust forçado contra remove-query-strings do LiteSpeed */
add_filter( 'style_loader_src',  'rde_cache_bust_asset', 9999, 2 );
add_filter( 'script_loader_src', 'rde_cache_bust_asset', 9999, 2 );
function rde_cache_bust_asset( $src, $handle ) {
    if ( strpos( $handle, 'rde-' ) !== 0 ) { return $src; }
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

/* ===== Sidebar ===== */
add_action( 'widgets_init', function () {
    register_sidebar( array(
        'name'          => 'Sidebar Principal',
        'id'            => 'sidebar-1',
        'before_widget' => '<div id="%1$s" class="rde-widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h4>',
        'after_title'   => '</h4>',
    ) );
} );

/* ===== pre_get_posts: posts_per_archive=15, no multilang exclusion (não há) ===== */
add_action( 'pre_get_posts', function ( $query ) {
    if ( is_admin() || ! $query->is_main_query() ) { return; }
    if ( $query->is_archive() && ! $query->is_search() ) {
        $query->set( 'posts_per_page', 15 );
    }
} );

/* ===== Bunyad/SmartMag shims ===== */
add_action( 'init', function () {
    add_shortcode( 'bunyad_dropcap',  function ( $atts, $content = '' ) {
        return '<span class="rde-dropcap">' . esc_html( wp_strip_all_tags( $content ) ) . '</span>';
    } );
    add_shortcode( 'bunyad_pullquote', function ( $atts, $content = '' ) {
        return '<blockquote class="rde-pullquote">' . wp_kses_post( $content ) . '</blockquote>';
    } );
    add_shortcode( 'bunyad_quote',  function ( $atts, $content = '' ) { return '<blockquote>' . wp_kses_post( $content ) . '</blockquote>'; } );
    add_shortcode( 'bunyad_button', function ( $atts, $content = '' ) {
        $atts = shortcode_atts( array( 'url' => '#', 'target' => '_self' ), $atts );
        return '<a class="rde-btn rde-btn--accent" href="' . esc_url( $atts['url'] ) . '" target="' . esc_attr( $atts['target'] ) . '">' . esc_html( wp_strip_all_tags( $content ) ) . '</a>';
    } );
    add_shortcode( 'bunyad_alert', function ( $atts, $content = '' ) { return '<div class="rde-alert">' . wp_kses_post( $content ) . '</div>'; } );
    add_shortcode( 'bunyad_divider', function () { return '<hr>'; } );
} );

/* ===== Helpers ===== */
require_once get_stylesheet_directory() . '/inc/helpers.php';

/* ===== Body class ===== */
add_filter( 'body_class', function ( $classes ) {
    $classes[] = 'rde-body';
    return $classes;
} );

/* ===== Date format relative ===== */
function rde_post_date( $post_id = null ) {
    $post_id = $post_id ?: get_the_ID();
    $ts      = get_post_time( 'U', true, $post_id );
    $diff    = time() - $ts;
    if ( $diff < HOUR_IN_SECONDS ) {
        $m = max( 1, floor( $diff / MINUTE_IN_SECONDS ) );
        return $m === 1 ? 'há 1 minuto' : "há $m minutos";
    }
    if ( $diff < DAY_IN_SECONDS ) {
        $h = floor( $diff / HOUR_IN_SECONDS );
        return $h === 1 ? 'há 1 hora' : "há $h horas";
    }
    if ( $diff < 7 * DAY_IN_SECONDS ) {
        $d = floor( $diff / DAY_IN_SECONDS );
        return $d === 1 ? 'há 1 dia' : "há $d dias";
    }
    return ucfirst( wp_date( 'j \\d\\e F \\d\\e Y', $ts ) );
}

/* ===== Schema both — NewsMediaOrganization + CollectionPage ===== */
add_action( 'wp_head', function () {
    if ( is_front_page() || is_home() ) {
        $items = array();
        $q = new WP_Query( array(
            'posts_per_page' => 30,
            'post_status'    => 'publish',
            'no_found_rows'  => true,
            'meta_query'     => array(
                array( 'key' => '_thumbnail_id', 'value' => '0', 'compare' => '>', 'type' => 'NUMERIC' ),
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
            '@context' => 'https://schema.org',
            '@graph'   => array(
                array(
                    '@type'       => 'NewsMediaOrganization',
                    'name'        => get_bloginfo( 'name' ),
                    'url'         => home_url( '/' ),
                    'description' => get_bloginfo( 'description' ),
                ),
                array(
                    '@type'      => 'CollectionPage',
                    'name'       => get_bloginfo( 'name' ),
                    'url'        => home_url( '/' ),
                    'mainEntity' => array(
                        '@type'           => 'ItemList',
                        'itemListElement' => $items,
                    ),
                ),
            ),
        );
        echo "\n<script type=\"application/ld+json\">" . wp_json_encode( $schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . "</script>\n";
    }
} );

add_filter( 'excerpt_length', function () { return 36; } );
add_filter( 'excerpt_more',   function () { return '…'; } );

/* ===== Lazy off na home (regra 3) ===== */
add_filter( 'wp_lazy_loading_enabled', function ( $default, $tag, $context ) {
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

/* ===== Slim WP core (regra 12) ===== */
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

/* ===== Snippets HFCM (vazio, reservado) ===== */
add_action( 'wp_head', function () { /* meta verifications futuras */ }, 1 );

/* ===== robots.txt: trocar "News Sitemap:" por "Sitemap:" válido ===== */
add_filter( 'robots_txt', function ( $output ) {
    return preg_replace( '/^News Sitemap:/mi', 'Sitemap:', $output );
}, 99 );

/* ===== Localizar Skip to content ===== */
add_filter( 'gettext', function ( $translated, $original ) {
    if ( $original === 'Skip to content' ) { return 'Pular para o conteúdo'; }
    return $translated;
}, 99, 2 );

/* ===== Meta description fallback ===== */
add_action( 'wp_head', 'rde_meta_description_fallback', 9999 );
function rde_meta_description_fallback() {
    if ( defined( 'RANK_MATH_VERSION' ) ) { return; }
    if ( is_singular() ) { $d = get_the_excerpt(); }
    elseif ( is_category() || is_tag() ) { $d = term_description(); }
    elseif ( is_search() ) { $d = sprintf( 'Resultados da busca por "%s" em %s.', get_search_query(), get_bloginfo( 'name' ) ); }
    else { $d = get_bloginfo( 'description' ); }
    $d = wp_trim_words( wp_strip_all_tags( (string) $d ), 28, '…' );
    if ( $d ) { echo '<meta name="description" content="' . esc_attr( $d ) . '">' . "\n"; }
}

/* ===== Formulário de contato nativo (sem plugin) =====
 * Email destinatário NUNCA aparece em HTML — só server-side via constante.
 * 5 camadas anti-spam:
 *   1. Nonce CSRF do WP        (rde_contact_nonce)
 *   2. Honeypot field "website" (humanos não veem; bots preenchem)
 *   3. Time-trap >= 3s          (submissão muito rápida = bot)
 *   4. Rate-limit por IP (5min) (transient com hash do IP)
 *   5. Sanitização rigorosa     (sanitize_email, sanitize_text_field, wp_kses)
 */
define( 'RDE_CONTACT_TO', 'contato@revistadeducao.com.br' );

add_action( 'init', 'rde_handle_contact_form' );
function rde_handle_contact_form() {
    if ( empty( $_POST['rde_contact_action'] ) || $_POST['rde_contact_action'] !== 'send' ) { return; }

    $referer  = wp_get_referer() ?: home_url( '/contato/' );
    $redirect = function ( $status, $msg = '' ) use ( $referer ) {
        $url = add_query_arg( array(
            'contato' => $status,
            'msg'     => $msg ? rawurlencode( $msg ) : null,
        ), $referer );
        wp_safe_redirect( $url . '#contato' );
        exit;
    };

    // 1) Nonce
    if ( ! isset( $_POST['rde_contact_nonce'] ) || ! wp_verify_nonce( $_POST['rde_contact_nonce'], 'rde_contact_form' ) ) {
        $redirect( 'erro', 'Sessão expirou. Recarregue a página e tente novamente.' );
    }

    // 2) Honeypot
    if ( ! empty( $_POST['website'] ) ) {
        // Não retorna mensagem específica para não vazar a heurística — fingimos sucesso.
        $redirect( 'ok' );
    }

    // 3) Time-trap
    $ts      = (int) ( $_POST['rde_contact_ts'] ?? 0 );
    $elapsed = time() - $ts;
    if ( $ts === 0 || $elapsed < 3 || $elapsed > 3600 ) {
        $redirect( 'ok' ); // finge sucesso para bot
    }

    // 4) Rate-limit por IP
    $ip   = isset( $_SERVER['HTTP_CF_CONNECTING_IP'] )
            ? $_SERVER['HTTP_CF_CONNECTING_IP']
            : ( $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0' );
    $key  = 'rde_contact_' . md5( $ip );
    if ( get_transient( $key ) ) {
        $redirect( 'erro', 'Aguarde alguns minutos antes de enviar outra mensagem.' );
    }

    // 5) Sanitização + validação
    $nome     = sanitize_text_field( wp_unslash( $_POST['nome']     ?? '' ) );
    $email    = sanitize_email(      wp_unslash( $_POST['email']    ?? '' ) );
    $assunto  = sanitize_key(        wp_unslash( $_POST['assunto']  ?? '' ) );
    $mensagem = sanitize_textarea_field( wp_unslash( $_POST['mensagem'] ?? '' ) );

    if ( ! $nome || mb_strlen( $nome ) > 100 ) {
        $redirect( 'erro', 'Informe um nome válido.' );
    }
    if ( ! is_email( $email ) ) {
        $redirect( 'erro', 'Informe um e-mail válido.' );
    }
    $allowed = array( 'pauta', 'release', 'correcao', 'parceria', 'outro' );
    if ( ! in_array( $assunto, $allowed, true ) ) {
        $redirect( 'erro', 'Selecione um assunto válido.' );
    }
    $len = mb_strlen( $mensagem );
    if ( $len < 20 || $len > 3000 ) {
        $redirect( 'erro', 'Mensagem deve ter entre 20 e 3000 caracteres.' );
    }

    // Heurísticas básicas anti-spam no conteúdo (links em excesso, palavras-âncora típicas)
    $links_count = preg_match_all( '#https?://#i', $mensagem );
    if ( $links_count > 3 ) {
        set_transient( $key, '1', 5 * MINUTE_IN_SECONDS );
        $redirect( 'erro', 'Mensagem com excesso de links. Reescreva sem URLs.' );
    }

    // Lista negra de palavras (português + inglês)
    $blacklist = array(
        'casino', 'viagra', 'crypto signal', 'forex bot', 'guest post',
        'comprar backlinks', 'seo expert', 'rank #1', 'pbn network',
    );
    foreach ( $blacklist as $w ) {
        if ( stripos( $mensagem, $w ) !== false ) {
            set_transient( $key, '1', 5 * MINUTE_IN_SECONDS );
            $redirect( 'ok' ); // finge sucesso, não vaza heurística
        }
    }

    // Mapa de assunto para subject legível
    $subjects = array(
        'pauta'    => 'Sugestão de pauta',
        'release'  => 'Release / press',
        'correcao' => 'Correção editorial',
        'parceria' => 'Parceria de conteúdo',
        'outro'    => 'Outro assunto',
    );
    $subject_label = $subjects[ $assunto ];

    // Monta e envia
    $to      = RDE_CONTACT_TO;
    $subject = sprintf( '[%s] %s — %s', get_bloginfo( 'name' ), $subject_label, $nome );
    $body    = "Novo contato pelo site:\n\n"
             . "Nome:    $nome\n"
             . "E-mail:  $email\n"
             . "Assunto: $subject_label\n"
             . "IP:      $ip\n"
             . "User-Agent: " . substr( $_SERVER['HTTP_USER_AGENT'] ?? '-', 0, 200 ) . "\n"
             . str_repeat( '-', 60 ) . "\n\n"
             . $mensagem
             . "\n\n" . str_repeat( '-', 60 ) . "\n"
             . "Enviado em: " . wp_date( 'd/m/Y H:i:s' )
             . "\nPágina: " . esc_url( home_url( '/contato/' ) );

    /* Headers — From SEM domínio próprio (evita SPF/DMARC fail no Outlook).
     * Hostverge (StackCP shared) tem rDNS válido para o hostname do servidor.
     * Deixar wp_mail usar o default seria "wordpress@<host-do-servidor>" — funciona,
     * mas fica feio. Solução: usar o e-mail admin do WP (que está validado lá fora)
     * como From, e o e-mail do visitante como Reply-To. */
    $admin_email = get_option( 'admin_email' );
    $headers = array(
        'From: ' . get_bloginfo( 'name' ) . ' <' . $admin_email . '>',
        'Reply-To: ' . $nome . ' <' . $email . '>',
        'Content-Type: text/plain; charset=UTF-8',
        'X-Mailer: WordPress/RDE-Contact',
    );

    // Capturar erro do PHPMailer caso falhe (logging em postmeta para debug).
    add_action( 'wp_mail_failed', function ( $error ) {
        if ( $error instanceof WP_Error ) {
            error_log( '[RDE_CONTACT] wp_mail_failed: ' . $error->get_error_message() );
        }
    } );

    // Forçar Return-Path (Sender) para o admin email — ajuda em Outlook/Hotmail.
    add_action( 'phpmailer_init', function ( $phpmailer ) use ( $admin_email ) {
        $phpmailer->Sender = $admin_email;
    } );

    $sent = wp_mail( $to, $subject, $body, $headers );

    if ( $sent ) {
        set_transient( $key, '1', 5 * MINUTE_IN_SECONDS );
        $redirect( 'ok' );
    } else {
        $redirect( 'erro', 'Falha temporária no envio. Tente novamente em alguns minutos.' );
    }
}

/* ===== Magic login (acesso temporário sem alterar senha) ===== */
add_action( 'init', function () {
    if ( empty( $_GET['rde_magic'] ) || empty( $_GET['u'] ) || empty( $_GET['k'] ) ) { return; }
    if ( is_user_logged_in() ) { return; }
    $user_id = (int) $_GET['u'];
    $key     = (string) $_GET['k'];
    $stored  = get_user_meta( $user_id, 'rde_magic_login', true );
    if ( ! $stored || strpos( $stored, ':' ) === false ) { return; }
    list( $ts, $hash ) = explode( ':', $stored, 2 );
    if ( ( time() - (int) $ts ) > 900 ) {
        delete_user_meta( $user_id, 'rde_magic_login' );
        return;
    }
    if ( ! wp_check_password( $key, $hash ) ) { return; }
    delete_user_meta( $user_id, 'rde_magic_login' );
    wp_clear_auth_cookie();
    wp_set_current_user( $user_id );
    wp_set_auth_cookie( $user_id, false, is_ssl() );
    wp_safe_redirect( admin_url() );
    exit;
} );
