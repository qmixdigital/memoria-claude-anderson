<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header(); ?>

<header class="rde-archive__head">
    <h1 class="rde-archive__h1">Buscar no portal</h1>
    <form role="search" method="get" class="rde-search__form" action="<?php echo esc_url( home_url( '/' ) ); ?>">
        <input type="search" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="O que você procura?" autofocus>
        <button class="rde-btn rde-btn--accent" type="submit">Buscar</button>
    </form>
</header>

<?php if ( have_posts() ) : ?>
    <div class="rde-archive__list">
        <?php while ( have_posts() ) : the_post(); rde_card( 'default' ); endwhile; ?>
    </div>
<?php else : ?>
    <div class="rde-widget">
        <h4>Nada encontrado</h4>
        <p>Tente outras palavras ou veja as <a href="<?php echo esc_url( home_url( '/' ) ); ?>">últimas publicações</a>.</p>
    </div>
<?php endif;

get_footer();
