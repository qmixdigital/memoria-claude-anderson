<?php
/**
 * Plugin Name: QMIX - AdSense
 * Description: Carrega o script do AdSense e a meta de verificacao no frontend. Nao entra em admin, login, 404 nem preview.
 * Version: 1.0
 * Author: QMIX Digital
 *
 * O publisher tem DUAS formas e elas NAO sao intercambiaveis:
 *   - script e meta: COM o prefixo -> ca-pub-3880875536722698
 *   - ads.txt:       SEM o prefixo -> pub-3880875536722698
 * Com o ID errado no `client=` o script baixa normal, responde 200 e nao serve
 * anuncio nenhum. A falha e silenciosa; por isso a normalizacao abaixo.
 *
 * REMOCAO: apague este arquivo de wp-content/mu-plugins/ e purgue o cache.
 */

if (!defined('ABSPATH')) { exit; }

if (!defined('QMIX_ADSENSE_ID')) { define('QMIX_ADSENSE_ID', '3880875536722698'); }

/** Aceita o ID salvo em qualquer uma das duas formas e devolve a forma COM prefixo. */
function qmix_adsense_client() {
    $id = trim((string) QMIX_ADSENSE_ID);
    $id = preg_replace('/^(ca-)?pub-/', '', $id);
    return 'ca-pub-' . $id;
}

/**
 * Onde NAO deve haver anuncio: painel, login, feed, preview e tela de erro.
 * Em 404 o proprio Google pede que o pedido de anuncio seja pausado.
 */
function qmix_adsense_pagina_valida() {
    if (is_admin() || is_feed() || is_preview() || is_robots()) { return false; }
    if (function_exists('is_login') && is_login()) { return false; }
    return true;
}

function qmix_adsense_head() {
    if (!qmix_adsense_pagina_valida()) { return; }

    $client = qmix_adsense_client();

    echo "\n" . '<meta name="google-adsense-account" content="' . esc_attr($client) . '">' . "\n";

    // 404 continua carregando o script (a verificacao do Google pode cair aqui),
    // mas com o pedido de anuncio pausado pela API oficial.
    if (is_404()) {
        echo '<script>(window.adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1;</script>' . "\n";
    }

    echo '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='
       . esc_attr($client) . '" crossorigin="anonymous"></script>' . "\n";
}
add_action('wp_head', 'qmix_adsense_head', 5);
