<?php
/**
 * Portal: DF8 News (df8.com.br)
 * 404 page
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="d8-main" role="main">
<section class="d8-404">
	<div class="d8-404__big">404</div>
	<h1 class="d8-404__title">Página não encontrada</h1>
	<p class="d8-404__desc">A página que você procura pode ter sido removida ou nunca existiu. Volte à página inicial ou explore as últimas notícias.</p>
	<a class="d8-404__cta" href="<?php echo esc_url( home_url( '/' ) ); ?>">Ir para a página inicial</a>
</section>
</main>
<?php get_footer(); ?>
