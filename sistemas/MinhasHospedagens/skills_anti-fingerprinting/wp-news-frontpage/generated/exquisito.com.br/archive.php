<?php
/** Archive alpha simple grid 3x */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="exq-main" role="main">
<section class="exq-archive">
	<header class="exq-archive__head">
		<?php if ( is_category() ) : ?>
			<div class="exq-archive__kicker">Editoria</div>
		<?php elseif ( is_tag() ) : ?>
			<div class="exq-archive__kicker">Tag</div>
		<?php elseif ( is_author() ) : ?>
			<div class="exq-archive__kicker">Autor</div>
		<?php else : ?>
			<div class="exq-archive__kicker">Arquivo</div>
		<?php endif; ?>
		<h1 class="exq-archive__title"><?php
			if ( is_category() || is_tag() || is_tax() ) { single_term_title();
			} elseif ( is_author() ) { the_author();
			} else { the_archive_title( '' ); }
		?></h1>
		<?php $desc = is_category() || is_tag() || is_tax() ? term_description() : get_the_archive_description(); ?>
		<?php if ( $desc ) : ?>
			<div class="exq-archive__desc"><?php echo wp_kses_post( $desc ); ?></div>
		<?php endif; ?>
	</header>
	<div class="exq-archive__grid">
		<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); exq_card_default(); endwhile; else : ?>
			<p>Nenhum post encontrado.</p>
		<?php endif; ?>
	</div>
	<?php
	$pag = paginate_links( array( 'mid_size' => 2, 'prev_text' => '←', 'next_text' => '→', 'type' => 'array' ) );
	if ( ! empty( $pag ) ) : ?>
	<nav class="exq-pagination" aria-label="Paginação"><?php foreach ( $pag as $p ) { echo $p; } ?></nav>
	<?php endif; ?>
</section>
</main>
<?php get_footer(); ?>
