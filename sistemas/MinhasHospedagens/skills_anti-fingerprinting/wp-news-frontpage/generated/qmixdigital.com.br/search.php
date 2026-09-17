<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header(); ?>

<header class="archive-head">
  <h1>Resultados</h1>
  <span class="archive-head__count">Busca por "<?php echo esc_html( get_search_query() ); ?>"</span>
</header>

<?php if ( have_posts() ) : ?>
  <div class="archive-grid">
    <?php while ( have_posts() ) : the_post(); $rcats = get_the_category(); ?>
      <article class="archive-grid__card" id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
        <?php if ( has_post_thumbnail() ) : ?>
          <a class="archive-grid__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
            <?php the_post_thumbnail( 'qmix-card', array( 'loading' => 'lazy' ) ); ?>
          </a>
        <?php endif; ?>
        <?php if ( $rcats ) : ?><div class="archive-grid__cat"><?php echo esc_html( $rcats[0]->name ); ?></div><?php endif; ?>
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
  <div class="error-page">
    <h1>Nada encontrado</h1>
    <p>Não encontramos matérias para "<?php echo esc_html( get_search_query() ); ?>". Tente outras palavras-chave ou explore as editorias.</p>
    <?php get_search_form(); ?>
  </div>
<?php endif; ?>

<?php get_footer();
