<?php
/**
 * Fallback index: usa archive.php quando aplicável.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="adon-main" role="main">
<section class="adon-archive">
	<header class="adon-archive__head">
		<h1 class="adon-archive__title">Últimos posts</h1>
	</header>
	<div class="adon-archive__grid">
		<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); adon_card_default(); endwhile; else : ?>
			<p>Nenhum post encontrado.</p>
		<?php endif; ?>
	</div>
	<?php
	$pag = paginate_links( array( 'mid_size' => 2, 'prev_text' => '←', 'next_text' => '→', 'type' => 'array' ) );
	if ( ! empty( $pag ) ) {
		echo '<nav class="adon-pagination">';
		foreach ( $pag as $p ) { echo $p; }
		echo '</nav>';
	}
	?>
</section>
</main>
<?php get_footer(); ?>
