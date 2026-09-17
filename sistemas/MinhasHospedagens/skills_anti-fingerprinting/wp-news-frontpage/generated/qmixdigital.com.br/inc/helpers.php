<?php
# Revista QMIX - helpers
# Class naming: semantic | Function naming: custom_helpers prefix qmix_

if ( ! defined( 'ABSPATH' ) ) { exit; }

# Categorias multilingue excluidas da home (lifestyle em ingles)
function qmix_excluded_lang_cat_ids() {
  static $cache = null;
  if ( $cache !== null ) { return $cache; }
  $slugs = array( 'lifestyle' );
  $ids = array();
  foreach ( $slugs as $slug ) {
    $term = get_category_by_slug( $slug );
    if ( $term ) { $ids[] = (int) $term->term_id; }
  }
  $cache = $ids;
  return $ids;
}

# Query padrao para sections do front-page. Filtra posts sem thumb + exclui multilang.
function qmix_query_for_section( $args = array() ) {
  $defaults = array(
    'posts_per_page'      => 6,
    'no_found_rows'       => true,
    'ignore_sticky_posts' => true,
    'category__not_in'    => qmix_excluded_lang_cat_ids(),
    'meta_query'          => array(
      array( 'key' => '_thumbnail_id', 'value' => '0', 'compare' => '>', 'type' => 'NUMERIC' ),
    ),
  );
  $q = wp_parse_args( $args, $defaults );
  if ( ! empty( $args['category__not_in'] ) ) {
    $q['category__not_in'] = array_unique( array_merge(
      (array) $args['category__not_in'], qmix_excluded_lang_cat_ids()
    ) );
  }
  return new WP_Query( $q );
}

# Data ISO + relativa (date_format roll: iso_with_relative)
function qmix_post_date( $post_id = null ) {
  $post_id = $post_id ?: get_the_ID();
  $ts = get_post_time( 'U', true, $post_id );
  $diff = time() - $ts;
  $iso = date_i18n( 'd/m/Y', $ts );
  if ( $diff < HOUR_IN_SECONDS ) {
    $m = max( 1, floor( $diff / MINUTE_IN_SECONDS ) );
    return $iso . ' (há ' . $m . ' min)';
  }
  if ( $diff < DAY_IN_SECONDS ) {
    $h = floor( $diff / HOUR_IN_SECONDS );
    return $iso . ' (há ' . $h . 'h)';
  }
  if ( $diff < 7 * DAY_IN_SECONDS ) {
    $d = floor( $diff / DAY_IN_SECONDS );
    return $iso . ' (há ' . $d . ' dias)';
  }
  return $iso;
}

# Tempo de leitura
function qmix_read_time( $post_id = null ) {
  $post_id = $post_id ?: get_the_ID();
  $words = str_word_count( wp_strip_all_tags( get_post_field( 'post_content', $post_id ) ) );
  return max( 1, (int) ceil( $words / 220 ) );
}

# Stream card helper (image_left default, --flip = image_right)
function qmix_stream_card( $variant = 'left' ) {
  if ( ! has_post_thumbnail() ) { return; }
  $cats = get_the_category();
  $cat = $cats ? $cats[0] : null;
  $cls = 'stream-card';
  if ( $variant === 'right' ) { $cls .= ' stream-card--flip'; }
  ?>
  <article class="<?php echo esc_attr( $cls ); ?>">
    <a class="stream-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
      <?php the_post_thumbnail( 'medium_large', array( 'loading' => 'eager', 'decoding' => 'async' ) ); ?>
    </a>
    <div class="stream-card__body">
      <?php if ( $cat ) : ?>
        <span class="kicker"><a href="<?php echo esc_url( get_category_link( $cat ) ); ?>"><?php echo esc_html( $cat->name ); ?></a></span>
      <?php endif; ?>
      <h2 class="stream-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
      <p class="stream-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 32 ) ); ?></p>
      <div class="stream-card__meta">
        <span><?php echo esc_html( get_the_author() ); ?></span>
        <span><?php echo esc_html( qmix_post_date() ); ?></span>
        <span><?php echo (int) qmix_read_time(); ?> min</span>
      </div>
    </div>
  </article>
  <?php
}

# Detecta Gravatar real (cache 1 semana)
function qmix_user_has_gravatar( $user_id ) {
  static $rt = array();
  if ( isset( $rt[ $user_id ] ) ) { return $rt[ $user_id ]; }
  $key = 'qmix_grav_' . (int) $user_id;
  $c = get_transient( $key );
  if ( $c !== false ) { $rt[ $user_id ] = ( '1' === $c ); return $rt[ $user_id ]; }
  $u = get_user_by( 'id', $user_id );
  if ( ! $u || empty( $u->user_email ) ) { set_transient( $key, '0', WEEK_IN_SECONDS ); return false; }
  $hash = md5( strtolower( trim( $u->user_email ) ) );
  $r = wp_remote_head( "https://secure.gravatar.com/avatar/{$hash}?d=404", array( 'timeout' => 3 ) );
  $has = ( 200 === (int) wp_remote_retrieve_response_code( $r ) );
  set_transient( $key, $has ? '1' : '0', WEEK_IN_SECONDS );
  $rt[ $user_id ] = $has;
  return $has;
}

# Breadcrumb chevron icons style
function qmix_breadcrumb( $post_id = null ) {
  $post_id = $post_id ?: get_the_ID();
  $sep = '<span class="single-breadcrumb__sep" aria-hidden="true">›</span>';
  $home = '<a href="' . esc_url( home_url( '/' ) ) . '">Início</a>';
  $cats = get_the_category( $post_id );
  $cat_html = '';
  if ( $cats ) {
    $c = $cats[0];
    $cat_html = $sep . '<a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a>';
  }
  $title = $sep . '<span>' . esc_html( wp_trim_words( get_the_title( $post_id ), 8 ) ) . '</span>';
  echo '<nav class="single-breadcrumb" aria-label="Caminho">' . $home . $cat_html . $title . '</nav>';
}

# Share top buttons
function qmix_share_buttons() {
  $url = urlencode( get_permalink() );
  $title = urlencode( get_the_title() );
  ?>
  <div class="share-top">
    <span class="share-top__label">Compartilhar</span>
    <a href="https://api.whatsapp.com/send?text=<?php echo $title; ?>%20<?php echo $url; ?>" aria-label="WhatsApp" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 3.6 17.3L2 22l4.8-1.6A11 11 0 1 0 20.5 3.5zM12 20a8 8 0 0 1-4-1l-.3-.2-2.8 1 .9-2.8-.2-.3a8 8 0 1 1 6.5 3.3zm4.4-5.7c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7.9-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.4-1.6-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.2.2-.4 0-.2 0-.3 0-.4 0-.1-.5-1.2-.7-1.6-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4 0-.6.3-.2.2-.8.8-.8 1.9 0 1.1.8 2.2 1 2.4.1.1 1.6 2.4 3.9 3.4.5.2 1 .3 1.3.4.5.2 1 .1 1.4.1.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1z"/></svg>
    </a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $url; ?>" aria-label="Facebook" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 22v-8h3l.5-4H13V7.5c0-1.1.4-2 2-2h2V2.1c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8V10H6v4h3.5v8H13z"/></svg>
    </a>
    <a href="https://twitter.com/intent/tweet?text=<?php echo $title; ?>&url=<?php echo $url; ?>" aria-label="X" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 3h3l-7 8 8 10h-6l-5-6-5 6h-3l8-9-8-9h6l4 5z"/></svg>
    </a>
    <a href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo $url; ?>" aria-label="LinkedIn" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM9 17H6.5v-7H9v7zM7.7 8.9c-.8 0-1.4-.6-1.4-1.4S6.9 6.1 7.7 6.1c.8 0 1.4.6 1.4 1.4S8.5 8.9 7.7 8.9zM18 17h-2.5v-3.6c0-.9-.3-1.5-1.1-1.5-.6 0-1 .4-1.2.9-.1.2-.1.4-.1.6V17H10.6v-7h2.4v1.1c.3-.5 1-1.2 2.4-1.2 1.7 0 3 1.1 3 3.6V17z"/></svg>
    </a>
    <a href="mailto:?subject=<?php echo $title; ?>&body=<?php echo $url; ?>" aria-label="Email">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 8.5L20 8H4l8 5.5zm-8-4.4V18h16V9.1l-8 5.5-8-5.5z"/></svg>
    </a>
  </div>
  <?php
}
