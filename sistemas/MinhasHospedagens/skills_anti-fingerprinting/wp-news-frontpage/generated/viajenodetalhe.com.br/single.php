<?php
/**
 * Viaje no Detalhe — single (archetype III tabloid + ad every_3_paras + comments disabled).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>

<div class="vd-shell">

<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>

<article class="vd-post" id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

  <nav class="vd-breadcrumb" aria-label="Localização">
    <a href="<?php echo esc_url( home_url( '/' ) ); ?>">início</a>
    <?php $bc = get_the_category(); if ( ! empty( $bc ) ) : ?>
      <span class="vd-breadcrumb__sep" aria-hidden="true"></span>
      <a href="<?php echo esc_url( get_category_link( $bc[0] ) ); ?>"><?php echo esc_html( strtolower( $bc[0]->name ) ); ?></a>
    <?php endif; ?>
    <span class="vd-breadcrumb__sep" aria-hidden="true"></span>
    <span><?php echo esc_html( strtolower( wp_trim_words( get_the_title(), 8, '…' ) ) ); ?></span>
  </nav>

  <header class="vd-post__head">
    <?php
    $cats = get_the_category();
    if ( ! empty( $cats ) ) {
      echo '<a class="vd-post__kicker" href="' . esc_url( get_category_link( $cats[0] ) ) . '">' . esc_html( $cats[0]->name ) . '</a>';
    }
    ?>
    <h1 class="vd-post__title"><?php the_title(); ?></h1>
    <?php if ( has_excerpt() ) : ?>
      <p class="vd-post__lead"><?php echo esc_html( get_the_excerpt() ); ?></p>
    <?php endif; ?>
  </header>

  <?php if ( has_post_thumbnail() ) : ?>
    <figure class="vd-post__cover">
      <?php the_post_thumbnail( 'large', array( 'fetchpriority' => 'high', 'decoding' => 'async' ) ); ?>
      <?php $cap = get_the_post_thumbnail_caption(); if ( $cap ) : ?>
        <figcaption><?php echo esc_html( $cap ); ?></figcaption>
      <?php endif; ?>
    </figure>
  <?php endif; ?>

  <div class="vd-post__body vd-prose">
    <?php
    $content = apply_filters( 'the_content', get_the_content() );
    $content = str_replace( ']]>', ']]&gt;', $content );
    vd_render_with_inline_ads( $content, get_the_ID() );
    ?>
  </div>

  <?php
  $tags = get_the_tags();
  if ( ! empty( $tags ) ) :
  ?>
  <div class="vd-post__tags">
    <span class="vd-post__tags-label">// tags</span>
    <?php foreach ( $tags as $t ) : ?>
      <a href="<?php echo esc_url( get_tag_link( $t ) ); ?>" class="vd-post__tag"><?php echo esc_html( strtolower( $t->name ) ); ?></a>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>

  <?php
  $author_id = get_the_author_meta( 'ID' );
  $bio = get_the_author_meta( 'description' );
  if ( $bio ) :
  ?>
  <aside class="vd-author-card" aria-label="Sobre o autor">
    <?php echo get_avatar( $author_id, 64, '', get_the_author(), array( 'class' => 'vd-author-card__avatar' ) ); ?>
    <div class="vd-author-card__body">
      <span class="vd-author-card__role">// quem assina</span>
      <h3 class="vd-author-card__name"><?php the_author(); ?></h3>
      <p class="vd-author-card__bio"><?php echo esc_html( $bio ); ?></p>
    </div>
  </aside>
  <?php endif; ?>

  <!-- Comments disabled by roll (comments_treatment: disabled) -->

  <!-- Floating share buttons (right sticky) -->
  <aside class="vd-share-floating" aria-label="Compartilhar">
    <a class="vd-share-floating__btn" href="https://wa.me/?text=<?php echo rawurlencode( get_the_title() . ' ' . get_permalink() ); ?>" target="_blank" rel="noopener nofollow" aria-label="WhatsApp">w</a>
    <a class="vd-share-floating__btn" href="https://twitter.com/intent/tweet?url=<?php echo rawurlencode( get_permalink() ); ?>&text=<?php echo rawurlencode( get_the_title() ); ?>" target="_blank" rel="noopener nofollow" aria-label="X/Twitter">x</a>
    <a class="vd-share-floating__btn" href="https://www.facebook.com/sharer/sharer.php?u=<?php echo rawurlencode( get_permalink() ); ?>" target="_blank" rel="noopener nofollow" aria-label="Facebook">f</a>
    <a class="vd-share-floating__btn" href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo rawurlencode( get_permalink() ); ?>" target="_blank" rel="noopener nofollow" aria-label="LinkedIn">in</a>
  </aside>

</article>

<?php endwhile; endif; ?>
</div>

<?php get_footer();
