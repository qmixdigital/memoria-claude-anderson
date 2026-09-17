<?php
/**
 * Câmera Cotidiana — helpers (template utilities).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function cc_excluded_lang_cat_ids() {
    static $cache = null;
    if ( null !== $cache ) { return $cache; }
    $cache = array();
    // sem multilang configurado neste portal
    return $cache;
}

function cc_query_for_section( $args = array(), $hide_lang = true ) {
    $defaults = array(
        'posts_per_page'      => 6,
        'no_found_rows'       => true,
        'ignore_sticky_posts' => true,
        'meta_query'          => array(
            array(
                'key'     => '_thumbnail_id',
                'value'   => '0',
                'compare' => '>',
                'type'    => 'NUMERIC',
            ),
        ),
    );
    if ( $hide_lang ) {
        $excl = cc_excluded_lang_cat_ids();
        if ( ! empty( $excl ) ) { $defaults['category__not_in'] = $excl; }
    }
    return new WP_Query( wp_parse_args( $args, $defaults ) );
}

/**
 * Date format: j_de_F_de_Y (e.g. "1 de maio de 2026") com fallback relativo
 * para posts <24h.
 */
function cc_post_date( $post_id = null ) {
    $post_id = $post_id ?: get_the_ID();
    $ts      = get_post_time( 'U', true, $post_id );
    if ( ! $ts ) { return ''; }
    $diff = time() - $ts;
    if ( $diff < HOUR_IN_SECONDS ) {
        $m = max( 1, floor( $diff / MINUTE_IN_SECONDS ) );
        return $m === 1 ? 'há 1 minuto' : "há $m minutos";
    }
    if ( $diff < DAY_IN_SECONDS ) {
        $h = floor( $diff / HOUR_IN_SECONDS );
        return $h === 1 ? 'há 1 hora' : "há $h horas";
    }
    return wp_date( 'j \\d\\e F \\d\\e Y', $ts );
}

function cc_reading_time( $post_id = null ) {
    $post_id = $post_id ?: get_the_ID();
    $content = get_post_field( 'post_content', $post_id );
    $words   = str_word_count( strip_tags( $content ) );
    if ( $words < 50 ) { return ''; }
    $min = max( 1, (int) round( $words / 230 ) );
    return $min === 1 ? '1 min de leitura' : "{$min} min de leitura";
}

function cc_related_posts( $post_id, $count = 5 ) {
    $cats = wp_get_post_categories( $post_id );
    if ( empty( $cats ) ) { return array(); }

    $q = new WP_Query( array(
        'posts_per_page'      => max( 12, $count * 3 ),
        'category__in'        => $cats,
        'post__not_in'        => array( $post_id ),
        'no_found_rows'       => true,
        'ignore_sticky_posts' => true,
        'orderby'             => 'date',
        'order'               => 'DESC',
        'meta_query'          => array(
            array( 'key' => '_thumbnail_id', 'value' => '0', 'compare' => '>', 'type' => 'NUMERIC' ),
        ),
    ) );
    $ids = array();
    while ( $q->have_posts() ) {
        $q->the_post();
        if ( ! has_post_thumbnail() ) { continue; }
        $ids[] = get_the_ID();
        if ( count( $ids ) >= $count ) { break; }
    }
    wp_reset_postdata();
    return $ids;
}

/**
 * Render do post inserindo:
 *  - share inline após 1º parágrafo
 *  - in-article ad a cada 5 parágrafos (set B do roll)
 */
function cc_render_with_inline_extras( $html, $post_id ) {
    if ( ! $html ) { return; }

    $parts = preg_split( '#</p>#i', $html, -1, PREG_SPLIT_NO_EMPTY );
    if ( empty( $parts ) ) { echo $html; return; }

    $output = '';
    $share_inserted = false;

    foreach ( $parts as $i => $chunk ) {
        $output .= $chunk . '</p>';
        $position = $i + 1;

        // Share — após 1º parágrafo
        if ( $position === 1 && ! $share_inserted ) {
            $share_inserted = true;
            $url   = get_permalink( $post_id );
            $title = get_the_title( $post_id );
            $output .= '<div class="cc__share-inline" aria-label="Compartilhar">';
            $output .= '<span class="cc__share-inline__label">› compartilhar</span>';
            $output .= '<a href="https://wa.me/?text=' . rawurlencode( $title . ' ' . $url ) . '" target="_blank" rel="noopener nofollow">whatsapp</a>';
            $output .= '<a href="https://twitter.com/intent/tweet?url=' . rawurlencode( $url ) . '&text=' . rawurlencode( $title ) . '" target="_blank" rel="noopener nofollow">twitter / x</a>';
            $output .= '<a href="https://www.facebook.com/sharer/sharer.php?u=' . rawurlencode( $url ) . '" target="_blank" rel="noopener nofollow">facebook</a>';
            $output .= '<a href="https://www.linkedin.com/sharing/share-offsite/?url=' . rawurlencode( $url ) . '" target="_blank" rel="noopener nofollow">linkedin</a>';
            $output .= '</div>';
        }

        // Ad — every 5 paragraphs (set B), cap at 3 ads
        if ( $position > 1 && $position % 5 === 0 ) {
            static $ad_count = 0;
            if ( $ad_count < 3 ) {
                $ad_count++;
                $output .= '<div class="cc__post__ad" aria-hidden="true"><ins class="adsbygoogle cc__adslot" data-ad-client="' . esc_attr( CC_ADSENSE_CLIENT ) . '" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins></div>';
            }
        }
    }

    echo $output;
}

/**
 * Menu fallback — single horizontal row (categorias top + contato).
 */
function cc_menu_fallback() {
    $cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 7, 'hide_empty' => true ) );
    echo '<ul class="cc__menu">';
    echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">início</a></li>';
    foreach ( $cats as $c ) {
        echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( strtolower( $c->name ) ) . '</a></li>';
    }
    echo '<li><a href="' . esc_url( home_url( '/contato/' ) ) . '">contato</a></li>';
    echo '</ul>';
}
