<?php
/**
 * 404 page
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="adon-main" role="main">
<section class="adon-404">
	<div class="adon-404__big">404</div>
	<h1 class="adon-404__title">Página não encontrada</h1>
	<p class="adon-404__desc">A página que você procura pode ter sido removida ou nunca existiu. Volte para a página inicial ou explore as últimas notícias.</p>
	<a class="adon-404__cta" href="<?php echo esc_url( home_url( '/' ) ); ?>">Ir para a página inicial</a>
</section>
</main>
<?php get_footer(); ?>
