<?php
/**
 * Portal: DF8 News (df8.com.br)
 * Search results
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="d8-main" role="main">
<section class="d8-archive">
	<header class="d8-archive__head">
		<div class="d8-archive__kicker">Busca</div>
		<h1 class="d8-archive__title">Resultados para "<?php echo esc_html( get_search_query() ); ?>"</h1>
	</header>
	<?php if ( have_posts() ) : ?>
		<div class="d8-archive__grid">
			<?php while ( have_posts() ) : the_post(); d8_card_default(); endwhile; ?>
		</div>
		<?php
		$pag = paginate_links( array( 'mid_size' => 1, 'prev_text' => '&larr; Anterior', 'next_text' => 'Próximo &rarr;', 'type' => 'array' ) );
		if ( ! empty( $pag ) ) {
			echo '<nav class="d8-pagination" aria-label="Paginação">';
			foreach ( $pag as $p ) { echo $p; }
			echo '</nav>';
		}
		?>
	<?php else : ?>
		<p>Nenhum resultado para a sua busca. Tente outros termos.</p>
		<form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" style="margin-top:18px;display:flex;gap:8px;max-width:520px;">
			<input type="search" name="s" placeholder="Buscar no DF8 News" value="<?php echo esc_attr( get_search_query() ); ?>" style="flex:1;padding:11px 14px;border:1px solid var(--d8-line);border-radius:var(--d8-r-button);">
			<button type="submit" style="padding:11px 22px;background:var(--d8-primary);color:var(--d8-paper);border:0;font-family:var(--d8-font-display);font-weight:400;letter-spacing:.12em;text-transform:uppercase;border-radius:var(--d8-r-button);">Buscar</button>
		</form>
	<?php endif; ?>
</section>
</main>
<?php get_footer(); ?>
