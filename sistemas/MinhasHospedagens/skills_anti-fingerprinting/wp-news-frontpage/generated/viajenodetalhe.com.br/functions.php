<?php
/**
 * Viaje no Detalhe — child theme functions (Kadence parent).
 *
 * Roll: archetype A newspaper grid / palette P03 vintage / font F16 (serif+mono)
 *       single III tabloid / archive gamma editorial column
 *       header H4 sticky megamenu burger / footer F3 newsletter
 *       hero triptych / sidebar floating / class=utility (vd-)
 *       AdSense set C auto + every_3_paras / comments disabled / dark manual
 *       schema=webpage_only / pagination=load_more / breadcrumb text_slashes.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'VD_ADSENSE_CLIENT', 'ca-pub-3880875536722698' );

/* ===== Theme support & menus ===== */
add_action( 'after_setup_theme', function () {
  add_theme_support( 'post-thumbnails' );
  add_theme_support( 'title-tag' );
  add_theme_support( 'html5', array( 'search-form', 'comment-list', 'gallery', 'caption' ) );
  register_nav_menus( array( 'primary' => 'Menu principal' ) );
  add_image_size( 'vd-card', 800, 600, true );
  add_image_size( 'vd-hero', 1280, 800, true );
} );

/* ============================================================
 * Enqueue — child has full CSS, dequeue Kadence bundle
 * ============================================================ */
add_action( 'wp_enqueue_scripts', function () {
  $child_dir = get_stylesheet_directory();
  $child_uri = get_stylesheet_directory_uri();

  // Dequeue Kadence styles/scripts pesados
  foreach ( array( 'kadence-global', 'kadence-content', 'kadence-header', 'kadence-fonts' ) as $h ) {
    wp_dequeue_style( $h );
    wp_deregister_style( $h );
  }
  foreach ( array( 'kadence-navigation' ) as $h ) {
    wp_dequeue_script( $h );
    wp_deregister_script( $h );
  }

  $css = $child_dir . '/style.css';
  wp_enqueue_style( 'vd-child', $child_uri . '/style.css', array(),
    file_exists( $css ) ? filemtime( $css ) : '1' );

  if ( is_front_page() || is_home() ) {
    $p = $child_dir . '/assets/css/home.css';
    wp_enqueue_style( 'vd-home', $child_uri . '/assets/css/home.css',
      array( 'vd-child' ), file_exists( $p ) ? filemtime( $p ) : '1' );
  }
  if ( is_singular( 'post' ) ) {
    $p = $child_dir . '/assets/css/single.css';
    wp_enqueue_style( 'vd-single', $child_uri . '/assets/css/single.css',
      array( 'vd-child' ), file_exists( $p ) ? filemtime( $p ) : '1' );
  }

  $j = $child_dir . '/assets/js/chrome.js';
  wp_enqueue_script( 'vd-chrome', $child_uri . '/assets/js/chrome.js', array(),
    file_exists( $j ) ? filemtime( $j ) : '1', true );
  if ( is_front_page() || is_home() ) {
    $j = $child_dir . '/assets/js/home.js';
    wp_enqueue_script( 'vd-home', $child_uri . '/assets/js/home.js', array(),
      file_exists( $j ) ? filemtime( $j ) : '1', true );
  }
  if ( is_archive() || is_search() ) {
    $j = $child_dir . '/assets/js/archive.js';
    wp_enqueue_script( 'vd-archive', $child_uri . '/assets/js/archive.js', array(),
      file_exists( $j ) ? filemtime( $j ) : '1', true );
  }
}, 100 );

add_filter( 'script_loader_tag', function ( $tag, $handle ) {
  if ( strpos( $handle, 'vd-' ) === 0 && strpos( $tag, ' defer' ) === false ) {
    $tag = str_replace( '<script ', '<script defer ', $tag );
  }
  return $tag;
}, 10, 2 );

/* Cache-bust filemtime — sobrevive ao remove-query-strings de cache plugins */
add_filter( 'style_loader_src',  'vd_cache_bust', 9999, 2 );
add_filter( 'script_loader_src', 'vd_cache_bust', 9999, 2 );
function vd_cache_bust( $src, $handle ) {
  if ( strpos( $handle, 'vd-' ) !== 0 ) return $src;
  $stylesheet_uri = get_stylesheet_directory_uri();
  if ( strpos( $src, $stylesheet_uri ) !== 0 ) return $src;
  $rel = strtok( substr( $src, strlen( $stylesheet_uri ) ), '?' );
  $abs = get_stylesheet_directory() . $rel;
  if ( file_exists( $abs ) ) $src = $stylesheet_uri . $rel . '?v=' . filemtime( $abs );
  return $src;
}

/* Helpers */
require_once get_stylesheet_directory() . '/inc/helpers.php';

/* ============================================================
 * Multilang — sem categorias em outra língua. posts_per_archive=10.
 * ============================================================ */
add_action( 'pre_get_posts', function ( $query ) {
  if ( is_admin() || ! $query->is_main_query() ) return;
  if ( $query->is_archive() && ! $query->is_search() ) {
    $query->set( 'posts_per_page', 10 );
  }
} );

/* Body class custom — divergir dos siblings + suprimir fingerprints de tema */
add_filter( 'body_class', function ( $classes ) {
  $classes[] = 'vd-body';
  $classes[] = 'vd-almanac-mode';
  // Remove wp-theme-* / wp-child-theme-* / wp-custom-logo / page-template-page-templates*
  $filtered = array();
  foreach ( $classes as $c ) {
    if ( $c === 'wp-custom-logo' ) continue;
    if ( strpos( $c, 'wp-theme-' ) === 0 ) continue;
    if ( strpos( $c, 'wp-child-theme-' ) === 0 ) continue;
    if ( strpos( $c, 'page-template-page-templates' ) === 0 ) continue;
    if ( strpos( $c, 'page-template-no-wrapper' ) === 0 ) continue;
    $filtered[] = $c;
  }
  return $filtered;
} );

/* Lazy loading desativado na home (regra 3) */
add_filter( 'wp_lazy_loading_enabled', function ( $default, $tag, $context ) {
  if ( is_front_page() || is_home() ) return false;
  return $default;
}, 10, 3 );
add_filter( 'wp_get_attachment_image_attributes', function ( $attr ) {
  if ( is_front_page() || is_home() ) {
    $attr['loading']  = 'eager';
    $attr['decoding'] = 'async';
    $attr['data-no-lazy'] = '1';
  }
  return $attr;
}, 99 );
add_filter( 'litespeed_media_lazy_img_excludes', function ( $excludes ) {
  $excludes[] = 'fetchpriority="high"';
  $excludes[] = 'data-no-lazy';
  return $excludes;
} );

/* ============================================================
 * Schema — webpage_only (do roll). Estrutura mínima, distinta dos siblings.
 * ============================================================ */
add_action( 'wp_head', function () {
  if ( ! ( is_front_page() || is_home() ) ) return;
  $schema = array(
    '@context'    => 'https://schema.org',
    '@type'       => 'WebPage',
    'name'        => get_bloginfo( 'name' ),
    'url'         => home_url( '/' ),
    'description' => get_bloginfo( 'description' ),
    'inLanguage'  => 'pt-BR',
    'about'       => array( '@type' => 'Thing', 'name' => 'Almanaque editorial generalista' ),
    'mainContentOfPage' => array(
      '@type' => 'WebPageElement',
      'cssSelector' => '.vd-main',
    ),
  );
  echo "\n<script type=\"application/ld+json\">" . wp_json_encode( $schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . "</script>\n";
} );

add_filter( 'excerpt_length', function () { return 28; } );
add_filter( 'excerpt_more',   function () { return '…'; } );

/* Disable comments globally (roll: comments_treatment=disabled) */
add_filter( 'comments_open', '__return_false', 99 );
add_filter( 'pings_open', '__return_false', 99 );

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
 * AdSense set C — auto_ads (script async global)
 * ============================================================ */
add_action( 'wp_head', function () {
  echo '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' . esc_attr( VD_ADSENSE_CLIENT ) . '" crossorigin="anonymous"></script>' . "\n";
  echo '<meta name="google-adsense-account" content="' . esc_attr( VD_ADSENSE_CLIENT ) . '">' . "\n";
}, 1 );

/* ============================================================
 * Performance — DNS prefetch + preload critical CSS hint
 * ============================================================ */
add_action( 'wp_head', function () {
  // dns-prefetch is enough for AdSense — preconnect was unused on most pages and triggers Lighthouse warning
  echo '<link rel="dns-prefetch" href="//pagead2.googlesyndication.com">' . "\n";
  // Preload do CSS principal do tema (cache-busted via ?v=mtime)
  $css = get_stylesheet_directory() . '/style.css';
  if ( file_exists( $css ) ) {
    $url = get_stylesheet_directory_uri() . '/style.css?v=' . filemtime( $css );
    echo '<link rel="preload" href="' . esc_attr( $url ) . '" as="style">' . "\n";
  }
}, 2 );

/* ============================================================
 * Favicon SVG inline (almanaque § symbol)
 * ============================================================ */
add_action( 'wp_head', function () {
  $svg  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">';
  $svg .= '<rect width="32" height="32" fill="#FAF7EE"/>';
  $svg .= '<rect x="4" y="4" width="24" height="24" fill="none" stroke="#1A2B2E" stroke-width="1.5"/>';
  $svg .= '<text x="16" y="23" font-family="Georgia, serif" font-size="22" font-style="italic" font-weight="700" text-anchor="middle" fill="#C9544D">§</text>';
  $svg .= '</svg>';
  $data = 'data:image/svg+xml;base64,' . base64_encode( $svg );
  echo '<link rel="icon" type="image/svg+xml" href="' . esc_attr( $data ) . '">' . "\n";
  echo '<link rel="apple-touch-icon" href="' . esc_attr( $data ) . '">' . "\n";
  echo '<meta name="theme-color" content="#FAF7EE">' . "\n";
}, -1 );

remove_action( 'wp_head', 'wp_site_icon', 99 );
add_filter( 'get_site_icon_url', '__return_empty_string', 99 );

/* Meta description fallback */
add_action( 'wp_head', 'vd_meta_description_fallback', 9999 );
function vd_meta_description_fallback() {
  if ( defined( 'RANK_MATH_VERSION' ) || defined( 'WPSEO_VERSION' ) || defined( 'AIOSEO_VERSION' ) ) return;
  if ( is_singular() ) {
    $desc = get_the_excerpt();
  } elseif ( is_category() || is_tag() ) {
    $desc = term_description();
  } else {
    $desc = get_bloginfo( 'description' );
  }
  $desc = wp_trim_words( wp_strip_all_tags( (string) $desc ), 28, '…' );
  if ( $desc ) echo '<meta name="description" content="' . esc_attr( $desc ) . '">' . "\n";
}

/* ============================================================
 * robots.txt customizado — voz própria + AI bot block
 * ============================================================ */
add_filter( 'robots_txt', function ( $output ) {
  $output = preg_replace( '/^News Sitemap:/mi', 'Sitemap:', $output );
  $output = preg_replace_callback(
    '#^Sitemap:\s*(http://)([^\s]+)#mi',
    function ( $m ) { return 'Sitemap: https://' . $m[2]; },
    $output
  );
  $h  = "# viajenodetalhe.com.br - almanaque editorial\n";
  $h .= "# notas, ensaios e curadorias do dia a dia\n";
  $h .= "# proponha pauta em /contato/\n\n";
  $extra  = "\nUser-agent: GPTBot\nDisallow: /\n\n";
  $extra .= "User-agent: CCBot\nDisallow: /\n\n";
  $extra .= "User-agent: Google-Extended\nDisallow: /\n\n";
  return $h . trim( $output ) . $extra;
}, 99, 1 );

/* "Skip to content" pt-BR */
add_filter( 'gettext', function ( $translated, $original, $domain ) {
  if ( $original === 'Skip to content' ) return 'Pular para o conteúdo';
  return $translated;
}, 99, 3 );

/* ============================================================
 * Form de contato — Viaje no Detalhe (carta ao almanaque).
 * Action: vd_envio_pauta=enviar, honeypot: numero_assinatura.
 * Roteia para inbox oiempreendedores com tag [VIAJENODETALHE].
 * ============================================================ */
define( 'VD_REDACAO_TO',  'contato@oiempreendedores.com.br' );
define( 'VD_REDACAO_TAG', '[VIAJENODETALHE]' );

add_action( 'init', 'vd_handle_pauta_form' );
function vd_handle_pauta_form() {
  if ( empty( $_POST['vd_envio_pauta'] ) || $_POST['vd_envio_pauta'] !== 'enviar' ) return;

  $back = function ( $st, $m = '' ) {
    $u = add_query_arg( array(
      'st' => $st,
      'm'  => $m ? rawurlencode( $m ) : null,
    ), wp_get_referer() ?: home_url( '/contato/' ) );
    wp_safe_redirect( $u );
    exit;
  };

  if ( ! wp_verify_nonce( $_POST['vd_pauta_nonce'] ?? '', 'vd_pauta' ) ) {
    $back( 'erro', 'Sessão expirou. Recarregue a página.' );
  }
  if ( ! empty( $_POST['numero_assinatura'] ) ) { $back( 'recebido' ); }
  $elapsed = time() - (int) ( $_POST['vd_pauta_ts'] ?? 0 );
  if ( $elapsed < 3 || $elapsed > 3600 ) { $back( 'recebido' ); }

  $ip  = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '0';
  $key = 'vd_pauta_' . md5( $ip );
  if ( get_transient( $key ) ) { $back( 'erro', 'Aguarde alguns minutos antes de enviar outra carta.' ); }

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
    $back( 'erro', 'O texto precisa ter entre 40 e 4000 caracteres.' );
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

  $body  = "Carta para o Viaje no Detalhe\n";
  $body .= str_repeat( '=', 60 ) . "\n\n";
  $body .= "Assinante: {$assinante}\n";
  $body .= "E-mail:    {$email}\n";
  $body .= "Motivo:    " . $labels[ $motivo ] . "\n";
  $body .= "IP:        {$ip}\n\n";
  $body .= str_repeat( '-', 60 ) . "\n\n";
  $body .= $texto;
  $body .= "\n\n" . str_repeat( '=', 60 ) . "\n";
  $body .= 'Expedida em ' . wp_date( 'd/m/Y H:i:s' );

  $subject = sprintf( '%s [%s] %s — %s',
    VD_REDACAO_TAG, get_bloginfo( 'name' ), $labels[ $motivo ], $assinante
  );

  $sent = wp_mail(
    VD_REDACAO_TO,
    $subject,
    "*** ESTE EMAIL VEIO DO PORTAL VIAJENODETALHE.COM.BR ***\n"
    . "*** (form roteado para oiempreendedores via mailer único QMIX) ***\n\n"
    . $body,
    array(
      'Reply-To: ' . $assinante . ' <' . $email . '>',
      'Content-Type: text/plain; charset=UTF-8',
      'X-VD-Origin: viajenodetalhe.com.br',
    )
  );

  if ( $sent ) {
    set_transient( $key, '1', 5 * MINUTE_IN_SECONDS );
    $back( 'recebido' );
  } else {
    $back( 'erro', 'Falha temporária no envio. Tente novamente em alguns minutos.' );
  }
}

/* ============================================================
 * Magic login (acesso temporário sem alterar senha)
 * ============================================================ */
add_action( 'init', function () {
  if ( empty( $_GET['vd_magic'] ) || empty( $_GET['u'] ) || empty( $_GET['k'] ) ) return;
  if ( is_user_logged_in() ) return;
  $user_id = (int) $_GET['u'];
  $key     = (string) $_GET['k'];
  $stored  = get_user_meta( $user_id, 'vd_magic_login', true );
  if ( ! $stored || strpos( $stored, ':' ) === false ) return;
  list( $ts, $hash ) = explode( ':', $stored, 2 );
  if ( ( time() - (int) $ts ) > 900 ) {
    delete_user_meta( $user_id, 'vd_magic_login' );
    return;
  }
  if ( ! wp_check_password( $key, $hash ) ) return;
  delete_user_meta( $user_id, 'vd_magic_login' );
  wp_clear_auth_cookie();
  wp_set_current_user( $user_id );
  wp_set_auth_cookie( $user_id, false, is_ssl() );
  wp_safe_redirect( admin_url() );
  exit;
} );

/* Footer styling helpers (newsletter F3) */
add_action( 'wp_head', function () {
  if ( ! is_singular() && ! is_archive() && ! is_home() && ! is_front_page() ) return;
  echo '<style>
.vd-footer { margin-top: var(--vd-sp-7); background: var(--vd-paper); border-top: 3px double var(--vd-line-strong); padding: var(--vd-sp-6) 0 var(--vd-sp-4); }
html[data-theme="dark"] .vd-footer { background: var(--vd-dark-paper); border-top-color: var(--vd-dark-ink); }
.vd-footer__newsletter { text-align: center; padding: var(--vd-sp-4); margin-bottom: var(--vd-sp-5); background: var(--vd-paper-2); border: 1px solid var(--vd-line); }
html[data-theme="dark"] .vd-footer__newsletter { background: var(--vd-dark-paper-2); border-color: var(--vd-dark-line); }
.vd-footer__nl-kicker { margin: 0 0 8px; font-family: var(--vd-mono); font-size: 11px; color: var(--vd-coral-ink); letter-spacing: .22em; text-transform: lowercase; font-weight: 600; }
.vd-footer__nl-title { font-family: var(--vd-display); font-size: clamp(22px, 3vw, 30px); margin: 0 0 8px; font-weight: 800; }
.vd-footer__nl-sub { font-family: var(--vd-serif); font-size: 14.5px; color: var(--vd-muted); font-style: italic; margin: 0 auto var(--vd-sp-3); max-width: 50ch; }
.vd-footer__nl-form { display: inline-flex; gap: 8px; max-width: 480px; width: 100%; flex-wrap: wrap; justify-content: center; }
.vd-footer__nl-form input { flex: 1; min-width: 200px; }
.vd-footer__row { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: var(--vd-sp-4); padding-bottom: var(--vd-sp-4); border-bottom: 1px solid var(--vd-line); }
@media (max-width: 880px) { .vd-footer__row { grid-template-columns: 1fr 1fr; } }
@media (max-width: 540px) { .vd-footer__row { grid-template-columns: 1fr; } }
.vd-footer__brand-name { font-family: var(--vd-display); font-size: 22px; font-weight: 800; letter-spacing: -0.018em; display: block; }
.vd-footer__brand-name em { color: var(--vd-teal); font-style: italic; }
.vd-footer__brand-line { font-family: var(--vd-serif); font-size: 14px; color: var(--vd-muted); margin: 8px 0 0; line-height: 1.5; max-width: 36ch; font-style: italic; }
.vd-footer__col h4 { color: var(--vd-coral-ink); margin: 0 0 var(--vd-sp-3); padding-bottom: 6px; border-bottom: 1px solid var(--vd-line); }
.vd-footer__col ul { list-style: none; padding: 0; margin: 0; }
.vd-footer__col li { margin: 0 0 8px; }
.vd-footer__col a { color: var(--vd-ink-2); font-size: 14px; text-decoration: none !important; }
html[data-theme="dark"] .vd-footer__col a { color: var(--vd-dark-ink-2); }
.vd-footer__col a:hover { color: var(--vd-coral-ink); }
.vd-footer__credits { padding-top: var(--vd-sp-3); font-family: var(--vd-mono); font-size: 11px; color: var(--vd-muted); letter-spacing: .12em; text-transform: lowercase; text-align: center; }
</style>';
}, 50 );
