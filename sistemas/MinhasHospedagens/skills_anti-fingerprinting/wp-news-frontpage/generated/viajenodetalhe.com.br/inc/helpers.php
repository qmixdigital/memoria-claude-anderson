<?php
/**
 * Viaje no Detalhe — helpers (inline functions).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

/* Categorias ocultas da home: Life (27, a pedido do operador) + Portugal pt-PT (28, multilingue). */
function vd_excluded_lang_cat_ids() {
  static $c = null;
  if ( null !== $c ) return $c;
  $c = array( 27, 28 );
  return $c;
}

function vd_query_for_section( $args = array() ) {
  $defaults = array(
    'posts_per_page'      => 6,
    'no_found_rows'       => true,
    'ignore_sticky_posts' => true,
    'category__not_in'    => vd_excluded_lang_cat_ids(),
    'meta_query'          => array(
      array( 'key' => '_thumbnail_id', 'value' => '0', 'compare' => '>', 'type' => 'NUMERIC' ),
    ),
  );
  return new WP_Query( wp_parse_args( $args, $defaults ) );
}

/* date_format do roll: D_j_de_F (ex: "Sex, 2 de maio") */
function vd_post_date( $post_id = null ) {
  $post_id = $post_id ?: get_the_ID();
  $ts = get_post_time( 'U', true, $post_id );
  if ( ! $ts ) return '';
  $diff = time() - $ts;
  if ( $diff < HOUR_IN_SECONDS ) {
    $m = max( 1, floor( $diff / MINUTE_IN_SECONDS ) );
    return $m === 1 ? 'há 1 min' : "há {$m} min";
  }
  if ( $diff < DAY_IN_SECONDS ) {
    $h = floor( $diff / HOUR_IN_SECONDS );
    return $h === 1 ? 'há 1 hora' : "há {$h} horas";
  }
  return wp_date( 'D, j \\d\\e F', $ts );
}

function vd_reading_time( $post_id = null ) {
  $post_id = $post_id ?: get_the_ID();
  $words = str_word_count( strip_tags( get_post_field( 'post_content', $post_id ) ) );
  if ( $words < 50 ) return '';
  $min = max( 1, (int) round( $words / 230 ) );
  return $min === 1 ? '1 min' : "{$min} min";
}

/* Render do post inserindo ad in-article a cada 3 parágrafos (set C — auto_ads + manual placement) */
function vd_render_with_inline_ads( $html, $post_id ) {
  if ( ! $html ) { echo ''; return; }
  $parts = preg_split( '#</p>#i', $html, -1, PREG_SPLIT_NO_EMPTY );
  if ( empty( $parts ) ) { echo $html; return; }

  $output = '';
  $ad_count = 0;
  foreach ( $parts as $i => $chunk ) {
    $output .= $chunk . '</p>';
    $position = $i + 1;
    if ( $position > 0 && $position % 3 === 0 && $ad_count < 3 ) {
      $ad_count++;
      $output .= '<div class="vd-post__ad" aria-hidden="true"><ins class="adsbygoogle" data-ad-client="' . esc_attr( VD_ADSENSE_CLIENT ) . '" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins></div>';
    }
  }
  echo $output;
}

function vd_menu_fallback() {
  $cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 8, 'hide_empty' => true ) );
  echo '<ul class="vd-menu">';
  echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">índice</a></li>';
  foreach ( $cats as $c ) {
    echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( strtolower( $c->name ) ) . '</a></li>';
  }
  echo '<li><a href="' . esc_url( home_url( '/contato/' ) ) . '">contato</a></li>';
  echo '</ul>';
}
