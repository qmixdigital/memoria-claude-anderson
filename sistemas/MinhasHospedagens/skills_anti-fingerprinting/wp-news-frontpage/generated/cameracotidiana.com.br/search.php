<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<div class="cc__shell">
    <header class="cc__archive__head">
        <nav class="cc__breadcrumb" aria-label="Localização">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>">início</a>
            <span class="cc__breadcrumb__sep" aria-hidden="true"></span>
            <span>busca</span>
        </nav>
        <span class="cc__archive__kicker">resultados</span>
        <h1 class="cc__archive__h1">› <?php echo esc_html( strtolower( get_search_query() ) ); ?></h1>
        <?php if ( have_posts() ) : ?>
        <p class="cc__archive__desc"><?php echo (int) $GLOBALS['wp_query']->found_posts; ?> ensaios encontrados.</p>
        <?php endif; ?>
    </header>

    <?php if ( have_posts() ) : ?>
        <div class="cc__archive__grid">
            <?php while ( have_posts() ) : the_post(); ?>
                <article class="cc__archive__item">
                    <?php if ( has_post_thumbnail() ) : ?>
                    <a class="cc__archive__item-media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
                        <?php the_post_thumbnail( 'medium', array( 'alt' => '' ) ); ?>
                    </a>
                    <?php endif; ?>
                    <div class="cc__archive__item-body">
                        <p class="cc__archive__item-byline"><?php echo esc_html( cc_post_date() ); ?></p>
                        <h2 class="cc__archive__item-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                    </div>
                </article>
            <?php endwhile; ?>
        </div>
        <nav class="cc__pagination" aria-label="Paginação">
            <span><?php previous_posts_link( '‹ anteriores' ); ?></span>
            <span><?php next_posts_link( 'próximos ›' ); ?></span>
        </nav>
    <?php else : ?>
        <div class="cc__empty">
            <h2>nada por esse termo</h2>
            <p>Tente palavras-chave mais curtas ou explore um caderno no menu.</p>
        </div>
    <?php endif; ?>
</div>
<?php get_footer();
