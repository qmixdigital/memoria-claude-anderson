<?php
/**
 * Search results
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="fn-main" role="main">
<section class="fn-archive">
	<header class="fn-archive__head">
		<div class="fn-archive__kicker">Busca</div>
		<h1 class="fn-archive__title">Resultados para "<?php echo esc_html( get_search_query() ); ?>"</h1>
	</header>
	<?php if ( have_posts() ) : ?>
		<div class="fn-archive__grid">
			<?php while ( have_posts() ) : the_post(); fn_card_default(); endwhile; ?>
		</div>
		<?php
		$pag = paginate_links( array( 'mid_size' => 2, 'prev_text' => '←', 'next_text' => '→', 'type' => 'array' ) );
		if ( ! empty( $pag ) ) {
			echo '<nav class="fn-pagination" aria-label="Paginação">';
			foreach ( $pag as $p ) { echo $p; }
			echo '</nav>';
		}
		?>
	<?php else : ?>
		<p>Nenhum resultado para a sua busca. Tente outros termos.</p>
		<form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" style="margin-top:24px;display:flex;gap:8px;max-width:520px;">
			<input type="search" name="s" placeholder="Buscar na Folha do Noroeste" value="<?php echo esc_attr( get_search_query() ); ?>" style="flex:1;padding:12px 16px;border:1px solid var(--fn-line);border-radius:var(--fn-r-button);">
			<button type="submit" style="padding:12px 22px;background:var(--fn-ink);color:var(--fn-paper);border:0;border-radius:var(--fn-r-button);font-weight:700;letter-spacing:.04em;">Buscar</button>
		</form>
	<?php endif; ?>
</section>
</main>
<?php get_footer(); ?>
