<?php
/**
 * Oi Empreendedores — helpers.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

function oie_breadcrumb_slashes() {
    if ( is_front_page() ) { return; }
    $home = '<a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html( get_bloginfo( 'name' ) ) . '</a>';
    $parts = array( $home );
    if ( is_singular( 'post' ) ) {
        $cats = get_the_category();
        if ( ! empty( $cats ) ) {
            $cat = $cats[0];
            $parts[] = '<a href="' . esc_url( get_category_link( $cat ) ) . '">' . esc_html( $cat->name ) . '</a>';
        }
        $parts[] = esc_html( get_the_title() );
    } elseif ( is_category() ) {
        $cur = get_queried_object();
        if ( $cur && $cur->parent ) {
            $parents = get_ancestors( $cur->term_id, 'category' );
            foreach ( array_reverse( $parents ) as $pid ) {
                $p = get_term( $pid, 'category' );
                $parts[] = '<a href="' . esc_url( get_category_link( $pid ) ) . '">' . esc_html( $p->name ) . '</a>';
            }
        }
        $parts[] = esc_html( single_cat_title( '', false ) );
    } elseif ( is_search() ) {
        $parts[] = 'Resultados da busca';
    } elseif ( is_404() ) {
        $parts[] = 'Página não encontrada';
    } elseif ( is_archive() ) {
        $parts[] = esc_html( get_the_archive_title() );
    }
    echo '<nav class="oie-post__crumbs">' . implode( ' / ', $parts ) . '</nav>';
}

function oie_card( $density = 'default' ) {
    if ( ! has_post_thumbnail() ) { return; }
    $cats = get_the_category();
    $cat  = $cats ? $cats[0] : null;
    $cls  = 'oie-card oie-card--has-media';
    if ( $density === 'lg' ) { $cls .= ' oie-card--lg'; }
    if ( $density === 'xl' ) { $cls .= ' oie-card--xl'; }
    if ( $density === 'compact' ) { $cls .= ' oie-card--compact'; }
    ?>
    <article class="<?php echo esc_attr( $cls ); ?>">
        <a class="oie-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
            <?php the_post_thumbnail( 'medium_large', array(
                'loading'  => 'eager',
                'decoding' => 'async',
                'class'    => 'oie-card__img',
            ) ); ?>
        </a>
        <div class="oie-card__body">
            <?php if ( $cat ) : ?>
                <span class="oie-card__cat"><a href="<?php echo esc_url( get_category_link( $cat ) ); ?>"><?php echo esc_html( $cat->name ); ?></a></span>
            <?php endif; ?>
            <h3 class="oie-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
            <?php if ( $density !== 'compact' ) : ?>
                <p class="oie-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 18 ) ); ?></p>
            <?php endif; ?>
            <div class="oie-card__meta">
                <span><?php echo esc_html( oie_post_date() ); ?></span>
                <span><?php echo esc_html( oie_read_time() ); ?> min</span>
            </div>
        </div>
    </article>
    <?php
}

function oie_read_time( $post_id = null ) {
    $post_id = $post_id ?: get_the_ID();
    $words = str_word_count( wp_strip_all_tags( get_post_field( 'post_content', $post_id ) ) );
    return max( 1, (int) ceil( $words / 220 ) );
}

function oie_query_for_section( $args = array() ) {
    // Home só exibe posts com imagem destacada de verdade (_thumbnail_id pode existir
    // como string vazia ou 0 — EXISTS não basta; exigimos NUMERIC > 0).
    $defaults = array(
        'posts_per_page'      => 5,
        'no_found_rows'       => true,
        'ignore_sticky_posts' => true,
        'category__not_in'    => oie_excluded_lang_cat_ids(),
        'meta_query'          => array(
            array(
                'key'     => '_thumbnail_id',
                'value'   => '0',
                'compare' => '>',
                'type'    => 'NUMERIC',
            ),
        ),
    );
    // Pega 3x mais para sobrar margem caso algum post tenha _thumbnail_id apontando
    // para attachment deletado — filtramos com has_post_thumbnail() no template.
    $defaults['posts_per_page'] = isset( $args['posts_per_page'] ) ? max( (int) $args['posts_per_page'], 1 ) : $defaults['posts_per_page'];
    return new WP_Query( wp_parse_args( $args, $defaults ) );
}

function oie_h3_subcat_chips() {
    $cats = get_the_category();
    if ( empty( $cats ) ) { return; }
    echo '<div class="oie-post__h3cats">';
    foreach ( $cats as $c ) {
        echo '<a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a>';
    }
    echo '</div>';
}

// Stub mantido para compatibilidade com chamadas antigas — site não exibe redes sociais.
function oie_share_links( $url = '', $title = '' ) {}

/**
 * Verifica via HTTP HEAD se o usuário tem Gravatar real (não default).
 * Resposta cacheada em transient por 7 dias para não bater no Gravatar a cada page load.
 */
function oie_user_has_gravatar( $user_id ) {
    static $runtime = array();
    if ( isset( $runtime[ $user_id ] ) ) { return $runtime[ $user_id ]; }
    $cache_key = 'oie_grav_' . (int) $user_id;
    $cached    = get_transient( $cache_key );
    if ( $cached !== false ) {
        $runtime[ $user_id ] = ( '1' === $cached );
        return $runtime[ $user_id ];
    }
    $user = get_user_by( 'id', $user_id );
    if ( ! $user || empty( $user->user_email ) ) {
        set_transient( $cache_key, '0', WEEK_IN_SECONDS );
        return false;
    }
    $hash     = md5( strtolower( trim( $user->user_email ) ) );
    $response = wp_remote_head( "https://secure.gravatar.com/avatar/{$hash}?d=404", array( 'timeout' => 3 ) );
    $has      = ( 200 === (int) wp_remote_retrieve_response_code( $response ) );
    set_transient( $cache_key, $has ? '1' : '0', WEEK_IN_SECONDS );
    $runtime[ $user_id ] = $has;
    return $has;
}

/**
 * Avatar do autor com fallback em camadas:
 *   1. Anexo na Biblioteca de Mídia com slug == user_nicename / user_login / slug(display_name).
 *   2. Gravatar real (verificado via HEAD).
 *   3. Site Icon (favicon do Customizer).
 *   4. Identicon do Gravatar (sempre retorna algo).
 */
function oie_author_avatar( $user_id, $size = 120, $alt = '' ) {
    if ( ! $user_id ) { return ''; }
    $user = get_user_by( 'id', $user_id );
    $alt  = $alt ?: ( $user ? $user->display_name : '' );

    // 1) Anexo da Biblioteca de Mídia com slug do usuário
    if ( $user ) {
        $candidates = array_unique( array_filter( array(
            $user->user_nicename,
            $user->user_login,
            sanitize_title( $user->display_name ),
        ) ) );
        foreach ( $candidates as $slug ) {
            $att = get_page_by_path( $slug, OBJECT, 'attachment' );
            if ( $att && wp_attachment_is_image( $att->ID ) ) {
                return wp_get_attachment_image( $att->ID, array( $size, $size ), false, array(
                    'class'    => 'oie-authorbox__img',
                    'alt'      => $alt,
                    'loading'  => 'eager',
                    'decoding' => 'async',
                ) );
            }
        }
    }

    // 2) Gravatar real (HTTP HEAD)
    if ( oie_user_has_gravatar( $user_id ) ) {
        return get_avatar( $user_id, $size, '', $alt, array( 'class' => 'oie-authorbox__img' ) );
    }

    // 3) Site Icon (Customizer > Identidade do Site > Ícone do Site)
    $site_icon = get_site_icon_url( $size );
    if ( $site_icon ) {
        return sprintf(
            '<img src="%s" alt="%s" width="%d" height="%d" class="oie-authorbox__img" decoding="async" loading="eager" />',
            esc_url( $site_icon ),
            esc_attr( $alt ?: get_bloginfo( 'name' ) ),
            (int) $size,
            (int) $size
        );
    }

    // 4) Fallback final — identicon do Gravatar (gerado a partir do email, único por user)
    return get_avatar( $user_id, $size, 'identicon', $alt, array( 'class' => 'oie-authorbox__img' ) );
}
