<?php
# Single archetype II: Longform editorial
#   - byline under_title (autor + datas + read time)
#   - featured_image_treatment: boxed_max_width (dentro da coluna narrow)
#   - content_typography: editorial_large (drop cap + 19px serif + 1.75 line)
#   - share_buttons_position: top_only
#   - in_article_ad_pattern: after_2nd_para
#   - related_posts_layout: inline_3_during_content (no meio)
#   - author_bio_box: card_style (renderizado FORA do <article>)

if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

while ( have_posts() ) : the_post();
  $post_id   = get_the_ID();
  $cats      = get_the_category();
  $primary_cat = $cats ? $cats[0] : null;
  $author_id = get_the_author_meta( 'ID' );
  $author    = get_the_author_meta( 'display_name', $author_id );
  $author_link = get_author_posts_url( $author_id );
  $has_grav  = qmix_user_has_gravatar( $author_id );

  # Pre-pega 3 related posts pra inline mid-content
  $rel_ids = array();
  $rel_args = array(
    'posts_per_page'      => 12,
    'post__not_in'        => array( $post_id ),
    'ignore_sticky_posts' => true,
    'orderby'             => 'rand',
    'category__not_in'    => qmix_excluded_lang_cat_ids(),
    'meta_query'          => array(
      array( 'key' => '_thumbnail_id', 'value' => '0', 'compare' => '>', 'type' => 'NUMERIC' ),
    ),
  );
  if ( $primary_cat ) {
    $rel_args['tax_query'] = array( array(
      'taxonomy' => 'category', 'field' => 'term_id', 'terms' => array( $primary_cat->term_id ),
    ) );
  }
  $rel_q = new WP_Query( $rel_args );
  while ( $rel_q->have_posts() ) {
    $rel_q->the_post();
    if ( ! has_post_thumbnail() ) { continue; }
    $rel_ids[] = get_the_ID();
    if ( count( $rel_ids ) >= 3 ) { break; }
  }
  wp_reset_postdata();
  $GLOBALS['post'] = get_post( $post_id );
  setup_postdata( $GLOBALS['post'] );

  # Inject inline-related no meio do content via filter
  $inline_html = '';
  if ( ! empty( $rel_ids ) ) {
    ob_start();
    ?>
    <aside class="inline-related" aria-label="Leia também">
      <div class="inline-related__label">Leia também</div>
      <div class="inline-related__grid">
        <?php
        global $post;
        $_orig = $post;
        foreach ( $rel_ids as $rid ) {
          $post = get_post( $rid );
          setup_postdata( $post );
          ?>
          <article class="inline-related__card">
            <a class="inline-related__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
              <?php the_post_thumbnail( 'qmix-card', array( 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
            </a>
            <h4 class="inline-related__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h4>
          </article>
          <?php
        }
        $post = $_orig;
        wp_reset_postdata();
        ?>
      </div>
    </aside>
    <?php
    $inline_html = ob_get_clean();
  }
  $GLOBALS['post'] = get_post( $post_id );
  setup_postdata( $GLOBALS['post'] );
?>

<article class="single-article" id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

  <?php qmix_breadcrumb( $post_id ); ?>

  <?php if ( $primary_cat ) : ?>
    <div class="single-cat"><a href="<?php echo esc_url( get_category_link( $primary_cat ) ); ?>"><?php echo esc_html( $primary_cat->name ); ?></a></div>
  <?php endif; ?>

  <h1 class="single-title"><?php the_title(); ?></h1>

  <?php
  $excerpt = get_the_excerpt();
  if ( $excerpt && strlen( $excerpt ) > 20 ) : ?>
    <p class="single-deck"><?php echo esc_html( wp_trim_words( $excerpt, 32 ) ); ?></p>
  <?php endif; ?>

  <div class="single-byline">
    <div class="single-byline__avatar">
      <?php if ( $has_grav ) : ?>
        <?php echo get_avatar( $author_id, 44 ); ?>
      <?php else : ?>
        <span class="single-byline__avatar-fallback" aria-hidden="true"><?php echo esc_html( mb_strtoupper( mb_substr( $author, 0, 1 ) ) ); ?></span>
      <?php endif; ?>
    </div>
    <div>
      <div class="single-byline__author"><span>Por</span><a href="<?php echo esc_url( $author_link ); ?>" rel="author" itemprop="author"><?php echo esc_html( $author ); ?></a></div>
      <div class="single-byline__meta">
        <time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>" itemprop="datePublished"><?php echo esc_html( get_the_date( 'j \d\e F \d\e Y' ) ); ?></time>
        <span class="sep">·</span>
        <span><?php echo (int) qmix_read_time(); ?> min de leitura</span>
        <?php if ( ( get_the_modified_time( 'U' ) - get_the_time( 'U' ) ) > DAY_IN_SECONDS ) : ?>
          <span class="sep">·</span>
          <span>Atualizado em <time datetime="<?php echo esc_attr( get_the_modified_date( 'c' ) ); ?>" itemprop="dateModified"><?php echo esc_html( get_the_modified_date( 'j \d\e F \d\e Y' ) ); ?></time></span>
        <?php endif; ?>
      </div>
    </div>
  </div>

  <?php qmix_share_buttons(); ?>

  <?php if ( has_post_thumbnail() ) : ?>
    <figure class="single-image">
      <?php the_post_thumbnail( 'full', array( 'fetchpriority' => 'high', 'loading' => 'eager', 'decoding' => 'async' ) ); ?>
      <?php $caption = get_the_post_thumbnail_caption(); ?>
      <?php if ( $caption ) : ?>
        <figcaption><?php echo esc_html( $caption ); ?></figcaption>
      <?php endif; ?>
    </figure>
  <?php endif; ?>

  <div class="single-body" itemprop="articleBody">
    <?php
    # Injetar inline-related no meio do content
    $content = apply_filters( 'the_content', get_the_content() );
    $paras = explode( '</p>', $content );
    $mid = (int) floor( count( $paras ) / 2 );
    if ( $inline_html && $mid >= 2 ) {
      array_splice( $paras, $mid, 0, array( $inline_html ) );
    }
    echo implode( '</p>', $paras );
    ?>
  </div>

  <?php
  $tags = get_the_tags( $post_id );
  if ( $tags && ! is_wp_error( $tags ) ) : ?>
    <nav class="single-tags" aria-label="Etiquetas">
      <span class="single-tags__label">Tags:</span>
      <ul>
        <?php foreach ( $tags as $tag ) : ?>
          <li><a href="<?php echo esc_url( get_tag_link( $tag ) ); ?>" rel="tag"><?php echo esc_html( $tag->name ); ?></a></li>
        <?php endforeach; ?>
      </ul>
    </nav>
  <?php endif; ?>

  <?php
  $bio = get_the_author_meta( 'description', $author_id );
  ?>
</article>

<?php if ( $bio ) : ?>
  <div class="author-bio-card" itemprop="author" itemscope itemtype="https://schema.org/Person">
    <div class="author-bio-card__avatar">
      <?php if ( $has_grav ) : ?>
        <?php echo get_avatar( $author_id, 90 ); ?>
      <?php else : ?>
        <span class="avatar-fallback" aria-hidden="true"><?php echo esc_html( mb_strtoupper( mb_substr( $author, 0, 1 ) ) ); ?></span>
      <?php endif; ?>
    </div>
    <div class="author-bio-card__content">
      <span class="author-bio-card__label">Escrito por</span>
      <h4 itemprop="name"><a href="<?php echo esc_url( $author_link ); ?>" rel="author"><?php echo esc_html( $author ); ?></a></h4>
      <p itemprop="description"><?php echo esc_html( $bio ); ?></p>
    </div>
  </div>
<?php endif; ?>

<?php endwhile; ?>

<?php get_footer();
