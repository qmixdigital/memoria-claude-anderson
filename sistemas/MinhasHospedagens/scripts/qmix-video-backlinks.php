<?php
/**
 * Plugin Name: QMIX - Video backlinks (teste SERP)
 * Description: Embute video do canal QMIX em artigos de backlinks/SEO e publica o VideoObject correspondente. Teste de posicionamento em video na SERP.
 * Version: 4.0
 * Author: QMIX Digital
 *
 * Quatro videos, UM por pagina (o mais aderente ao tema do artigo):
 *   - artigo EXPLICATIVO de backlink -> "O que sao backlinks e para que servem"
 *   - artigo sobre BACKLINKS         -> "Comprar Backlinks Vale a Pena em 2026?"
 *   - artigo sobre SEO em geral      -> "7 Erros Mais Comuns ao Comprar Backlinks"
 *   - cita backlink e estava sem video -> "Onde Comprar Backlinks: 6 Sinais"
 *
 * O video explicativo entra DENTRO da secao que fala de backlinks (logo apos o
 * primeiro paragrafo do bloco cujo subtitulo cita backlink), nao no topo do texto.
 *
 * Artigo que ja tem video proprio no texto nao recebe nada.
 *
 * REMOCAO: apague este arquivo de wp-content/mu-plugins/ e purgue o cache.
 * O conteudo dos posts NAO e alterado no banco - a injecao e via filtro the_content.
 */

if (!defined('ABSPATH')) { exit; }

function qmix_vb_videos() {
    return array(
        // Artigo que EXPLICA o que e backlink (didatico, iniciante).
        // Sem 'duration': o YouTube nao devolveu a duracao e chutar valor no
        // schema e pior que omitir o campo (ele e opcional no VideoObject).
        'oque' => array(
            'id'       => 'RQevDiUOJz0',
            'title'    => 'O que são backlinks e para que servem, do jeito mais simples',
            'upload'   => '2026-08-07T09:00:00-03:00',
            'desc'     => 'A QMIX Digital explica de forma simples o que é um backlink: um link de outro site apontando para o seu, que funciona como recomendação e ajuda o Google a entender a relevância da sua página. O vídeo mostra para que servem os backlinks, por que nem todo link tem o mesmo peso e o que olhar antes de buscar links.',
            'legendas' => array(
                'Vídeo: o que são backlinks e para que servem, explicado do jeito simples.',
                'Assista: backlink explicado em linguagem simples, sem jargão.',
                'Em vídeo: entenda em poucos minutos o que é um backlink.',
            ),
        ),
        // Preenche artigo que FALA de backlink mas nao tinha video nenhum.
        'onde' => array(
            'id'       => 'KeAFoto-QW0',
            'title'    => 'Onde Comprar Backlinks: 6 Sinais de Agência Confiável [2026]',
            'upload'   => '2026-08-03T13:19:00-07:00',
            'duration' => 'PT5M31S',
            'desc'     => 'A QMIX Digital lista os 6 sinais de uma agência de link building confiável e como verificar cada um: tempo de mercado com reputação limpa, contato real com os responsáveis, produção de conteúdo que indexa, preferência por portais de notícias, garantias formais com prazo e reposição, e transparência do portal ao relatório de entrega.',
            'legendas' => array(
                'Vídeo: 6 sinais de uma agência de backlinks confiável.',
                'Assista: como escolher onde comprar backlinks sem tomar prejuízo.',
                'Em vídeo: o filtro para não pagar por backlink que nunca chega.',
            ),
        ),
        'backlink' => array(
            'id'       => 'S-NDuJXnCuQ',
            'title'    => 'Comprar Backlinks Vale a Pena em 2026? O Que Ninguém Te Conta',
            'upload'   => '2026-08-02T07:40:53-07:00',
            'duration' => 'PT4M13S',
            'desc'     => 'A QMIX Digital explica quando comprar backlinks vale a pena e por que o risco maior não é a penalização do Google, e sim a página do link sair do índice: sem conteúdo de qualidade e portal com tráfego real, o link deixa de existir para o buscador.',
            'legendas' => array(
                'Vídeo: comprar backlinks vale a pena em 2026?',
                'Assista: o que ninguém conta sobre comprar backlinks.',
                'Em vídeo: quando o backlink comprado continua valendo daqui a um ano.',
            ),
        ),
        'seo' => array(
            'id'       => 'hE0EdPWue2U',
            'title'    => '7 Erros Mais Comuns ao Comprar Backlinks (Evite Antes que Seja Tarde) [2026]',
            'upload'   => '2026-04-06T15:25:02-07:00',
            'duration' => 'PT6M42S',
            'desc'     => 'A QMIX Digital mostra os 7 erros mais comuns de quem compra backlinks e que podem gerar penalização no Google: ignorar o SEO on-page, repetir o mesmo texto âncora, comprar links de sites sem tráfego real, entre outros pontos de atenção em link building.',
            'legendas' => array(
                'Vídeo: os 7 erros mais comuns de quem compra backlinks.',
                'Assista: o que evitar na hora de comprar backlinks.',
                'Em vídeo: erros de link building que geram penalização no Google.',
            ),
        ),
    );
}

/**
 * Qual video cabe neste artigo? Retorna 'backlink', 'seo', 'onde' ou false.
 *
 * Cuidados:
 * - "Seo" tambem e sobrenome coreano ("Lee Seo Yi", "Kang Seo-ha"). Por isso a sigla
 *   solta so vale em CAIXA ALTA, ou em minuscula acompanhada de termo de contexto.
 * - Titulos que sao vazamento de prompt de IA ("Hmm, o usuario pede um titulo...")
 *   sao paginas quebradas e ficam de fora do teste.
 */
function qmix_vb_pick($post) {
    if (!$post || $post->post_type !== 'post') { return false; }
    $t = $post->post_title;

    $lixo = '/^\s*(hmm|okay|ok|bem|primeiramente|vamos analisar|preciso)\b|usu[áa]rio (pede|pediu|solicita|precisa|quer)|t[íi]tulo jornal[íi]stico/iu';
    if (preg_match($lixo, $t)) { return apply_filters('qmix_vb_pick', false, $post); }

    // Artigo que ja traz video proprio no texto fica de fora: um video por pagina.
    if (preg_match('/<iframe[^>]+(youtube|youtu\.be|vimeo)/i', $post->post_content)) {
        return apply_filters('qmix_vb_pick', false, $post);
    }

    $mencoes = substr_count(mb_strtolower(wp_strip_all_tags($post->post_content)), 'backlink');

    $tituloBacklink = preg_match('/backlink|link ?building|linkbuilding|autoridade de dom[íi]nio/iu', $t);

    // 1) Artigo DIDATICO de backlink ("o que e", "para que serve", "guia para
    // iniciantes"). Avaliado antes do generico para nao levar o video de
    // "comprar backlinks" para quem so quer entender o conceito.
    $explicativo = preg_match(
        '/o que (é|e|s[ãa]o)|para que serv|como funcion|guia (completo|definitivo|b[áa]sico|pr[áa]tico|para iniciantes)|para iniciantes|do zero|passo a passo|significa(do)?\b|entenda|conceito|iniciantes/iu',
        $t
    );
    if ($tituloBacklink && $explicativo) { return apply_filters('qmix_vb_pick', 'oque', $post); }

    // 2) Artigo de backlinks: titulo inequivoco OU o assunto se repete no corpo.
    // O corte de mencoes evita marcar texto de marketing geral que so cita backlink de passagem.
    $minMencoes = (int) apply_filters('qmix_vb_min_mencoes', 5);
    if ($tituloBacklink || $mencoes >= $minMencoes) { return apply_filters('qmix_vb_pick', 'backlink', $post); }

    // 3) Artigo de SEO em geral.
    $sigla = preg_match('/(?<![\p{L}\-])(SEO|SERP)(?![\p{L}\-])/u', $t);
    $ctx   = preg_match('/(?<![\p{L}\-])(seo|serp)(?![\p{L}\-])/iu', $t)
          && preg_match('/google|site|sites|web|wordpress|ranq|ranking|tr[áa]fego|busca|pesquisa|marketing|conte[úu]do|otimiz|palavra-chave|ag[êe]ncia|especialista|estrat[ée]gi|auditoria|ferramenta|t[ée]cnic|on-page|off-page|indexa|algoritmo|digital/iu', $t);
    if ($sigla || $ctx) { return apply_filters('qmix_vb_pick', 'seo', $post); }

    // 4) Fala de backlink no corpo sem casar acima: pagina que estava sem video
    // nenhum. Vai o video de "onde comprar" (avaliado por ultimo justamente
    // para nao trocar o video de nenhuma pagina que ja tinha um).
    $minOnde = (int) apply_filters('qmix_vb_min_mencoes_onde', 3);
    if ($mencoes >= $minOnde) { return apply_filters('qmix_vb_pick', 'onde', $post); }

    return apply_filters('qmix_vb_pick', false, $post);
}

/** Compatibilidade com scripts de auditoria. */
function qmix_vb_is_target($post) { return (bool) qmix_vb_pick($post); }

/**
 * Variacao de marcacao por dominio - evita bloco identico em toda a rede.
 */
function qmix_vb_variant() {
    static $v = null;
    if ($v !== null) { return $v; }
    $h = md5(strtolower((string) parse_url(home_url(), PHP_URL_HOST)));
    $v = array(
        'slot'    => hexdec(substr($h, 0, 4)) % 3,   // 0 = apos 1o H2, 1 = apos 2o paragrafo, 2 = apos 1o paragrafo
        'sufixo'  => substr($h, 8, 6),
        'tag'     => (hexdec(substr($h, 4, 2)) % 2) ? 'figure' : 'div',
        'legenda' => hexdec(substr($h, 6, 2)) % 3,
    );
    return $v;
}

function qmix_vb_bloco($vid) {
    $v      = qmix_vb_variant();
    $sfx    = $v['sufixo'];
    $tag    = $v['tag'];
    $capTag = $tag === 'figure' ? 'figcaption' : 'p';
    $legenda = $vid['legendas'][$v['legenda']];

    $css = ".vb-$sfx{margin:28px 0}"
         . ".vb-$sfx .vbf-$sfx{position:relative;width:100%;aspect-ratio:16/9;background:#000;border-radius:10px;overflow:hidden}"
         . ".vb-$sfx .vbf-$sfx iframe{position:absolute;inset:0;width:100%;height:100%;border:0}"
         . ".vb-$sfx .vbc-$sfx{font-size:.9em;opacity:.8;margin:8px 0 0;text-align:left}";

    // data-no-lazy/data-skip-lazy: impede o LiteSpeed de trocar o src por about:blank
    // (o Googlebot precisa ver a URL real do embed no HTML de origem).
    $iframe = '<iframe src="https://www.youtube.com/embed/' . $vid['id'] . '" '
            . 'data-no-lazy="1" data-skip-lazy="1" '
            . 'title="' . esc_attr($vid['title']) . '" width="560" height="315" loading="lazy" '
            . 'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" '
            . 'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';

    return "\n<style>$css</style>\n"
         . "<$tag class=\"vb-$sfx\">"
         . "<div class=\"vbf-$sfx\">$iframe</div>"
         . "<$capTag class=\"vbc-$sfx\">" . esc_html($legenda) . "</$capTag>"
         . "</$tag>\n";
}

/**
 * Posicao "dentro da secao que fala de backlinks".
 *
 * Ordem de preferencia:
 *   1. subtitulo (h2/h3) da secao de links -> apos o 1o paragrafo do bloco;
 *   2. primeiro paragrafo que fala de links;
 *   3. subtitulo que fala de autoridade de dominio (assunto irmao; muitos
 *      artigos da rede tratam do tema sem usar a palavra "backlink");
 * Sem nenhuma delas, devolve null e o chamador usa o slot padrao.
 */
function qmix_vb_pos_secao($content) {
    $forte = '/backlink|link ?building|linkbuilding|links? externos?|links? de entrada|constru(ir|[çc][ãa]o) de links/iu';
    $fraco = '/autoridade de dom[íi]nio/iu';

    preg_match_all('/<h[23][^>]*>(.*?)<\/h[23]>/is', $content, $hs, PREG_OFFSET_CAPTURE | PREG_SET_ORDER);

    foreach (array($forte, $fraco) as $i => $re) {
        // entre os dois passes pelos titulos, tenta o paragrafo com o termo forte
        if ($i === 1) {
            if (preg_match_all('/<p\b[^>]*>.*?<\/p>/is', $content, $ps, PREG_OFFSET_CAPTURE)) {
                foreach ($ps[0] as $p) {
                    if (preg_match($forte, wp_strip_all_tags($p[0]))) { return $p[1] + strlen($p[0]); }
                }
            }
        }
        foreach ($hs as $h) {
            if (!preg_match($re, wp_strip_all_tags($h[1][0]))) { continue; }
            $fimTitulo = $h[0][1] + strlen($h[0][0]);
            if (preg_match('/<\/p>/i', substr($content, $fimTitulo), $p, PREG_OFFSET_CAPTURE)) {
                return $fimTitulo + $p[0][1] + strlen($p[0][0]);
            }
            return $fimTitulo;
        }
    }

    return null;
}

/**
 * Injeta o bloco no corpo do artigo (nao grava no banco).
 */
function qmix_vb_inject($content) {
    if (is_admin() || !is_singular('post') || !in_the_loop() || !is_main_query()) { return $content; }
    $post = get_post();
    $key  = qmix_vb_pick($post);
    if (!$key) { return $content; }

    $vid = qmix_vb_videos()[$key];
    if (strpos($content, $vid['id']) !== false) { return $content; }  // ja tem o video no texto

    $bloco = qmix_vb_bloco($vid);
    $slot  = qmix_vb_variant()['slot'];

    // O video explicativo vai para dentro da secao de backlinks; os demais
    // mantem a posicao que ja tinham, para nao mexer no que o Google ja rastreou.
    if ($key === 'oque') {
        $pos = qmix_vb_pos_secao($content);
        if ($pos !== null) {
            return substr($content, 0, $pos) . $bloco . substr($content, $pos);
        }
    }

    if ($slot === 0 && preg_match('/<\/h2>/i', $content, $m, PREG_OFFSET_CAPTURE)) {
        $pos = $m[0][1] + strlen($m[0][0]);
        return substr($content, 0, $pos) . $bloco . substr($content, $pos);
    }

    $alvo = ($slot === 1) ? 2 : 1;  // apos o N-esimo </p>
    if (preg_match_all('/<\/p>/i', $content, $m, PREG_OFFSET_CAPTURE) && count($m[0]) >= $alvo) {
        $pos = $m[0][$alvo - 1][1] + strlen($m[0][$alvo - 1][0]);
        return substr($content, 0, $pos) . $bloco . substr($content, $pos);
    }

    return $content . $bloco;
}
add_filter('the_content', 'qmix_vb_inject', 20);

/**
 * VideoObject - e isto que o Google usa para indexar o video da pagina.
 */
function qmix_vb_schema() {
    if (!is_singular('post')) { return; }
    $post = get_post();
    $key  = qmix_vb_pick($post);
    if (!$key) { return; }
    $vid = qmix_vb_videos()[$key];

    $schema = array(
        '@context'     => 'https://schema.org',
        '@type'        => 'VideoObject',
        'name'         => $vid['title'],
        'description'  => $vid['desc'],
        'thumbnailUrl' => array(
            'https://i.ytimg.com/vi/' . $vid['id'] . '/maxresdefault.jpg',
            'https://i.ytimg.com/vi/' . $vid['id'] . '/hqdefault.jpg',
        ),
        'uploadDate'   => $vid['upload'],
        'embedUrl'     => 'https://www.youtube.com/embed/' . $vid['id'],
        'publisher'    => array(
            '@type' => 'Organization',
            'name'  => 'QMIX Digital',
            'url'   => 'https://www.youtube.com/@qmixdigital',
        ),
        'isFamilyFriendly' => true,
        'inLanguage'       => 'pt-BR',
        'mainEntityOfPage' => get_permalink($post),
    );
    if (!empty($vid['duration'])) { $schema['duration'] = $vid['duration']; }

    echo "\n<script type=\"application/ld+json\">" . wp_json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "</script>\n";
}
add_action('wp_head', 'qmix_vb_schema', 30);
