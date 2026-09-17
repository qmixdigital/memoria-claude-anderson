<?php
/**
 * Plugin Name: QMIX - Portal de noticias
 * Description: Trata o site como veiculo de noticias: sitemap de noticias (48h) em /news-sitemap.xml, publisher NewsMediaOrganization e schema NewsArticle onde o plugin de SEO nao emite nenhum.
 * Version: 1.0
 * Author: QMIX Digital
 *
 * REMOCAO: apague este arquivo de wp-content/mu-plugins/ e purgue o cache.
 * Nao grava nada no banco.
 */

if (!defined('ABSPATH')) { exit; }

const QMIX_NP_JANELA_HORAS = 48;   // Google News so considera as ultimas 48h
const QMIX_NP_MAX_URLS     = 1000; // limite do protocolo

/* ------------------------------------------------------------------ *
 * 1) O site ja tem schema de artigo de algum plugin de SEO?
 * ------------------------------------------------------------------ */
function qmix_np_seo_ja_marca_artigo() {
    static $r = null;
    if ($r !== null) { return $r; }
    $r = false;
    if (function_exists('is_plugin_active') || function_exists('rank_math')) {
        $t = get_option('rank-math-options-titles');
        if (is_array($t)) {
            $snippet = isset($t['pt_post_default_rich_snippet']) ? $t['pt_post_default_rich_snippet'] : '';
            if (class_exists('RankMath') && $snippet === 'article') { $r = true; }
        }
    }
    return $r;
}

function qmix_np_publisher() {
    $nome = get_bloginfo('name');
    $t = get_option('rank-math-options-titles');
    if (is_array($t) && !empty($t['knowledgegraph_name'])) { $nome = $t['knowledgegraph_name']; }

    $pub = array(
        '@type' => 'NewsMediaOrganization',
        'name'  => $nome,
        'url'   => home_url('/'),
    );

    $logo = '';
    if (is_array($t) && !empty($t['knowledgegraph_logo'])) {
        $logo = $t['knowledgegraph_logo'];
    } else {
        $cl = get_theme_mod('custom_logo');
        if ($cl) { $src = wp_get_attachment_image_src($cl, 'full'); if ($src) { $logo = $src[0]; } }
        if ($logo === '') { $sid = get_option('site_icon'); if ($sid) { $src = wp_get_attachment_image_src($sid, 'full'); if ($src) { $logo = $src[0]; } } }
    }
    if ($logo !== '') {
        $pub['logo'] = array('@type' => 'ImageObject', 'url' => $logo);
    }
    return $pub;
}

/* ------------------------------------------------------------------ *
 * 2) NewsArticle onde o plugin de SEO nao emite artigo nenhum
 * ------------------------------------------------------------------ */
function qmix_np_schema() {
    if (!is_singular('post') || qmix_np_seo_ja_marca_artigo()) { return; }
    $p = get_post();
    if (!$p) { return; }

    $img = get_the_post_thumbnail_url($p, 'full');
    $cats = wp_get_post_terms($p->ID, 'category', array('fields' => 'names'));

    $schema = array(
        '@context'         => 'https://schema.org',
        '@type'            => 'NewsArticle',
        'headline'         => wp_strip_all_tags(get_the_title($p)),
        'description'      => wp_strip_all_tags(get_the_excerpt($p)),
        'datePublished'    => get_the_date('c', $p),
        'dateModified'     => get_the_modified_date('c', $p),
        'author'           => array(
            '@type' => 'Person',
            'name'  => get_the_author_meta('display_name', $p->post_author),
            'url'   => get_author_posts_url($p->post_author),
        ),
        'publisher'        => qmix_np_publisher(),
        'mainEntityOfPage' => array('@type' => 'WebPage', '@id' => get_permalink($p)),
        'inLanguage'       => 'pt-BR',
    );
    if ($img)  { $schema['image'] = array($img); }
    if ($cats) { $schema['articleSection'] = $cats[0]; }

    echo "\n<script type=\"application/ld+json\">" . wp_json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "</script>\n";
}
add_action('wp_head', 'qmix_np_schema', 20);

/* ------------------------------------------------------------------ *
 * 3) Publisher do Rank Math: Organization -> NewsMediaOrganization
 * ------------------------------------------------------------------ */
add_filter('rank_math/json_ld', function ($data) {
    if (!is_array($data)) { return $data; }
    foreach ($data as $k => $node) {
        if (!is_array($node) || !isset($node['@type'])) { continue; }
        if ($node['@type'] === 'Organization') {
            $data[$k]['@type'] = 'NewsMediaOrganization';
        } elseif (is_array($node['@type']) && in_array('Organization', $node['@type'], true)) {
            $data[$k]['@type'] = array_map(function ($t) {
                return $t === 'Organization' ? 'NewsMediaOrganization' : $t;
            }, $node['@type']);
        }
    }
    return $data;
}, 99);

/* ------------------------------------------------------------------ *
 * 4) /news-sitemap.xml  (ultimas 48h)
 * ------------------------------------------------------------------ */
function qmix_np_serve_sitemap() {
    $uri = strtok((string) (isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : ''), '?');
    if (trim($uri, '/') !== 'news-sitemap.xml') { return; }

    $posts = get_posts(array(
        'post_type'        => 'post',
        'post_status'      => 'publish',
        'posts_per_page'   => QMIX_NP_MAX_URLS,
        'orderby'          => 'date',
        'order'            => 'DESC',
        'suppress_filters' => true,
        'date_query'       => array(array('after' => QMIX_NP_JANELA_HORAS . ' hours ago', 'column' => 'post_date_gmt')),
    ));

    $nome = get_bloginfo('name');
    $t = get_option('rank-math-options-titles');
    if (is_array($t) && !empty($t['knowledgegraph_name'])) { $nome = $t['knowledgegraph_name']; }

    while (ob_get_level()) { ob_end_clean(); }
    status_header(200);
    header('Content-Type: application/xml; charset=UTF-8');
    header('X-Robots-Tag: noindex', true);

    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">' . "\n";
    foreach ($posts as $p) {
        echo "  <url>\n";
        echo '    <loc>' . esc_url(get_permalink($p)) . "</loc>\n";
        echo "    <news:news>\n";
        echo "      <news:publication>\n";
        echo '        <news:name>' . esc_html($nome) . "</news:name>\n";
        echo "        <news:language>pt</news:language>\n";
        echo "      </news:publication>\n";
        echo '      <news:publication_date>' . esc_html(get_the_date('c', $p)) . "</news:publication_date>\n";
        echo '      <news:title>' . esc_html(wp_strip_all_tags(get_the_title($p))) . "</news:title>\n";
        echo "    </news:news>\n";
        echo "  </url>\n";
    }
    echo '</urlset>';
    exit;
}
add_action('parse_request', 'qmix_np_serve_sitemap', 1);

/* Anuncia no robots.txt (varios ja anunciavam um arquivo que dava 404). */
add_filter('robots_txt', function ($saida) {
    $linha = 'Sitemap: ' . home_url('/news-sitemap.xml');
    if (strpos($saida, '/news-sitemap.xml') === false) { $saida .= "\n" . $linha . "\n"; }
    return $saida;
}, 20);
