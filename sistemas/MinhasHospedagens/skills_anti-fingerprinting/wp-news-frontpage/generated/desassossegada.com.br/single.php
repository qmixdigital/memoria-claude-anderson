<?php
// Single archetype III: Tabloid / news-flash, fast mobile-first - v1.2 com byline + tags + SEO
//   - byline VISIVEL (override do roll hidden): autor, data, atualizado-em, read-time
//   - tags no final do post-body
//   - featured_image_treatment: full_bleed
//   - content_typography: magazine_serif
//   - share_buttons_position: floating_left_sticky
//   - author_bio_box: expanded (so renderiza se gravatar+bio)
//   - related_posts_layout: grid_6

if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

while ( have_posts() ) : the_post();
  $post_id   = get_the_ID();
  $cats      = get_the_category();
  $primary_cat = $cats ? $cats[0] : null;
  $author_id = get_the_author_meta( 'ID' );
  $author    = get_the_author_meta( 'display_name', $author_id );
  $author_link = get_author_posts_url( $author_id );
  $published = get_the_date( 'c' );
  $modified  = get_the_modified_date( 'c' );
  $is_updated = ( get_the_modified_time( 'U' ) - get_the_time( 'U' ) ) > DAY_IN_SECONDS;
  $has_grav  = dsg_user_has_gravatar( $author_id );
?>

<article class="dsg-single" id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

  <div class="dsg-post-head">
    <?php dsg_breadcrumb( $post_id ); ?>

    <?php if ( $primary_cat ) : ?>
      <div class="dsg-post-cat"><a href="<?php echo esc_url( get_category_link( $primary_cat ) ); ?>"><?php echo esc_html( $primary_cat->name ); ?></a></div>
    <?php endif; ?>

    <h1 class="dsg-post-title"><?php the_title(); ?></h1>

    <div class="dsg-byline">
      <a class="dsg-byline__avatar" href="<?php echo esc_url( $author_link ); ?>" aria-hidden="true" tabindex="-1">
        <?php if ( $has_grav ) : ?>
          <?php echo get_avatar( $author_id, 48 ); ?>
        <?php else : ?>
          <span class="dsg-byline__avatar-fallback" aria-hidden="true"><?php echo esc_html( mb_strtoupper( mb_substr( $author, 0, 1 ) ) ); ?></span>
        <?php endif; ?>
      </a>
      <div class="dsg-byline__meta">
        <div class="dsg-byline__author">
          <span class="dsg-byline__label">Por</span>
          <a href="<?php echo esc_url( $author_link ); ?>" rel="author" itemprop="author"><?php echo esc_html( $author ); ?></a>
        </div>
        <div class="dsg-byline__dates">
          <time datetime="<?php echo esc_attr( $published ); ?>" itemprop="datePublished">
            <?php echo esc_html( get_the_date( 'j \d\e F \d\e Y' ) ); ?>
          </time>
          <span aria-hidden="true">&middot;</span>
          <span><?php echo (int) dsg_read_time(); ?> min de leitura</span>
          <?php if ( $is_updated ) : ?>
            <span aria-hidden="true">&middot;</span>
            <span class="dsg-byline__updated">Atualizado em <time datetime="<?php echo esc_attr( $modified ); ?>" itemprop="dateModified"><?php echo esc_html( get_the_modified_date( 'j \d\e F \d\e Y' ) ); ?></time></span>
          <?php endif; ?>
        </div>
      </div>
    </div>
  </div>

  <?php if ( has_post_thumbnail() ) : ?>
    <figure class="dsg-post-image" itemprop="image" itemscope itemtype="https://schema.org/ImageObject">
      <?php the_post_thumbnail( 'full', array( 'fetchpriority' => 'high', 'loading' => 'eager', 'decoding' => 'async', 'itemprop' => 'url' ) ); ?>
      <?php $caption = get_the_post_thumbnail_caption(); ?>
      <?php if ( $caption ) : ?>
        <figcaption itemprop="caption"><?php echo esc_html( $caption ); ?></figcaption>
      <?php endif; ?>
    </figure>
  <?php endif; ?>

  <?php dsg_share_buttons(); ?>

  <div class="dsg-post-body" itemprop="articleBody">
    <?php the_content(); ?>
  </div>

  <?php
  // Tags no final do post-body
  $tags = get_the_tags( $post_id );
  if ( $tags && ! is_wp_error( $tags ) ) : ?>
    <nav class="dsg-tags" aria-label="Etiquetas">
      <span class="dsg-tags__label">Marcado:</span>
      <ul>
        <?php foreach ( $tags as $tag ) : ?>
          <li><a href="<?php echo esc_url( get_tag_link( $tag ) ); ?>" rel="tag">#<?php echo esc_html( $tag->name ); ?></a></li>
        <?php endforeach; ?>
      </ul>
    </nav>
  <?php endif; ?>

  <?php
  // Pre-pega bio do autor pra renderizar FORA do <article> (evita float/sidebar do parent theme)
  $bio = get_the_author_meta( 'description', $author_id );
  ?>
</article>

<?php if ( $bio ) : ?>
  <div class="dsg-author-bio" itemprop="author" itemscope itemtype="https://schema.org/Person">
    <div class="dsg-author-bio__avatar">
      <?php if ( $has_grav ) : ?>
        <?php echo get_avatar( $author_id, 80, '', '', array( 'class' => 'dsg-avatar' ) ); ?>
      <?php else : ?>
        <span class="dsg-avatar dsg-avatar--fallback" aria-hidden="true"><?php echo esc_html( mb_strtoupper( mb_substr( $author, 0, 1 ) ) ); ?></span>
      <?php endif; ?>
    </div>
    <div class="dsg-author-bio__content">
      <span class="dsg-author-bio__label">Escrito por</span>
      <h4 itemprop="name"><a href="<?php echo esc_url( $author_link ); ?>" rel="author"><?php echo esc_html( $author ); ?></a></h4>
      <p itemprop="description"><?php echo esc_html( $bio ); ?></p>
    </div>
  </div>
<?php endif; ?>

<?php
// Related posts grid_6
$rel_args = array(
  'posts_per_page'      => 18,
  'post__not_in'        => array( $post_id ),
  'ignore_sticky_posts' => true,
  'orderby'             => 'rand',
  'category__not_in'    => dsg_excluded_lang_cat_ids(),
  'meta_query'          => array(
    array( 'key' => '_thumbnail_id', 'value' => '0', 'compare' => '>', 'type' => 'NUMERIC' ),
  ),
);
if ( $primary_cat ) {
  $rel_args['tax_query'] = array(
    array( 'taxonomy' => 'category', 'field' => 'term_id', 'terms' => array( $primary_cat->term_id ) ),
  );
}
$rel = new WP_Query( $rel_args );
$rel_ids = array();
while ( $rel->have_posts() ) {
  $rel->the_post();
  if ( ! has_post_thumbnail() ) { continue; }
  $rel_ids[] = get_the_ID();
  if ( count( $rel_ids ) >= 6 ) { break; }
}
wp_reset_postdata();

if ( count( $rel_ids ) < 6 ) {
  $fill = new WP_Query( array(
    'posts_per_page'      => 18,
    'post__not_in'        => array_merge( array( $post_id ), $rel_ids ),
    'ignore_sticky_posts' => true,
    'orderby'             => 'rand',
    'category__not_in'    => dsg_excluded_lang_cat_ids(),
    'meta_query'          => array(
      array( 'key' => '_thumbnail_id', 'value' => '0', 'compare' => '>', 'type' => 'NUMERIC' ),
    ),
  ) );
  while ( $fill->have_posts() ) {
    $fill->the_post();
    if ( ! has_post_thumbnail() ) { continue; }
    $rel_ids[] = get_the_ID();
    if ( count( $rel_ids ) >= 6 ) { break; }
  }
  wp_reset_postdata();
}

if ( ! empty( $rel_ids ) ) : ?>
<section class="dsg-related" aria-label="Leia também">
  <h2>Leia também</h2>
  <div class="dsg-related__grid">
    <?php
    global $post;
    $_orig_post = $post;
    foreach ( $rel_ids as $rid ) {
      $post = get_post( $rid );
      setup_postdata( $post );
      $rcats = get_the_category();
      ?>
      <article class="dsg-related__card">
        <a class="dsg-related__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
          <?php the_post_thumbnail( 'dsg-card', array( 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
        </a>
        <div class="dsg-related__body">
          <?php if ( $rcats ) : ?>
            <div class="dsg-related__cat"><?php echo esc_html( $rcats[0]->name ); ?></div>
          <?php endif; ?>
          <h3 class="dsg-related__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
        </div>
      </article>
      <?php
    }
    $post = $_orig_post;
    wp_reset_postdata();
    ?>
  </div>
</section>
<?php endif; ?>

<?php endwhile; ?>

<?php get_footer();
