<?php
/**
 * QMIX Content Pruning - Audit script (per portal)
 *
 * Roda via: wp eval-file /tmp/prune_audit.php
 * Output: JSON em stdout: { site, domain, total_published, candidates: [...] }
 *
 * NÃO faz mutação. Só inspeciona e retorna lista de candidatos.
 *
 * Critérios (TODOS verdadeiros para classificar como candidato):
 *   - post_status = publish
 *   - post_type = post
 *   - post_date < NOW() - 120 dias
 *   - views < 5 (meta_key v____post_views do Antonio stats)
 *   - 0 outbound links em post_content
 *
 * Salvaguardas (qualquer uma => SKIP):
 *   - has approved comments
 *   - ID em wp_options (front-page, menu, sticky_posts)
 *   - has _wp_old_slug active
 *   - has _antonio_imported_at within 120 days
 *   - has qmix_keep = 1
 */

if (!defined('ABSPATH')) {
    fwrite(STDERR, "must run via wp eval-file\n");
    exit(1);
}

global $wpdb;

// Config (override via env vars passed by orchestrator)
$min_age_days = (int) (getenv('QMIX_PRUNE_MIN_AGE') ?: 120);
$max_views    = (int) (getenv('QMIX_PRUNE_MAX_VIEWS') ?: 5);

$site_url    = get_option('siteurl');
$site_host   = parse_url($site_url, PHP_URL_HOST);
$site_domain = preg_replace('/^www\./', '', $site_host);

// Descobre o meta_key do Antonio stats (varia por portal, prefixo de 2-8 chars).
// Se múltiplas keys existirem (plugin legado + atual), pega a de maior cobertura.
$views_meta_key = $wpdb->get_var(
    "SELECT meta_key FROM {$wpdb->postmeta}
     WHERE meta_key REGEXP '^[a-z0-9]{2,8}_post_views$'
     GROUP BY meta_key
     ORDER BY COUNT(*) DESC
     LIMIT 1"
);

// Frontpage / sticky / menu references
$front_page_id   = (int) get_option('page_on_front');
$posts_page_id   = (int) get_option('page_for_posts');
$sticky_posts    = (array) get_option('sticky_posts', array());
$referenced_ids  = array_filter(array_merge([$front_page_id, $posts_page_id], $sticky_posts));

// Total publicados (denominador pra sanidade)
$total_published = (int) $wpdb->get_var(
    "SELECT COUNT(*) FROM {$wpdb->posts}
     WHERE post_status = 'publish' AND post_type = 'post'"
);

// Query principal: candidatos por idade + views
if ($views_meta_key) {
    $sql = $wpdb->prepare(
        "SELECT p.ID, p.post_title, p.post_date, p.post_content,
                COALESCE(pm.meta_value+0, 0) AS views,
                LENGTH(p.post_content) AS content_size,
                p.comment_count
         FROM {$wpdb->posts} p
         LEFT JOIN {$wpdb->postmeta} pm ON pm.post_id = p.ID AND pm.meta_key = %s
         WHERE p.post_status = 'publish'
           AND p.post_type = 'post'
           AND p.post_date < DATE_SUB(NOW(), INTERVAL %d DAY)
           AND COALESCE(pm.meta_value+0, 0) < %d
         ORDER BY views ASC, p.post_date ASC",
        $views_meta_key, $min_age_days, $max_views
    );
} else {
    // No Antonio stats key found - assume 0 views for all old posts
    $sql = $wpdb->prepare(
        "SELECT p.ID, p.post_title, p.post_date, p.post_content,
                0 AS views,
                LENGTH(p.post_content) AS content_size,
                p.comment_count
         FROM {$wpdb->posts} p
         WHERE p.post_status = 'publish'
           AND p.post_type = 'post'
           AND p.post_date < DATE_SUB(NOW(), INTERVAL %d DAY)
         ORDER BY p.post_date ASC",
        $min_age_days
    );
}

$candidates = array();
$skipped    = array(
    'has_comments'      => 0,
    'is_referenced'     => 0,
    'has_old_slug'      => 0,
    'recently_imported' => 0,
    'has_keep_flag'     => 0,
    'has_outbound'      => 0,
);

$rows = $wpdb->get_results($sql);

foreach ($rows as $r) {
    $id = (int) $r->ID;

    // Salvaguarda: comentários aprovados
    $approved_comments = (int) $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM {$wpdb->comments}
         WHERE comment_post_ID = %d AND comment_approved = '1'", $id
    ));
    if ($approved_comments > 0) {
        $skipped['has_comments']++;
        continue;
    }

    // Salvaguarda: referenciado em config
    if (in_array($id, $referenced_ids, true)) {
        $skipped['is_referenced']++;
        continue;
    }

    // Salvaguarda: _wp_old_slug ativo
    $has_old_slug = (int) $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM {$wpdb->postmeta}
         WHERE post_id = %d AND meta_key = '_wp_old_slug'", $id
    ));
    if ($has_old_slug > 0) {
        $skipped['has_old_slug']++;
        continue;
    }

    // Salvaguarda: importado pelo Antonio < 120d
    $antonio_imported = get_post_meta($id, '_antonio_imported_at', true);
    if ($antonio_imported && (time() - (int)$antonio_imported) < ($min_age_days * 86400)) {
        $skipped['recently_imported']++;
        continue;
    }

    // Salvaguarda: keep flag manual
    $keep_flag = get_post_meta($id, 'qmix_keep', true);
    if ($keep_flag == '1' || $keep_flag === 1 || $keep_flag === true) {
        $skipped['has_keep_flag']++;
        continue;
    }

    // Critério principal: 0 outbound links no post_content
    $has_outbound = qmix_post_has_outbound($r->post_content, $site_domain);
    if ($has_outbound) {
        $skipped['has_outbound']++;
        continue;
    }

    $candidates[] = array(
        'id'           => $id,
        'title'        => $r->post_title,
        'post_date'    => $r->post_date,
        'age_days'     => (int) ((time() - strtotime($r->post_date)) / 86400),
        'views'        => (int) $r->views,
        'content_size' => (int) $r->content_size,
        'comments'     => (int) $r->comment_count,
        'permalink'    => get_permalink($id),
    );
}

function qmix_post_has_outbound($content, $self_domain) {
    if (preg_match_all('/<a\s[^>]*\bhref\s*=\s*(["\'])([^"\']+)\1/i', $content, $m)) {
        foreach ($m[2] as $href) {
            $host = parse_url($href, PHP_URL_HOST);
            if (!$host) continue;
            $host = preg_replace('/^www\./', '', $host);
            if ($host !== $self_domain && stripos($host, $self_domain) === false) {
                return true;
            }
        }
    }
    if (preg_match_all('@(?<!["\'=])https?://([^\s<>"\']+)@i', $content, $m)) {
        foreach ($m[1] as $raw) {
            $host = strtolower(strtok($raw, '/'));
            $host = preg_replace('/^www\./', '', $host);
            if ($host && $host !== $self_domain && stripos($host, $self_domain) === false) {
                return true;
            }
        }
    }
    return false;
}

$out = array(
    'site'             => $site_url,
    'domain'           => $site_domain,
    'views_meta_key'   => $views_meta_key,
    'total_published'  => $total_published,
    'min_age_days'     => $min_age_days,
    'max_views'        => $max_views,
    'rows_scanned'     => count($rows),
    'candidates_count' => count($candidates),
    'skipped'          => $skipped,
    'candidates'       => $candidates,
);

echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
