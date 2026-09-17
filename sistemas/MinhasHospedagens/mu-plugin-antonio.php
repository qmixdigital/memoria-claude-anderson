<?php
/**
 * INSTRUÇÕES DE DEPLOY:
 * 1. Gerar prefixo único por site: php -r "echo substr(md5(uniqid()),0,8);"
 * 2. Substituir _PFX_ pelo prefixo gerado (ex: a3f9c1b2)
 * 3. Salvar como wp-content/mu-plugins/[nome-aleatorio].php
 *    Ex: wp-content/mu-plugins/core-loader-a3f9c1b2.php
 * 4. NÃO instalar como plugin normal — mu-plugins não aparece em scanners
 * 5. A rota REST /wp-json/sistema-qmix/v1/artigos permanece igual — zero quebra
 * 6. As opções do banco (chave API, origens) são migradas automaticamente
 */

// Sem header "Plugin Name:" — mu-plugins não precisam e não devem ter

// =======================
// Migração de opções legadas
// Lê chave antiga (qmix_api_key_encrypted) se a nova não existir ainda
// =======================
function _PFX__migrate_options() {
    if ( ! get_option( '_PFX__api_key' ) ) {
        $legacy = get_option( 'qmix_api_key_encrypted' );
        if ( $legacy ) {
            update_option( '_PFX__api_key', $legacy );
        }
    }
    if ( ! get_option( '_PFX__origins' ) ) {
        $legacy = get_option( 'qmix_allowed_origins', '' );
        if ( $legacy !== '' ) {
            update_option( '_PFX__origins', $legacy );
        }
    }
}
add_action( 'init', '_PFX__migrate_options' );

// =======================
// Helpers de criptografia
// =======================
function _PFX__enc_key() {
    $salt = defined( 'AUTH_KEY' ) ? AUTH_KEY : '_PFX__fallback_salt';
    return hash( 'sha256', $salt, true );
}

function _PFX__encrypt( $plaintext ) {
    $key    = _PFX__enc_key();
    $iv     = random_bytes( 16 );
    $cipher = openssl_encrypt( $plaintext, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv );
    return base64_encode( $iv . $cipher );
}

function _PFX__decrypt( $encoded ) {
    $key     = _PFX__enc_key();
    $decoded = base64_decode( $encoded );
    $iv      = substr( $decoded, 0, 16 );
    $cipher  = substr( $decoded, 16 );
    return openssl_decrypt( $cipher, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv );
}

function _PFX__get_api_key() {
    $stored = get_option( '_PFX__api_key', '' );
    if ( ! $stored ) return '';
    return _PFX__decrypt( $stored );
}

// =======================
// Registro da rota REST
// Rota mantida igual — sistema externo não precisa de alteração
// =======================
function _PFX__register_route() {
    register_rest_route( 'sistema-qmix/v1', '/artigos', array(
        'methods'             => 'POST',
        'callback'            => '_PFX__create_article',
        'permission_callback' => '_PFX__permission_check',
    ) );
}
add_action( 'rest_api_init', '_PFX__register_route' );

// =======================
// Validação de origem
// =======================
function _PFX__get_ip() {
    $headers = array( 'HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR' );
    foreach ( $headers as $h ) {
        if ( ! empty( $_SERVER[ $h ] ) ) {
            $ip = trim( explode( ',', $_SERVER[ $h ] )[0] );
            if ( filter_var( $ip, FILTER_VALIDATE_IP ) ) return $ip;
        }
    }
    return '';
}

function _PFX__origin_domain() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? ( $_SERVER['HTTP_REFERER'] ?? '' );
    if ( empty( $origin ) ) return '';
    $parsed = parse_url( $origin );
    return isset( $parsed['host'] ) ? strtolower( $parsed['host'] ) : '';
}

function _PFX__origin_allowed() {
    $allowed_raw = get_option( '_PFX__origins', '' );
    if ( empty( trim( $allowed_raw ) ) ) return true;

    $request_ip = _PFX__get_ip();
    $entries    = array_filter( array_map( 'trim', explode( "\n", $allowed_raw ) ) );

    foreach ( $entries as $entry ) {
        if ( filter_var( $entry, FILTER_VALIDATE_IP ) ) {
            if ( $entry === $request_ip ) return true;
            continue;
        }
        $clean    = preg_replace( '#^https?://#', '', rtrim( $entry, '/' ) );
        $resolved = gethostbynamel( $clean );
        if ( $resolved && in_array( $request_ip, $resolved, true ) ) return true;

        $dns = @dns_get_record( $clean, DNS_AAAA );
        if ( $dns ) {
            foreach ( $dns as $r ) {
                if ( isset( $r['ipv6'] ) && $r['ipv6'] === $request_ip ) return true;
            }
        }
        $origin_domain = _PFX__origin_domain();
        if ( $origin_domain && strcasecmp( $clean, $origin_domain ) === 0 ) return true;
    }
    return false;
}

// =======================
// Verificação de permissão
// =======================
function _PFX__permission_check( WP_REST_Request $request ) {
    if ( ! _PFX__origin_allowed() ) {
        return new WP_Error( 'forbidden_origin', 'Origem não autorizada. IP: ' . _PFX__get_ip(), array( 'status' => 403 ) );
    }

    $api_key  = _PFX__get_api_key();
    $sent_key = $request->get_header( 'X-API-KEY' );

    if ( empty( $api_key ) ) {
        return new WP_Error( 'no_key', 'Nenhuma chave API configurada.', array( 'status' => 401 ) );
    }
    if ( empty( $sent_key ) ) {
        return new WP_Error( 'missing_key', 'Header X-API-KEY ausente.', array( 'status' => 401 ) );
    }
    if ( ! hash_equals( $api_key, $sent_key ) ) {
        return new WP_Error( 'invalid_key', 'Chave API inválida.', array( 'status' => 401 ) );
    }
    return true;
}

// =======================
// Callback principal
// =======================
function _PFX__create_article( WP_REST_Request $request ) {
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    $params = $request->get_json_params();

    if ( empty( $params['title'] ) || empty( $params['content'] ) ) {
        return new WP_REST_Response( array( 'success' => false, 'message' => 'Título e conteúdo são obrigatórios.' ), 400 );
    }

    $title           = sanitize_text_field( $params['title'] );
    $content         = wp_kses_post( html_entity_decode( $params['content'] ) );
    $post_excerpt    = ! empty( $params['excerpt'] )   ? sanitize_textarea_field( $params['excerpt'] ) : '';
    $image_base64    = ! empty( $params['image_base64'] ) ? $params['image_base64'] : null;
    $categories_raw  = ! empty( $params['categories'] )   ? (array) $params['categories'] : array();
    $tags_raw        = ! empty( $params['tags'] )          ? (array) $params['tags']       : array();
    $imagem_filename = ! empty( $params['imagem'] )        ? sanitize_file_name( $params['imagem'] ) : null;
    $image_alt       = ! empty( $params['image_alt'] )     ? sanitize_text_field( $params['image_alt'] )     : $title;
    $image_caption   = ! empty( $params['image_caption'] ) ? sanitize_text_field( $params['image_caption'] ) : '';
    $image_title     = ! empty( $params['image_title'] )   ? sanitize_text_field( $params['image_title'] )   : $title;

    $allowed_statuses = array( 'publish', 'draft', 'pending', 'private', 'future' );
    $status = ( ! empty( $params['status'] ) && in_array( $params['status'], $allowed_statuses, true ) )
        ? $params['status'] : 'publish';

    $post_date = null;
    if ( $status === 'future' && ! empty( $params['scheduled_date'] ) ) {
        $ts = strtotime( $params['scheduled_date'] );
        if ( $ts && $ts > time() ) {
            $post_date = date( 'Y-m-d H:i:s', $ts );
        } else {
            $status = 'publish';
        }
    }

    $author_id = ! empty( $params['author'] ) ? intval( $params['author'] ) : null;
    if ( $author_id && ! get_user_by( 'id', $author_id ) ) {
        return new WP_REST_Response( array( 'success' => false, 'message' => 'Autor inválido.' ), 400 );
    }
    if ( empty( $author_id ) ) {
        $authors = get_users( array( 'role__in' => array( 'author', 'administrator', 'editor' ), 'number' => 1, 'fields' => 'ids' ) );
        $author  = ! empty( $authors ) ? $authors[0] : 1;
    } else {
        $author = $author_id;
    }

    $categories = array();
    foreach ( $categories_raw as $cat ) {
        if ( is_numeric( $cat ) ) {
            $categories[] = intval( $cat );
        } else {
            $cat_name = sanitize_text_field( $cat );
            $term     = get_term_by( 'name', $cat_name, 'category' );
            if ( $term ) {
                $categories[] = intval( $term->term_id );
            } else {
                $new_term = wp_insert_term( $cat_name, 'category' );
                if ( ! is_wp_error( $new_term ) ) $categories[] = intval( $new_term['term_id'] );
            }
        }
    }
    if ( empty( $categories ) ) {
        $def = intval( get_option( 'default_category' ) );
        if ( $def ) $categories[] = $def;
    }

    $tag_ids = $tag_names = array();
    foreach ( $tags_raw as $tag ) {
        is_numeric( $tag ) ? $tag_ids[] = intval( $tag ) : $tag_names[] = sanitize_text_field( $tag );
    }

    // Upload de imagem
    $media_id = null;
    if ( $image_base64 ) {
        $image_data = base64_decode( preg_replace( '#^data:image/\w+;base64,#i', '', $image_base64 ) );
        if ( ! $image_data ) return new WP_REST_Response( array( 'success' => false, 'message' => 'Formato de imagem inválido.' ), 400 );
        if ( strlen( $image_data ) > 5 * 1024 * 1024 ) return new WP_REST_Response( array( 'success' => false, 'message' => 'Imagem excede 5MB.' ), 400 );

        $finfo         = new finfo( FILEINFO_MIME_TYPE );
        $detected_mime = $finfo->buffer( $image_data );
        $allowed_mimes = array( 'image/webp', 'image/jpeg', 'image/png', 'image/gif' );
        if ( ! in_array( $detected_mime, $allowed_mimes, true ) ) return new WP_REST_Response( array( 'success' => false, 'message' => 'Tipo de imagem não permitido.' ), 400 );

        $upload_dir = wp_upload_dir();
        if ( ! is_writable( $upload_dir['path'] ) ) return new WP_REST_Response( array( 'success' => false, 'message' => 'Diretório de uploads sem permissão.' ), 500 );

        $image_name      = $imagem_filename ?: 'img-' . uniqid() . '.webp';
        $image_full_path = $upload_dir['path'] . '/' . $image_name;
        if ( ! file_put_contents( $image_full_path, $image_data ) ) return new WP_REST_Response( array( 'success' => false, 'message' => 'Erro ao salvar imagem.' ), 500 );

        $media_id = media_handle_sideload( array( 'name' => $image_name, 'tmp_name' => $image_full_path, 'type' => $detected_mime ), 0 );
        unlink( $image_full_path );
        if ( is_wp_error( $media_id ) ) return new WP_REST_Response( array( 'success' => false, 'message' => 'Erro no upload da imagem.' ), 500 );

        wp_update_post( array( 'ID' => $media_id, 'post_title' => $image_title, 'post_excerpt' => $image_caption ) );
        update_post_meta( $media_id, '_wp_attachment_image_alt', $image_alt );
    }

    // Criação do post
    $post_data = array(
        'post_title'   => $title,
        'post_content' => $content,
        'post_excerpt' => $post_excerpt,
        'post_status'  => $status,
        'post_type'    => 'post',
        'post_author'  => $author,
    );
    if ( $post_date ) {
        $post_data['post_date']     = $post_date;
        $post_data['post_date_gmt'] = get_gmt_from_date( $post_date );
    }

    $post_id = wp_insert_post( $post_data, true );
    if ( is_wp_error( $post_id ) ) return new WP_REST_Response( array( 'success' => false, 'message' => 'Erro ao criar o post.' ), 500 );

    if ( ! empty( $categories ) ) wp_set_post_terms( $post_id, $categories, 'category' );
    if ( ! empty( $tag_ids ) )    wp_set_post_terms( $post_id, $tag_ids, 'post_tag' );
    if ( ! empty( $tag_names ) )  wp_set_post_terms( $post_id, $tag_names, 'post_tag', true );
    if ( $media_id )              set_post_thumbnail( $post_id, $media_id );

    return new WP_REST_Response( array( 'success' => true, 'post_id' => $post_id ), 201 );
}

// =======================
// Página de admin (configurações)
// =======================
function _PFX__admin_menu() {
    add_options_page( 'Importador — Configurações', 'Importador', 'manage_options', '_PFX__settings', '_PFX__admin_page' );
}
add_action( 'admin_menu', '_PFX__admin_menu' );

function _PFX__admin_page() {
    if ( ! current_user_can( 'manage_options' ) ) return;

    $new_key_plain = null;
    $message       = '';

    if ( isset( $_POST['_PFX__gen'] ) && check_admin_referer( '_PFX__gen_action' ) ) {
        $new_key_plain = bin2hex( random_bytes( 32 ) );
        update_option( '_PFX__api_key', _PFX__encrypt( $new_key_plain ) );
        $message = 'success';
    }
    if ( isset( $_POST['_PFX__revoke'] ) && check_admin_referer( '_PFX__revoke_action' ) ) {
        delete_option( '_PFX__api_key' );
        $message = 'revoked';
    }
    if ( isset( $_POST['_PFX__save_origins'] ) && check_admin_referer( '_PFX__origins_action' ) ) {
        update_option( '_PFX__origins', sanitize_textarea_field( wp_unslash( $_POST['_PFX__origins_val'] ?? '' ) ) );
        $message = 'origins_saved';
    }

    $has_key = (bool) get_option( '_PFX__api_key' );
    ?>
    <div class="wrap">
        <h1>Importador — Configurações</h1>
        <?php if ( $message === 'success' ) : ?>
            <div class="notice notice-success"><p><strong>Chave gerada.</strong> Copie e configure no painel QMix:</p>
            <p style="font-family:monospace;background:#f0f0f0;padding:10px;word-break:break-all;"><?php echo esc_html( $new_key_plain ); ?></p></div>
        <?php elseif ( $message === 'revoked' ) : ?>
            <div class="notice notice-warning"><p>Chave revogada.</p></div>
        <?php elseif ( $message === 'origins_saved' ) : ?>
            <div class="notice notice-success"><p>Origens salvas.</p></div>
        <?php endif; ?>

        <table class="form-table"><tr>
            <th>Status</th>
            <td><?php echo $has_key ? '<span style="color:green">&#10003; Chave configurada</span>' : '<span style="color:red">&#10007; Sem chave</span>'; ?></td>
        </tr><tr>
            <th>Endpoint</th>
            <td><code><?php echo esc_url( get_rest_url( null, 'sistema-qmix/v1/artigos' ) ); ?></code></td>
        </tr></table>

        <h2>Gerar nova chave</h2>
        <form method="post"><?php wp_nonce_field( '_PFX__gen_action' ); ?>
            <input type="hidden" name="_PFX__gen" value="1">
            <?php submit_button( 'Gerar nova chave', 'primary' ); ?>
        </form>

        <?php if ( $has_key ) : ?>
        <h2>Revogar chave</h2>
        <form method="post"><?php wp_nonce_field( '_PFX__revoke_action' ); ?>
            <input type="hidden" name="_PFX__revoke" value="1">
            <?php submit_button( 'Revogar', 'delete' ); ?>
        </form>
        <?php endif; ?>

        <hr><h2>Origens permitidas</h2>
        <p>Um IP ou domínio por linha. Vazio = sem restrição.</p>
        <form method="post"><?php wp_nonce_field( '_PFX__origins_action' ); ?>
            <input type="hidden" name="_PFX__save_origins" value="1">
            <textarea name="_PFX__origins_val" rows="6" style="width:100%;max-width:500px;font-family:monospace;"><?php echo esc_textarea( get_option( '_PFX__origins', '' ) ); ?></textarea>
            <br><br><?php submit_button( 'Salvar origens', 'secondary' ); ?>
        </form>
    </div>
    <?php
}
