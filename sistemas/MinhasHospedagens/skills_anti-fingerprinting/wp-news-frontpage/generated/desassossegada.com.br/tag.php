<?php
// Tag archive - segue padrao gamma mas com identificacao "Tag:" no kicker
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

$tag = get_queried_object();
?>

<header class="dsg-archive-head">
  <div class="dsg-post-cat" style="margin-bottom: var(--dsg-sp-3);">Tag</div>
  <h1>#<?php single_tag_title( '', true ); ?>
    <?php if ( isset( $tag->count ) ) : ?>
      <span class="dsg-archive-count"><?php echo (int) $tag->count; ?> matérias</span>
    <?php endif; ?>
  </h1>
  <?php if ( ! empty( $tag->description ) ) : ?>
    <p><?php echo esc_html( $tag->description ); ?></p>
  <?php endif; ?>
</header>

<?php if ( have_posts() ) : ?>
  <div class="dsg-archive">
    <?php while ( have_posts() ) : the_post();
      $rcats = get_the_category();
      ?>
      <article class="dsg-archive-card" id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
        <?php if ( has_post_thumbnail() ) : ?>
          <a class="dsg-archive-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
            <?php the_post_thumbnail( 'dsg-card', array( 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
          </a>
        <?php endif; ?>
        <div class="dsg-archive-card__body">
          <?php if ( $rcats ) : ?>
            <div class="dsg-archive-card__cat"><?php echo esc_html( $rcats[0]->name ); ?></div>
          <?php endif; ?>
          <h2 class="dsg-archive-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
          <p class="dsg-archive-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 32 ) ); ?></p>
          <div class="dsg-archive-card__meta"><?php echo esc_html( get_the_date( 'j \d\e F \d\e Y' ) ); ?></div>
        </div>
      </article>
    <?php endwhile; ?>
  </div>

  <nav class="dsg-pagination" aria-label="Paginação">
    <?php
    $prev = get_previous_posts_link( '&laquo; Mais recentes' );
    $next = get_next_posts_link( 'Mais antigas &raquo;' );
    echo $prev ? $prev : '<span>&laquo; Mais recentes</span>';
    echo $next ? $next : '<span>Mais antigas &raquo;</span>';
    ?>
  </nav>
<?php else : ?>
  <p class="text-muted">Nenhuma matéria com esta tag.</p>
<?php endif; ?>

<?php get_footer();
