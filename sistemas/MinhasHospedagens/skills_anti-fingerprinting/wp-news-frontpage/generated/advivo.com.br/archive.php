<?php
/**
 * Portal: AdVivo (advivo.com.br) - Archive arquetipo gamma (coluna editorial)
 * Gerado: 09/08/2026
 *
 * Arquivo NAO filtra por imagem destacada: existe para expor todo o acervo.
 * A trava de imagem vale so na home.
 */

get_header();
?>

<div class="av-wrap">
	<header class="av-arch__head">
		<h1 class="av-arch__h"><?php echo esc_html( single_term_title( '', false ) ); ?></h1>
		<?php
		$total = (int) $GLOBALS['wp_query']->found_posts;
		?>
		<p class="av-arch__count"><?php echo esc_html( number_format_i18n( $total ) ); ?> <?php echo esc_html( $total === 1 ? 'publicação' : 'publicações' ); ?></p>
	</header>
</div>

<div class="av-wrap av-layout">
	<div class="av-main-col">
		<?php if ( have_posts() ) : ?>
			<div class="av-latest">
				<?php
				while ( have_posts() ) :
					the_post();
					av_card( get_the_ID(), 'default', array( 'dek' => true, 'size' => 'av-card' ) );
				endwhile;
				?>
			</div>

			<div class="av-pager">
				<?php
				the_posts_pagination( array(
					'mid_size'  => 1,
					'prev_text' => 'Anteriores',
					'next_text' => 'Próximas',
				) );
				?>
			</div>
		<?php else : ?>
			<p>Nenhuma publicação nesta editoria por enquanto.</p>
		<?php endif; ?>
	</div>

	<aside class="av-side" aria-label="Conteudo complementar">
		<?php if ( category_description() ) : ?>
			<section class="av-widget">
				<h2 class="av-widget__h">Sobre a editoria</h2>
				<div class="av-card__dek"><?php echo wp_kses_post( category_description() ); ?></div>
			</section>
		<?php endif; ?>

		<?php
		$destaques = av_ids( 5 );
		if ( $destaques ) :
			?>
			<section class="av-widget">
				<h2 class="av-widget__h">Em Alta no Portal</h2>
				<div class="av-rank">
					<?php foreach ( $destaques as $id ) { av_card( $id, 'sm', array( 'meta' => false, 'size' => 'av-thumb' ) ); } ?>
				</div>
			</section>
		<?php endif; ?>

		<section class="av-widget">
			<h2 class="av-widget__h">Editorias</h2>
			<div class="av-tags">
				<?php
				foreach ( get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 10, 'hide_empty' => true, 'exclude' => av_cat_ids_excluidas() ) ) as $t ) :
					?>
					<a href="<?php echo esc_url( get_category_link( $t->term_id ) ); ?>"><?php echo esc_html( $t->name ); ?></a>
				<?php endforeach; ?>
			</div>
		</section>
	</aside>
</div>

<?php get_footer(); ?>
