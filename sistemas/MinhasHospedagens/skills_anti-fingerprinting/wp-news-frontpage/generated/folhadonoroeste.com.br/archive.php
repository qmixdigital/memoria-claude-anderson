<?php
/**
 * Archive: alpha simple grid 4x
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="fn-main" role="main">
<section class="fn-archive">
	<header class="fn-archive__head">
		<?php if ( is_category() ) : ?>
			<div class="fn-archive__kicker">Editoria</div>
		<?php elseif ( is_tag() ) : ?>
			<div class="fn-archive__kicker">Tag</div>
		<?php elseif ( is_author() ) : ?>
			<div class="fn-archive__kicker">Autor</div>
		<?php else : ?>
			<div class="fn-archive__kicker">Arquivo</div>
		<?php endif; ?>
		<h1 class="fn-archive__title"><?php
			if ( is_category() || is_tag() || is_tax() ) { single_term_title();
			} elseif ( is_author() ) { the_author();
			} else { the_archive_title( '' ); }
		?></h1>
		<?php $desc = is_category() || is_tag() || is_tax() ? term_description() : get_the_archive_description(); ?>
		<?php if ( $desc ) : ?>
			<div class="fn-archive__desc"><?php echo wp_kses_post( $desc ); ?></div>
		<?php endif; ?>
	</header>
	<div class="fn-archive__grid">
		<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
			<?php fn_card_default(); ?>
		<?php endwhile; else : ?>
			<p>Nenhum post encontrado.</p>
		<?php endif; ?>
	</div>
	<?php
	$pag = paginate_links( array( 'mid_size' => 2, 'prev_text' => '←', 'next_text' => '→', 'type' => 'array' ) );
	if ( ! empty( $pag ) ) :
	?>
	<nav class="fn-pagination" aria-label="Paginação">
		<?php foreach ( $pag as $p ) { echo $p; } ?>
	</nav>
	<?php endif; ?>
</section>
</main>
<?php get_footer(); ?>
