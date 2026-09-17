<?php
/**
 * EUVO News, funcoes do tema.
 *
 * Roll: theme=neve | archetype=A | single=IV_sidebar_rich | archive=delta_hub_subcategories
 *       header=H1_classic_3row | footer=F2_classic_4col | palette=P18 | fonts=F19
 *       hero=bleed | card=image_right | ratio=21x9 | sidebar=floating | classes=utility (ev-)
 *       breaking=tab_filter | schema=itemlist | pagination=load_more | date=relative
 *
 * @package EuvoNews
 * @since   1.0.0
 * @author  QMIX Digital
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

require_once get_stylesheet_directory() . '/inc/helpers.php';

/**
 * Suportes do tema.
 *
 * custom-logo e obrigatorio aqui: a logomarca do portal vive em custom_logo (core)
 * e e renderizada por the_custom_logo() no header. Sem este suporte a marca some.
 *
 * @since 1.0.0
 * @return void
 */
function ev_setup() {
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'title-tag' );
    add_theme_support( 'automatic-feed-links' );
    add_theme_support( 'responsive-embeds' );
    add_theme_support(
        'html5',
        array( 'search-form', 'gallery', 'caption', 'style', 'script' )
    );
    add_theme_support(
        'custom-logo',
        array(
            'height'      => 120,
            'width'       => 600,
            'flex-height' => true,
            'flex-width'  => true,
        )
    );

    // image_ratio=21x9 para hero e cards, 1x1 para a lista compacta da sidebar.
    add_image_size( 'ev-hero', 1400, 600, true );
    add_image_size( 'ev-card', 760, 326, true );
    add_image_size( 'ev-thumb', 192, 192, true );

    register_nav_menus(
        array(
            'ev_primary' => 'Menu Principal',
            'ev_footer'  => 'Menu Rodapé',
        )
    );
}
add_action( 'after_setup_theme', 'ev_setup' );

/**
 * Areas de widget. widgets_style=heavy.
 *
 * @since 1.0.0
 * @return void
 */
function ev_widgets() {
    register_sidebar(
        array(
            'name'          => 'Barra Lateral',
            'id'            => 'ev-aside',
            'description'   => 'Aparece na home, nos posts e nos arquivos.',
            'before_widget' => '<section id="%1$s" class="ev-w %2$s">',
            'after_widget'  => '</section>',
            'before_title'  => '<h2 class="ev-w__h">',
            'after_title'   => '</h2>',
        )
    );
}
add_action( 'widgets_init', 'ev_widgets' );

/**
 * Enfileira estilos e scripts.
 *
 * A versao vem de filemtime() e nao da versao do tema: o LiteSpeed remove
 * query strings estaticas (optm-qs_rm) e serviria o bundle velho por dias.
 *
 * @since 1.0.0
 * @return void
 */
function ev_assets() {
    $dir = get_stylesheet_directory();
    $uri = get_stylesheet_directory_uri();

    wp_enqueue_style(
        'ev-parent',
        get_template_directory_uri() . '/style.css',
        array(),
        ev_mtime( get_template_directory() . '/style.css' )
    );

    /*
     * O style.css do Neve e so o cabecalho do tema. O CSS que ele realmente
     * aplica vive no handle neve-style (style-main-new.min.css) e sai depois,
     * levando junto o inline que define --nv-site-bg, --bodyfontfamily e
     * companhia. Sem depender desse handle, o tema filho e impresso antes e
     * perde body, links e botoes para o pai: fundo branco e Arial no lugar da
     * identidade do portal.
     *
     * A dependencia so entra se o handle existir de verdade. Declarar
     * dependencia de um handle nao registrado faz o WP simplesmente nao
     * imprimir a folha, o que seria pior que o problema original.
     */
    $deps = array( 'ev-parent' );
    foreach ( array( 'neve-style' ) as $handle ) {
        if ( wp_style_is( $handle, 'registered' ) || wp_style_is( $handle, 'enqueued' ) ) {
            $deps[] = $handle;
        }
    }

    wp_enqueue_style(
        'ev-shell',
        $uri . '/style.css',
        $deps,
        ev_mtime( $dir . '/style.css' )
    );

    if ( is_front_page() || is_home() ) {
        wp_enqueue_style(
            'euvo-capa',
            $uri . '/assets/css/home.css',
            array( 'ev-shell' ),
            ev_mtime( $dir . '/assets/css/home.css' )
        );
        wp_enqueue_script(
            'euvo-capa-js',
            $uri . '/assets/js/home.js',
            array(),
            ev_mtime( $dir . '/assets/js/home.js' ),
            true
        );
        wp_localize_script(
            'euvo-capa-js',
            'evCapa',
            array(
                'ajax'  => admin_url( 'admin-ajax.php' ),
                'nonce' => wp_create_nonce( 'ev_more' ),
            )
        );
    }

    if ( is_singular( 'post' ) ) {
        // Handle e identificador, nao texto: fica sem acento de proposito.
        wp_enqueue_style(
            'euvo-materia',
            $uri . '/assets/css/single.css',
            array( 'ev-shell' ),
            ev_mtime( $dir . '/assets/css/single.css' )
        );
    }

    wp_enqueue_script(
        'euvo-chrome',
        $uri . '/assets/js/chrome.js',
        array(),
        ev_mtime( $dir . '/assets/js/chrome.js' ),
        true
    );
}
// Prioridade 20: o Neve precisa ter registrado neve-style antes de eu depender dele.
add_action( 'wp_enqueue_scripts', 'ev_assets', 20 );

/**
 * Precarrega a fonte de titulo. Ela pinta o LCP (titulo do hero).
 *
 * @since 1.0.0
 * @return void
 */
function ev_preload_font() {
    $href = get_stylesheet_directory_uri() . '/assets/fonts/librecaslondisplay-400-latin.woff2';
    printf(
        '<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n",
        esc_url( $href )
    );
}
add_action( 'wp_head', 'ev_preload_font', 1 );

/**
 * Segunda camada de cache-bust: reinjeta ?v=mtime depois que o LiteSpeed limpa.
 *
 * @since 1.0.0
 * @param string $src    URL do asset.
 * @param string $handle Handle registrado.
 * @return string
 */
function ev_rebust( $src, $handle ) {
    if ( 0 !== strpos( (string) $handle, 'ev-' ) && 0 !== strpos( (string) $handle, 'euvo-' ) ) {
        return $src;
    }
    if ( false === strpos( $src, get_stylesheet_directory_uri() ) ) {
        return $src;
    }
    $rel = str_replace( get_stylesheet_directory_uri(), '', strtok( $src, '?' ) );
    $abs = get_stylesheet_directory() . $rel;

    return add_query_arg( 'v', ev_mtime( $abs ), strtok( $src, '?' ) );
}
add_filter( 'style_loader_src', 'ev_rebust', 9999, 2 );
add_filter( 'script_loader_src', 'ev_rebust', 9999, 2 );

/**
 * Desliga o lazy-load na capa.
 *
 * A home tem hero + faixa + 3 blocos de categoria + sidebar. Com lazy nativo
 * as imagens aparecem em cascata conforme a rolagem e isso e lido como bug.
 *
 * @since 1.0.0
 * @param bool   $default Valor atual.
 * @param string $tag     Tag HTML.
 * @param string $context Contexto.
 * @return bool
 */
function ev_kill_lazy( $default, $tag, $context ) {
    if ( is_front_page() || is_home() ) {
        return false;
    }
    return $default;
}
add_filter( 'wp_lazy_loading_enabled', 'ev_kill_lazy', 10, 3 );

/**
 * Forca eager/async nos atributos de imagem da capa.
 *
 * @since 1.0.0
 * @param array $attr Atributos da imagem.
 * @return array
 */
function ev_eager_attrs( $attr ) {
    if ( is_front_page() || is_home() ) {
        $attr['loading']  = 'eager';
        $attr['decoding'] = 'async';
    }
    return $attr;
}
add_filter( 'wp_get_attachment_image_attributes', 'ev_eager_attrs', 99 );

/**
 * Tira o traco solto do fim da manchete.
 *
 * Boa parte do acervo chegou com titulo terminando em traco ("... ministro
 * Zanin -", "... disponiveis -"): sobra do processo de importacao, que cortava
 * o titulo original no separador. Na capa isso aparece em quase metade das
 * chamadas e le como texto quebrado.
 *
 * Exige espaco antes do traco de proposito, para nao mutilar titulo legitimo
 * com hifen colado ("COVID-19", "pos-jogo"). Os travessoes vao por escape
 * unicode, nao literais, para o codigo seguir sem travessao.
 *
 * So exibicao: o post_title no banco fica intacto e a mudanca se desfaz
 * removendo o filtro.
 *
 * @since 1.0.0
 * @param string $t Titulo.
 * @return string
 */
function ev_tidy_title( $t ) {
    if ( is_admin() ) {
        return $t;
    }

    /*
     * O wptexturize do core roda neste mesmo hook e sai na frente, trocando o
     * hifen ASCII pela entidade &#8211;. Um padrao que so procure o caractere
     * nao acha mais nada, porque o que sobrou termina em ponto e virgula. Por
     * isso o padrao cobre as duas formas, e a prioridade 20 garante rodar
     * depois de quem texturiza.
     */
    $sep = '(?:[\x{2010}-\x{2015}\-|]|&#8211;|&#8212;|&ndash;|&mdash;|&#x2013;|&#x2014;)';

    return preg_replace( '/(?:\s|&nbsp;)+' . $sep . '+\s*$/u', '', $t );
}
add_filter( 'the_title', 'ev_tidy_title', 20, 1 );

/**
 * Resumo curto. excerpt=short (12 a 18 palavras).
 *
 * @since 1.0.0
 * @return int
 */
function ev_excerpt_len() {
    return 16;
}
add_filter( 'excerpt_length', 'ev_excerpt_len', 99 );

/**
 * Reticencias do resumo.
 *
 * @since 1.0.0
 * @return string
 */
function ev_excerpt_end() {
    return '...';
}
add_filter( 'excerpt_more', 'ev_excerpt_end' );

/**
 * posts_per_archive_page=10.
 *
 * @since 1.0.0
 * @param WP_Query $q Query principal.
 * @return void
 */
function ev_archive_ppp( $q ) {
    if ( is_admin() || ! $q->is_main_query() ) {
        return;
    }
    if ( $q->is_archive() || $q->is_search() ) {
        $q->set( 'posts_per_page', 10 );
    }
}
add_action( 'pre_get_posts', 'ev_archive_ppp' );

/**
 * Remove peso do core que o portal nao usa.
 *
 * @since 1.0.0
 * @return void
 */
function ev_slim() {
    wp_dequeue_style( 'wp-block-library' );
    wp_dequeue_style( 'wp-block-library-theme' );
    wp_dequeue_style( 'global-styles' );
    wp_dequeue_style( 'classic-theme-styles' );
}
add_action( 'wp_enqueue_scripts', 'ev_slim', 100 );

remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );

/**
 * Handler do botao "Carregar mais" da capa. pagination=load_more.
 *
 * @since 1.0.0
 * @return void
 */
function ev_more_handler() {
    check_ajax_referer( 'ev_more', 'nonce' );

    $page = isset( $_POST['page'] ) ? absint( $_POST['page'] ) : 1;
    $skip = isset( $_POST['skip'] ) ? array_map( 'absint', (array) $_POST['skip'] ) : array();

    $q = ev_section_query(
        array(
            'posts_per_page' => 24,
            'paged'          => $page,
            'post__not_in'   => $skip,
        )
    );

    $out   = '';
    $shown = 0;
    $ids   = array();

    while ( $q->have_posts() ) {
        $q->the_post();
        if ( ! has_post_thumbnail() ) {
            continue;
        }
        if ( $shown >= 8 ) {
            break;
        }
        ob_start();
        ev_card( 'default' );
        $out .= ob_get_clean();
        $ids[] = get_the_ID();
        $shown++;
    }
    wp_reset_postdata();

    wp_send_json_success(
        array(
            'html' => $out,
            'ids'  => $ids,
            'done' => ( $shown < 8 ),
        )
    );
}
add_action( 'wp_ajax_ev_more', 'ev_more_handler' );
add_action( 'wp_ajax_nopriv_ev_more', 'ev_more_handler' );
