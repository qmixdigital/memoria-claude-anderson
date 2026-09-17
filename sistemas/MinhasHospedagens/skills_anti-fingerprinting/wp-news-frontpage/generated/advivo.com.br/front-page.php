<?php
/**
 * Portal: AdVivo (advivo.com.br) - Front-page arquetipo B com hero triptico
 * Gerado: 09/08/2026
 *
 * Ordem no fonte: conteudo principal antes do aside, porque em grid a coluna
 * segue a ordem do HTML e reordenar por grid-column quebra quando plugin injeta
 * estilo.
 */

get_header();

$usados = array();

/* Hero: 1 chamada grande + 2 laterais */
$hero = av_ids( 3 );
$usados = array_merge( $usados, $hero );
?>

<section class="av-hero">
	<div class="av-wrap av-hero__grid">
		<?php if ( isset( $hero[0] ) ) : ?>
			<div class="av-hero__lead">
				<?php av_card( $hero[0], 'xl', array( 'dek' => true, 'size' => 'av-hero', 'eager' => true, 'prioridade' => true ) ); ?>
			</div>
		<?php endif; ?>

		<div class="av-hero__side">
			<?php
			foreach ( array_slice( $hero, 1, 2 ) as $id ) {
				av_card( $id, 'lg', array( 'dek' => false, 'size' => 'av-card', 'eager' => true ) );
			}
			?>
		</div>
	</div>
</section>

<div class="av-wrap av-layout">

	<div class="av-main-col">

		<?php
		/* Em alta: leitura rapida em tres colunas */
		$alta   = av_ids( 3, array( 'post__not_in' => $usados ) );
		$usados = array_merge( $usados, $alta );
		if ( $alta ) :
			?>
			<section class="av-sec" aria-labelledby="av-alta">
				<div class="av-sec__head">
					<h2 class="av-sec__h" id="av-alta">Em Alta</h2>
					<a class="av-sec__more" href="<?php echo esc_url( home_url( '/feed/' ) ); ?>">Assinar RSS</a>
				</div>
				<div class="av-grid-3">
					<?php foreach ( $alta as $id ) { av_card( $id, 'default', array( 'eager' => true ) ); } ?>
				</div>
			</section>
		<?php endif; ?>

		<div class="av-ad" aria-hidden="true"></div>

		<?php
		/* Blocos por editoria: 1 destaque + 3 menores em cada */
		foreach ( av_editorias_home() as $cat ) :
			$ids = av_ids( 4, array(
				'cat'          => $cat->term_id,
				'post__not_in' => $usados,
			) );
			if ( count( $ids ) < 2 ) { continue; }
			$usados = array_merge( $usados, $ids );
			?>
			<section class="av-sec" aria-labelledby="av-cat-<?php echo esc_attr( $cat->slug ); ?>">
				<div class="av-sec__head">
					<h2 class="av-sec__h" id="av-cat-<?php echo esc_attr( $cat->slug ); ?>"><?php echo esc_html( $cat->name ); ?></h2>
					<a class="av-sec__more" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>">Ver tudo de <?php echo esc_html( $cat->name ); ?></a>
				</div>
				<div class="av-cat">
					<div class="av-cat__lead">
						<?php av_card( $ids[0], 'lg', array( 'dek' => true, 'size' => 'av-card' ) ); ?>
					</div>
					<div class="av-cat__rest">
						<?php
						foreach ( array_slice( $ids, 1, 3 ) as $id ) {
							av_card( $id, 'row', array( 'size' => 'av-thumb' ) );
						}
						?>
					</div>
				</div>
			</section>
		<?php endforeach; ?>

		<div class="av-ad" aria-hidden="true"></div>

		<?php
		/* Ultimas: coluna unica, cartao horizontal */
		$ultimas = av_ids( 8, array( 'post__not_in' => $usados ) );
		if ( $ultimas ) :
			?>
			<section class="av-sec" aria-labelledby="av-ultimas">
				<div class="av-sec__head">
					<h2 class="av-sec__h" id="av-ultimas">Últimas Publicações</h2>
				</div>
				<div class="av-latest">
					<?php foreach ( $ultimas as $id ) { av_card( $id, 'default', array( 'dek' => true, 'size' => 'av-card' ) ); } ?>
				</div>
				<div class="av-pager">
					<a class="av-btn" href="<?php echo esc_url( get_permalink( get_option( 'page_for_posts' ) ) ? get_permalink( get_option( 'page_for_posts' ) ) : home_url( '/noticias/' ) ); ?>">Carregar mais notícias</a>
				</div>
			</section>
		<?php endif; ?>

	</div><!-- /av-main-col -->

	<aside class="av-side" aria-label="Conteudo complementar">

		<?php
		$mais_lidas = av_ids( 5, array(
			'post__not_in' => $usados,
			'orderby'      => 'comment_count',
		) );
		if ( $mais_lidas ) :
			?>
			<section class="av-widget">
				<h2 class="av-widget__h">Mais Lidas</h2>
				<div class="av-rank">
					<?php foreach ( $mais_lidas as $id ) { av_card( $id, 'sm', array( 'meta' => false, 'size' => 'av-thumb' ) ); } ?>
				</div>
			</section>
		<?php endif; ?>

		<section class="av-widget">
			<h2 class="av-widget__h">Editorias</h2>
			<div class="av-tags">
				<?php
				$tags_side = get_categories( array(
					'orderby'    => 'count',
					'order'      => 'DESC',
					'number'     => 10,
					'hide_empty' => true,
					'exclude'    => av_cat_ids_excluidas(),
				) );
				foreach ( $tags_side as $t ) :
					?>
					<a href="<?php echo esc_url( get_category_link( $t->term_id ) ); ?>"><?php echo esc_html( $t->name ); ?></a>
				<?php endforeach; ?>
			</div>
		</section>

		<?php
		$selecao = av_ids( 4, array( 'post__not_in' => $usados, 'orderby' => 'rand' ) );
		if ( $selecao ) :
			?>
			<section class="av-widget">
				<h2 class="av-widget__h">Do Acervo</h2>
				<div class="av-widget__list">
					<?php foreach ( $selecao as $id ) { av_card( $id, 'row', array( 'meta' => false, 'size' => 'av-thumb' ) ); } ?>
				</div>
			</section>
		<?php endif; ?>

		<div class="av-ad" aria-hidden="true"></div>

	</aside>

</div><!-- /av-layout -->

<?php
/* Schema da home: colecao com os itens realmente exibidos. */
$schema_ids = array_slice( $usados, 0, 12 );
if ( $schema_ids ) {
	$itens = array();
	$pos   = 1;
	foreach ( $schema_ids as $id ) {
		$itens[] = array(
			'@type'    => 'ListItem',
			'position' => $pos++,
			'url'      => get_permalink( $id ),
			'name'     => get_the_title( $id ),
		);
	}
	// So ItemList: o Rank Math ja emite o no CollectionPage da home
	// (@id .../#webpage). Emitir outro criaria dois nos de pagina iguais.
	$schema = array(
		'@context'        => 'https://schema.org',
		'@type'           => 'ItemList',
		'name'            => 'Destaques da capa',
		'itemListOrder'   => 'https://schema.org/ItemListOrderDescending',
		'numberOfItems'   => count( $itens ),
		'itemListElement' => $itens,
	);
	echo "\n" . '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
}

get_footer();
