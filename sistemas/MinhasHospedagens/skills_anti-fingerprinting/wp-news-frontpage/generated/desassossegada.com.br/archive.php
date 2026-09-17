<?php
// Archive Archetype gamma: editorial column, single column, large cards (image left + body right)
//   - archive_h1_treatment: h1_with_count
//   - category_description_position: sidebar_only (mas sem sidebar aqui -> mostra inline curto)
//   - archive_pagination: prev_next_only
//   - posts_per_archive_page: 8

if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

$obj = get_queried_object();
$is_cat = is_category();
?>

<header class="dsg-archive-head">
  <h1>
    <?php single_term_title(); ?>
    <?php if ( $is_cat && isset( $obj->count ) ) : ?>
      <span class="dsg-archive-count">&middot; <?php echo (int) $obj->count; ?> matérias</span>
    <?php endif; ?>
  </h1>
  <?php if ( $is_cat && ! empty( $obj->description ) ) : ?>
    <p><?php echo esc_html( $obj->description ); ?></p>
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
          <p class="dsg-archive-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 36 ) ); ?></p>
          <div class="dsg-archive-card__meta"><?php echo esc_html( get_the_date( 'j \d\e F \d\e Y' ) ); ?> &middot; <?php echo (int) dsg_read_time(); ?> min</div>
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
  <p class="text-muted">Nenhum conteúdo encontrado nesta editoria.</p>
<?php endif; ?>

<?php
// Schema CollectionPage com ItemList das matérias listadas
if ( $is_cat && have_posts() ) {
  rewind_posts();
  $items = array();
  $pos = 0;
  while ( have_posts() ) {
    the_post();
    $pos++;
    $items[] = array(
      '@type'    => 'ListItem',
      'position' => $pos,
      'url'      => get_permalink(),
      'name'     => wp_strip_all_tags( get_the_title() ),
    );
  }
  rewind_posts();
  $schema = array(
    '@context'   => 'https://schema.org',
    '@type'      => 'CollectionPage',
    'name'       => single_term_title( '', false ),
    'url'        => get_term_link( $obj ),
    'inLanguage' => 'pt-BR',
    'mainEntity' => array(
      '@type'           => 'ItemList',
      'itemListElement' => $items,
    ),
  );
  echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
}

get_footer();
