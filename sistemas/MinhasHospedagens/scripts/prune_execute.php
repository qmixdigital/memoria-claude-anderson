<?php
/**
 * QMIX Content Pruning - Executor (per portal)
 *
 * Roda via: wp eval-file /tmp/prune_execute.php
 * Lê arquivo JSON em /tmp/prune_input.json com os IDs aprovados.
 *
 * 3 fases idempotentes (cada execução roda todas):
 *   1. Mover publish → draft (IDs novos do input.json)
 *   2. Mover draft → trash (drafts com _qmix_pruned_at >= 30d)
 *   3. Force-delete (trash com <<REMOVIDO>> >= 30d)
 *
 * Backup completo de post_content em meta antes de cada transição.
 * NÃO mexe em post_modified (atualiza só status via $wpdb direto).
 */

if (!defined('ABSPATH')) {
    fwrite(STDERR, "must run via wp eval-file\n");
    exit(1);
}

global $wpdb;

$input_file = '/tmp/prune_input.json';
if (!file_exists($input_file)) {
    fwrite(STDERR, "missing /tmp/prune_input.json\n");
    exit(1);
}
$input = json_decode(file_get_contents($input_file), true);
$ids_to_draft = isset($input['ids_to_draft']) ? array_map('intval', $input['ids_to_draft']) : array();
$dry_run      = !empty($input['dry_run']);
$now          = time();

// NÃO usar ?: aqui — em PHP a string "0" é falsy, o que ignoraria grace=0.
$_gd = getenv('QMIX_PRUNE_DRAFT_GRACE');
$grace_draft_days = ($_gd === false || $_gd === '') ? 30 : (int) $_gd;
$_gt = getenv('QMIX_PRUNE_TRASH_GRACE');
$grace_trash_days = ($_gt === false || $_gt === '') ? 30 : (int) $_gt;

$report = array(
    'phase_1_drafted'  => array(),
    'phase_2_trashed'  => array(),
    'phase_3_deleted'  => array(),
    'errors'           => array(),
    'dry_run'          => $dry_run,
);

// ============================================================
// FASE 1: publish -> draft (IDs do input)
// ============================================================
foreach ($ids_to_draft as $id) {
    $post = get_post($id);
    if (!$post) {
        $report['errors'][] = array('id' => $id, 'phase' => 1, 'msg' => 'not_found');
        continue;
    }
    if ($post->post_status !== 'publish') {
        $report['errors'][] = array('id' => $id, 'phase' => 1, 'msg' => 'not_publish:' . $post->post_status);
        continue;
    }
    if ($dry_run) {
        $report['phase_1_drafted'][] = array('id' => $id, 'title' => $post->post_title, 'dry_run' => true);
        continue;
    }
    // Backup ANTES de transicionar
    update_post_meta($id, '_qmix_pruned_at', $now);
    update_post_meta($id, '_qmix_pruned_stage', 'drafted');
    update_post_meta($id, '_qmix_pruned_reason', 'low_traffic_no_outbound');
    update_post_meta($id, '_qmix_pruned_backup_content', $post->post_content);
    update_post_meta($id, '_qmix_pruned_backup_excerpt', $post->post_excerpt);
    update_post_meta($id, '_qmix_pruned_orig_status', 'publish');

    // wpdb->update direto para NÃO atualizar post_modified
    $wpdb->update(
        $wpdb->posts,
        array('post_status' => 'draft'),
        array('ID' => $id),
        array('%s'),
        array('%d')
    );
    clean_post_cache($id);
    $report['phase_1_drafted'][] = array('id' => $id, 'title' => $post->post_title);
}

// ============================================================
// FASE 2: draft -> trash (drafts marcados pelo pruning + idade >= grace)
// ============================================================
$cutoff_2 = $now - ($grace_draft_days * 86400);
$drafts_due = $wpdb->get_col($wpdb->prepare(
    "SELECT p.ID FROM {$wpdb->posts} p
     INNER JOIN {$wpdb->postmeta} m1 ON m1.post_id = p.ID
        AND m1.meta_key = '_qmix_pruned_stage' AND m1.meta_value = 'drafted'
     INNER JOIN {$wpdb->postmeta} m2 ON m2.post_id = p.ID
        AND m2.meta_key = '_qmix_pruned_at' AND m2.meta_value+0 <= %d
     WHERE p.post_status = 'draft' AND p.post_type = 'post'",
    $cutoff_2
));

foreach ($drafts_due as $id) {
    $id = (int) $id;
    if ($dry_run) {
        $report['phase_2_trashed'][] = array('id' => $id, 'dry_run' => true);
        continue;
    }
    update_post_meta($id, '_qmix_pruned_stage', 'trashed');
    update_post_meta($id, '<<REMOVIDO>>', $now);
    // wp_trash_post() faz tudo certo (status, slug __trashed) e usa wp_update_post internamente
    // que atualiza post_modified. Em vez disso, fazemos manualmente sem mexer no timestamp:
    $current_slug = $wpdb->get_var($wpdb->prepare(
        "SELECT post_name FROM {$wpdb->posts} WHERE ID = %d", $id
    ));
    update_post_meta($id, '_wp_trash_meta_status', 'draft');
    update_post_meta($id, '_wp_trash_meta_time', $now);
    update_post_meta($id, '_wp_desired_post_slug', $current_slug);
    $wpdb->update(
        $wpdb->posts,
        array(
            'post_status' => 'trash',
            'post_name'   => $current_slug . '__trashed',
        ),
        array('ID' => $id),
        array('%s', '%s'),
        array('%d')
    );
    clean_post_cache($id);
    $report['phase_2_trashed'][] = array('id' => $id);
}

// ============================================================
// FASE 3: trash -> DELETE (force)
// ============================================================
$cutoff_3 = $now - ($grace_trash_days * 86400);
$trash_due = $wpdb->get_col($wpdb->prepare(
    "SELECT p.ID FROM {$wpdb->posts} p
     INNER JOIN {$wpdb->postmeta} m1 ON m1.post_id = p.ID
        AND m1.meta_key = '_qmix_pruned_stage' AND m1.meta_value = 'trashed'
     INNER JOIN {$wpdb->postmeta} m2 ON m2.post_id = p.ID
        AND m2.meta_key = '<<REMOVIDO>>' AND m2.meta_value+0 <= %d
     WHERE p.post_status = 'trash' AND p.post_type = 'post'",
    $cutoff_3
));

foreach ($trash_due as $id) {
    $id = (int) $id;
    if ($dry_run) {
        $report['phase_3_deleted'][] = array('id' => $id, 'dry_run' => true);
        continue;
    }
    $result = wp_delete_post($id, true);
    if ($result) {
        $report['phase_3_deleted'][] = array('id' => $id);
    } else {
        $report['errors'][] = array('id' => $id, 'phase' => 3, 'msg' => 'delete_failed');
    }
}

// Purge caches
if (!$dry_run && (count($report['phase_1_drafted']) || count($report['phase_2_trashed']) || count($report['phase_3_deleted']))) {
    do_action('litespeed_purge_all');
    wp_cache_flush();
}

echo json_encode($report, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
