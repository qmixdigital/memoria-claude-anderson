<?php
// Cria a pagina de contato onde ela nao existe e a liga ao menu do rodape.
// O formulario em si e gerado pelo mu-plugin qmix-form-endpoint.php.
// Texto varia por dominio: pagina identica em 11 portais seria rastro.
$host = strtolower((string) parse_url(get_option('home'), PHP_URL_HOST));
$nome = get_bloginfo('name');

$ja = get_page_by_path('contato');
if ($ja) { echo "$host|JA-EXISTE|" . get_permalink($ja) . "\n"; return; }

$h = md5('pagina-contato|' . $host);

$titulos = array('Contato', 'Fale com a redação', 'Contato', 'Fale conosco');
$titulo  = $titulos[hexdec(substr($h, 0, 2)) % 4];

$intros = array(
    "Quer falar com a equipe do $nome? Use o formulário abaixo para enviar sugestão de pauta, correção em matéria publicada ou proposta de parceria. Lemos todas as mensagens e respondemos no e-mail informado.",
    "Esta é a via direta com a redação do $nome. Envie sua mensagem pelo formulário abaixo: sugestões de reportagem, pedidos de correção e assuntos comerciais chegam por aqui e são respondidos por e-mail.",
    "Fale com o $nome. Preencha o formulário abaixo com o assunto que precisa tratar, seja uma pauta, uma correção ou uma proposta comercial, e nossa equipe retorna pelo e-mail que você informar.",
    "O $nome está aberto ao contato de leitores, fontes e parceiros. Escreva pelo formulário abaixo e detalhe o assunto na mensagem para que a resposta chegue até você com a informação certa.",
);
$intro = $intros[hexdec(substr($h, 2, 2)) % 4];

$id = wp_insert_post(array(
    'post_type'    => 'page',
    'post_title'   => $titulo,
    'post_name'    => 'contato',
    'post_status'  => 'publish',
    'post_content' => '<p>' . $intro . '</p>',
    'comment_status' => 'closed',
    'ping_status'    => 'closed',
), true);

if (is_wp_error($id)) { echo "$host|ERRO|" . $id->get_error_message() . "\n"; return; }

// Liga a pagina a um menu existente para nao nascer orfa.
$ligada = 'nenhum-menu';
$locais = get_nav_menu_locations();
$alvo   = 0;
foreach ($locais as $loc => $term) {
    if (!$term) { continue; }
    if (preg_match('/footer|rodape|secondary|bottom/i', $loc)) { $alvo = $term; break; }
    if (!$alvo) { $alvo = $term; }
}
if ($alvo) {
    $r = wp_update_nav_menu_item($alvo, 0, array(
        'menu-item-title'     => $titulo,
        'menu-item-object'    => 'page',
        'menu-item-object-id' => $id,
        'menu-item-type'      => 'post_type',
        'menu-item-status'    => 'publish',
    ));
    $menu = wp_get_nav_menu_object($alvo);
    $ligada = is_wp_error($r) ? 'falhou' : ($menu ? $menu->name : 'ok');
}

if (function_exists('do_action')) { do_action('litespeed_purge_all'); }
echo "$host|CRIADA|" . get_permalink($id) . "|menu=$ligada\n";
