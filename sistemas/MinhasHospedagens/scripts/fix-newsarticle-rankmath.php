<?php
// Sites de cliente ficam de fora de operacoes da rede.
$clientes = array(
    'blog.advdobrasil.com.br',
    'blog.aplusplatform.com',
    'blog.camilafarias.com.br',
    'blog.cirurgiadojoelhogoiania.com',
    'blog.clinicasrecuperacaosaopaulo.com',
    'blog.coegoiania.com.br',
    'blog.drbrunoair.com.br',
    'blog.drhenriquebufaical.com.br',
    'blog.drthiagotredicci.com.br',
    'blog.drtiagobernardes.com.br',
    'blog.nutricionista.digital',
    'blog.ombrogoiania.com.br',
    'arlaproducao.com',
    'blog.qmix.com.br',
    'belemduartealmeida.com.br',
    'carretaspresidente.com.br',
    'comprarsites',
    'comprarvisualizacoes.com',
    'creatinadicas.com',
    'cirurgiadecolunagoiania.com.br',
    'cirurgiadojoelhogoiania.com',
    'clinicasrecuperacaosaopaulo.com',
    'drbrunoair.com.br',
    'energiaeficiente.com.br',
    'drtiagobernardes.com.br',
    'itacaiugo.com.br',
    'notebookx.com.br',
    'pael.com.br',
    'pneusemgoiania.com.br',
    'qmiximoveis.com.br',
    'tratamentodor.com.br',
    'revistamsaude.com.br',
    'setorenergetico.com.br',
    'arcondicionadotop.com',
    'geladeirastop.com',
);
$__h = strtolower((string) parse_url(get_option('home'), PHP_URL_HOST));
$__b = preg_replace('/^www\./', '', $__h);
if (in_array($__b, $clientes, true) || in_array($__h, $clientes, true)) { echo $__h . "|SKIP-cliente
"; return; }
// Portal de noticias no Rank Math:
//   - post marcado como NewsArticle (em vez de BlogPosting/Article)
//   - Knowledge Graph como organizacao (publisher vira Organization, nao Person)
//   - logo: custom_logo do tema -> icone do site -> sem logo
$host = strtolower((string) parse_url(get_option('home'), PHP_URL_HOST));

$t = get_option('rank-math-options-titles');
if (!is_array($t)) { echo "$host|SKIP-sem-rankmath\n"; return; }

$antes = array(
    'snippet' => isset($t['pt_post_default_rich_snippet']) ? $t['pt_post_default_rich_snippet'] : 'unset',
    'tipo'    => isset($t['pt_post_default_article_type']) ? $t['pt_post_default_article_type'] : 'unset',
    'kg'      => isset($t['knowledgegraph_type']) ? $t['knowledgegraph_type'] : 'unset',
);

$mudou = array();

// 1) Tipo de artigo
if ($antes['snippet'] !== 'off') {
    if ($antes['snippet'] !== 'article') { $t['pt_post_default_rich_snippet'] = 'article'; $mudou[] = 'snippet'; }
    if ($antes['tipo'] !== 'NewsArticle') { $t['pt_post_default_article_type'] = 'NewsArticle'; $mudou[] = 'tipo'; }
}

// 2) Publisher como organizacao
if ($antes['kg'] !== 'company') { $t['knowledgegraph_type'] = 'company'; $mudou[] = 'kg'; }
if (empty($t['knowledgegraph_name'])) {
    $t['knowledgegraph_name'] = !empty($t['website_name']) ? $t['website_name'] : get_bloginfo('name');
    $mudou[] = 'nome';
}

// 3) Logo: tema -> icone do site
$logo = '';
if (empty($t['knowledgegraph_logo'])) {
    $cl = get_theme_mod('custom_logo');
    if ($cl) { $src = wp_get_attachment_image_src($cl, 'full'); if ($src) { $logo = $src[0]; } }
    if ($logo === '') { $sid = get_option('site_icon'); if ($sid) { $src = wp_get_attachment_image_src($sid, 'full'); if ($src) { $logo = $src[0]; } } }
    if ($logo !== '') { $t['knowledgegraph_logo'] = $logo; $mudou[] = 'logo'; }
}

if (!$mudou) { echo "$host|OK-ja-portal\n"; return; }

update_option('rank-math-options-titles', $t);
$dep = (array) get_option('rank-math-options-titles');
$ok  = (isset($dep['knowledgegraph_type']) && $dep['knowledgegraph_type'] === 'company');
$tipoDep = isset($dep['pt_post_default_article_type']) ? $dep['pt_post_default_article_type'] : '?';

echo "$host|" . ($ok ? 'FIXED' : 'PARCIAL') . " [" . implode(',', $mudou) . "] tipo=$tipoDep logo=" . (empty($dep['knowledgegraph_logo']) ? 'sem' : 'sim') . "\n";
if (function_exists('do_action')) { do_action('litespeed_purge_all'); }
