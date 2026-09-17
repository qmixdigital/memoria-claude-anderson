<?php
/**
 * Portal: Revista Rumo (revistarumo.com.br)
 * Archive archetype gamma: editorial column (1 col vertical, cards image-left + body-right grandes).
 *  posts_per_archive_page=15 (set via pre_get_posts em functions.php).
 *  archive_pagination=numbered_bottom.
 *  archive_h1_treatment=h1_with_count.
 *  category_description_position=none (sem desc visible).
 *  In-feed ad after 3rd card.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="rr-main" role="main">
<section class="rr-archive">
	<header class="rr-archive__head">
		<?php if ( is_category() ) : ?>
			<div class="rr-archive__kicker">Editoria</div>
		<?php elseif ( is_tag() ) : ?>
			<div class="rr-archive__kicker">Tag</div>
		<?php elseif ( is_author() ) : ?>
			<div class="rr-archive__kicker">Autor</div>
		<?php else : ?>
			<div class="rr-archive__kicker">Arquivo</div>
		<?php endif; ?>
		<h1 class="rr-archive__title"><?php
			if ( is_category() || is_tag() || is_tax() ) { single_term_title();
			} elseif ( is_author() ) { the_author();
			} else { the_archive_title( '' ); }
		?></h1>
		<?php
		// archive_h1_treatment=h1_with_count
		$obj = get_queried_object();
		if ( $obj && isset( $obj->count ) && $obj->count > 0 ) {
			printf( '<div class="rr-archive__count">%d %s nesta seção</div>',
				(int) $obj->count,
				$obj->count === 1 ? 'matéria publicada' : 'matérias publicadas'
			);
		}
		?>
	</header>

	<?php if ( have_posts() ) : ?>
		<div class="rr-archive__list">
			<?php
			$i = 0;
			while ( have_posts() ) : the_post();
				if ( ! has_post_thumbnail() ) { continue; }
				rr_card_archive();
				$i++;
				if ( $i === 3 ) :
				?>
				<div class="rr-ad" aria-label="Espaço publicitário">
					<div class="rr-ad__inner">
						<span class="rr-ad__label">Publicidade</span>
						<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-PORTAL_PUB_ID" data-ad-slot="RR_SLOT_ARCHIVE_INFEED" data-ad-format="auto" data-full-width-responsive="true"></ins>
					</div>
				</div>
				<?php
				endif;
			endwhile;
			?>
		</div>

		<?php
		// Pagination numbered_bottom
		$pag = paginate_links( array(
			'mid_size'  => 1,
			'prev_text' => '&larr; Anteriores',
			'next_text' => 'Próximas &rarr;',
			'type'      => 'array',
		) );
		if ( ! empty( $pag ) ) :
		?>
		<nav class="rr-pagination" aria-label="Paginação">
			<?php foreach ( $pag as $p ) { echo $p; } ?>
		</nav>
		<?php endif; ?>

	<?php else : ?>
		<p>Nenhuma matéria encontrada nesta seção por enquanto.</p>
	<?php endif; ?>
</section>
</main>
<?php get_footer(); ?>
