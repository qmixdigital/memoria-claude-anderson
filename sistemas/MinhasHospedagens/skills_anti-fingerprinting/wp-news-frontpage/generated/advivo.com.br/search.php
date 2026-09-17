<?php
/**
 * Portal: AdVivo (advivo.com.br) - Busca, segue o padrao do arquivo
 * Gerado: 09/08/2026
 */

get_header();
?>

<div class="av-wrap">
	<header class="av-arch__head">
		<h1 class="av-arch__h">Busca: <?php echo esc_html( get_search_query() ); ?></h1>
		<p class="av-arch__count"><?php echo esc_html( number_format_i18n( (int) $GLOBALS['wp_query']->found_posts ) ); ?> resultado(s)</p>
	</header>
</div>

<div class="av-wrap av-layout">
	<div class="av-main-col">
		<?php if ( have_posts() ) : ?>
			<div class="av-latest">
				<?php while ( have_posts() ) : the_post(); av_card( get_the_ID(), 'default', array( 'dek' => true, 'size' => 'av-card' ) ); endwhile; ?>
			</div>
			<div class="av-pager">
				<?php the_posts_pagination( array( 'mid_size' => 1, 'prev_text' => 'Anteriores', 'next_text' => 'Próximas' ) ); ?>
			</div>
		<?php else : ?>
			<p>Nada encontrado para esse termo. Tente uma palavra mais curta ou veja as editorias no menu.</p>
		<?php endif; ?>
	</div>

	<aside class="av-side" aria-label="Conteudo complementar">
		<section class="av-widget">
			<h2 class="av-widget__h">Buscar de novo</h2>
			<form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" class="av-widget__list">
				<label class="screen-reader-text" for="av-s2">Buscar por</label>
				<input type="search" id="av-s2" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="Digite um termo" style="width:100%;padding:11px;border:1px solid var(--av-rule-strong);border-radius:var(--av-r-input);font:inherit">
				<button class="av-btn" type="submit">Buscar</button>
			</form>
		</section>
		<?php $q = av_ids( 5 ); if ( $q ) : ?>
			<section class="av-widget">
				<h2 class="av-widget__h">Em Alta no Portal</h2>
				<div class="av-rank">
					<?php foreach ( $q as $id ) { av_card( $id, 'sm', array( 'meta' => false, 'size' => 'av-thumb' ) ); } ?>
				</div>
			</section>
		<?php endif; ?>
	</aside>
</div>

<?php get_footer(); ?>
