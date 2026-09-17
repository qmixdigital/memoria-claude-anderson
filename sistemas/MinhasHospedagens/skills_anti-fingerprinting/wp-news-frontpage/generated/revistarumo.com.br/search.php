<?php
/**
 * Portal: Revista Rumo (revistarumo.com.br)
 * Search results: lista editorial (mesmo estilo do archive gamma).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="rr-main" role="main">
<section class="rr-archive">
	<header class="rr-archive__head">
		<div class="rr-archive__kicker">Busca</div>
		<h1 class="rr-archive__title">Resultados para "<?php echo esc_html( get_search_query() ); ?>"</h1>
	</header>
	<?php if ( have_posts() ) : ?>
		<div class="rr-archive__list">
			<?php while ( have_posts() ) : the_post();
				if ( ! has_post_thumbnail() ) { continue; }
				rr_card_archive();
			endwhile; ?>
		</div>
		<?php
		$pag = paginate_links( array( 'mid_size' => 1, 'prev_text' => '&larr; Anteriores', 'next_text' => 'Próximas &rarr;', 'type' => 'array' ) );
		if ( ! empty( $pag ) ) {
			echo '<nav class="rr-pagination" aria-label="Paginação">';
			foreach ( $pag as $p ) { echo $p; }
			echo '</nav>';
		}
		?>
	<?php else : ?>
		<p>Nenhum resultado para a sua busca. Tente outros termos.</p>
		<form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" style="margin-top:18px;display:flex;gap:8px;max-width:520px;">
			<input type="search" name="s" placeholder="Buscar na Revista Rumo" value="<?php echo esc_attr( get_search_query() ); ?>" style="flex:1;padding:12px 16px;border:1px solid var(--rr-line);border-radius:var(--rr-r-button);font-family:inherit;">
			<button type="submit" style="padding:12px 22px;background:var(--rr-primary);color:var(--rr-paper);border:0;font-family:var(--rr-font-meta);font-weight:700;letter-spacing:.04em;border-radius:var(--rr-r-button);cursor:pointer;">Buscar</button>
		</form>
	<?php endif; ?>
</section>
</main>
<?php get_footer(); ?>
