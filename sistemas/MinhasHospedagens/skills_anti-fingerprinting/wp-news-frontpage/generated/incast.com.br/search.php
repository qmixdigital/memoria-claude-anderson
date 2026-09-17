<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header(); ?>

<header class="ic-archive__head">
    <h1 class="ic-archive__h1">Buscar no portal</h1>
    <form role="search" method="get" class="ic-search__form" action="<?php echo esc_url( home_url( '/' ) ); ?>">
        <input type="search" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="O que você procura?" autofocus>
        <button class="ic-btn ic-btn--accent" type="submit">Buscar</button>
    </form>
</header>

<?php if ( have_posts() ) : ?>
    <div class="ic-archive__list">
        <?php while ( have_posts() ) : the_post(); ic_card( 'default' ); endwhile; ?>
    </div>
    <nav class="ic-archive__pagination">
        <?php the_posts_pagination( array( 'mid_size' => 1 ) ); ?>
    </nav>
<?php else : ?>
    <div class="ic-widget">
        <h4>Nada encontrado</h4>
        <p>Tente outras palavras ou veja as <a href="<?php echo esc_url( home_url( '/' ) ); ?>">últimas publicações</a>.</p>
    </div>
<?php endif;

get_footer();
