<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header(); ?>

<header class="bx-archive-head">
    <h1>Resultados</h1>
    <span class="bx-archive-head__count">Busca por "<?php echo esc_html( get_search_query() ); ?>"</span>
</header>

<?php if ( have_posts() ) : ?>
    <div class="bx-list">
        <?php while ( have_posts() ) : the_post(); $rcats = get_the_category(); ?>
            <article class="bx-list-card" id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                <?php if ( has_post_thumbnail() ) : ?>
                    <a class="bx-list-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
                        <?php the_post_thumbnail( 'bx-card', array( 'loading' => 'lazy' ) ); ?>
                    </a>
                <?php endif; ?>
                <div class="bx-list-card__body">
                    <?php if ( $rcats ) : ?><div class="bx-list-card__cat"><?php echo esc_html( $rcats[0]->name ); ?></div><?php endif; ?>
                    <h2 class="bx-list-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                    <p class="bx-list-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 28 ) ); ?></p>
                </div>
            </article>
        <?php endwhile; ?>
    </div>
<?php else : ?>
    <div class="bx-error">
        <h1>Nada encontrado</h1>
        <p>Não há matérias para "<?php echo esc_html( get_search_query() ); ?>".</p>
        <?php get_search_form(); ?>
    </div>
<?php endif; get_footer();
