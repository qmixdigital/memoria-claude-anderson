<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="exq-main" role="main">
<section class="exq-archive">
	<header class="exq-archive__head">
		<div class="exq-archive__kicker">Busca</div>
		<h1 class="exq-archive__title">Resultados para "<?php echo esc_html( get_search_query() ); ?>"</h1>
	</header>
	<?php if ( have_posts() ) : ?>
		<div class="exq-archive__grid">
			<?php while ( have_posts() ) : the_post(); exq_card_default(); endwhile; ?>
		</div>
		<?php
		$pag = paginate_links( array( 'mid_size' => 2, 'prev_text' => '←', 'next_text' => '→', 'type' => 'array' ) );
		if ( ! empty( $pag ) ) {
			echo '<nav class="exq-pagination" aria-label="Paginação">';
			foreach ( $pag as $p ) { echo $p; }
			echo '</nav>';
		}
		?>
	<?php else : ?>
		<p>Nenhum resultado para a sua busca. Tente outros termos.</p>
	<?php endif; ?>
</section>
</main>
<?php get_footer(); ?>
