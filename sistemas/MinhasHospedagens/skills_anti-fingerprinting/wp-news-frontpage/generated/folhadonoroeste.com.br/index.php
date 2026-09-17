<?php
/**
 * Fallback index
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="fn-main" role="main">
<section class="fn-archive">
	<header class="fn-archive__head">
		<h1 class="fn-archive__title">Últimos posts</h1>
	</header>
	<div class="fn-archive__grid">
		<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); fn_card_default(); endwhile; else : ?>
			<p>Nenhum post encontrado.</p>
		<?php endif; ?>
	</div>
	<?php
	$pag = paginate_links( array( 'mid_size' => 2, 'prev_text' => '←', 'next_text' => '→', 'type' => 'array' ) );
	if ( ! empty( $pag ) ) {
		echo '<nav class="fn-pagination">';
		foreach ( $pag as $p ) { echo $p; }
		echo '</nav>';
	}
	?>
</section>
</main>
<?php get_footer(); ?>
