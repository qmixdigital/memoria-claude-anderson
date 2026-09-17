<?php
/**
 * Portal: Revista Rumo (revistarumo.com.br)
 * 404 page
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="rr-main" role="main">
<section class="rr-404">
	<div class="rr-404__big">404</div>
	<h1 class="rr-404__title">Página não encontrada</h1>
	<p class="rr-404__desc">A página que você procura pode ter sido removida ou nunca existiu. Volte à página inicial ou explore as últimas matérias da Revista Rumo.</p>
	<a class="rr-404__cta" href="<?php echo esc_url( home_url( '/' ) ); ?>">Ir para a página inicial</a>
</section>
</main>
<?php get_footer(); ?>
