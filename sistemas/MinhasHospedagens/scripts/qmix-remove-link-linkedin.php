<?php
// Remove o link do artigo do LinkedIn da QMIX ("comprar backlinks vale a pena")
// do corpo dos posts, preservando o texto ancora.
// APLICAR=1 executa; sem isso, so relata.
//
// Regras da rede: backup do conteudo original em post meta, e gravacao direta
// via $wpdb->update para NAO tocar em post_modified (timestamp sincronizado em
// 100 portais e o rastro que ferramentas de clustering procuram).
global $wpdb;
$host    = strtolower((string) parse_url(get_option('home'), PHP_URL_HOST));
$aplicar = getenv('APLICAR') === '1';
$alvo    = 'comprar-backlinks-vale-pena';

$rows = $wpdb->get_results($wpdb->prepare(
    "SELECT ID, post_title, post_content FROM {$wpdb->posts}
     WHERE post_status='publish' AND post_content LIKE %s",
    '%' . $wpdb->esc_like($alvo) . '%'
));

$total = 0;
foreach ($rows as $r) {
    $orig = $r->post_content;

    // 1) <a ...href="...alvo...">texto</a>  ->  texto
    $novo = preg_replace_callback(
        '#<a\b[^>]*href\s*=\s*(["\'])([^"\']*' . preg_quote($alvo, '#') . '[^"\']*)\1[^>]*>(.*?)</a>#is',
        function ($m) { return $m[3]; },
        $orig
    );
    // 2) URL solta no texto
    $novo = preg_replace('#https?://[^\s"\'<>]*' . preg_quote($alvo, '#') . '[^\s"\'<>]*#i', '', $novo);

    if ($novo === $orig) { continue; }

    $qtd = preg_match_all('#' . preg_quote($alvo, '#') . '#i', $orig);
    $total += $qtd;
    echo $host . "\t" . $r->ID . "\t" . $qtd . "\t" . substr($r->post_title, 0, 60) . "\n";

    if (!$aplicar) { continue; }

    update_post_meta($r->ID, 'oie_link_removed_' . time(), $orig);
    $wpdb->update($wpdb->posts, array('post_content' => $novo), array('ID' => $r->ID));
    clean_post_cache($r->ID);
}

echo $host . '|TOTAL=' . $total . '|' . ($aplicar ? 'REMOVIDO' : 'simulacao') . "\n";
if ($aplicar && $total && function_exists('do_action')) { do_action('litespeed_purge_all'); }
