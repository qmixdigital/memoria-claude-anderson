<?php
/**
 * Plugin Name: HTML Sitemap
 * Description: Mapa do site HTML por editoria (todos os artigos). A identidade visual (classes, slug, ancora, layout, cor) e derivada de um hash do dominio em runtime, entao cada portal renderiza um HTML diferente: mesmo arquivo-fonte, ZERO footprint publico entre os sites da rede. Auto-cria a propria pagina e auto-purga o cache.
 * Version: 6.0
 * Author: -
 *
 * >>> ATENCAO (humano/IA): o link deste mapa que aparece no rodape e um link
 *     INTERNO PERMANENTE de SEO (mapa do site). NAO e um backlink send-remove.
 *     NAO remover em limpezas de backlink / link externo. Esta protecao vive
 *     SOMENTE aqui no PHP e na memoria do assistente: NUNCA emitir marcador de
 *     marca no HTML publico (isso recriaria footprint entre os portais). <<<
 */
if (!defined('ABSPATH')) { exit; }

/* ---------- fingerprint deterministico por dominio ---------- */
function qsm_fp() {
    static $fp = null;
    if ($fp !== null) { return $fp; }
    $host = strtolower((string) parse_url(home_url(), PHP_URL_HOST));
    $host = preg_replace('/^www\./', '', $host);
    $hex  = md5($host);
    $pick = function ($start, $len, $arr) use ($hex) {
        return $arr[hexdec(substr($hex, $start, $len)) % count($arr)];
    };

    $slugs = array('mapa-do-site','indice','todos-os-artigos','arquivo-de-artigos','conteudo','mapa-de-conteudo','indice-de-artigos','todo-o-conteudo','central-de-conteudo','navegacao','indice-geral','arquivo-completo','lista-de-materias','indice-de-materias','mapa-de-navegacao','todos-os-conteudos','biblioteca-de-conteudo','indice-do-site','sumario','painel-de-conteudo');
    $anchors = array('Mapa do Site','Todos os artigos','Índice de conteúdo','Mapa do conteúdo','Ver todo o conteúdo','Arquivo de artigos','Índice de artigos','Navegue por todo o conteúdo','Central de conteúdo','Índice geral','Todas as matérias','Lista completa de artigos','Explore todo o conteúdo','Arquivo completo','Índice de matérias','Mapa de navegação','Todos os conteúdos','Sumário do site','Acesse todo o conteúdo','Biblioteca de artigos');
    $titles = array('Mapa do Site','Índice de Conteúdo','Todo o Conteúdo do Site','Arquivo Completo de Artigos','Central de Conteúdo','Índice de Publicações','Índice Geral do Site','Sumário de Matérias','Biblioteca de Conteúdo','Mapa de Navegação do Site','Lista Completa de Artigos','Índice de Artigos');
    $accents = array('#2456c9','#1f7a4d','#b23a48','#8a5a2b','#5a3fa0','#0f766e','#b45309','#334155','#9f1239','#1e40af','#155e75','#7c2d12','#065f46','#6d28d9','#a21caf','#0e7490','#c2410c','#4d7c0f','#be123c','#374151');
    $radii  = array('3px','6px','8px','10px','12px','16px','22px');

    $fp = array(
        'p'      => 'q' . substr($hex, 3, 4),                 // prefixo de classe unico por site: ex q9af3
        'slug'   => $pick(8, 6, $slugs),
        'anchor' => $pick(14, 6, $anchors),
        'title'  => $pick(20, 5, $titles),
        'accent' => $pick(25, 5, $accents),
        'rad'    => $pick(0, 2, $radii),
        'layout' => hexdec(substr($hex, 30, 2)) % 3,          // 0,1,2 -> estrutura de DOM/CSS distinta
    );
    return $fp;
}

/* ---------- pagina do mapa: reutiliza legado ou auto-cria com slug variado ---------- */
add_action('wp_loaded', function () {
    $pid = (int) get_option('qsm_page_id');
    if ($pid && get_post_status($pid) === 'publish') { return; }

    $fp = qsm_fp();
    $pg = get_page_by_path('mapa-do-site');          // preserva pagina legada ja indexada
    if (!$pg) { $pg = get_page_by_path($fp['slug']); }

    if ($pg) {
        if (strpos((string) $pg->post_content, '[qsm_map]') === false) {
            wp_update_post(array('ID' => $pg->ID, 'post_content' => '[qsm_map]'));
        }
        update_option('qsm_page_id', (int) $pg->ID);
        return;
    }
    $new = wp_insert_post(array(
        'post_title'   => $fp['title'],
        'post_name'    => $fp['slug'],
        'post_status'  => 'publish',
        'post_type'    => 'page',
        'post_content' => '[qsm_map]',
        'comment_status' => 'closed',
    ));
    if ($new && !is_wp_error($new)) { update_option('qsm_page_id', (int) $new); }
});

/* ---------- shortcode (nome interno fixo; nao aparece no HTML publico) ---------- */
add_shortcode('qsm_map', 'qsm_render');

function qsm_render() {
    global $wpdb;
    $fp = qsm_fp();
    $p  = $fp['p'];
    $name = get_bloginfo('name');
    $cats = get_categories(array('orderby' => 'count', 'order' => 'DESC', 'hide_empty' => true));

    $o  = '<div class="' . $p . '">';
    $o .= '<h1 class="' . $p . '-h1">' . esc_html($fp['title']) . '</h1>';
    $o .= '<p class="' . $p . '-intro">Todo o conteúdo do ' . esc_html($name) . ' organizado por editoria.</p>';

    /* nav de atalhos: 3 variantes de layout */
    if (!empty($cats) && $fp['layout'] !== 2) {
        $o .= '<nav class="' . $p . '-nav" aria-label="Editorias">';
        $sep = ($fp['layout'] === 1);
        $first = true;
        foreach ($cats as $c) {
            if ($sep && !$first) { $o .= '<span class="' . $p . '-sep">·</span>'; }
            $o .= '<a href="#c-' . esc_attr($c->slug) . '">' . esc_html($c->name);
            if (!$sep) { $o .= '<span>' . (int) $c->count . '</span>'; }
            $o .= '</a>';
            $first = false;
        }
        $o .= '</nav>';
    }

    $pages = get_pages(array('sort_column' => 'menu_order,post_title'));
    if (!empty($pages)) {
        $mapid = (int) get_option('qsm_page_id');
        $o .= '<section class="' . $p . '-sec"><h2>Páginas</h2><ul class="' . $p . '-list"><li><a href="' . esc_url(home_url('/')) . '">Página inicial</a></li>';
        foreach ($pages as $pg) {
            if ((int) $pg->ID === $mapid) { continue; }
            $o .= '<li><a href="' . esc_url(get_permalink($pg->ID)) . '">' . esc_html($pg->post_title) . '</a></li>';
        }
        $o .= '</ul></section>';
    }

    foreach ($cats as $c) {
        $link = get_category_link($c->term_id);
        $o .= '<section class="' . $p . '-sec" id="c-' . esc_attr($c->slug) . '">';
        $badge = ($fp['layout'] === 2) ? ' (' . (int) $c->count . ')' : '';
        $o .= '<h2><a href="' . esc_url($link) . '">' . esc_html($c->name) . '</a>';
        if ($fp['layout'] === 0) { $o .= '<span class="' . $p . '-badge">' . (int) $c->count . ' artigos</span>'; }
        else { $o .= '<span class="' . $p . '-badge">' . esc_html($badge) . '</span>'; }
        $o .= '</h2>';
        /* query DIRETA: dribla filtro hf- (_thumbnail_id) e traz TODOS os posts */
        $ids = $wpdb->get_col($wpdb->prepare(
            "SELECT p.ID FROM {$wpdb->posts} p
             INNER JOIN {$wpdb->term_relationships} tr ON tr.object_id = p.ID
             INNER JOIN {$wpdb->term_taxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
             WHERE tt.taxonomy = 'category' AND tt.term_id = %d
               AND p.post_type = 'post' AND p.post_status = 'publish'
             ORDER BY p.post_date DESC",
            $c->term_id
        ));
        if (!empty($ids)) {
            _prime_post_caches($ids, false, false);
            update_object_term_cache($ids, 'post');
            $o .= '<ul class="' . $p . '-list">';
            foreach ($ids as $id) {
                $o .= '<li><a href="' . esc_url(get_permalink($id)) . '">' . esc_html(get_the_title($id)) . '</a></li>';
            }
            $o .= '</ul>';
        }
        $o .= '</section>';
    }
    $o .= '</div>';

    /* CSS: seletores por prefixo unico + cor/raio/colunas variados por site */
    $ac  = $fp['accent'];
    $rad = $fp['rad'];
    $cols = ($fp['layout'] === 2) ? '1fr' : 'repeat(auto-fill,minmax(330px,1fr))';
    $navbg = ($fp['layout'] === 0) ? '#f5f6f8' : 'transparent';
    $navbd = ($fp['layout'] === 0) ? '1px solid #e6e8eb' : '0';
    $o .= '<style>'
        . 'h1.entry-title{display:none}'
        . ".$p{max-width:1140px;margin:0 auto}"
        . ".$p-h1{font-size:30px;line-height:1.2;margin:0 0 14px}"
        . ".$p-intro{font-size:16px;color:#555;margin:0 0 22px}"
        . ".$p-nav{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 34px;padding-bottom:22px;border-bottom:2px solid #f0f0f0}"
        . ".$p-nav a{display:inline-flex;align-items:center;gap:7px;background:$navbg;border:$navbd;border-radius:$rad;padding:5px 13px;font-size:13px;color:#333;text-decoration:none;transition:opacity .18s}"
        . ".$p-nav a:hover{opacity:.6}"
        . ".$p-nav a span{background:rgba(0,0,0,.07);border-radius:9px;padding:1px 8px;font-size:11px;font-weight:600}"
        . ".$p-sep{color:#bbb}"
        . ".$p-sec{margin:0 0 42px;scroll-margin-top:100px}"
        . ".$p-sec h2{display:flex;align-items:baseline;flex-wrap:wrap;gap:10px 12px;font-size:22px;margin:0 0 16px;padding-bottom:10px;border-bottom:1px solid #ececec}"
        . ".$p-sec h2 a{color:#111;text-decoration:none}.$p-sec h2 a:hover{text-decoration:underline}"
        . ".$p-badge{font-size:12px;font-weight:400;color:#999}"
        . ".$p-list{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:$cols;gap:0 32px}"
        . ".$p-list li{margin:0}"
        . ".$p-list li a{display:block;padding:8px 0;border-bottom:1px solid #f4f4f4;color:$ac;text-decoration:none;font-size:14.5px;line-height:1.45;transition:padding .15s}"
        . ".$p-list li a:hover{padding-left:5px}"
        . "@media(max-width:700px){.$p-list{grid-template-columns:1fr}.$p-sec h2{font-size:19px}.$p-h1{font-size:25px}}"
        . '</style>';
    return $o;
}

/* ---------- link interno no rodape (ancora e classe variadas por site) ---------- */
add_action('wp_footer', function () {
    $fp = qsm_fp();
    $pid = (int) get_option('qsm_page_id');
    $url = $pid ? get_permalink($pid) : home_url('/' . $fp['slug'] . '/');
    /* SEM comentario/atributo de marca no HTML: proteccao vive so no PHP acima + memoria */
    echo '<div class="' . esc_attr($fp['p']) . '-fl" style="text-align:center;padding:12px 0;font-size:13px;opacity:.75;">';
    echo '<a href="' . esc_url($url) . '" rel="internal">' . esc_html($fp['anchor']) . '</a></div>';
}, 20);

/* ---------- auto-purge do cache do mapa em publicacao/edicao/remocao ---------- */
function qsm_purge() {
    $pid = (int) get_option('qsm_page_id');
    if ($pid) {
        do_action('litespeed_purge_url', get_permalink($pid));
        do_action('litespeed_purge_post', $pid);
    }
}
add_action('transition_post_status', function ($new, $old, $post) {
    if (!isset($post->post_type) || $post->post_type !== 'post') { return; }
    if ($new === 'publish' || $old === 'publish') { qsm_purge(); }
}, 10, 3);
add_action('deleted_post', function ($post_id, $post = null) {
    if ($post && isset($post->post_type) && $post->post_type === 'post') { qsm_purge(); }
}, 10, 2);
