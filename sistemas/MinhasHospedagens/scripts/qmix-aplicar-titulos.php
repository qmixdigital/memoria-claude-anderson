<?php
// Troca o titulo vazado pela manchete escrita para cada post.
// Le /tmp/mapa-titulos.json e usa a entrada do proprio dominio.
// APLICAR=1 executa; sem isso, so mostra o que faria.
//
// Cuidados:
//  - NAO mexe no slug: URL indexada e backlink apontam para ela.
//  - Grava via $wpdb->update para preservar post_modified (timestamp igual em
//    dezenas de portais no mesmo minuto e rastro de rede).
//  - Guarda o titulo antigo em post meta, entao da para reverter.
global $wpdb;
$host    = strtolower((string) parse_url(get_option('home'), PHP_URL_HOST));
$bare    = preg_replace('/^www\./', '', $host);
$aplicar = getenv('APLICAR') === '1';

$json = @file_get_contents('/tmp/mapa-titulos.json');
if (!$json) { echo "$host|SEM-MAPA\n"; return; }
$mapa = json_decode($json, true);
$meu  = isset($mapa[$host]) ? $mapa[$host] : (isset($mapa[$bare]) ? $mapa[$bare] : null);
if (!$meu) { return; }

$ok = 0;
foreach ($meu as $id => $novo) {
    $id = (int) $id;
    $p  = get_post($id);
    if (!$p) { echo "$host|$id|NAO-ENCONTRADO\n"; continue; }

    if ($novo === 'RASCUNHO') {
        echo "$host|$id|" . ($aplicar ? 'DESPUBLICADO' : 'iria-despublicar') . "|" . mb_substr($p->post_title, 0, 50) . "\n";
        if ($aplicar) {
            update_post_meta($id, 'oie_titulo_original', $p->post_title);
            wp_update_post(array('ID' => $id, 'post_status' => 'draft'));
            clean_post_cache($id);
            $ok++;
        }
        continue;
    }

    echo "$host|$id|" . ($aplicar ? 'RENOMEADO' : 'iria-renomear') . "|" . $novo . "\n";
    if (!$aplicar) { continue; }

    update_post_meta($id, 'oie_titulo_original', $p->post_title);
    $wpdb->update($wpdb->posts, array('post_title' => $novo), array('ID' => $id));

    // Titulo de SEO proprio, se tiver herdado o texto vazado, sai de cena.
    $seo = get_post_meta($id, 'rank_math_title', true);
    if ($seo && preg_match('/usu[áa]rio (pede|pediu|solicita|quer|precisa)|t[íi]tulo jornal[íi]stico|^\s*hmm\b/iu', $seo)) {
        delete_post_meta($id, 'rank_math_title');
    }
    $spo = get_post_meta($id, '_seopress_titles_title', true);
    if ($spo && preg_match('/usu[áa]rio (pede|pediu|solicita|quer|precisa)|t[íi]tulo jornal[íi]stico|^\s*hmm\b/iu', $spo)) {
        delete_post_meta($id, '_seopress_titles_title');
    }

    clean_post_cache($id);
    $ok++;
}

if ($aplicar && $ok && function_exists('do_action')) { do_action('litespeed_purge_all'); }
echo "$host|TOTAL=$ok\n";
