<?php
/**
 * Portal: AdVivo (advivo.com.br)
 * Parent theme: OceanWP
 * Front-page archetype: B, Single: III, Archive: gamma, Header: H3, Footer: F3
 * Visual: palette=P14 font=F05 spacing=comfortable radius=mixed shadow=bold
 * Gerado: 09/08/2026
 *
 * Helpers de consulta e renderizacao usados pelos templates.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

/* Categorias que nao entram na home nem nos blocos (vazias ou de servico). */
function av_cat_ids_excluidas() {
	static $ids = null;
	if ( $ids !== null ) { return $ids; }
	$ids = array();
	foreach ( array( 'atualidade', 'lifestyle', 'redes-sociais', 'destaque' ) as $slug ) {
		$t = get_category_by_slug( $slug );
		if ( $t ) { $ids[] = (int) $t->term_id; }
	}
	return $ids;
}

/**
 * Query padrao da home. Duas travas contra card sem imagem:
 * o meta_query numerico corta no SQL e o has_post_thumbnail() corta no loop,
 * porque importador deixa _thumbnail_id como '' ou apontando pra anexo apagado.
 */
function av_query( $args = array() ) {
	$base = array(
		'post_type'           => 'post',
		'post_status'         => 'publish',
		'posts_per_page'      => 5,
		'no_found_rows'       => true,
		'ignore_sticky_posts' => true,
		'category__not_in'    => av_cat_ids_excluidas(),
		'meta_query'          => array(
			array(
				'key'     => '_thumbnail_id',
				'value'   => '0',
				'compare' => '>',
				'type'    => 'NUMERIC',
			),
		),
	);
	return new WP_Query( wp_parse_args( $args, $base ) );
}

/** Coleta N ids que realmente tem imagem, pedindo 3x pra sobrar margem. */
function av_ids( $quantidade, $args = array() ) {
	$args['posts_per_page'] = $quantidade * 3;
	$q   = av_query( $args );
	$ids = array();
	while ( $q->have_posts() ) {
		$q->the_post();
		if ( ! has_post_thumbnail() ) { continue; }
		$ids[] = get_the_ID();
		if ( count( $ids ) >= $quantidade ) { break; }
	}
	wp_reset_postdata();
	return $ids;
}

/** Categoria principal do post, ignorando as de servico. */
function av_cat_do_post( $post_id = null ) {
	$post_id = $post_id ? $post_id : get_the_ID();
	$cats    = get_the_category( $post_id );
	if ( empty( $cats ) ) { return null; }
	$fora = av_cat_ids_excluidas();
	foreach ( $cats as $c ) {
		if ( ! in_array( (int) $c->term_id, $fora, true ) ) { return $c; }
	}
	return $cats[0];
}

/** Tempo de leitura em minutos, arredondado pra cima. */
function av_tempo_leitura( $post_id = null ) {
	$post_id  = $post_id ? $post_id : get_the_ID();
	$palavras = str_word_count( wp_strip_all_tags( get_post_field( 'post_content', $post_id ) ) );
	return max( 1, (int) ceil( $palavras / 200 ) );
}

/**
 * Card. $variacao: xl, lg, default, sm, row.
 * Renderiza a partir de um ID explicito para nao depender da global $post
 * (evita o bug de related repetindo o post atual).
 */
function av_card( $post_id, $variacao = 'default', $opcoes = array() ) {
	if ( ! has_post_thumbnail( $post_id ) ) { return; }

	$mostrar_dek  = isset( $opcoes['dek'] ) ? $opcoes['dek'] : false;
	$mostrar_meta = isset( $opcoes['meta'] ) ? $opcoes['meta'] : true;
	$tamanho      = isset( $opcoes['size'] ) ? $opcoes['size'] : 'medium_large';
	$eager        = ! empty( $opcoes['eager'] );
	$prioridade   = ! empty( $opcoes['prioridade'] );

	$cat   = av_cat_do_post( $post_id );
	$url   = get_permalink( $post_id );
	$title = get_the_title( $post_id );
	?>
	<article class="av-card av-card--<?php echo esc_attr( $variacao ); ?>">
		<a class="av-card__media" href="<?php echo esc_url( $url ); ?>" aria-hidden="true" tabindex="-1">
			<?php
			echo get_the_post_thumbnail(
				$post_id,
				$tamanho,
				array_filter( array(
					'alt'           => esc_attr( $title ),
					'loading'       => $eager ? 'eager' : 'lazy',
					'decoding'      => 'async',
					'fetchpriority' => $prioridade ? 'high' : '',
				) )
			);
			?>
		</a>
		<div class="av-card__body">
			<?php if ( $cat ) : ?>
				<a class="av-card__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
			<?php endif; ?>
			<h3 class="av-card__title"><a href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $title ); ?></a></h3>
			<?php if ( $mostrar_dek ) : ?>
				<p class="av-card__dek"><?php echo esc_html( wp_trim_words( get_the_excerpt( $post_id ), 24, '' ) ); ?></p>
			<?php endif; ?>
			<?php if ( $mostrar_meta ) : ?>
				<div class="av-card__meta">
					<span><?php echo esc_html( get_the_date( 'j \d\e F', $post_id ) ); ?></span>
					<span><?php echo esc_html( av_tempo_leitura( $post_id ) ); ?> min de leitura</span>
				</div>
			<?php endif; ?>
		</div>
	</article>
	<?php
}

/** Editorias exibidas na home, na ordem, so as que tem volume real. */
function av_editorias_home() {
	$slugs = array( 'noticias', 'entretenimento', 'insights', 'dicas', 'saude-beleza', 'negocios' );
	$out   = array();
	foreach ( $slugs as $slug ) {
		$t = get_category_by_slug( $slug );
		if ( $t && $t->count > 3 ) { $out[] = $t; }
	}
	return $out;
}
