<?php
// 404 - chrome based
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header(); ?>

<section class="dsg-error" aria-labelledby="dsg-404-h">
  <p class="dsg-error__code">404</p>
  <h1 id="dsg-404-h">Esta página se perdeu pelo caminho</h1>
  <p>O endereço que você digitou não existe ou foi removido. Volte à página inicial ou explore as editorias mais lidas.</p>
  <a class="dsg-btn" href="<?php echo esc_url( home_url( '/' ) ); ?>">Ir para a página inicial</a>
</section>

<?php
// Sugestoes: 6 posts aleatorios (com thumb)
$sug = new WP_Query( array(
  'posts_per_page'      => 18,
  'orderby'             => 'rand',
  'ignore_sticky_posts' => true,
  'category__not_in'    => dsg_excluded_lang_cat_ids(),
  'meta_query'          => array(
    array( 'key' => '_thumbnail_id', 'value' => '0', 'compare' => '>', 'type' => 'NUMERIC' ),
  ),
) );
$sug_ids = array();
while ( $sug->have_posts() ) {
  $sug->the_post();
  if ( ! has_post_thumbnail() ) { continue; }
  $sug_ids[] = get_the_ID();
  if ( count( $sug_ids ) >= 6 ) { break; }
}
wp_reset_postdata();

if ( ! empty( $sug_ids ) ) : ?>
<section class="dsg-related" aria-label="Sugestões">
  <h2>Conteúdo em destaque</h2>
  <div class="dsg-related__grid">
    <?php
    global $post; $_o = $post;
    foreach ( $sug_ids as $sid ) {
      $post = get_post( $sid );
      setup_postdata( $post );
      $rcats = get_the_category();
      ?>
      <article class="dsg-related__card">
        <a class="dsg-related__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
          <?php the_post_thumbnail( 'dsg-card', array( 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
        </a>
        <div class="dsg-related__body">
          <?php if ( $rcats ) : ?><div class="dsg-related__cat"><?php echo esc_html( $rcats[0]->name ); ?></div><?php endif; ?>
          <h3 class="dsg-related__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
        </div>
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
