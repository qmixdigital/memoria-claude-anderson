<?php
/**
 * 404 page
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="fn-main" role="main">
<section class="fn-404">
	<div class="fn-404__big">404</div>
	<h1 class="fn-404__title">Página não encontrada</h1>
	<p class="fn-404__desc">A página que você procura pode ter sido removida ou nunca existiu. Volte à página inicial ou explore as últimas notícias.</p>
	<a class="fn-404__cta" href="<?php echo esc_url( home_url( '/' ) ); ?>">Ir para a página inicial</a>
</section>
</main>
<?php get_footer(); ?>
