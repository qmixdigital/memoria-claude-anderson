<?php
/**
 * Incast — child theme functions.
 *
 * Roll: front B / single I / archive gamma / header H5 masthead / footer F2 4col
 * Palette P18, font_pairing F06, image_left cards, AdSense set A.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

/* ===== AdSense client ID ===== */
define( 'INCAST_ADSENSE_CLIENT', 'ca-pub-3880875536722698' );

/* ===== Theme support & menus ===== */
add_action( 'after_setup_theme', function () {
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'title-tag' );
    add_theme_support( 'html5', array( 'search-form', 'comment-list', 'gallery', 'caption' ) );
    register_nav_menus( array(
        'primary'  => 'Menu principal',
        'footer-1' => 'Rodapé — Coluna 1',
        'footer-2' => 'Rodapé — Coluna 2',
        'footer-3' => 'Rodapé — Coluna 3',
    ) );
    // Tamanho intermediário para slot do hero/single (~640px wide).
    add_image_size( 'ic-card', 800, 450, true );
    add_image_size( 'ic-hero', 1280, 720, true );
} );

/* ===== Enqueue com cache-bust filemtime + dequeue do auto-load do parent (Blocksy)
        + dequeue do main.min.css/page-title.min.css/main.js do Blocksy
        (o child theme tem CSS próprio completo, não precisa do bundle do Blocksy). ===== */
add_action( 'wp_enqueue_scripts', function () {
    $child_dir = get_stylesheet_directory();
    $child_uri = get_stylesheet_directory_uri();

    // Blocksy auto-enfileira: tirar TODOS para reduzir 16KB de CSS render-blocking.
    foreach ( array(
        'blocksy-child', 'ct-main-styles', 'ct-main-styles-pro',
        'blocksy-main-styles', 'blocksy-page-title-styles',
    ) as $h ) {
        wp_dequeue_style( $h );
        wp_deregister_style( $h );
    }
    foreach ( array( 'ct-scripts', 'blocksy-main-script' ) as $h ) {
        wp_dequeue_script( $h );
        wp_deregister_script( $h );
    }

    // Não enfileiramos o style.css do parent Blocksy — o child tem o próprio.
    $css = $child_dir . '/style.css';
    wp_enqueue_style( 'ic-child', $child_uri . '/style.css', array(),
        file_exists( $css ) ? filemtime( $css ) : '1' );

    if ( is_front_page() || is_home() ) {
        $p = $child_dir . '/assets/css/home.css';
        wp_enqueue_style( 'ic-home', $child_uri . '/assets/css/home.css', array( 'ic-child' ),
            file_exists( $p ) ? filemtime( $p ) : '1' );
    }
    if ( is_singular( 'post' ) ) {
        $p = $child_dir . '/assets/css/single.css';
        wp_enqueue_style( 'ic-single', $child_uri . '/assets/css/single.css', array( 'ic-child' ),
            file_exists( $p ) ? filemtime( $p ) : '1' );
    }
}, 100 );

/* Defer scripts do tema (não bloqueiam render). */
add_filter( 'script_loader_tag', function ( $tag, $handle ) {
    if ( strpos( $handle, 'ic-' ) === 0 && strpos( $tag, ' defer' ) === false ) {
        $tag = str_replace( '<script ', '<script defer ', $tag );
    }
    return $tag;
}, 10, 2 );

add_action( 'wp_enqueue_scripts', function () {
    $dir = get_stylesheet_directory();
    $uri = get_stylesheet_directory_uri();
    $mt  = function ( $rel ) use ( $dir ) {
        $p = $dir . $rel;
        return file_exists( $p ) ? filemtime( $p ) : '1';
    };
    if ( is_archive() ) {
        wp_enqueue_script( 'ic-archive', $uri . '/assets/js/archive.js', array(), $mt( '/assets/js/archive.js' ), true );
    }
    if ( is_front_page() || is_home() ) {
        wp_enqueue_script( 'ic-home', $uri . '/assets/js/home.js', array(), $mt( '/assets/js/home.js' ), true );
    }
    wp_enqueue_script( 'ic-chrome', $uri . '/assets/js/chrome.js', array(), $mt( '/assets/js/chrome.js' ), true );
} );

/* ===== Cache-bust forçado para sobreviver ao remove-query-strings do LiteSpeed ===== */
add_filter( 'style_loader_src',  'ic_cache_bust_asset', 9999, 2 );
add_filter( 'script_loader_src', 'ic_cache_bust_asset', 9999, 2 );
function ic_cache_bust_asset( $src, $handle ) {
    if ( strpos( $handle, 'ic-' ) !== 0 ) { return $src; }
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

/* ===== Sidebar registrada ===== */
add_action( 'widgets_init', function () {
    register_sidebar( array(
        'name'          => 'Sidebar Principal',
        'id'            => 'sidebar-1',
        'before_widget' => '<div id="%1$s" class="ic-widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h4>',
        'after_title'   => '</h4>',
    ) );
} );

/* ===== Multilang exclusion (Lifestyle category — só na home) ===== */
function ic_excluded_lang_cat_ids() {
    static $cache = null;
    if ( null !== $cache ) { return $cache; }
    $cache = array();
    foreach ( array( 'lifestyle' ) as $slug ) {
        $term = get_term_by( 'slug', $slug, 'category' );
        if ( $term && ! is_wp_error( $term ) ) { $cache[] = (int) $term->term_id; }
    }
    return $cache;
}
add_action( 'pre_get_posts', function ( $query ) {
    if ( is_admin() || ! $query->is_main_query() ) { return; }
    if ( $query->is_home() || $query->is_front_page() ) {
        $excl = ic_excluded_lang_cat_ids();
        if ( ! empty( $excl ) ) { $query->set( 'category__not_in', $excl ); }
    }
    if ( $query->is_archive() && ! $query->is_search() ) {
        $query->set( 'posts_per_page', 12 );
    }
} );

/* ===== Bunyad/SmartMag shortcode shims (posts antigos podem ter [bunyad_*]) ===== */
add_action( 'init', function () {
    add_shortcode( 'bunyad_dropcap',  function ( $atts, $content = '' ) {
        return '<span class="ic-dropcap">' . esc_html( wp_strip_all_tags( $content ) ) . '</span>';
    } );
    add_shortcode( 'bunyad_pullquote', function ( $atts, $content = '' ) {
        return '<blockquote class="ic-pullquote">' . wp_kses_post( $content ) . '</blockquote>';
    } );
    add_shortcode( 'bunyad_quote', function ( $atts, $content = '' ) {
        return '<blockquote>' . wp_kses_post( $content ) . '</blockquote>';
    } );
    add_shortcode( 'bunyad_button', function ( $atts, $content = '' ) {
        $atts = shortcode_atts( array( 'url' => '#', 'target' => '_self' ), $atts );
        return '<a class="ic-btn ic-btn--accent" href="' . esc_url( $atts['url'] ) . '" target="' . esc_attr( $atts['target'] ) . '">' . esc_html( wp_strip_all_tags( $content ) ) . '</a>';
    } );
    add_shortcode( 'bunyad_alert', function ( $atts, $content = '' ) {
        return '<div class="ic-alert">' . wp_kses_post( $content ) . '</div>';
    } );
    add_shortcode( 'bunyad_divider', function () { return '<hr>'; } );
} );

/* ===== Helpers ===== */
require_once get_stylesheet_directory() . '/inc/helpers.php';

/* ===== Body class ===== */
add_filter( 'body_class', function ( $classes ) {
    $classes[] = 'ic-body';
    return $classes;
} );

/* ===== Date format relative ===== */
function ic_post_date( $post_id = null ) {
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
    return ucfirst( wp_date( 'j \\d\\e F', $ts ) );
}

/* ===== Schema both — NewsMediaOrganization + CollectionPage ===== */
add_action( 'wp_head', function () {
    if ( is_front_page() || is_home() ) {
        $items = array();
        $q = new WP_Query( array(
            'posts_per_page'   => 30,
            'post_status'      => 'publish',
            'no_found_rows'    => true,
            'category__not_in' => ic_excluded_lang_cat_ids(),
            'meta_query'       => array(
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
            '@context'    => 'https://schema.org',
            '@graph'      => array(
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

add_filter( 'excerpt_length', function () { return 32; } );
add_filter( 'excerpt_more',   function () { return '…'; } );

/* ===== Lazy loading desativado na home (regra 3 da SKILL) ===== */
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

/* ===== Slim WP core (regra 12 da SKILL) ===== */

// Twemoji
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

// jQuery Migrate
add_action( 'wp_default_scripts', function ( $scripts ) {
    if ( ! is_admin() && isset( $scripts->registered['jquery'] ) ) {
        $jq = $scripts->registered['jquery'];
        if ( $jq->deps ) { $jq->deps = array_diff( $jq->deps, array( 'jquery-migrate' ) ); }
    }
} );

// oEmbed
remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
remove_action( 'wp_head', 'wp_oembed_add_host_js' );
remove_action( 'rest_api_init', 'wp_oembed_register_route' );
add_filter( 'embed_oembed_discover', '__return_false' );

// RSD/WLW/generator/shortlink/REST link/feed-extras
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'wp_shortlink_wp_head' );
remove_action( 'template_redirect', 'wp_shortlink_header', 11 );
remove_action( 'wp_head', 'rest_output_link_wp_head', 10 );
remove_action( 'wp_head', 'feed_links_extra', 3 );

// Dashicons no front (mantém para admin-bar de logado)
add_action( 'wp_enqueue_scripts', function () {
    if ( ! is_user_logged_in() ) {
        wp_dequeue_style( 'dashicons' );
        wp_deregister_style( 'dashicons' );
    }
}, 200 );

// Block library + classic-themes + global-styles
add_action( 'wp_enqueue_scripts', function () {
    foreach ( array(
        'wp-block-library', 'wp-block-library-theme', 'wc-block-style',
        'classic-theme-styles', 'global-styles', 'wp-img-auto-sizes-contain',
    ) as $h ) { wp_dequeue_style( $h ); }
}, 200 );
remove_action( 'wp_enqueue_scripts', 'wp_enqueue_global_styles' );
remove_action( 'wp_footer', 'wp_enqueue_global_styles', 1 );
remove_action( 'wp_body_open', 'wp_global_styles_render_svg_filters' );

/* ===== Snippets migrados de HFCM (incast não tinha) — bloco reservado para futuros pixels/verifications ===== */
add_action( 'wp_head', function () {
    // Adicionar aqui meta-verifications, GTM, Pixel etc no futuro.
}, 1 );

/* ===== Meta description fallback — só dispara se nenhum SEO plugin emitiu. */
add_filter( 'wp_robots', function ( $robots ) { return $robots; } );
add_action( 'wp_head', 'ic_meta_description_fallback', 9999 );
function ic_meta_description_fallback() {
    // Se o RankMath está ativo, ele cuida em prioridades anteriores. Sair.
    if ( defined( 'RANK_MATH_VERSION' ) ) { return; }
    if ( is_singular() ) {
        $desc = get_the_excerpt();
    } elseif ( is_category() || is_tag() ) {
        $desc = term_description();
    } elseif ( is_search() ) {
        $desc = sprintf( 'Resultados da busca por "%s" em %s.',
            get_search_query(), get_bloginfo( 'name' ) );
    } else {
        $desc = get_bloginfo( 'description' );
    }
    $desc = wp_trim_words( wp_strip_all_tags( (string) $desc ), 28, '…' );
    if ( $desc ) {
        echo '<meta name="description" content="' . esc_attr( $desc ) . '">' . "\n";
    }
}

/* ===== robots.txt — RankMath News injeta linha "News Sitemap:" não-padrão.
   Substituir por "Sitemap:" válido. */
add_filter( 'robots_txt', function ( $output ) {
    return preg_replace( '/^News Sitemap:/mi', 'Sitemap:', $output );
}, 99, 1 );

/* ===== Localizar "Skip to content" do parent theme para pt-BR. */
add_filter( 'gettext', function ( $translated, $original, $domain ) {
    if ( $original === 'Skip to content' ) { return 'Pular para o conteúdo'; }
    return $translated;
}, 99, 3 );

/* ===== Form de contato — fala com a redação (envia via qmix-mailer/Resend) =====
 * Como o domínio incast.com.br não tem Cloudflare Email Routing configurado,
 * os emails são roteados para a inbox do oiempreendedores.com.br com prefixo
 * [INCAST] no assunto para identificação fácil. Pode trocar para
 * contato@revistadeducao.com.br se preferir usar essa caixa.
 */
define( 'IC_REDACAO_TO', 'contato@oiempreendedores.com.br' );
define( 'IC_REDACAO_TAG', '[INCAST]' );

add_action( 'init', 'ic_handle_redacao_form' );
function ic_handle_redacao_form() {
    if ( empty( $_POST['ic_acao'] ) || $_POST['ic_acao'] !== 'enviar' ) { return; }

    $back = function ( $cf, $e = '' ) {
        $u = add_query_arg( array(
            'cf' => $cf,
            'e'  => $e ? rawurlencode( $e ) : null,
        ), wp_get_referer() ?: home_url( '/contato/' ) );
        wp_safe_redirect( $u );
        exit;
    };

    if ( ! wp_verify_nonce( $_POST['ic_nonce'] ?? '', 'ic_contato' ) ) {
        $back( '0', 'Sessão expirou. Recarregue a página.' );
    }
    if ( ! empty( $_POST['telefone_extra'] ) ) { $back( '1' ); }
    $elapsed = time() - (int) ( $_POST['ic_t'] ?? 0 );
    if ( $elapsed < 3 || $elapsed > 3600 ) { $back( '1' ); }

    $ip  = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '0';
    $key = 'ic_redacao_' . md5( $ip );
    if ( get_transient( $key ) ) { $back( '0', 'Aguarde alguns minutos antes de enviar outra mensagem.' ); }

    $quem      = sanitize_text_field( wp_unslash( $_POST['quem']           ?? '' ) );
    $email     = sanitize_email(      wp_unslash( $_POST['contato_email']  ?? '' ) );
    $programa  = sanitize_text_field( wp_unslash( $_POST['programa']       ?? '' ) );
    $categoria = sanitize_key(        wp_unslash( $_POST['categoria']      ?? '' ) );
    $corpo     = sanitize_textarea_field( wp_unslash( $_POST['corpo']      ?? '' ) );

    if ( ! $quem || ! is_email( $email ) || ! in_array( $categoria, array( 'dica', 'comentario', 'correcao', 'release', 'outro' ), true ) ) {
        $back( '0', 'Preencha os campos obrigatórios corretamente.' );
    }
    $len = mb_strlen( $corpo );
    if ( $len < 25 || $len > 3000 ) {
        $back( '0', 'Mensagem deve ter entre 25 e 3000 caracteres.' );
    }
    if ( preg_match_all( '#https?://#i', $corpo ) > 3 ) {
        set_transient( $key, '1', 5 * MINUTE_IN_SECONDS );
        $back( '0', 'Mensagem com excesso de links.' );
    }

    $cats = array(
        'dica'       => 'Dica de pauta',
        'comentario' => 'Comentário sobre matéria',
        'correcao'   => 'Correção / direito de resposta',
        'release'    => 'Press release',
        'outro'      => 'Outro',
    );

    $body = "Mensagem da redação:\n\n"
          . "De:        $quem\n"
          . "E-mail:    $email\n"
          . ( $programa ? "Programa:  $programa\n" : '' )
          . "Categoria: " . $cats[ $categoria ] . "\n"
          . "IP:        $ip\n"
          . str_repeat( '=', 60 ) . "\n\n"
          . $corpo
          . "\n\n" . str_repeat( '=', 60 ) . "\n"
          . wp_date( 'd/m/Y H:i:s' );

    // Subject com tag [INCAST] no início para visualização rápida no inbox.
    $subject = sprintf( '%s [%s] %s — %s',
        IC_REDACAO_TAG,                  // [INCAST]
        get_bloginfo( 'name' ),           // [Incast]
        $cats[ $categoria ],
        $quem
    );

    // Header X-RDE-Origin facilita filtros no Outlook (regra: "se header contém INCAST, mover pra pasta")
    $sent = wp_mail(
        IC_REDACAO_TO,
        $subject,
        "*** ESTE EMAIL VEIO DO PORTAL INCAST.COM.BR ***\n"
        . "*** (form roteado para oiempreendedores via mesmo domínio QMIX) ***\n\n"
        . $body,
        array(
            'Reply-To: ' . $quem . ' <' . $email . '>',
            'Content-Type: text/plain; charset=UTF-8',
            'X-RDE-Origin: incast.com.br',
        )
    );

    if ( $sent ) {
        set_transient( $key, '1', 5 * MINUTE_IN_SECONDS );
        $back( '1' );
    } else {
        $back( '0', 'Falha temporária. Tente novamente em alguns minutos.' );
    }
}

/* ===== Magic login (acesso temporário sem alterar senha) ===== */
add_action( 'init', function () {
    if ( empty( $_GET['ic_magic'] ) || empty( $_GET['u'] ) || empty( $_GET['k'] ) ) { return; }
    if ( is_user_logged_in() ) { return; }
    $user_id = (int) $_GET['u'];
    $key     = (string) $_GET['k'];
    $stored  = get_user_meta( $user_id, 'ic_magic_login', true );
    if ( ! $stored || strpos( $stored, ':' ) === false ) { return; }
    list( $ts, $hash ) = explode( ':', $stored, 2 );
    if ( ( time() - (int) $ts ) > 900 ) {
        delete_user_meta( $user_id, 'ic_magic_login' );
        return;
    }
    if ( ! wp_check_password( $key, $hash ) ) { return; }
    delete_user_meta( $user_id, 'ic_magic_login' );
    wp_clear_auth_cookie();
    wp_set_current_user( $user_id );
    wp_set_auth_cookie( $user_id, false, is_ssl() );
    wp_safe_redirect( admin_url() );
    exit;
} );
