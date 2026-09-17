<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header(); ?>

<section class="error-page" aria-labelledby="error-h">
  <p class="error-page__code">404</p>
  <h1 id="error-h">Página não encontrada</h1>
  <p>O endereço solicitado não existe ou foi removido. Volte ao início ou explore as editorias.</p>
  <a class="btn-cta" href="<?php echo esc_url( home_url( '/' ) ); ?>">Ir para a página inicial</a>
</section>

<?php
$sug = new WP_Query( array(
  'posts_per_page' => 12, 'orderby' => 'rand', 'ignore_sticky_posts' => true,
  'category__not_in' => qmix_excluded_lang_cat_ids(),
  'meta_query' => array(
    array( 'key' => '_thumbnail_id', 'value' => '0', 'compare' => '>', 'type' => 'NUMERIC' ),
  ),
) );
$sug_ids = array();
while ( $sug->have_posts() ) {
  $sug->the_post();
  if ( ! has_post_thumbnail() ) { continue; }
  $sug_ids[] = get_the_ID();
  if ( count( $sug_ids ) >= 4 ) { break; }
}
wp_reset_postdata();

if ( ! empty( $sug_ids ) ) : ?>
<section aria-label="Sugestões">
  <header class="section-head">
    <h2>Em destaque</h2>
  </header>
  <div class="archive-grid">
    <?php
    global $post; $_o = $post;
    foreach ( $sug_ids as $sid ) {
      $post = get_post( $sid );
      setup_postdata( $post );
      $rcats = get_the_category();
      ?>
      <article class="archive-grid__card">
        <a class="archive-grid__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
          <?php the_post_thumbnail( 'qmix-card', array( 'loading' => 'lazy' ) ); ?>
        </a>
        <?php if ( $rcats ) : ?><div class="archive-grid__cat"><?php echo esc_html( $rcats[0]->name ); ?></div><?php endif; ?>
        <h3 class="archive-grid__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
      </article>
      <?php
    }
    $post = $_o;
    wp_reset_postdata();
    ?>
  </div>
</section>
<?php endif; ?>

<?php get_footer();
