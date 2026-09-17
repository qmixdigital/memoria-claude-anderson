<?php
// Desassossegada - helpers (front-page archetype E, single III tabloid, archive gamma)
// Visual: palette P20, font F06, spacing tight, radius friendly, shadow bold
// Class naming: utility (atomic) + dsg-* component prefix

if ( ! defined( 'ABSPATH' ) ) { exit; }

// Categorias multilingue: nao aparecem na home (life em ingles, actualidade em pt-PT)
function dsg_excluded_lang_cat_ids() {
  static $cache = null;
  if ( $cache !== null ) { return $cache; }
  $slugs = array( 'life', 'actualidade' );
  $ids = array();
  foreach ( $slugs as $slug ) {
    $term = get_category_by_slug( $slug );
    if ( $term ) { $ids[] = (int) $term->term_id; }
  }
  $cache = $ids;
  return $ids;
}

// Query padrao para sections do front-page. Filtra posts sem thumb (Layer 1) e exclui multilang.
function dsg_query_for_section( $args = array() ) {
  $defaults = array(
    'posts_per_page'      => 6,
    'no_found_rows'       => true,
    'ignore_sticky_posts' => true,
    'category__not_in'    => dsg_excluded_lang_cat_ids(),
    'meta_query'          => array(
      array( 'key' => '_thumbnail_id', 'value' => '0', 'compare' => '>', 'type' => 'NUMERIC' ),
    ),
  );
  $q = wp_parse_args( $args, $defaults );
  if ( ! empty( $args['category__not_in'] ) ) {
    $q['category__not_in'] = array_unique( array_merge(
      (array) $args['category__not_in'], dsg_excluded_lang_cat_ids()
    ) );
  }
  return new WP_Query( $q );
}

// Data relativa em pt-BR
function dsg_post_date( $post_id = null ) {
  $post_id = $post_id ?: get_the_ID();
  $ts = get_post_time( 'U', true, $post_id );
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
    return $d === 1 ? 'ontem' : "há $d dias";
  }
  return date_i18n( 'j \d\e F \d\e Y', $ts );
}

// Tempo de leitura (palavras / 220)
function dsg_read_time( $post_id = null ) {
  $post_id = $post_id ?: get_the_ID();
  $words = str_word_count( wp_strip_all_tags( get_post_field( 'post_content', $post_id ) ) );
  return max( 1, (int) ceil( $words / 220 ) );
}

// Card helper (image_right padrao). Densidades: default, featured, overlay, mini.
function dsg_card( $density = 'default' ) {
  if ( ! has_post_thumbnail() ) { return; }
  $cats = get_the_category();
  $cat = $cats ? $cats[0] : null;

  if ( $density === 'mini' ) {
    ?>
    <article class="dsg-mini">
      <a class="dsg-mini__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
        <?php the_post_thumbnail( 'thumbnail', array( 'loading' => 'eager', 'decoding' => 'async' ) ); ?>
      </a>
      <div>
        <h3 class="dsg-mini__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
        <div class="dsg-mini__meta"><?php echo esc_html( dsg_post_date() ); ?></div>
      </div>
    </article>
    <?php
    return;
  }

  if ( $density === 'overlay' ) {
    ?>
    <a class="dsg-card dsg-card--overlay" href="<?php the_permalink(); ?>">
      <span class="dsg-card__media" aria-hidden="true">
        <?php the_post_thumbnail( 'medium_large', array( 'loading' => 'eager', 'decoding' => 'async' ) ); ?>
      </span>
      <span class="dsg-card__body">
        <?php if ( $cat ) : ?><span class="dsg-card__cat"><?php echo esc_html( $cat->name ); ?></span><?php endif; ?>
        <h3 class="dsg-card__title"><span><?php the_title(); ?></span></h3>
      </span>
    </a>
    <?php
    return;
  }

  $cls = 'dsg-card';
  if ( $density === 'featured' ) { $cls .= ' dsg-card--featured'; }
  ?>
  <article class="<?php echo esc_attr( $cls ); ?>">
    <div class="dsg-card__body">
      <?php if ( $cat ) : ?>
        <div class="dsg-card__cat"><a href="<?php echo esc_url( get_category_link( $cat ) ); ?>"><?php echo esc_html( $cat->name ); ?></a></div>
      <?php endif; ?>
      <h3 class="dsg-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
      <p class="dsg-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 22 ) ); ?></p>
      <div class="dsg-card__meta"><?php echo esc_html( dsg_post_date() ); ?></div>
    </div>
    <a class="dsg-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
      <?php the_post_thumbnail( 'medium_large', array(
        'loading'  => 'eager',
        'decoding' => 'async',
        'class'    => 'dsg-card__img',
      ) ); ?>
    </a>
  </article>
  <?php
}

// Detecta Gravatar real (cache 1 semana). Evita default 404.
function dsg_user_has_gravatar( $user_id ) {
  static $rt = array();
  if ( isset( $rt[ $user_id ] ) ) { return $rt[ $user_id ]; }
  $key = 'dsg_grav_' . (int) $user_id;
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

// Breadcrumb (text_arrows)
function dsg_breadcrumb( $post_id = null ) {
  $post_id = $post_id ?: get_the_ID();
  $home = '<a href="' . esc_url( home_url( '/' ) ) . '">Início</a>';
  $cats = get_the_category( $post_id );
  $cat_html = '';
  if ( $cats ) {
    $c = $cats[0];
    $cat_html = '<span class="dsg-breadcrumb__sep">&rsaquo;</span><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a>';
  }
  $title = '<span class="dsg-breadcrumb__sep">&rsaquo;</span><span>' . esc_html( wp_trim_words( get_the_title( $post_id ), 8 ) ) . '</span>';
  echo '<nav class="dsg-breadcrumb" aria-label="Caminho">' . $home . $cat_html . $title . '</nav>';
}

// Share buttons (floating left sticky)
function dsg_share_buttons() {
  $url = urlencode( get_permalink() );
  $title = urlencode( get_the_title() );
  ?>
  <aside class="dsg-share" aria-label="Compartilhar">
    <a href="https://api.whatsapp.com/send?text=<?php echo $title; ?>%20<?php echo $url; ?>" aria-label="Compartilhar no WhatsApp" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 3.6 17.3L2 22l4.8-1.6A11 11 0 1 0 20.5 3.5zM12 20a8 8 0 0 1-4-1l-.3-.2-2.8 1 .9-2.8-.2-.3a8 8 0 1 1 6.5 3.3zm4.4-5.7c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7.9-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.4-1.6-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.2.2-.4 0-.2 0-.3 0-.4 0-.1-.5-1.2-.7-1.6-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4 0-.6.3-.2.2-.8.8-.8 1.9 0 1.1.8 2.2 1 2.4.1.1 1.6 2.4 3.9 3.4.5.2 1 .3 1.3.4.5.2 1 .1 1.4.1.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1z"/></svg>
    </a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $url; ?>" aria-label="Compartilhar no Facebook" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 22v-8h3l.5-4H13V7.5c0-1.1.4-2 2-2h2V2.1c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8V10H6v4h3.5v8H13z"/></svg>
    </a>
    <a href="https://twitter.com/intent/tweet?text=<?php echo $title; ?>&url=<?php echo $url; ?>" aria-label="Compartilhar no X" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 3h3l-7 8 8 10h-6l-5-6-5 6h-3l8-9-8-9h6l4 5z"/></svg>
    </a>
    <a href="mailto:?subject=<?php echo $title; ?>&body=<?php echo $url; ?>" aria-label="Compartilhar por email">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 8.5L20 8H4l8 5.5zm-8-4.4V18h16V9.1l-8 5.5-8-5.5z"/></svg>
    </a>
  </aside>
  <?php
}
