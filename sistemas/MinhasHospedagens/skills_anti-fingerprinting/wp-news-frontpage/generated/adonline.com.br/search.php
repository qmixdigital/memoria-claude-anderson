<?php
/**
 * Search results
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="adon-main" role="main">
<section class="adon-archive">
	<header class="adon-archive__head">
		<div class="adon-archive__kicker">Busca</div>
		<h1 class="adon-archive__title">Resultados para “<?php echo esc_html( get_search_query() ); ?>”</h1>
	</header>

	<?php if ( have_posts() ) : ?>
		<div class="adon-archive__grid">
			<?php while ( have_posts() ) : the_post(); adon_card_default(); endwhile; ?>
		</div>
		<?php
		$pag = paginate_links( array( 'mid_size' => 2, 'prev_text' => '←', 'next_text' => '→', 'type' => 'array' ) );
		if ( ! empty( $pag ) ) {
			echo '<nav class="adon-pagination" aria-label="Paginação">';
			foreach ( $pag as $p ) { echo $p; }
			echo '</nav>';
		}
		?>
	<?php else : ?>
		<p>Nenhum resultado para a sua busca. Tente outros termos.</p>
		<form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" style="margin-top:24px;display:flex;gap:8px;max-width:520px;">
			<input type="search" name="s" placeholder="Buscar no AdOnline" value="<?php echo esc_attr( get_search_query() ); ?>" style="flex:1;padding:12px 16px;border:1px solid var(--adon-line);border-radius:var(--adon-r-button);">
			<button type="submit" style="padding:12px 22px;background:var(--adon-ink);color:var(--adon-paper);border:0;border-radius:var(--adon-r-button);font-weight:700;letter-spacing:.04em;">Buscar</button>
		</form>
	<?php endif; ?>
</section>
</main>
<?php get_footer(); ?>
