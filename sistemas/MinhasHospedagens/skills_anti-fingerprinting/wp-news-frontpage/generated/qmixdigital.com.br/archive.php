<?php
# Archive beta - Magazine Grid (4 cols desktop, mixed_featured: 1o card span 2x2)
#   - posts_per_archive_page: 20
#   - archive_pagination: prev_next_only
#   - archive_h1_treatment: h1_only
#   - category_description_position: top_subtitle

if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

$obj = get_queried_object();
$is_cat = is_category();
?>

<header class="archive-head">
  <h1><?php single_term_title(); ?></h1>
  <?php if ( $is_cat && isset( $obj->count ) ) : ?>
    <span class="archive-head__count"><?php echo (int) $obj->count; ?> matérias</span>
  <?php endif; ?>
  <?php if ( $is_cat && ! empty( $obj->description ) ) : ?>
    <p class="archive-head__sub"><?php echo esc_html( $obj->description ); ?></p>
  <?php endif; ?>
</header>

<?php if ( have_posts() ) : ?>
  <div class="archive-grid">
    <?php while ( have_posts() ) : the_post();
      $rcats = get_the_category();
      ?>
      <article class="archive-grid__card" id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
        <?php if ( has_post_thumbnail() ) : ?>
          <a class="archive-grid__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
            <?php the_post_thumbnail( 'qmix-card', array( 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
          </a>
        <?php endif; ?>
        <?php if ( $rcats ) : ?>
          <div class="archive-grid__cat"><?php echo esc_html( $rcats[0]->name ); ?></div>
        <?php endif; ?>
        <h2 class="archive-grid__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
        <div class="archive-grid__meta"><?php echo esc_html( get_the_date( 'd/m/Y' ) ); ?></div>
      </article>
    <?php endwhile; ?>
  </div>

  <nav class="pagination-nav" aria-label="Paginação">
    <?php
    $prev = get_previous_posts_link( '« Mais recentes' );
    $next = get_next_posts_link( 'Mais antigas »' );
    echo $prev ? $prev : '<span>« Mais recentes</span>';
    echo $next ? $next : '<span>Mais antigas »</span>';
    ?>
  </nav>

<?php else : ?>
  <p class="archive-head__sub">Nenhum conteúdo encontrado nesta editoria.</p>
<?php endif;

# Schema CollectionPage
if ( $is_cat && have_posts() ) {
  rewind_posts();
  $items = array();
  $pos = 0;
  while ( have_posts() ) {
    the_post();
    $pos++;
    $items[] = array(
      '@type' => 'ListItem',
      'position' => $pos,
      'url' => get_permalink(),
      'name' => wp_strip_all_tags( get_the_title() ),
    );
  }
  rewind_posts();
  $schema = array(
    '@context' => 'https://schema.org',
    '@type' => 'CollectionPage',
    'name' => single_term_title( '', false ),
    'url' => get_term_link( $obj ),
    'inLanguage' => 'pt-BR',
    'mainEntity' => array(
      '@type' => 'ItemList',
      'itemListElement' => $items,
    ),
  );
  echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
}

get_footer();
