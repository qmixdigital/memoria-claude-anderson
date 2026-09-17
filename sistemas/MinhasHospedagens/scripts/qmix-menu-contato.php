<?php
// A pagina de contato recebe algum link de menu? Se nao, cria/liga um menu de rodape.
// APLICAR=1 executa. Sem isso, so relata.
$host    = strtolower((string) parse_url(get_option('home'), PHP_URL_HOST));
$aplicar = getenv('APLICAR') === '1';

$pag = get_page_by_path('contato');
if (!$pag) {
    foreach (array('contact', 'fale-conosco', 'faleconosco') as $s) {
        $pag = get_page_by_path($s);
        if ($pag) { break; }
    }
}
if (!$pag) { echo "$host|SEM-PAGINA\n"; return; }

// Ja existe item de menu apontando para ela?
$temLink = false;
foreach (wp_get_nav_menus() as $menu) {
    foreach (wp_get_nav_menu_items($menu->term_id) ?: array() as $item) {
        if ((int) $item->object_id === (int) $pag->ID && $item->type === 'post_type') { $temLink = true; break 2; }
        if (!empty($item->url) && rtrim($item->url, '/') === rtrim(get_permalink($pag), '/')) { $temLink = true; break 2; }
    }
}
if ($temLink) { echo "$host|JA-TEM-LINK\n"; return; }
if (!$aplicar) { echo "$host|SEM-LINK|pagina=" . get_permalink($pag) . "\n"; return; }

// Escolhe um local de menu do tema, preferindo rodape.
$locais = get_registered_nav_menus();
$escolhido = '';
foreach (array_keys($locais) as $loc) {
    if (preg_match('/footer|rodape|bottom/i', $loc)) { $escolhido = $loc; break; }
}
if ($escolhido === '' && $locais) { $escolhido = array_key_first($locais); }

$atuais = get_nav_menu_locations();
$termId = ($escolhido && !empty($atuais[$escolhido])) ? (int) $atuais[$escolhido] : 0;
$criou  = 'nao';

if (!$termId) {
    $nomes = array('Rodapé', 'Institucional', 'Links do rodapé', 'Navegação do rodapé');
    $nome  = $nomes[hexdec(substr(md5('menu|' . $host), 0, 2)) % 4];
    $novo  = wp_create_nav_menu($nome);
    if (is_wp_error($novo)) { echo "$host|ERRO-MENU|" . $novo->get_error_message() . "\n"; return; }
    $termId = (int) $novo;
    $criou  = $nome;

    // Politica de privacidade e termos entram junto quando existem.
    foreach (array('politica-de-privacidade', 'politica-privacidade', 'termos-de-uso', 'sobre') as $slug) {
        $p = get_page_by_path($slug);
        if (!$p) { continue; }
        wp_update_nav_menu_item($termId, 0, array(
            'menu-item-title'     => get_the_title($p),
            'menu-item-object'    => 'page',
            'menu-item-object-id' => $p->ID,
            'menu-item-type'      => 'post_type',
            'menu-item-status'    => 'publish',
        ));
    }
    if ($escolhido) {
        $atuais[$escolhido] = $termId;
        set_theme_mod('nav_menu_locations', $atuais);
    }
}

$r = wp_update_nav_menu_item($termId, 0, array(
    'menu-item-title'     => get_the_title($pag),
    'menu-item-object'    => 'page',
    'menu-item-object-id' => $pag->ID,
    'menu-item-type'      => 'post_type',
    'menu-item-status'    => 'publish',
));
if (is_wp_error($r)) { echo "$host|ERRO-ITEM|" . $r->get_error_message() . "\n"; return; }

if (function_exists('do_action')) { do_action('litespeed_purge_all'); }
$menu = wp_get_nav_menu_object($termId);
echo "$host|LIGADA|menu=" . ($menu ? $menu->name : '?') . "|local=" . ($escolhido ?: 'sem-local') . "|menu-novo=$criou\n";
