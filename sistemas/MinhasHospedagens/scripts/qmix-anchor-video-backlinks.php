<?php
/**
 * qmix-anchor-video-backlinks.php
 *
 * Insere UM link (dofollow, nova aba) para o vídeo do YouTube na primeira
 * ocorrência da palavra "backlinks" em UM artigo do site.
 *
 * Regras:
 *  - um link por domínio (idempotente: se já existe o ID do vídeo no conteúdo,
 *    não faz nada e devolve a URL de quem já tem);
 *  - a âncora é a própria palavra encontrada, preservando maiúsculas/minúsculas;
 *  - só substitui texto puro: pula o que está dentro de <a>, de headings,
 *    de <script>/<style>/<figcaption> e de atributos de tag;
 *  - prefere artigo cujo TÍTULO fala de backlink (mais tópico); empate = mais recente;
 *  - preserva `post_modified` (evita carimbar a rede toda no mesmo dia).
 *
 * Uso:  QMIX_DRY=1 wp --path=/caminho eval-file qmix-anchor-video-backlinks.php
 * Saída: host|OK|post_id|url|palavra   ·   host|JA_TEM|url   ·   host|SEM_CANDIDATO
 */

$VIDEO_ID  = 'RQevDiUOJz0';
$VIDEO_URL = 'https://youtu.be/RQevDiUOJz0';
$DRY       = getenv('QMIX_DRY') === '1';

global $wpdb;
$host = parse_url(home_url(), PHP_URL_HOST);

/** Já existe o vídeo em algum conteúdo? Então este domínio está feito. */
$jaTem = $wpdb->get_var(
    $wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts}
          WHERE post_status = 'publish' AND post_type = 'post'
            AND post_content LIKE %s LIMIT 1",
        '%' . $wpdb->esc_like($VIDEO_ID) . '%'
    )
);
if ($jaTem) {
    echo $host . '|JA_TEM|' . get_permalink($jaTem) . "\n";
    return;
}

/**
 * Acha a posição segura da palavra e devolve o conteúdo já com o link.
 * Devolve null quando não há ocorrência aproveitável.
 */
function qmix_anchor_insert($content, $palavra, $url) {
    $partes = preg_split('/(<[^>]+>)/u', $content, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
    if (!$partes) { return null; }

    $emLink = 0; $emHeading = 0; $emBloqueado = 0;
    $saida = ''; $feito = false;

    foreach ($partes as $p) {
        if (!$feito && $p !== '' && $p[0] === '<') {
            // controla os contextos onde NÃO se pode inserir
            if (preg_match('/^<a[\s>]/i', $p))                        { $emLink++; }
            elseif (preg_match('/^<\/a>/i', $p))                      { $emLink = max(0, $emLink - 1); }
            elseif (preg_match('/^<h[1-6][\s>]/i', $p))               { $emHeading++; }
            elseif (preg_match('/^<\/h[1-6]>/i', $p))                 { $emHeading = max(0, $emHeading - 1); }
            elseif (preg_match('/^<(script|style|figcaption)[\s>]/i', $p)) { $emBloqueado++; }
            elseif (preg_match('/^<\/(script|style|figcaption)>/i', $p))   { $emBloqueado = max(0, $emBloqueado - 1); }
            $saida .= $p;
            continue;
        }

        if (!$feito && !$emLink && !$emHeading && !$emBloqueado
            && preg_match('/\b' . $palavra . '\b/iu', $p, $m, PREG_OFFSET_CAPTURE)) {
            $achado = $m[0][0];              // preserva a caixa original
            $off    = $m[0][1];
            $link   = '<a href="' . $url . '" target="_blank" rel="noopener">' . $achado . '</a>';
            $p      = substr($p, 0, $off) . $link . substr($p, $off + strlen($achado));
            $feito  = true;
        }
        $saida .= $p;
    }

    return $feito ? $saida : null;
}

/** Candidatos: artigos publicados que citam a palavra. */
$rows = $wpdb->get_results(
    "SELECT ID, post_title, post_content, post_date FROM {$wpdb->posts}
      WHERE post_status = 'publish' AND post_type = 'post'
        AND post_content LIKE '%backlink%'
      ORDER BY post_date DESC"
);
if (!$rows) { echo $host . "|SEM_CANDIDATO\n"; return; }

// Ordena: título que fala de backlink primeiro; depois mais recente (já veio ordenado).
usort($rows, function ($a, $b) {
    $ta = preg_match('/backlink/i', $a->post_title) ? 0 : 1;
    $tb = preg_match('/backlink/i', $b->post_title) ? 0 : 1;
    if ($ta !== $tb) { return $ta - $tb; }
    return strcmp($b->post_date, $a->post_date);
});

$escolhido = null; $novo = null; $palavraUsada = null;

// Primeiro tenta o plural (a palavra-chave pedida); só cai no singular se nenhum
// artigo do site tiver a forma plural em texto puro.
foreach (array('backlinks', 'backlink') as $palavra) {
    foreach ($rows as $r) {
        $tentativa = qmix_anchor_insert($r->post_content, $palavra, $VIDEO_URL);
        if ($tentativa !== null) {
            $escolhido = $r; $novo = $tentativa; $palavraUsada = $palavra;
            break 2;
        }
    }
}

if (!$escolhido) { echo $host . "|SEM_CANDIDATO\n"; return; }

if ($DRY) {
    echo $host . '|DRY|' . $escolhido->ID . '|' . get_permalink($escolhido->ID)
       . '|' . $palavraUsada . '|' . mb_substr(strip_tags($escolhido->post_title), 0, 60) . "\n";
    return;
}

// Grava direto: wp_update_post carimbaria post_modified na rede inteira no mesmo dia.
$ok = $wpdb->update($wpdb->posts, array('post_content' => $novo), array('ID' => $escolhido->ID));
if ($ok === false) { echo $host . "|ERRO_UPDATE|" . $escolhido->ID . "\n"; return; }

clean_post_cache($escolhido->ID);
if (function_exists('do_action')) { do_action('litespeed_purge_post', $escolhido->ID); }

echo $host . '|OK|' . $escolhido->ID . '|' . get_permalink($escolhido->ID) . '|' . $palavraUsada . "\n";
