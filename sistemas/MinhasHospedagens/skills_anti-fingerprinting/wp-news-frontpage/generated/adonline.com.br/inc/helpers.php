<?php
/**
 * Helpers: queries, cards, formatters
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * IDs de categorias que NÃO devem aparecer no home (conteúdo em outro idioma).
 * Pattern: skill references/multilang-exclusion.md.
 *
 * @return int[]
 */
function adon_excluded_lang_cat_ids() {
	static $cache = null;
	if ( $cache !== null ) { return $cache; }
	$slugs = array( 'brazil-news' ); // categoria 92, conteúdo em inglês
	$ids = array();
	foreach ( $slugs as $slug ) {
		$term = get_category_by_slug( $slug );
		if ( $term ) { $ids[] = (int) $term->term_id; }
	}
	$cache = $ids;
	return $ids;
}

/**
 * Query padrão para qualquer bloco do home.
 *  Layer 1: meta_query NUMERIC (thumb existe + > 0)
 *  Layer 3: category__not_in (exclui idiomas estrangeiros)
 */
function adon_query_for_section( $args = array() ) {
	$defaults = array(
		'posts_per_page'      => 5,
		'no_found_rows'       => true,
		'ignore_sticky_posts' => true,
		'category__not_in'    => adon_excluded_lang_cat_ids(),
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
	// Garantir que category__not_in nunca seja sobreposto por queries que setam só `cat`.
	if ( ! empty( $args['cat'] ) && empty( $args['category__not_in'] ) ) {
		$merged['category__not_in'] = adon_excluded_lang_cat_ids();
	}
	return new WP_Query( $merged );
}

/**
 * Heurística: o título parece ser PT-BR?
 * Critério A: tem caractere acentuado tipicamente PT (á, é, í, ó, ú, ã, õ, ç).
 * Critério B: tem palavra PT muito comum como token (de, do, da, em, na, no, que, com, para, por, pela, sobre, sua, seu).
 * Retorna true se A OU B. Cobre ~95% dos títulos PT. Posts em inglês raramente
 * têm acentos e raramente colidem com a whitelist.
 */
function adon_title_looks_ptbr( $title ) {
	if ( preg_match( '/[áàâãäéèêëíïîóôõöúüùûçÁÀÂÃÄÉÈÊËÍÏÎÓÔÕÖÚÜÙÛÇ]/u', $title ) ) {
		return true;
	}
	if ( preg_match( '/\\b(de|do|da|dos|das|em|no|na|nos|nas|que|com|para|por|pelo|pela|sobre|sua|seu|este|esta|esse|essa|isso|aqui|onde|quando|como|sem|mais|menos|porque|tem|s\\xC3\\xA3o|n\\xC3\\xA3o)\\b/iu', $title ) ) {
		return true;
	}
	return false;
}

/**
 * Coleta IDs com thumb válida, com over-fetch 3x.
 *  Layer 2: has_post_thumbnail
 *  Layer 4: filtro heurístico de idioma (apenas títulos PT-BR)
 */
function adon_collect_ids_with_thumb( $args, $target ) {
	$args['posts_per_page'] = max( $target * 4, 16 );
	$q   = adon_query_for_section( $args );
	$ids = array();
	while ( $q->have_posts() ) {
		$q->the_post();
		if ( ! has_post_thumbnail() ) { continue; }
		if ( ! adon_title_looks_ptbr( get_the_title() ) ) { continue; }
		$ids[] = get_the_ID();
		if ( count( $ids ) >= $target ) { break; }
	}
	wp_reset_postdata();
	return $ids;
}

/**
 * Tempo relativo PT-BR (há X tempo). Limita a 7 dias, depois data formal.
 */
function adon_relative_time( $post_id = null ) {
	$post_id = $post_id ?: get_the_ID();
	$pub  = get_the_time( 'U', $post_id );
	$now  = current_time( 'timestamp' );
	$diff = $now - $pub;
	if ( $diff < 60 ) { return 'agora'; }
	if ( $diff < 3600 ) { $m = floor( $diff / 60 ); return "há {$m} min"; }
	if ( $diff < 86400 ) { $h = floor( $diff / 3600 ); return "há {$h}h"; }
	if ( $diff < 604800 ) { $d = floor( $diff / 86400 ); return $d === 1 ? "há 1 dia" : "há {$d} dias"; }
	return get_the_date( 'j \\d\\e M', $post_id );
}

/**
 * Categoria principal do post (primeira não-uncategorized).
 */
function adon_primary_category( $post_id = null ) {
	$post_id = $post_id ?: get_the_ID();
	$cats = get_the_category( $post_id );
	if ( empty( $cats ) ) { return null; }
	foreach ( $cats as $c ) {
		if ( $c->slug !== 'uncategorized' && $c->name !== 'Geral' ) { return $c; }
	}
	return $cats[0];
}

/**
 * Card padrão (image-top): usado nas seções full-width.
 */
function adon_card_default() {
	if ( ! has_post_thumbnail() ) { return; }
	$cat = adon_primary_category();
	?>
	<article class="adon-card">
		<a class="adon-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
			<?php the_post_thumbnail( 'adon-card', array( 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
		</a>
		<div class="adon-card__body">
			<?php if ( $cat ) : ?>
				<a class="adon-card__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
			<?php endif; ?>
			<h3 class="adon-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
			<p class="adon-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 18 ) ); ?></p>
			<div class="adon-card__meta">
				<span><?php echo esc_html( adon_relative_time() ); ?></span>
			</div>
		</div>
	</article>
	<?php
}

/**
 * Card compacto (image-left, 90px): sidebar Recentes.
 */
function adon_card_compact() {
	if ( ! has_post_thumbnail() ) { return; }
	$cat = adon_primary_category();
	?>
	<li class="adon-card-compact">
		<a class="adon-card-compact__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
			<?php the_post_thumbnail( 'adon-compact', array( 'loading' => 'eager', 'decoding' => 'async' ) ); ?>
		</a>
		<div class="adon-card-compact__body">
			<h3 class="adon-card-compact__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
			<?php if ( $cat ) : ?>
				<a class="adon-card-compact__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
			<?php endif; ?>
			<div class="adon-card-compact__time"><?php echo esc_html( adon_relative_time() ); ?></div>
		</div>
	</li>
	<?php
}

/**
 * Card só texto (sem imagem): rail Geral lista.
 */
function adon_card_text() {
	$cat = adon_primary_category();
	?>
	<li class="adon-card-text">
		<?php if ( $cat ) : ?>
			<a class="adon-card-text__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
		<?php endif; ?>
		<h4 class="adon-card-text__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h4>
		<div class="adon-card-text__time"><?php echo esc_html( adon_relative_time() ); ?></div>
	</li>
	<?php
}

/**
 * Trending strip item: 4 manchetes com border-left.
 */
function adon_trend_item() {
	?>
	<div class="adon-trend-item">
		<h3 class="adon-trend-item__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
		<div class="adon-trend-item__date"><?php echo esc_html( adon_relative_time() ); ?></div>
	</div>
	<?php
}

/**
 * Cover hero: image full + overlay + cat pill verde + título.
 */
function adon_cover_hero() {
	if ( ! has_post_thumbnail() ) { return; }
	$cat = adon_primary_category();
	?>
	<a class="adon-cover" href="<?php the_permalink(); ?>">
		<div class="adon-cover__media">
			<?php the_post_thumbnail( 'adon-hero', array( 'loading' => 'eager', 'fetchpriority' => 'high', 'decoding' => 'async' ) ); ?>
		</div>
		<div class="adon-cover__overlay"></div>
		<div class="adon-cover__body">
			<?php if ( $cat ) : ?>
				<span class="adon-cover__cat"><?php echo esc_html( $cat->name ); ?></span>
			<?php endif; ?>
			<h2 class="adon-cover__title"><?php the_title(); ?></h2>
			<div class="adon-cover__meta">
				<?php echo esc_html( get_the_author() ); ?>
				&nbsp;·&nbsp;
				<?php echo esc_html( adon_relative_time() ); ?>
			</div>
		</div>
	</a>
	<?php
}

/**
 * Featured do rail (image + título grande).
 */
function adon_rail_featured() {
	if ( ! has_post_thumbnail() ) { return; }
	?>
	<div class="adon-rail__featured">
		<a class="adon-rail__featured-media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
			<?php the_post_thumbnail( 'adon-card', array( 'loading' => 'eager', 'decoding' => 'async' ) ); ?>
		</a>
		<h3 class="adon-rail__featured-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
		<div class="adon-card-text__time"><?php echo esc_html( adon_relative_time() ); ?></div>
	</div>
	<?php
}

/**
 * Data PT-BR formatada estilo "sábado, 2 de maio".
 */
function adon_today_pt() {
	$days = array( 'domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado' );
	$months = array( '', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro' );
	$ts = current_time( 'timestamp' );
	$dn = (int) date( 'w', $ts );
	$d  = (int) date( 'j', $ts );
	$m  = (int) date( 'n', $ts );
	return $days[ $dn ] . ', ' . $d . ' de ' . $months[ $m ];
}
