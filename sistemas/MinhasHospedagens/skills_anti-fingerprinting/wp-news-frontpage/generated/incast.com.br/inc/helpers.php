<?php
/**
 * Incast — helpers.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

function ic_read_time( $post_id = null ) {
    $post_id = $post_id ?: get_the_ID();
    $words   = str_word_count( wp_strip_all_tags( get_post_field( 'post_content', $post_id ) ) );
    return max( 1, (int) ceil( $words / 220 ) );
}

/** Card image_left (default), lg ou featured. */
function ic_card( $density = 'default' ) {
    if ( ! has_post_thumbnail() ) { return; }
    $cats = get_the_category();
    $cat  = $cats ? $cats[0] : null;
    $cls  = 'ic-card';
    if ( $density === 'lg' )       { $cls .= ' ic-card--lg'; }
    if ( $density === 'featured' ) { $cls .= ' ic-card--featured'; }
    ?>
    <article class="<?php echo esc_attr( $cls ); ?>">
        <a class="ic-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
            <?php the_post_thumbnail( 'ic-card', array(
                'loading'  => 'eager',
                'decoding' => 'async',
                'class'    => 'ic-card__img',
            ) ); ?>
        </a>
        <div class="ic-card__body">
            <?php if ( $cat ) : ?>
                <span class="ic-card__cat"><a href="<?php echo esc_url( get_category_link( $cat ) ); ?>"><?php echo esc_html( $cat->name ); ?></a></span>
            <?php endif; ?>
            <h3 class="ic-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
            <?php if ( $density !== 'compact' ) : ?>
                <p class="ic-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 22 ) ); ?></p>
            <?php endif; ?>
            <div class="ic-card__meta">
                <span class="ic-author"><?php the_author(); ?></span>
                <span><?php echo esc_html( ic_post_date() ); ?></span>
            </div>
        </div>
    </article>
    <?php
}

/** Detecta Gravatar real (HEAD com d=404) — cache de 7 dias. */
function ic_user_has_gravatar( $user_id ) {
    static $rt = array();
    if ( isset( $rt[ $user_id ] ) ) { return $rt[ $user_id ]; }
    $key = 'ic_grav_' . (int) $user_id;
    $c   = get_transient( $key );
    if ( $c !== false ) { $rt[ $user_id ] = ( '1' === $c ); return $rt[ $user_id ]; }
    $u = get_user_by( 'id', $user_id );
    if ( ! $u || empty( $u->user_email ) ) { set_transient( $key, '0', WEEK_IN_SECONDS ); return false; }
    $hash = md5( strtolower( trim( $u->user_email ) ) );
    $r    = wp_remote_head( "https://secure.gravatar.com/avatar/{$hash}?d=404", array( 'timeout' => 3 ) );
    $has  = ( 200 === (int) wp_remote_retrieve_response_code( $r ) );
    set_transient( $key, $has ? '1' : '0', WEEK_IN_SECONDS );
    $rt[ $user_id ] = $has;
    return $has;
}

/** Avatar do autor com fallback em camadas: Mídia(slug) → Gravatar → Site Icon → identicon. */
function ic_author_avatar( $user_id, $size = 56, $alt = '' ) {
    if ( ! $user_id ) { return ''; }
    $u   = get_user_by( 'id', $user_id );
    $alt = $alt ?: ( $u ? $u->display_name : '' );
    if ( $u ) {
        $cands = array_unique( array_filter( array(
            $u->user_nicename, $u->user_login, sanitize_title( $u->display_name ),
        ) ) );
        foreach ( $cands as $slug ) {
            $att = get_page_by_path( $slug, OBJECT, 'attachment' );
            if ( $att && wp_attachment_is_image( $att->ID ) ) {
                return wp_get_attachment_image( $att->ID, array( $size, $size ), false, array(
                    'class'    => 'ic-authorbox__img',
                    'alt'      => $alt,
                    'loading'  => 'eager',
                    'decoding' => 'async',
                ) );
            }
        }
    }
    if ( ic_user_has_gravatar( $user_id ) ) {
        // Gravatar URL custom: força tamanho exato (sem 2x) + sem srcset Retina pesado.
        $u = get_user_by( 'id', $user_id );
        $hash = md5( strtolower( trim( $u->user_email ) ) );
        $url  = sprintf( 'https://secure.gravatar.com/avatar/%s?s=%d&d=mm&r=g', $hash, (int) $size );
        return sprintf(
            '<img src="%s" alt="%s" width="%d" height="%d" class="ic-authorbox__img" loading="lazy" decoding="async" />',
            esc_url( $url ), esc_attr( $alt ), (int) $size, (int) $size
        );
    }
    $icon = get_site_icon_url( $size );
    if ( $icon ) {
        return sprintf( '<img src="%s" alt="%s" width="%d" height="%d" class="ic-authorbox__img" decoding="async" loading="eager" />',
            esc_url( $icon ), esc_attr( $alt ?: get_bloginfo( 'name' ) ), (int) $size, (int) $size );
    }
    return get_avatar( $user_id, $size, 'identicon', $alt, array( 'class' => 'ic-authorbox__img' ) );
}

/** Injeta AdSense in-article após o 2º parágrafo (in_article_ad_pattern: after_2nd_para). */
function ic_inject_adsense_after_2nd_para( $content ) {
    if ( ! is_singular( 'post' ) || ! is_main_query() || ! in_the_loop() ) { return $content; }
    if ( ! defined( 'INCAST_ADSENSE_CLIENT' ) || ! INCAST_ADSENSE_CLIENT ) { return $content; }
    $client = INCAST_ADSENSE_CLIENT;
    $ad = '<div class="ic-inline-ad"><ins class="adsbygoogle" style="display:block" data-ad-client="' . esc_attr( $client ) . '" data-ad-format="fluid" data-ad-layout="in-article"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>';
    $closes = 0;
    return preg_replace_callback( '#</p>#i', function ( $m ) use ( &$closes, $ad ) {
        $closes++;
        return $closes === 2 ? '</p>' . $ad : '</p>';
    }, $content );
}
add_filter( 'the_content', 'ic_inject_adsense_after_2nd_para', 20 );

/** AdSense auto-ads loader no head (uma vez por página). */
add_action( 'wp_head', function () {
    if ( ! defined( 'INCAST_ADSENSE_CLIENT' ) || ! INCAST_ADSENSE_CLIENT ) { return; }
    if ( is_admin() || is_preview() ) { return; }
    echo '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' . esc_attr( INCAST_ADSENSE_CLIENT ) . '" crossorigin="anonymous"></script>' . "\n";
}, 5 );

/** Query helper para a home com filtro hard de thumbnail. */
function ic_query_for_section( $args = array() ) {
    $defaults = array(
        'posts_per_page'      => 5,
        'no_found_rows'       => true,
        'ignore_sticky_posts' => true,
        'category__not_in'    => ic_excluded_lang_cat_ids(),
        'meta_query'          => array(
            array(
                'key'     => '_thumbnail_id',
                'value'   => '0',
                'compare' => '>',
                'type'    => 'NUMERIC',
            ),
        ),
    );
    return new WP_Query( wp_parse_args( $args, $defaults ) );
}
