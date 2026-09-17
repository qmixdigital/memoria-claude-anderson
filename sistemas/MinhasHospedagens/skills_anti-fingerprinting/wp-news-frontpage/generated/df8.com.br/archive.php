<?php
/**
 * Portal: DF8 News (df8.com.br)
 * Archive archetype β: beta_magazine_grid (3 cols desktop, 2 tablet, 1 mobile)
 * Top hero (primeiro post como featured card grande) + grid 3-col
 * posts_per_archive_page = 8, archive_card_density = 3_2_1
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="d8-main" role="main">
<section class="d8-archive">
	<header class="d8-archive__head">
		<?php if ( is_category() ) : ?>
			<div class="d8-archive__kicker">Editoria</div>
		<?php elseif ( is_tag() ) : ?>
			<div class="d8-archive__kicker">Tag</div>
		<?php elseif ( is_author() ) : ?>
			<div class="d8-archive__kicker">Autor</div>
		<?php else : ?>
			<div class="d8-archive__kicker">Arquivo</div>
		<?php endif; ?>
		<h1 class="d8-archive__title"><?php
			if ( is_category() || is_tag() || is_tax() ) { single_term_title();
			} elseif ( is_author() ) { the_author();
			} else { the_archive_title( '' ); }
		?></h1>
		<?php $desc = ( is_category() || is_tag() || is_tax() ) ? term_description() : get_the_archive_description(); ?>
		<?php if ( $desc ) : ?>
			<div class="d8-archive__desc"><?php echo wp_kses_post( $desc ); ?></div>
		<?php endif; ?>
	</header>

	<?php if ( have_posts() ) : ?>

		<?php
		// Pega o primeiro post como hero featured (β archetype: featured at top).
		$is_first = true;
		?>

		<?php while ( have_posts() ) : the_post(); ?>
			<?php if ( $is_first && has_post_thumbnail() && ! is_paged() ) : ?>
				<div class="d8-archive__hero">
					<?php d8_card_default(); ?>
				</div>
				<?php $is_first = false; ?>
				<div class="d8-archive__grid">
			<?php else : ?>
				<?php if ( $is_first ) : ?>
					<div class="d8-archive__grid">
					<?php $is_first = false; ?>
				<?php endif; ?>
				<?php d8_card_default(); ?>
			<?php endif; ?>
		<?php endwhile; ?>

		</div><?php // close d8-archive__grid ?>

	<?php else : ?>
		<div class="d8-archive__grid">
			<p>Nenhum post encontrado nesta seção.</p>
		</div>
	<?php endif; ?>

	<?php
	$pag = paginate_links( array(
		'mid_size'  => 1,
		'prev_text' => '&larr; Anterior',
		'next_text' => 'Próximo &rarr;',
		'type'      => 'array',
	) );
	if ( ! empty( $pag ) ) :
	?>
	<nav class="d8-pagination" aria-label="Paginação">
		<?php foreach ( $pag as $p ) { echo $p; } ?>
	</nav>
	<?php endif; ?>
</section>
</main>
<?php get_footer(); ?>
