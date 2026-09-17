<?php
/**
 * Ebookcult — child theme functions (Astra parent).
 *
 * Roll: front D feature-led / single II longform / archive alpha-dense
 *       header H2 single-row-compact / footer F4 mega
 *       palette P04 (energia laranja+azul) / font_pairing F20 (system-only)
 *       sharp radius / neumorphic shadows / AdSense set C (auto_ads)
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

/* ===== AdSense ===== */
define( 'EC_ADSENSE_CLIENT', 'ca-pub-3880875536722698' );

/* ===== Theme support & menus ===== */
add_action( 'after_setup_theme', function () {
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'title-tag' );
    add_theme_support( 'html5', array( 'search-form', 'comment-list', 'gallery', 'caption' ) );
    register_nav_menus( array(
        'primary'  => 'Menu principal',
        'footer-1' => 'Rodapé — Coluna 1',
    ) );
    add_image_size( 'ec-card', 800, 800, true );  // 1:1
    add_image_size( 'ec-hero', 1280, 800, true ); // 16:10
} );

/* ============================================================
 * Enqueue — child has full CSS, dequeue Astra's bundle to avoid
 * 30KB of render-blocking it doesn't need. Filemtime cache-bust.
 * ============================================================ */
add_action( 'wp_enqueue_scripts', function () {
    $child_dir = get_stylesheet_directory();
    $child_uri = get_stylesheet_directory_uri();

    // Astra enfileira:
    //   astra-theme-css        (style.css principal do parent)
    //   astra-theme-css-inline (CSS inline gerado por customizer)
    //   astra-google-fonts (se houver)
    // Mantemos o handle 'astra-theme-css' como dependência do child para
    // garantir cascata correta, mas dequeueamos os bundles JS pesados.
    foreach ( array( 'astra-theme-js', 'astra-flexibility' ) as $h ) {
        wp_dequeue_script( $h );
        wp_deregister_script( $h );
    }

    // Astra Google Fonts: o child usa font-strategy=system_only, não precisa.
    foreach ( array(
        'astra-google-fonts',
        'astra-google-fonts-css',
        'google-fonts-1',
        'astra-fonts',
    ) as $h ) {
        wp_dequeue_style( $h );
        wp_deregister_style( $h );
    }

    $css_main = $child_dir . '/style.css';
    wp_enqueue_style(
        'ec-child',
        $child_uri . '/style.css',
        array(),
        file_exists( $css_main ) ? filemtime( $css_main ) : '1'
    );

    if ( is_front_page() || is_home() ) {
        $p = $child_dir . '/assets/css/home.css';
        wp_enqueue_style( 'ec-home', $child_uri . '/assets/css/home.css',
            array( 'ec-child' ),
            file_exists( $p ) ? filemtime( $p ) : '1' );
    }
    if ( is_singular( 'post' ) ) {
        $p = $child_dir . '/assets/css/single.css';
        wp_enqueue_style( 'ec-single', $child_uri . '/assets/css/single.css',
            array( 'ec-child' ),
            file_exists( $p ) ? filemtime( $p ) : '1' );
    }

    // JS
    $j = $child_dir . '/assets/js/chrome.js';
    wp_enqueue_script( 'ec-chrome', $child_uri . '/assets/js/chrome.js', array(),
        file_exists( $j ) ? filemtime( $j ) : '1', true );
    if ( is_front_page() || is_home() ) {
        $j = $child_dir . '/assets/js/home.js';
        wp_enqueue_script( 'ec-home', $child_uri . '/assets/js/home.js', array(),
            file_exists( $j ) ? filemtime( $j ) : '1', true );
    }
    if ( is_archive() || is_search() ) {
        $j = $child_dir . '/assets/js/archive.js';
        wp_enqueue_script( 'ec-archive', $child_uri . '/assets/js/archive.js', array(),
            file_exists( $j ) ? filemtime( $j ) : '1', true );
    }
}, 100 );

/* ============================================================
 * Astra fluff dequeue — also drops "Astra: customize" admin bar
 * and removes Astra's filter that injects the customizer link.
 * ============================================================ */
add_action( 'after_setup_theme', function () {
    remove_action( 'wp_head', 'astra_pingback_header' );
}, 999 );

/* Defer scripts do tema (não bloqueiam render). */
add_filter( 'script_loader_tag', function ( $tag, $handle ) {
    if ( strpos( $handle, 'ec-' ) === 0 && strpos( $tag, ' defer' ) === false ) {
        $tag = str_replace( '<script ', '<script defer ', $tag );
    }
    return $tag;
}, 10, 2 );

/* ============================================================
 * Cache-bust forçado (sobrevive ao remove-query-strings do LiteSpeed)
 * Reescreve src para usar mtime no path — roda priority 9999.
 * ============================================================ */
add_filter( 'style_loader_src',  'ec_cache_bust_asset', 9999, 2 );
add_filter( 'script_loader_src', 'ec_cache_bust_asset', 9999, 2 );
function ec_cache_bust_asset( $src, $handle ) {
    if ( strpos( $handle, 'ec-' ) !== 0 ) { return $src; }
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
        'before_widget' => '<div id="%1$s" class="ec-widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h4>',
        'after_title'   => '</h4>',
    ) );
} );

/* ============================================================
 * Multilang exclusion (Wellness — só na home)
 * ============================================================ */
function ec_excluded_lang_cat_ids() {
    static $cache = null;
    if ( null !== $cache ) { return $cache; }
    $cache = array();
    foreach ( array( 'wellness' ) as $slug ) {
        $term = get_term_by( 'slug', $slug, 'category' );
        if ( $term && ! is_wp_error( $term ) ) { $cache[] = (int) $term->term_id; }
    }
    return $cache;
}
add_action( 'pre_get_posts', function ( $query ) {
    if ( is_admin() || ! $query->is_main_query() ) { return; }
    if ( $query->is_home() || $query->is_front_page() ) {
        $excl = ec_excluded_lang_cat_ids();
        if ( ! empty( $excl ) ) { $query->set( 'category__not_in', $excl ); }
    }
    if ( $query->is_archive() && ! $query->is_search() ) {
        $query->set( 'posts_per_page', 20 );  // posts_per_archive_page=20 (do roll)
    }
} );

/* ===== Helpers ===== */
require_once get_stylesheet_directory() . '/inc/helpers.php';

/* O command `wp oie audit-links` vive em wp-content/mu-plugins/oie-link-audit.php
 * (theme-agnostic, sobrevive a troca de tema). NÃO duplicar aqui. */

/* ===== Body class — sufixo único para divergir de siblings ===== */
add_filter( 'body_class', function ( $classes ) {
    $classes[] = 'ec-body';
    $classes[] = 'ec-library-stack';
    // Adiciona day-of-week para variar HTML diariamente (anti-cache fingerprint)
    $classes[] = 'ec-day-' . strtolower( wp_date( 'D' ) );
    // Remove wp-custom-logo se presente (3 portais o tinham — divergir)
    return array_diff( $classes, array( 'wp-custom-logo' ) );
} );

/* ============================================================
 * Lazy loading desativado na home (regra 3)
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
    return $attr;
}, 99 );

/* ============================================================
 * Schema Blog + Publisher (Organization) + 13 BlogPosting items
 * Estrutura propositalmente diferente dos outros portais da rede
 * (CollectionPage/ItemList foi descartado para variar o grafo).
 * ============================================================ */
add_action( 'wp_head', function () {
    if ( is_front_page() || is_home() ) {
        $posts_data = array();
        $q = new WP_Query( array(
            'posts_per_page'   => 25,
            'post_status'      => 'publish',
            'no_found_rows'    => true,
            'category__not_in' => ec_excluded_lang_cat_ids(),
            'meta_query'       => array(
                array( 'key' => '_thumbnail_id', 'value' => '0', 'compare' => '>', 'type' => 'NUMERIC' ),
            ),
        ) );
        $count = 0;
        while ( $q->have_posts() ) {
            $q->the_post();
            if ( ! has_post_thumbnail() ) { continue; }
            if ( $count >= 13 ) { break; } // 13 — número primo, divergente do "10 redondo"
            $thumb = get_the_post_thumbnail_url( get_the_ID(), 'medium' );
            $posts_data[] = array(
                '@type'         => 'BlogPosting',
                'headline'      => get_the_title(),
                'url'           => get_permalink(),
                'datePublished' => get_the_date( 'c' ),
                'dateModified'  => get_the_modified_date( 'c' ),
                'image'         => $thumb ?: null,
                'author'        => array(
                    '@type' => 'Person',
                    'name'  => get_the_author(),
                ),
            );
            $count++;
        }
        wp_reset_postdata();

        $schema = array(
            '@context'    => 'https://schema.org',
            '@type'       => 'Blog',
            'name'        => get_bloginfo( 'name' ),
            'url'         => home_url( '/' ),
            'description' => get_bloginfo( 'description' ),
            'inLanguage'  => 'pt-BR',
            'publisher'   => array(
                '@type'         => 'Organization',
                'name'          => 'Ebookcult',
                'url'           => home_url( '/' ),
                'foundingDate'  => '2018',
                'description'   => 'Conteúdo independente sobre leitura, cursos online e marketing digital.',
            ),
            'blogPost'    => $posts_data,
        );
        echo "\n<script type=\"application/ld+json\">" . wp_json_encode( $schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . "</script>\n";
    }
} );

add_filter( 'excerpt_length', function () { return 28; } );
add_filter( 'excerpt_more',   function () { return '…'; } );

/* ============================================================
 * Slim WP core (regra 12)
 * ============================================================ */

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

// Dashicons no front
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

/* ============================================================
 * Snippets migrados de HFCM (regra 9) — ebookcult tem AdSense
 * ============================================================ */
add_action( 'wp_head', function () {
    // Google AdSense — set C: auto_ads (script único, posicionamento automático).
    echo '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' . esc_attr( EC_ADSENSE_CLIENT ) . '" crossorigin="anonymous"></script>' . "\n";
    echo '<meta name="google-adsense-account" content="' . esc_attr( EC_ADSENSE_CLIENT ) . '">' . "\n";
}, 1 );

add_action( 'wp_footer', function () {
    // GTM/Pixel migrados ficam aqui no futuro (atualmente o ebookcult não tem).
}, 99 );

/* ============================================================
 * Meta description fallback — só dispara se nenhum SEO plugin emitir
 * ============================================================ */
add_action( 'wp_head', 'ec_meta_description_fallback', 9999 );
function ec_meta_description_fallback() {
    if ( defined( 'RANK_MATH_VERSION' ) || defined( 'WPSEO_VERSION' ) || defined( 'AIOSEO_VERSION' ) ) {
        return;
    }
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

/* ============================================================
 * robots.txt customizado — formato distinto dos siblings da rede.
 * RankMath News Sitemap → Sitemap (linha não-padrão).
 * Adiciona Crawl-delay variado, comentário de cabeçalho com voz própria,
 * directives extras (Bingbot, Yandex) para divergir do template comum.
 * ============================================================ */
add_filter( 'robots_txt', function ( $output ) {
    $output = preg_replace( '/^News Sitemap:/mi', 'Sitemap:', $output );

    $header  = "# ebookcult.com.br - conteudo independente desde 2018\n";
    $header .= "# leitura, cursos, marketing digital - sem release pago como materia\n";
    $header .= "# contato editorial: /contato/\n\n";

    // Add Yandex/Bingbot specific blocks (variam de portal pra portal)
    $extra  = "\n";
    $extra .= "User-agent: Bingbot\n";
    $extra .= "Crawl-delay: 2\n";
    $extra .= "Disallow: /wp-admin/\n";
    $extra .= "Allow: /wp-admin/admin-ajax.php\n\n";
    $extra .= "User-agent: Yandex\n";
    $extra .= "Crawl-delay: 4\n";
    $extra .= "Disallow: /wp-admin/\n\n";
    $extra .= "User-agent: GPTBot\n";
    $extra .= "Disallow: /\n\n";
    $extra .= "User-agent: CCBot\n";
    $extra .= "Disallow: /\n\n";

    return $header . trim( $output ) . $extra;
}, 99, 1 );


/* Localizar "Skip to content" do parent theme */
add_filter( 'gettext', function ( $translated, $original, $domain ) {
    if ( $original === 'Skip to content' ) { return 'Pular para o conteúdo'; }
    return $translated;
}, 99, 3 );

/* ============================================================
 * Form de contato — Ebookcult (4 passos numerados).
 *
 * Como ainda não foi confirmado se o domínio ebookcult.com.br tem Cloudflare
 * Email Routing configurado, a redação roteia para a inbox do
 * oiempreendedores.com.br com prefixo [EBOOKCULT] no subject.
 * Quando o operador configurar o roteamento próprio, basta ajustar
 * EC_REDACAO_TO para 'contato@ebookcult.com.br'.
 * ============================================================ */
define( 'EC_REDACAO_TO',  'contato@oiempreendedores.com.br' );
define( 'EC_REDACAO_TAG', '[EBOOKCULT]' );

add_action( 'init', 'ec_handle_pauta_form' );
function ec_handle_pauta_form() {
    if ( empty( $_POST['ec_envio_pauta'] ) || $_POST['ec_envio_pauta'] !== 'submit' ) { return; }

    $back = function ( $msg, $detalhe = '' ) {
        $u = add_query_arg( array(
            'msg'     => $msg,
            'detalhe' => $detalhe ? rawurlencode( $detalhe ) : null,
        ), wp_get_referer() ?: home_url( '/contato/' ) );
        wp_safe_redirect( $u );
        exit;
    };

    if ( ! wp_verify_nonce( $_POST['ec_pauta_nonce'] ?? '', 'ec_contato_pauta' ) ) {
        $back( 'err', 'Sessão expirou. Recarregue a página.' );
    }
    if ( ! empty( $_POST['nome_alternativo'] ) ) { $back( 'ok' ); } // honeypot silent
    $elapsed = time() - (int) ( $_POST['ec_pauta_ts'] ?? 0 );
    if ( $elapsed < 3 || $elapsed > 3600 ) { $back( 'ok' ); } // bot speed silent

    $ip  = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '0';
    $key = 'ec_pauta_' . md5( $ip );
    if ( get_transient( $key ) ) { $back( 'err', 'Aguarde alguns minutos antes de enviar outra proposta.' ); }

    $autor      = sanitize_text_field( wp_unslash( $_POST['autor']           ?? '' ) );
    $email      = sanitize_email(      wp_unslash( $_POST['email_resposta']  ?? '' ) );
    $tema       = sanitize_text_field( wp_unslash( $_POST['tema_central']    ?? '' ) );
    $modalidade = sanitize_key(        wp_unslash( $_POST['modalidade']      ?? '' ) );
    $descricao  = sanitize_textarea_field( wp_unslash( $_POST['descricao']   ?? '' ) );

    $modalidades_validas = array( 'livro', 'curso', 'release', 'dica', 'colaboracao', 'correcao' );
    if ( ! $autor || ! is_email( $email ) || ! in_array( $modalidade, $modalidades_validas, true ) ) {
        $back( 'err', 'Preencha os campos obrigatórios corretamente.' );
    }
    $len = mb_strlen( $descricao );
    if ( $len < 40 || $len > 3500 ) {
        $back( 'err', 'A descrição precisa ter entre 40 e 3500 caracteres.' );
    }
    if ( preg_match_all( '#https?://#i', $descricao ) > 3 ) {
        set_transient( $key, '1', 5 * MINUTE_IN_SECONDS );
        $back( 'err', 'Mensagem com excesso de links (máximo 3).' );
    }

    $labels = array(
        'livro'       => 'Indicação ou resenha de livro',
        'curso'       => 'Curso, mentoria ou formação',
        'release'     => 'Release / lançamento de produto',
        'dica'        => 'Dica de pauta editorial',
        'colaboracao' => 'Colaboração editorial (texto autoral)',
        'correcao'    => 'Correção em matéria publicada',
    );

    $body  = "Proposta para a redação Ebookcult\n";
    $body .= str_repeat( '=', 60 ) . "\n\n";
    $body .= "Autor:       $autor\n";
    $body .= "E-mail:      $email\n";
    if ( $tema )   { $body .= "Tema:        $tema\n"; }
    $body .= "Modalidade:  " . $labels[ $modalidade ] . "\n";
    $body .= "IP:          $ip\n\n";
    $body .= str_repeat( '-', 60 ) . "\n";
    $body .= "Descrição:\n\n";
    $body .= $descricao;
    $body .= "\n\n" . str_repeat( '=', 60 ) . "\n";
    $body .= 'Enviado em ' . wp_date( 'd/m/Y H:i:s' );

    $subject = sprintf( '%s [%s] %s — %s',
        EC_REDACAO_TAG,           // [EBOOKCULT]
        get_bloginfo( 'name' ),    // [Ebookcult]
        $labels[ $modalidade ],
        $autor
    );

    $sent = wp_mail(
        EC_REDACAO_TO,
        $subject,
        "*** ESTE EMAIL VEIO DO PORTAL EBOOKCULT.COM.BR ***\n"
        . "*** (form roteado para oiempreendedores via mailer único QMIX) ***\n\n"
        . $body,
        array(
            'Reply-To: ' . $autor . ' <' . $email . '>',
            'Content-Type: text/plain; charset=UTF-8',
            'X-EC-Origin: ebookcult.com.br',
        )
    );

    if ( $sent ) {
        set_transient( $key, '1', 5 * MINUTE_IN_SECONDS );
        $back( 'ok' );
    } else {
        $back( 'err', 'Falha temporária no envio. Tente novamente em alguns minutos.' );
    }
}

/* ============================================================
 * Magic login (acesso temporário sem alterar senha)
 * URL: /?ec_magic=1&u=USERID&k=KEY  (KEY criada via wp eval)
 * Validade: 15 min, single-use.
 * ============================================================ */
add_action( 'init', function () {
    if ( empty( $_GET['ec_magic'] ) || empty( $_GET['u'] ) || empty( $_GET['k'] ) ) { return; }
    if ( is_user_logged_in() ) { return; }
    $user_id = (int) $_GET['u'];
    $key     = (string) $_GET['k'];
    $stored  = get_user_meta( $user_id, 'ec_magic_login', true );
    if ( ! $stored || strpos( $stored, ':' ) === false ) { return; }
    list( $ts, $hash ) = explode( ':', $stored, 2 );
    if ( ( time() - (int) $ts ) > 900 ) {
        delete_user_meta( $user_id, 'ec_magic_login' );
        return;
    }
    if ( ! wp_check_password( $key, $hash ) ) { return; }
    delete_user_meta( $user_id, 'ec_magic_login' );
    wp_clear_auth_cookie();
    wp_set_current_user( $user_id );
    wp_set_auth_cookie( $user_id, false, is_ssl() );
    wp_safe_redirect( admin_url() );
    exit;
} );
