<?php
/**
 * Exporta os registros que a WP_Query do `exporta_flr.php` NAO trouxe.
 *
 * 🔴 **`--skip-plugins` nao pula mu-plugin.** Este portal tem o
 * `qmix-ocultar-cat-en.php`, que filtra em `pre_get_posts` a categoria em
 * ingles. Resultado: a WP_Query devolveu 4.506 de 4.658, e os **152 que faltam
 * sao quase todos da categoria `life`**, mais os 2 de status `nao`.
 *
 * Eles existem no banco, tem URL e podem carregar backlink de cliente. Ficar de
 * fora do inventario significaria apaga-los sem nunca terem sido classificados.
 *
 * Aqui a lista de IDs sai de **SQL direto**, e o registro e montado com
 * `get_post()`, no mesmo formato do acervo, para poder ser concatenado nele.
 */
global $wpdb;
$ja = [];
$fh0 = fopen('/tmp/folhar-acervo.jsonl', 'r');
while (($linha = fgets($fh0)) !== false) {
    $d = json_decode($linha, true);
    if ($d && isset($d['id'])) $ja[(int) $d['id']] = 1;
}
fclose($fh0);

$todos = $wpdb->get_col("SELECT ID FROM {$wpdb->posts} WHERE post_type IN ('post','page')");
$saida = '/tmp/folhar-falta.jsonl';
$fh = fopen($saida, 'w');
$n = 0;
$porcat = [];
$porstatus = [];
foreach ($todos as $id) {
    $id = (int) $id;
    if (isset($ja[$id])) continue;
    $p = get_post($id);
    if (!$p) continue;
    $cats = [];
    foreach (wp_get_post_terms($id, 'category', ['fields' => 'all']) as $t) {
        $cats[] = ['slug' => $t->slug, 'name' => $t->name];
        $porcat[$t->slug] = (isset($porcat[$t->slug]) ? $porcat[$t->slug] : 0) + 1;
    }
    $tags = wp_get_post_terms($id, 'post_tag', ['fields' => 'slugs']);
    $u = get_userdata($p->post_author);
    $thumb = get_post_thumbnail_id($id);
    $porstatus[$p->post_status] = (isset($porstatus[$p->post_status]) ? $porstatus[$p->post_status] : 0) + 1;
    $reg = [
        'id'        => $id,
        'slug'      => $p->post_name,
        'url'       => get_permalink($id),
        'title'     => $p->post_title,
        'type'      => $p->post_type,
        'status'    => $p->post_status,
        'date'      => $p->post_date_gmt,
        'modified'  => $p->post_modified_gmt,
        'author'    => $u ? $u->display_name : '',
        'author_login' => $u ? $u->user_login : '',
        'cats'      => $cats,
        'tags'      => is_array($tags) ? $tags : [],
        'excerpt'   => $p->post_excerpt,
        'content'   => $p->post_content,
        'thumb'     => $thumb ? wp_get_attachment_url($thumb) : '',
        'thumb_alt' => $thumb ? get_post_meta($thumb, '_wp_attachment_image_alt', true) : '',
    ];
    fwrite($fh, json_encode($reg, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n");
    $n++;
    if ($n % 50 === 0) wp_cache_flush();
}
fclose($fh);
echo "  no banco: " . count($todos) . " | ja exportados: " . count($ja) . " | recuperados agora: $n\n";
foreach ($porstatus as $k => $v) echo "    status $k: $v\n";
foreach ($porcat as $k => $v) echo "    categoria $k: $v\n";
