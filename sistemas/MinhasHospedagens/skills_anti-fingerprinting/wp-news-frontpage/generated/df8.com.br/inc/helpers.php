<?php
/**
 * Portal: DF8 News (df8.com.br)
 * Helpers: queries + cards + formatters
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * Categorias multi-language excluidas do home.
 * df8 publica em pt-PT (actualidade, life) ao lado do pt-BR padrão.
 */
function d8_excluded_lang_cat_ids() {
	static $cache = null;
	if ( $cache !== null ) { return $cache; }
	$slugs = array( 'actualidade', 'life' );
	$ids = array();
	foreach ( $slugs as $slug ) {
		$term = get_category_by_slug( $slug );
		if ( $term ) { $ids[] = (int) $term->term_id; }
	}
	$cache = $ids;
	return $ids;
}

/**
 * Heuristica titulo PT-BR (acentos OU palavras PT comuns).
 * Bloqueia titulos em ingles e pt-PT mais raros que escapam da exclusao por categoria.
 */
function d8_title_looks_ptbr( $title ) {
	if ( preg_match( '/[áàâãäéèêëíïîóôõöúüùûçÁÀÂÃÄÉÈÊËÍÏÎÓÔÕÖÚÜÙÛÇ]/u', $title ) ) {
		return true;
	}
	if ( preg_match( '/\\b(de|do|da|dos|das|em|no|na|nos|nas|que|com|para|por|pelo|pela|sobre|sua|seu|este|esta|esse|essa|isso|aqui|onde|quando|como|sem|mais|menos|porque|tem)\\b/iu', $title ) ) {
		return true;
	}
	return false;
}

/**
 * Query base com regra 8 / 2.1: meta_query _thumbnail_id > 0 NUMERIC, exclusao multilingue.
 */
function d8_query_for_section( $args = array() ) {
	$defaults = array(
		'posts_per_page'      => 5,
		'no_found_rows'       => true,
		'ignore_sticky_posts' => true,
		'category__not_in'    => d8_excluded_lang_cat_ids(),
		'meta_query'          => array(
			array(
				'key'     => '_thumbnail_id',
				'value'   => '0',
				'compare' => '>',
				'type'    => 'NUMERIC',
			),
		),
	);
	$merged = wp_parse_args( $args, $defaults );
	if ( ! empty( $args['cat'] ) && empty( $args['category__not_in'] ) ) {
		$merged['category__not_in'] = d8_excluded_lang_cat_ids();
	}
	return new WP_Query( $merged );
}

/**
 * Over-fetch 3x e filtra duas vezes (regra 2.1): has_post_thumbnail + titulo PT-BR.
 */
function d8_collect_ids_with_thumb( $args, $target ) {
	$args['posts_per_page'] = max( $target * 4, 16 );
	$q   = d8_query_for_section( $args );
	$ids = array();
	while ( $q->have_posts() ) {
		$q->the_post();
		if ( ! has_post_thumbnail() ) { continue; }
		if ( ! d8_title_looks_ptbr( get_the_title() ) ) { continue; }
		$ids[] = get_the_ID();
		if ( count( $ids ) >= $target ) { break; }
	}
	wp_reset_postdata();
	return $ids;
}

function d8_relative_time( $post_id = null ) {
	$post_id = $post_id ?: get_the_ID();
	$pub  = get_the_time( 'U', $post_id );
	$now  = current_time( 'timestamp' );
	$diff = $now - $pub;
	if ( $diff < 60 ) { return 'agora'; }
	if ( $diff < 3600 ) { $m = floor( $diff / 60 ); return "há {$m} min"; }
	if ( $diff < 86400 ) { $h = floor( $diff / 3600 ); return "há {$h}h"; }
	if ( $diff < 604800 ) { $d = floor( $diff / 86400 ); return $d === 1 ? "há 1 dia" : "há {$d} dias"; }
	return get_the_date( 'd/m/Y', $post_id );
}

function d8_primary_category( $post_id = null ) {
	$post_id = $post_id ?: get_the_ID();
	$cats = get_the_category( $post_id );
	if ( empty( $cats ) ) { return null; }
	foreach ( $cats as $c ) {
		if ( $c->slug !== 'uncategorized' ) { return $c; }
	}
	return $cats[0];
}

/**
 * Card padrao. Regra 2.2: return early se nao tem thumb.
 * Card style = text_only com classe has-media quando ha foto.
 */
function d8_card_default() {
	if ( ! has_post_thumbnail() ) { return; }
	$cat = d8_primary_category();
	?>
	<article class="d8-card has-media">
		<a class="d8-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
			<?php the_post_thumbnail( 'd8-card', array( 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
		</a>
		<?php if ( $cat ) : ?>
			<a class="d8-card__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
		<?php endif; ?>
		<h3 class="d8-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
		<div class="d8-card__meta"><?php echo esc_html( d8_relative_time() ); ?></div>
	</article>
	<?php
}

/**
 * Card featured (hero lead): imagem maior + excerpt.
 */
function d8_hero_lead() {
	if ( ! has_post_thumbnail() ) { return; }
	$cat = d8_primary_category();
	?>
	<div class="d8-hero__lead">
		<a class="d8-hero__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
			<?php the_post_thumbnail( 'd8-hero', array( 'loading' => 'eager', 'fetchpriority' => 'high', 'decoding' => 'async' ) ); ?>
		</a>
		<div class="d8-hero__body">
			<?php if ( $cat ) : ?>
				<a class="d8-hero__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
			<?php endif; ?>
			<h2 class="d8-hero__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
			<p class="d8-hero__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 30 ) ); ?></p>
		</div>
	</div>
	<?php
}

function d8_hero_sublist( $ids ) {
	if ( empty( $ids ) ) { return; }
	echo '<ul class="d8-hero__sublist">';
	foreach ( $ids as $id ) {
		printf( '<li><a href="%s">%s</a></li>',
			esc_url( get_permalink( $id ) ),
			esc_html( get_the_title( $id ) )
		);
	}
	echo '</ul>';
}

function d8_column_card() {
	$cat = d8_primary_category();
	$author_id = (int) get_the_author_meta( 'ID' );
	$avatar = get_avatar_url( $author_id, array( 'size' => 56 ) );
	?>
	<article class="d8-column-card">
		<div class="d8-column-card__avatar">
			<img src="<?php echo esc_url( $avatar ); ?>" alt="<?php echo esc_attr( get_the_author() ); ?>" width="56" height="56" loading="lazy">
		</div>
		<div>
			<div class="d8-column-card__byline"><?php echo esc_html( get_the_author() ); ?></div>
			<h3 class="d8-column-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
		</div>
	</article>
	<?php
}

function d8_today_pt_long() {
	$days = array( 'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado' );
	$months = array( '', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro' );
	$ts = current_time( 'timestamp' );
	$dn = (int) date( 'w', $ts );
	$d  = (int) date( 'j', $ts );
	$m  = (int) date( 'n', $ts );
	return ucfirst( $days[ $dn ] ) . ', ' . $d . ' de ' . $months[ $m ];
}
