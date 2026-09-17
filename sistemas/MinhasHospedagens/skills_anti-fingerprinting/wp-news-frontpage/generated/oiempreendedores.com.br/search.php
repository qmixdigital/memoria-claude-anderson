<?php
/**
 * Search results.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header(); ?>

<header class="oie-archive__head">
    <h1 class="oie-archive__h1">Buscar no portal</h1>
    <form role="search" method="get" class="oie-search__form" action="<?php echo esc_url( home_url( '/' ) ); ?>">
        <input type="search" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="O que você procura?" autofocus>
        <button class="oie-btn oie-btn--accent" type="submit">Buscar</button>
    </form>
    <?php if ( have_posts() ) : ?>
        <p class="oie-archive__sub"><?php printf( '%s resultados para "<strong>%s</strong>".', (int) $GLOBALS['wp_query']->found_posts, esc_html( get_search_query() ) ); ?></p>
    <?php endif; ?>
</header>

<?php if ( have_posts() ) : ?>
    <div class="oie-front__row-three">
        <?php while ( have_posts() ) : the_post(); oie_card( 'default' ); endwhile; ?>
    </div>
    <div class="oie-mt-3" style="text-align:left;font-family:var(--oie-font-meta);font-size:12px">
        <?php the_posts_pagination( array( 'mid_size' => 1 ) ); ?>
    </div>
<?php else : ?>
    <div class="oie-card" style="padding:var(--oie-sp-4)">
        <h2 style="font-size:22px">Nada encontrado</h2>
        <p>Tente outras palavras ou veja as <a href="<?php echo esc_url( home_url( '/' ) ); ?>">últimas publicações</a>.</p>
    </div>
<?php endif;

get_footer();
