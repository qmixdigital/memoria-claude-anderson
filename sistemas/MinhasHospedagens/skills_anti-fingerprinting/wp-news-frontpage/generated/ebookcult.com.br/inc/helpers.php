<?php
/**
 * Ebookcult — helpers (template utilities).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * Default WP_Query for any home/sidebar block: hides Wellness (multilang)
 * and forces a real featured-image presence at SQL level.
 *
 * @param array $args   Args to merge with defaults.
 * @param bool  $hide_lang  Whether to apply the multilang exclusion (true on home).
 */
function ec_query_for_section( $args = array(), $hide_lang = true ) {
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
        $defaults['category__not_in'] = ec_excluded_lang_cat_ids();
    }
    return new WP_Query( wp_parse_args( $args, $defaults ) );
}

/**
 * Date string with relative format (iso_with_relative).
 * Recent posts: "há X horas". Older than 7 days: ISO date "2026-04-15".
 */
function ec_post_date( $post_id = null ) {
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
    if ( $diff < 7 * DAY_IN_SECONDS ) {
        $d = floor( $diff / DAY_IN_SECONDS );
        return $d === 1 ? 'há 1 dia' : "há $d dias";
    }
    return wp_date( 'Y-m-d', $ts ); // ISO format for older posts
}

/**
 * Approximate reading time string (rough average 230 words/min).
 */
function ec_reading_time( $post_id = null ) {
    $post_id = $post_id ?: get_the_ID();
    $content = get_post_field( 'post_content', $post_id );
    $words   = str_word_count( strip_tags( $content ) );
    if ( $words < 50 ) { return ''; }
    $min = max( 1, (int) round( $words / 230 ) );
    return $min === 1 ? 'leitura: 1 min' : "leitura: $min min";
}

/**
 * Related posts by category.
 */
function ec_related_posts( $post_id, $count = 3, $exclude = array() ) {
    $cats = wp_get_post_categories( $post_id );
    if ( empty( $cats ) ) { return array(); }

    $exclude = array_merge( array( $post_id ), (array) $exclude );

    $q = new WP_Query( array(
        'posts_per_page'      => max( 12, $count * 4 ),
        'category__in'        => $cats,
        'post__not_in'        => $exclude,
        'no_found_rows'       => true,
        'ignore_sticky_posts' => true,
        'orderby'             => 'date',
        'order'               => 'DESC',
        'meta_query'          => array(
            array(
                'key'     => '_thumbnail_id',
                'value'   => '0',
                'compare' => '>',
                'type'    => 'NUMERIC',
            ),
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
 * IDs já consumidos pelos boxes inline_3 dentro do post — para o "Veja também"
 * footer não duplicar.
 */
function ec_inline_related_used_ids() {
    static $used = array();
    return $used;
}
function ec_register_inline_related_id( $id ) {
    static $used = array();
    if ( $id ) { $used[] = (int) $id; }
    // Mirror into the static read by ec_inline_related_used_ids
    $GLOBALS['ec_inline_related_used'] = $used;
}

/**
 * Render do post inserindo até 3 boxes "Veja também" intercalados no conteúdo.
 * Inserções: após o 1º, 4º e 8º parágrafo (se existirem).
 */
function ec_render_with_inline_related( $html, $post_id ) {
    if ( ! $html ) { return; }

    $related_ids = ec_related_posts( $post_id, 6 );
    if ( empty( $related_ids ) ) {
        echo $html;
        return;
    }

    // Split por </p>
    $parts = preg_split( '#</p>#i', $html, -1, PREG_SPLIT_NO_EMPTY );
    if ( empty( $parts ) ) {
        echo $html;
        return;
    }

    $insert_after = array( 1, 4, 8 );
    $rel_index    = 0;
    $output       = '';

    foreach ( $parts as $i => $chunk ) {
        $output .= $chunk . '</p>';
        $position = $i + 1;
        if ( in_array( $position, $insert_after, true ) && isset( $related_ids[ $rel_index ] ) ) {
            $rid = $related_ids[ $rel_index ];
            ec_register_inline_related_id( $rid );
            $output .= '<aside class="ec-inline-related" aria-label="Leitura relacionada">';
            $output .= '<span class="ec-inline-related__label">Veja também</span>';
            $output .= '<h4 class="ec-inline-related__title"><a href="' . esc_url( get_permalink( $rid ) ) . '">';
            $output .= esc_html( get_the_title( $rid ) );
            $output .= '</a></h4></aside>';
            $rel_index++;
        }
    }
    echo $output;
}

/**
 * Menu fallback (sem nav atribuído — gera a partir das categorias top).
 */
function ec_menu_fallback() {
    $cats = get_categories( array(
        'orderby'    => 'count',
        'order'      => 'DESC',
        'number'     => 6,
        'hide_empty' => true,
    ) );
    echo '<ul class="ec-menu">';
    echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">Início</a></li>';
    foreach ( $cats as $c ) {
        echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
    }
    echo '<li><a href="' . esc_url( home_url( '/contato/' ) ) . '">Contato</a></li>';
    echo '</ul>';
}
