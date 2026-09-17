<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="exq-main" role="main">
<section class="exq-archive">
	<header class="exq-archive__head"><h1 class="exq-archive__title">Últimos posts</h1></header>
	<div class="exq-archive__grid">
		<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); exq_card_default(); endwhile; else : ?>
			<p>Nenhum post encontrado.</p>
		<?php endif; ?>
	</div>
	<?php
	$pag = paginate_links( array( 'mid_size' => 2, 'prev_text' => '←', 'next_text' => '→', 'type' => 'array' ) );
	if ( ! empty( $pag ) ) { echo '<nav class="exq-pagination">'; foreach ( $pag as $p ) { echo $p; } echo '</nav>'; }
	?>
</section>
</main>
<?php get_footer(); ?>
