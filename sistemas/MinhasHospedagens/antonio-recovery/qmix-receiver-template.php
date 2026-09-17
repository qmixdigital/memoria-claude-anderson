<?php
/**
 * Receptor Antonio (mu-plugin) — REST endpoint para receber artigos do sistema externo.
 * NAMESPACE, API_KEY substituídos por sed antes do upload.
 */
if (!defined('ABSPATH')) exit;

const QMIX_NS = '__NS__';      // ex: 'a9cd-api/v1'
const QMIX_KEY = '__APIKEY__'; // hex SHA-256

add_action('rest_api_init', function() {
    register_rest_route(QMIX_NS, '/artigos', [
        'methods'             => 'POST',
        'callback'            => 'qmix_create_article',
        'permission_callback' => 'qmix_perm_check',
    ]);
});

function qmix_perm_check($request) {
    $sent = $request->get_header('X-API-KEY');
    if (empty($sent)) return new WP_Error('missing_key', 'X-API-KEY ausente', ['status' => 401]);
    if (!hash_equals(QMIX_KEY, $sent)) return new WP_Error('invalid_key', 'X-API-KEY inválida', ['status' => 401]);
    return true;
}

function qmix_create_article(WP_REST_Request $request) {
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    $p = $request->get_json_params();

    if (empty($p['title']) || empty($p['content'])) {
        return new WP_REST_Response(['success' => false, 'message' => 'title e content obrigatórios'], 400);
    }

    $title         = sanitize_text_field($p['title']);
    $content       = wp_kses_post(html_entity_decode($p['content']));
    $excerpt       = !empty($p['excerpt']) ? sanitize_textarea_field($p['excerpt']) : '';
    $image_b64     = !empty($p['image_base64']) ? $p['image_base64'] : null;
    $cats_raw      = !empty($p['categories']) ? (array) $p['categories'] : [];
    $tags_raw      = !empty($p['tags']) ? (array) $p['tags'] : [];
    $img_name      = !empty($p['imagem']) ? sanitize_file_name($p['imagem']) : null;
    $img_alt       = !empty($p['image_alt']) ? sanitize_text_field($p['image_alt']) : $title;
    $img_caption   = !empty($p['image_caption']) ? sanitize_text_field($p['image_caption']) : '';
    $img_title     = !empty($p['image_title']) ? sanitize_text_field($p['image_title']) : $title;

    $allowed_st = ['publish', 'draft', 'pending', 'private', 'future'];
    $status = (!empty($p['status']) && in_array($p['status'], $allowed_st, true)) ? $p['status'] : 'publish';

    $post_date = null;
    if ($status === 'future' && !empty($p['scheduled_date'])) {
        $ts = strtotime($p['scheduled_date']);
        if ($ts && $ts > time()) $post_date = date('Y-m-d H:i:s', $ts);
        else $status = 'publish';
    }

    // Autor
    $author = !empty($p['author']) ? intval($p['author']) : 0;
    if ($author && !get_user_by('id', $author)) {
        return new WP_REST_Response(['success' => false, 'message' => 'Autor inválido'], 400);
    }
    if (!$author) {
        $authors = get_users(['role__in' => ['author','administrator','editor'], 'number' => 1, 'fields' => 'ids']);
        $author = !empty($authors) ? $authors[0] : 1;
    }

    // Categorias
    $cat_ids = [];
    foreach ($cats_raw as $c) {
        if (is_numeric($c)) {
            $cat_ids[] = intval($c);
        } else {
            $term = get_term_by('name', sanitize_text_field($c), 'category');
            if ($term) $cat_ids[] = (int) $term->term_id;
            else {
                $new = wp_insert_term(sanitize_text_field($c), 'category');
                if (!is_wp_error($new)) $cat_ids[] = (int) $new['term_id'];
            }
        }
    }
    if (empty($cat_ids)) {
        $def = (int) get_option('default_category');
        if ($def) $cat_ids[] = $def;
    }

    // Tags
    $tag_ids = $tag_names = [];
    foreach ($tags_raw as $t) {
        is_numeric($t) ? $tag_ids[] = intval($t) : $tag_names[] = sanitize_text_field($t);
    }

    // Upload imagem (base64)
    $media_id = null;
    if ($image_b64) {
        $bin = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $image_b64));
        if (!$bin) return new WP_REST_Response(['success' => false, 'message' => 'imagem base64 inválida'], 400);
        if (strlen($bin) > 5*1024*1024) return new WP_REST_Response(['success' => false, 'message' => 'imagem excede 5MB'], 400);

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->buffer($bin);
        $allowed_mime = ['image/webp','image/jpeg','image/png','image/gif'];
        if (!in_array($mime, $allowed_mime, true)) return new WP_REST_Response(['success' => false, 'message' => 'tipo de imagem não permitido'], 400);

        $up = wp_upload_dir();
        if (!is_writable($up['path'])) return new WP_REST_Response(['success' => false, 'message' => 'uploads sem permissão'], 500);

        $iname = $img_name ?: 'img-' . uniqid() . '.webp';
        $ipath = $up['path'] . '/' . $iname;
        if (!file_put_contents($ipath, $bin)) return new WP_REST_Response(['success' => false, 'message' => 'erro ao salvar imagem'], 500);

        $media_id = media_handle_sideload(['name' => $iname, 'tmp_name' => $ipath, 'type' => $mime], 0);
        @unlink($ipath);
        if (is_wp_error($media_id)) return new WP_REST_Response(['success' => false, 'message' => 'erro no upload da imagem'], 500);

        wp_update_post(['ID' => $media_id, 'post_title' => $img_title, 'post_excerpt' => $img_caption]);
        update_post_meta($media_id, '_wp_attachment_image_alt', $img_alt);
    }

    $post_data = [
        'post_title'   => $title,
        'post_content' => $content,
        'post_excerpt' => $excerpt,
        'post_status'  => $status,
        'post_type'    => 'post',
        'post_author'  => $author,
    ];
    if ($post_date) {
        $post_data['post_date']     = $post_date;
        $post_data['post_date_gmt'] = get_gmt_from_date($post_date);
    }

    $pid = wp_insert_post($post_data, true);
    if (is_wp_error($pid)) return new WP_REST_Response(['success' => false, 'message' => 'erro ao criar post: ' . $pid->get_error_message()], 500);

    if (!empty($cat_ids))   wp_set_post_terms($pid, $cat_ids, 'category');
    if (!empty($tag_ids))   wp_set_post_terms($pid, $tag_ids, 'post_tag');
    if (!empty($tag_names)) wp_set_post_terms($pid, $tag_names, 'post_tag', true);
    if ($media_id)          set_post_thumbnail($pid, $media_id);

    return new WP_REST_Response(['success' => true, 'post_id' => $pid], 201);
}
