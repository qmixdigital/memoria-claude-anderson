<?php
/**
 * Revista de Educação — helpers.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

function rde_read_time( $post_id = null ) {
    $post_id = $post_id ?: get_the_ID();
    $words   = str_word_count( wp_strip_all_tags( get_post_field( 'post_content', $post_id ) ) );
    return max( 1, (int) ceil( $words / 220 ) );
}

/** Card padrão / overlay / lg / featured. */
function rde_card( $density = 'default' ) {
    if ( ! has_post_thumbnail() ) { return; }
    $cats = get_the_category();
    $cat  = $cats ? $cats[0] : null;
    $cls  = 'rde-card';
    if ( $density === 'overlay' )  { $cls .= ' rde-card--overlay'; }
    if ( $density === 'lg' )       { $cls .= ' rde-card--lg'; }
    if ( $density === 'featured' ) { $cls .= ' rde-card--featured'; }
    ?>
    <article class="<?php echo esc_attr( $cls ); ?>">
        <a class="rde-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
            <?php the_post_thumbnail( 'rde-card', array(
                'loading'  => 'eager',
                'decoding' => 'async',
                'class'    => 'rde-card__img',
            ) ); ?>
        </a>
        <div class="rde-card__body">
            <?php if ( $cat ) : ?>
                <span class="rde-card__cat"><a href="<?php echo esc_url( get_category_link( $cat ) ); ?>"><?php echo esc_html( $cat->name ); ?></a></span>
            <?php endif; ?>
            <h3 class="rde-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
            <?php if ( $density !== 'compact' && $density !== 'overlay' ) : ?>
                <p class="rde-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 24 ) ); ?></p>
            <?php endif; ?>
            <div class="rde-card__meta">
                <span><?php echo esc_html( rde_post_date() ); ?></span>
            </div>
        </div>
    </article>
    <?php
}

/** Detecta Gravatar real. */
function rde_user_has_gravatar( $user_id ) {
    static $rt = array();
    if ( isset( $rt[ $user_id ] ) ) { return $rt[ $user_id ]; }
    $key = 'rde_grav_' . (int) $user_id;
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

/** AdSense set B — every_5_paras (a cada 5º parágrafo). */
function rde_inject_adsense_every_5_paras( $content ) {
    if ( ! is_singular( 'post' ) || ! is_main_query() || ! in_the_loop() ) { return $content; }
    if ( ! defined( 'RDE_ADSENSE_CLIENT' ) || ! RDE_ADSENSE_CLIENT ) { return $content; }
    $client = RDE_ADSENSE_CLIENT;
    $ad = '<div class="rde-inline-ad"><ins class="adsbygoogle" style="display:block" data-ad-client="' . esc_attr( $client ) . '" data-ad-format="fluid" data-ad-layout="in-article"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>';
    $closes = 0;
    return preg_replace_callback( '#</p>#i', function ( $m ) use ( &$closes, $ad ) {
        $closes++;
        if ( $closes > 0 && $closes % 5 === 0 ) { return '</p>' . $ad; }
        return '</p>';
    }, $content );
}
add_filter( 'the_content', 'rde_inject_adsense_every_5_paras', 20 );

add_action( 'wp_head', function () {
    if ( ! defined( 'RDE_ADSENSE_CLIENT' ) || ! RDE_ADSENSE_CLIENT ) { return; }
    if ( is_admin() || is_preview() ) { return; }
    echo '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' . esc_attr( RDE_ADSENSE_CLIENT ) . '" crossorigin="anonymous"></script>' . "\n";
}, 5 );

function rde_query_for_section( $args = array() ) {
    $defaults = array(
        'posts_per_page'      => 5,
        'no_found_rows'       => true,
        'ignore_sticky_posts' => true,
        'meta_query'          => array(
            array( 'key' => '_thumbnail_id', 'value' => '0', 'compare' => '>', 'type' => 'NUMERIC' ),
        ),
    );
    return new WP_Query( wp_parse_args( $args, $defaults ) );
}
