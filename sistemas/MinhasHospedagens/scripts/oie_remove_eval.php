<?php
// Fallback de remocao de links para sites WP onde `wp oie audit-links` NAO funciona
// (classe OIE_Link_Audit_Command declarada no tema sem registrar o subcomando).
// Tira <a href="...dominio...">texto</a> -> texto, preserva post_modified, backup reversivel.
// Parametros via env: OIE_DOMAINS (csv, obrigatorio), OIE_DRY=1 (opcional).
// Rodar: wp --path=SITE eval-file oie_remove_eval.php
global $wpdb;
$domains = array_filter(array_map('trim', explode(',', (string) getenv('OIE_DOMAINS'))));
if (!$domains) { echo "ERRO: defina OIE_DOMAINS\n"; return; }
$dry = getenv('OIE_DRY') === '1';
$ts  = getenv('OIE_TS') ?: time();

$ids = array();
foreach ($domains as $dm) {
    $like = '%' . $wpdb->esc_like($dm) . '%';
    foreach ($wpdb->get_col($wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts} WHERE post_status='publish' AND post_content LIKE %s", $like)) as $id) {
        $ids[$id] = 1;
    }
}
$tp = 0; $tl = 0;
foreach (array_keys($ids) as $id) {
    $post = get_post($id);
    if (!$post) { continue; }
    $orig = $post->post_content;
    $content = $orig;
    $cnt = 0;
    foreach ($domains as $dm) {
        $pattern = '/<a\s[^>]*href\s*=\s*["\'][^"\']*' . preg_quote($dm, '/') . '[^"\']*["\'][^>]*>(.*?)<\/a>/is';
        $content = preg_replace_callback($pattern, function ($m) use (&$cnt) { $cnt++; return $m[1]; }, $content);
    }
    if ($cnt > 0 && $content !== $orig) {
        if (!$dry) {
            update_post_meta($id, 'oie_link_removed_' . $ts, $orig);
            $wpdb->update($wpdb->posts, array('post_content' => $content), array('ID' => $id));
            clean_post_cache($id);
        }
        $tp++; $tl += $cnt;
    }
}
echo ($dry ? "[DRY] " : "[DONE] ") . "Posts: $tp | Links: $tl\n";
