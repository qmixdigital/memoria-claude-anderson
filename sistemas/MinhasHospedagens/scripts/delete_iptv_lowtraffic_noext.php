<?php
/**
 * Find + DELETE posts matching ALL:
 *   - post_type='post'
 *   - post_status IN ('publish', 'trash')
 *   - title contains "iptv" (case insensitive)
 *   - views < 5 (Antonio stats meta_key v[hex]_post_views or *_post_views)
 *   - post_content has NO external <a href> (zero outbound)
 *
 * Outputs JSON backup BEFORE deleting (audit trail).
 * Uses wp_delete_post($id, true) = force delete (skips trash).
 *
 * Env vars:
 *   QMIX_IPTV_DRY_RUN=1  -> only audit, don't delete
 */
if (!defined('ABSPATH')) { fwrite(STDERR, "wp eval-file only\n"); exit(1); }
global $wpdb;

$dry_run = (bool) getenv('QMIX_IPTV_DRY_RUN');

$site_url    = get_option('siteurl');
$site_host   = parse_url($site_url, PHP_URL_HOST);
$site_domain = preg_replace('/^www\./', '', $site_host);

// Discover Antonio stats meta_key (highest coverage)
$views_meta_key = $wpdb->get_var(
    "SELECT meta_key FROM {$wpdb->postmeta}
     WHERE meta_key REGEXP '^[a-z0-9]{2,8}_post_views$'
     GROUP BY meta_key
     ORDER BY COUNT(*) DESC
     LIMIT 1"
);

// Build query: posts with iptv in title, publish or trash, with views<5 (or no meta=0)
if ($views_meta_key) {
    $sql = $wpdb->prepare(
        "SELECT p.ID, p.post_title, p.post_status, p.post_content, COALESCE(pm.meta_value+0, 0) AS views
         FROM {$wpdb->posts} p
         LEFT JOIN {$wpdb->postmeta} pm ON pm.post_id = p.ID AND pm.meta_key = %s
         WHERE p.post_type = 'post'
           AND p.post_status IN ('publish', 'trash')
           AND LOWER(p.post_title) LIKE %s
           AND COALESCE(pm.meta_value+0, 0) < 5",
        $views_meta_key, '%iptv%'
    );
} else {
    $sql = $wpdb->prepare(
        "SELECT p.ID, p.post_title, p.post_status, p.post_content, 0 AS views
         FROM {$wpdb->posts} p
         WHERE p.post_type = 'post'
           AND p.post_status IN ('publish', 'trash')
           AND LOWER(p.post_title) LIKE %s",
        '%iptv%'
    );
}

$rows = $wpdb->get_results($sql);

function has_outbound_link($content, $self_domain) {
    if (preg_match_all('/<a\s[^>]*\bhref\s*=\s*(["\'])([^"\']+)\1/i', $content, $m)) {
        foreach ($m[2] as $href) {
            $host = parse_url($href, PHP_URL_HOST);
            if (!$host) continue;
            $host = preg_replace('/^www\./', '', strtolower($host));
            if ($host !== $self_domain && stripos($host, $self_domain) === false) {
                return true;
            }
        }
    }
    return false;
}

$candidates = array();
foreach ($rows as $r) {
    if (has_outbound_link($r->post_content, $site_domain)) continue;
    $candidates[] = array(
        'id'     => (int) $r->ID,
        'title'  => $r->post_title,
        'status' => $r->post_status,
        'views'  => (int) $r->views,
    );
}

// Backup BEFORE delete
$now = time();
$backup_file = '/tmp/qmix_iptv_deleted_' . $now . '.json';
$backup_payload = array();

if (!$dry_run && !empty($candidates)) {
    foreach ($candidates as $c) {
        $post = get_post($c['id']);
        if (!$post) continue;
        $backup_payload[] = array(
            'site'         => $site_url,
            'id'           => (int) $post->ID,
            'title'        => $post->post_title,
            'slug'         => $post->post_name,
            'status'       => $post->post_status,
            'date'         => $post->post_date,
            'modified'     => $post->post_modified,
            'content'      => $post->post_content,
            'excerpt'      => $post->post_excerpt,
            'author'       => (int) $post->post_author,
            'categories'   => wp_get_post_categories($post->ID),
            'tags'         => wp_get_post_tags($post->ID, array('fields'=>'names')),
            'meta'         => get_post_meta($post->ID),
            'deleted_at'   => $now,
        );
    }
    file_put_contents($backup_file, json_encode($backup_payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

// Execute deletes
$deleted = 0; $failed = 0;
if (!$dry_run) {
    foreach ($candidates as $c) {
        $result = wp_delete_post($c['id'], true);
        if ($result) $deleted++;
        else $failed++;
    }
}

echo json_encode(array(
    'site'             => $site_url,
    'domain'           => $site_domain,
    'views_meta_key'   => $views_meta_key,
    'candidates_count' => count($candidates),
    'dry_run'          => $dry_run,
    'deleted'          => $deleted,
    'failed'           => $failed,
    'backup_file'      => (!$dry_run && !empty($backup_payload)) ? $backup_file : null,
    'sample_titles'    => array_slice(array_column($candidates, 'title'), 0, 5),
), JSON_UNESCAPED_UNICODE) . "\n";
