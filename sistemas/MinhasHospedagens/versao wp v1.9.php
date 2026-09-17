<?php
/*
Este códog é resposável por receber os dados de artigos enviados pelo sistema e armazenados no wordpress, esta é uma nova versão que deve ser substituida pela versão atual 1.8, esta foi modificada para receber novos dados enviados na requisição do sistema.
*/
/**
 * Plugin Name: QMix Writing
 * Description: Plugin para receber artigos do sistema externo via API REST.
 * Version: 1.9
 * Author: QMix Writing
 */

// =======================
// Helpers de criptografia
// =======================

function qmix_get_encryption_key() {
    $salt = defined( 'AUTH_KEY' ) ? AUTH_KEY : '<<REMOVIDO>>';
    return hash( 'sha256', $salt, true ); // 32 bytes = AES-256
}

function qmix_encrypt( $plaintext ) {
    $key    = qmix_get_encryption_key();
    $iv     = random_bytes( 16 );
    $cipher = openssl_encrypt( $plaintext, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv );
    return base64_encode( $iv . $cipher );
}

function qmix_decrypt( $encoded ) {
    $key     = qmix_get_encryption_key();
    $decoded = base64_decode( $encoded );
    $iv      = substr( $decoded, 0, 16 );
    $cipher  = substr( $decoded, 16 );
    return openssl_decrypt( $cipher, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv );
}

function qmix_get_api_key() {
    $stored = get_option( 'qmix_api_key_encrypted' );
    if ( ! $stored ) {
        return '';
    }
    return qmix_decrypt( $stored );
}

// =======================
// Registro da rota REST
// =======================

function qmix_api_register_route() {
    register_rest_route( 'sistema-qmix/v1', '/artigos', array(
        'methods'             => 'POST',
        'callback'            => 'qmix_api_create_article',
        'permission_callback' => 'qmix_api_permission_check',
    ) );
}
add_action( 'rest_api_init', 'qmix_api_register_route' );

// =======================
// Validação de origem (IP / domínio)
// =======================

function qmix_get_request_ip() {
    // Suporte a proxy/Cloudflare — CF-Connecting-IP é o mais confiável quando Cloudflare está ativo
    $headers = array( 'HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR' );
    foreach ( $headers as $header ) {
        if ( ! empty( $_SERVER[ $header ] ) ) {
            // X-Forwarded-For pode conter lista; pega o primeiro
            $ip = trim( explode( ',', $_SERVER[ $header ] )[0] );
            if ( filter_var( $ip, FILTER_VALIDATE_IP ) ) {
                return $ip;
            }
        }
    }
    return '';
}

function qmix_is_origin_allowed() {
    $allowed_raw = get_option( 'qmix_allowed_origins', '' );
    if ( empty( trim( $allowed_raw ) ) ) {
        return true; // lista vazia = sem restrição
    }

    $request_ip = qmix_get_request_ip();
    $entries    = array_filter( array_map( 'trim', explode( "\n", $allowed_raw ) ) );

    foreach ( $entries as $entry ) {
        // É um IP direto?
        if ( filter_var( $entry, FILTER_VALIDATE_IP ) ) {
            if ( $entry === $request_ip ) {
                return true;
            }
            continue;
        }

        // É um domínio — resolve para IPs e compara
        $entry_clean = preg_replace( '#^https?://#', '', rtrim( $entry, '/' ) );
        $resolved    = gethostbynamel( $entry_clean );
        if ( $resolved && in_array( $request_ip, $resolved, true ) ) {
            return true;
        }

        // Tenta também resolução IPv6 via dns_get_record
        $dns_records = @dns_get_record( $entry_clean, DNS_AAAA );
        if ( $dns_records ) {
            foreach ( $dns_records as $record ) {
                if ( isset( $record['ipv6'] ) && $record['ipv6'] === $request_ip ) {
                    return true;
                }
            }
        }

        // Fallback: compara com o domínio extraído do header Origin ou Referer
        $origin_domain = qmix_get_origin_domain();
        if ( $origin_domain && strcasecmp( $entry_clean, $origin_domain ) === 0 ) {
            return true;
        }
    }

    return false;
}

/**
 * Extrai o domínio do header Origin ou Referer (fallback para quando IP não bate por causa de proxy/Cloudflare)
 */
function qmix_get_origin_domain() {
    $origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? $_SERVER['HTTP_ORIGIN'] : '';
    if ( empty( $origin ) ) {
        $origin = isset( $_SERVER['HTTP_REFERER'] ) ? $_SERVER['HTTP_REFERER'] : '';
    }
    if ( empty( $origin ) ) {
        return '';
    }
    $parsed = parse_url( $origin );
    return isset( $parsed['host'] ) ? strtolower( $parsed['host'] ) : '';
}

// =======================
// Verificação de permissão
// =======================

function qmix_api_permission_check( WP_REST_Request $request ) {
    // Valida origem antes da chave
    if ( ! qmix_is_origin_allowed() ) {
        $ip = qmix_get_request_ip();
        return new WP_Error(
            'rest_forbidden_origin',
            'Origem não autorizada. IP: ' . $ip,
            array( 'status' => 403 )
        );
    }

    $api_key      = qmix_get_api_key();
    $sent_api_key = $request->get_header( 'X-API-KEY' );

    if ( empty( $api_key ) ) {
        return new WP_Error(
            'rest_forbidden_no_key',
            'Nenhuma chave API configurada no WordPress. Gere uma em wp-admin > Configurações > QMix Writing.',
            array( 'status' => 401 )
        );
    }

    if ( empty( $sent_api_key ) ) {
        return new WP_Error(
            'rest_forbidden_missing_header',
            'Header X-API-KEY ausente na requisição.',
            array( 'status' => 401 )
        );
    }

    if ( ! hash_equals( $api_key, $sent_api_key ) ) {
        return new WP_Error(
            'rest_forbidden_invalid_key',
            'Chave API inválida.',
            array( 'status' => 401 )
        );
    }

    return true;
}

// =======================
// Callback principal
// =======================

function qmix_api_create_article( WP_REST_Request $request ) {
    require_once( ABSPATH . 'wp-admin/includes/file.php' );
    require_once( ABSPATH . 'wp-admin/includes/media.php' );
    require_once( ABSPATH . 'wp-admin/includes/image.php' );

    $params = $request->get_json_params();

    if ( empty( $params['title'] ) || empty( $params['content'] ) ) {
        return new WP_REST_Response( array(
            'success' => false,
            'message' => 'Título e conteúdo são obrigatórios.'
        ), 400 );
    }

    // --- Campos do post ---
    $title           = sanitize_text_field( $params['title'] );
    $content         = wp_kses_post( html_entity_decode( $params['content'] ) );
    $post_excerpt    = ! empty( $params['excerpt'] ) ? sanitize_textarea_field( $params['excerpt'] ) : '';
    $image_base64    = ! empty( $params['image_base64'] ) ? $params['image_base64'] : null;
    $categories_raw  = ! empty( $params['categories'] ) ? (array) $params['categories'] : array();
    $tags_raw        = ! empty( $params['tags'] )       ? (array) $params['tags']       : array();
    $imagem_filename = ! empty( $params['imagem'] )     ? sanitize_file_name( $params['imagem'] ) : null;

    // --- Metadados da imagem ---
    $image_alt     = ! empty( $params['image_alt'] )     ? sanitize_text_field( $params['image_alt'] )     : $title;
    $image_caption = ! empty( $params['image_caption'] ) ? sanitize_text_field( $params['image_caption'] ) : '';
    $image_title   = ! empty( $params['image_title'] )   ? sanitize_text_field( $params['image_title'] )   : $title;

    // --- Status com whitelist (inclui 'private' e 'future') ---
    $allowed_statuses = array( 'publish', 'draft', 'pending', 'private', 'future' );
    $status = ( ! empty( $params['status'] ) && in_array( $params['status'], $allowed_statuses, true ) )
        ? $params['status']
        : 'publish';

    // --- Data de publicação agendada (obrigatória quando status = future) ---
    $post_date = null;
    if ( $status === 'future' && ! empty( $params['scheduled_date'] ) ) {
        $ts = strtotime( $params['scheduled_date'] );
        if ( $ts && $ts > time() ) {
            $post_date = date( 'Y-m-d H:i:s', $ts );
        } else {
            // Data inválida ou no passado — publica imediatamente
            $status = 'publish';
        }
    }

    // --- Validação de autor ---
    $author_id = ! empty( $params['author'] ) ? intval( $params['author'] ) : null;
    if ( $author_id && ! get_user_by( 'id', $author_id ) ) {
        return new WP_REST_Response( array( 'success' => false, 'message' => 'Autor inválido.' ), 400 );
    }

    if ( empty( $author_id ) ) {
        $authors = get_users( array(
            'role__in' => array( 'author', 'administrator', 'editor' ),
            'number'   => 1,
            'fields'   => 'ids',
        ) );
        $author = ! empty( $authors ) ? $authors[0] : 1;
    } else {
        $author = $author_id;
    }

    // --- Conversão de categorias (aceita IDs ou nomes) ---
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
                if ( ! is_wp_error( $new_term ) ) {
                    $categories[] = intval( $new_term['term_id'] );
                }
            }
        }
    }

    if ( empty( $categories ) ) {
        $default_category_id = intval( get_option( 'default_category' ) );
        if ( $default_category_id ) {
            $categories[] = $default_category_id;
        }
    }

    // --- Conversão de tags (aceita IDs ou strings) ---
    $tag_ids    = array();
    $tag_names  = array();
    foreach ( $tags_raw as $tag ) {
        if ( is_numeric( $tag ) ) {
            $tag_ids[] = intval( $tag );
        } else {
            $tag_names[] = sanitize_text_field( $tag );
        }
    }

    // =======================
    // Upload de imagem
    // =======================
    $media_id = null;
    if ( $image_base64 ) {
        $image_data = base64_decode( preg_replace( '#^data:image/\w+;base64,#i', '', $image_base64 ) );

        if ( ! $image_data ) {
            return new WP_REST_Response( array( 'success' => false, 'message' => 'Formato de imagem inválido.' ), 400 );
        }

        // Limite de 5MB
        if ( strlen( $image_data ) > 5 * 1024 * 1024 ) {
            return new WP_REST_Response( array( 'success' => false, 'message' => 'Imagem excede o limite de 5MB.' ), 400 );
        }

        // Validação do MIME real do conteúdo
        $finfo         = new finfo( FILEINFO_MIME_TYPE );
        $detected_mime = $finfo->buffer( $image_data );
        $allowed_mimes = array( 'image/webp', 'image/jpeg', 'image/png', 'image/gif' );

        if ( ! in_array( $detected_mime, $allowed_mimes, true ) ) {
            return new WP_REST_Response( array( 'success' => false, 'message' => 'Tipo de imagem não permitido.' ), 400 );
        }

        $upload_dir = wp_upload_dir();
        if ( ! is_writable( $upload_dir['path'] ) ) {
            return new WP_REST_Response( array( 'success' => false, 'message' => 'Diretório de uploads sem permissão de escrita.' ), 500 );
        }

        $image_name      = $imagem_filename ? $imagem_filename : 'artigo-' . uniqid() . '.webp';
        $image_full_path = $upload_dir['path'] . '/' . $image_name;

        if ( ! file_put_contents( $image_full_path, $image_data ) ) {
            return new WP_REST_Response( array( 'success' => false, 'message' => 'Erro ao salvar imagem temporária.' ), 500 );
        }

        $file_args = array(
            'name'     => $image_name,
            'tmp_name' => $image_full_path,
            'type'     => $detected_mime,
        );

        $media_id = media_handle_sideload( $file_args, 0 );
        unlink( $image_full_path );

        if ( is_wp_error( $media_id ) ) {
            return new WP_REST_Response( array( 'success' => false, 'message' => 'Erro ao processar o upload da imagem.' ), 500 );
        }

        // --- Metadados do attachment ---
        // Título do attachment
        wp_update_post( array(
            'ID'           => $media_id,
            'post_title'   => $image_title,
            'post_excerpt' => $image_caption, // legenda da imagem no WordPress
        ) );

        // Texto alternativo (alt)
        update_post_meta( $media_id, '_wp_attachment_image_alt', $image_alt );
    }

    // =======================
    // Criação do post
    // =======================
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

    if ( is_wp_error( $post_id ) ) {
        return new WP_REST_Response( array( 'success' => false, 'message' => 'Erro ao criar o post.' ), 500 );
    }

    if ( ! empty( $categories ) ) {
        wp_set_post_terms( $post_id, $categories, 'category' );
    }

    // Tags por ID
    if ( ! empty( $tag_ids ) ) {
        wp_set_post_terms( $post_id, $tag_ids, 'post_tag' );
    }

    // Tags por nome (append para não sobrescrever as por ID)
    if ( ! empty( $tag_names ) ) {
        wp_set_post_terms( $post_id, $tag_names, 'post_tag', true );
    }

    if ( $media_id ) {
        set_post_thumbnail( $post_id, $media_id );
    }

    return new WP_REST_Response( array( 'success' => true, 'post_id' => $post_id ), 201 );
}

// =======================
// Página de admin
// =======================

function qmix_admin_menu() {
    add_options_page(
        'QMix Writing — Configurações',
        'QMix Writing',
        'manage_options',
        'qmix-writing',
        'qmix_admin_page'
    );
}
add_action( 'admin_menu', 'qmix_admin_menu' );

function qmix_admin_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    $new_key_plain = null;
    $message       = '';

    // Gerar nova chave
    if ( isset( $_POST['qmix_generate_key'] ) && check_admin_referer( 'qmix_generate_key_action' ) ) {
        $new_key_plain = bin2hex( random_bytes( 32 ) ); // 64 chars hex = 256 bits
        update_option( 'qmix_api_key_encrypted', qmix_encrypt( $new_key_plain ) );
        $message = 'success';
    }

    // Revogar chave
    if ( isset( $_POST['qmix_revoke_key'] ) && check_admin_referer( 'qmix_revoke_key_action' ) ) {
        delete_option( 'qmix_api_key_encrypted' );
        $message = 'revoked';
    }

    // Salvar origens permitidas
    if ( isset( $_POST['qmix_save_origins'] ) && check_admin_referer( 'qmix_save_origins_action' ) ) {
        $origins = isset( $_POST['qmix_allowed_origins'] ) ? sanitize_textarea_field( wp_unslash( $_POST['qmix_allowed_origins'] ) ) : '';
        update_option( 'qmix_allowed_origins', $origins );
        $message = 'origins_saved';
    }

    $has_key = (bool) get_option( 'qmix_api_key_encrypted' );
    ?>
    <div class="wrap">
        <h1>QMix Writing — Configurações</h1>

        <?php if ( $message === 'success' ) : ?>
            <div class="notice notice-success">
                <p><strong>Chave gerada com sucesso.</strong> Copie a chave abaixo e repasse à QMix. Ela não será exibida novamente.</p>
                <p style="font-family:monospace; font-size:14px; background:#f0f0f0; padding:10px; word-break:break-all;">
                    <?php echo esc_html( $new_key_plain ); ?>
                </p>
            </div>
        <?php elseif ( $message === 'revoked' ) : ?>
            <div class="notice notice-warning">
                <p>Chave revogada. O endpoint está desativado até que uma nova chave seja gerada.</p>
            </div>
        <?php elseif ( $message === 'origins_saved' ) : ?>
            <div class="notice notice-success">
                <p>Origens permitidas salvas com sucesso.</p>
            </div>
        <?php endif; ?>

        <table class="form-table">
            <tr>
                <th>Status da chave</th>
                <td>
                    <?php if ( $has_key ) :
                        $decrypted_key = qmix_get_api_key();
                        if ( $decrypted_key && strlen( $decrypted_key ) > 10 ) {
                            $masked = substr( $decrypted_key, 0, 6 ) . '***' . substr( $decrypted_key, -4 );
                        } else {
                            $masked = '??????';
                        }
                    ?>
                        <span style="color:green;">&#10003; Chave configurada</span>
                        <br>
                        <code style="font-size:13px; margin-top:4px; display:inline-block;">Key: <?php echo esc_html( $masked ); ?></code>
                        <!-- <p style="color:#666; font-size:12px; margin-top:4px;">Compare com o log de disparo para confirmar que as chaves batem.</p> -->
                    <?php else : ?>
                        <span style="color:red;">&#10007; Nenhuma chave configurada — endpoint inativo</span>
                    <?php endif; ?>
                </td>
            </tr>
            <tr>
                <th>Endpoint da API</th>
                <td>
                    <code><?php echo esc_url( get_rest_url( null, 'sistema-qmix/v1/artigos' ) ); ?></code>
                </td>
            </tr>
        </table>

        <h2>Gerar nova chave</h2>
        <p>Ao gerar uma nova chave, a anterior é invalidada imediatamente. Atualize a chave na QMix antes de revogar a atual.</p>
        <form method="post">
            <?php wp_nonce_field( 'qmix_generate_key_action' ); ?>
            <input type="hidden" name="qmix_generate_key" value="1">
            <?php submit_button( 'Gerar nova chave', 'primary' ); ?>
        </form>

        <?php if ( $has_key ) : ?>
            <h2>Revogar chave atual</h2>
            <p>Remove a chave do banco. O endpoint ficará inacessível até uma nova chave ser gerada.</p>
            <form method="post">
                <?php wp_nonce_field( 'qmix_revoke_key_action' ); ?>
                <input type="hidden" name="qmix_revoke_key" value="1">
                <?php submit_button( 'Revogar chave', 'delete' ); ?>
            </form>
        <?php endif; ?>

        <hr>
        <h2>Origens permitidas</h2>
        <p>Informe os IPs ou domínios autorizados a enviar requisições, um por linha. Deixe em branco para não restringir por origem.</p>
        <p style="color:#666; font-size:12px;">Exemplos: <code>acesso.qmix.com.br</code><!-- &nbsp;|&nbsp; <code>203.0.113.42</code> &nbsp;|&nbsp; <code>2606:4700:3037::6815:1e2f</code>--></p>
        <form method="post">
            <?php wp_nonce_field( 'qmix_save_origins_action' ); ?>
            <input type="hidden" name="qmix_save_origins" value="1">
            <textarea name="qmix_allowed_origins" rows="6" style="width:100%; max-width:500px; font-family:monospace;"><?php echo esc_textarea( get_option( 'qmix_allowed_origins', '' ) ); ?></textarea>
            <br><br>
            <?php
            $origins_raw = get_option( 'qmix_allowed_origins', '' );
            $entries     = array_filter( array_map( 'trim', explode( "\n", $origins_raw ) ) );
            if ( ! empty( $entries ) ) :
            ?>
                <p><strong>IPs resolvidos atualmente:</strong></p>
                <ul style="font-family:monospace; font-size:12px;">
                <?php foreach ( $entries as $entry ) :
                    $entry_clean = preg_replace( '#^https?://#', '', rtrim( $entry, '/' ) );
                    if ( filter_var( $entry_clean, FILTER_VALIDATE_IP ) ) {
                        echo '<li>' . esc_html( $entry_clean ) . ' <span style="color:green;">(IP direto)</span></li>';
                    } else {
                        $ipv4 = gethostbynamel( $entry_clean );
                        $ipv6 = array();
                        $dns  = @dns_get_record( $entry_clean, DNS_AAAA );
                        if ( $dns ) {
                            foreach ( $dns as $r ) {
                                if ( isset( $r['ipv6'] ) ) $ipv6[] = $r['ipv6'];
                            }
                        }
                        $all_ips = array_merge( $ipv4 ?: array(), $ipv6 );
                        if ( $all_ips ) {
                            echo '<li>' . esc_html( $entry ) . ' → ' . esc_html( implode( ', ', $all_ips ) ) . '</li>';
                        } else {
                            echo '<li>' . esc_html( $entry ) . ' <span style="color:red;">(não resolvido)</span></li>';
                        }
                    }
                endforeach; ?>
                </ul>
            <?php endif; ?>
            <?php submit_button( 'Salvar origens', 'secondary' ); ?>
        </form>
    </div>
    <?php
}
