<?php
/**
 * Conta, por site, quantos posts caem em cada video do qmix-video-backlinks.
 * Roda com o mu-plugin ja carregado (usa a propria funcao de selecao).
 * Saida: dominio|oque=N|backlink=N|seo=N|onde=N  + ate 3 URLs do video novo.
 */
global $wpdb;
if (!function_exists('qmix_vb_pick')) { echo "SEM PLUGIN\n"; return; }

$rows = $wpdb->get_results(
    "SELECT ID, post_title, post_content, post_type FROM {$wpdb->posts}
     WHERE post_status='publish' AND post_type='post'"
);

$tot = array('oque' => 0, 'backlink' => 0, 'seo' => 0, 'onde' => 0);
$amostra = array();
foreach ($rows as $r) {
    $k = qmix_vb_pick($r);
    if (!$k || !isset($tot[$k])) { continue; }
    $tot[$k]++;
    if ($k === 'oque' && count($amostra) < 3) {
        // confirma que a posicao "dentro da secao" foi encontrada
        $pos = qmix_vb_pos_secao($r->post_content);
        $amostra[] = get_permalink($r->ID) . ($pos === null ? ' [slot padrao]' : ' [na secao]');
    }
}

$host = parse_url(home_url(), PHP_URL_HOST);
echo $host . '|oque=' . $tot['oque'] . '|backlink=' . $tot['backlink']
   . '|seo=' . $tot['seo'] . '|onde=' . $tot['onde'] . "\n";
foreach ($amostra as $u) { echo '  ' . $u . "\n"; }
