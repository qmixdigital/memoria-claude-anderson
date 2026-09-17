<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="exq-main" role="main">
<section class="exq-404">
	<div class="exq-404__big">404</div>
	<h1 class="exq-404__title">Página não encontrada</h1>
	<p class="exq-404__desc">A página que você procura pode ter sido removida ou nunca existiu.</p>
	<a class="exq-404__cta" href="<?php echo esc_url( home_url( '/' ) ); ?>">Ir para a página inicial</a>
</section>
</main>
<?php get_footer(); ?>
