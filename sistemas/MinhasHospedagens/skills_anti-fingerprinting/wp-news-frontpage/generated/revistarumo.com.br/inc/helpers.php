<?php
/**
 * Portal: Revista Rumo (revistarumo.com.br)
 * Helpers: queries + cards + formatters
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * Categorias multi-language excluidas do home.
 * Revista Rumo publica em pt-PT (noticias-pt) ao lado do pt-BR padrão.
 */
function rr_excluded_lang_cat_ids() {
	static $cache = null;
	if ( $cache !== null ) { return $cache; }
	$slugs = array( 'noticias-pt' );
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
function rr_title_looks_ptbr( $title ) {
	if ( preg_match( '/[áàâãäéèêëíïîóôõöúüùûçÁÀÂÃÄÉÈÊËÍÏÎÓÔÕÖÚÜÙÛÇ]/u', $title ) ) {
		return true;
	}
	if ( preg_match( '/\\b(de|do|da|dos|das|em|no|na|nos|nas|que|com|para|por|pelo|pela|sobre|sua|seu|este|esta|esse|essa|isso|aqui|onde|quando|como|sem|mais|menos|porque|tem)\\b/iu', $title ) ) {
		return true;
	}
	return false;
}

/**
 * Verifica se a foto anexada existe fisicamente no disco (filtra thumbs órfãos).
 */
function rr_thumb_file_exists( $post_id ) {
	$tid = (int) get_post_thumbnail_id( $post_id );
	if ( ! $tid ) { return false; }
	$file = get_attached_file( $tid );
	if ( ! $file ) { return false; }
	return file_exists( $file );
}

/**
 * Query base (regra 2.1): meta_query _thumbnail_id > 0 NUMERIC, orderby=date DESC, exclusao multilingue.
 */
function rr_query_for_section( $args = array() ) {
	$defaults = array(
		'posts_per_page'      => 8,
		'no_found_rows'       => true,
		'ignore_sticky_posts' => true,
		'orderby'             => 'date',
		'order'               => 'DESC',
		'category__not_in'    => rr_excluded_lang_cat_ids(),
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
		$merged['category__not_in'] = rr_excluded_lang_cat_ids();
	}
	return new WP_Query( $merged );
}

/**
 * Paginated collector: itera ate 8 paginas, acumulando `post__not_in`.
 * Para cada lote, filtra has_post_thumbnail() + arquivo no disco + titulo PT-BR.
 * Retorna array de IDs (até $target).
 */
function rr_collect_ids_with_thumb( $args, $target ) {
	$ids = array();
	$exclude = isset( $args['post__not_in'] ) ? (array) $args['post__not_in'] : array();
	$per_page = max( $target * 3, 12 );
	$max_pages = 8;
	for ( $page = 1; $page <= $max_pages; $page++ ) {
		$q_args = array_merge( $args, array(
			'posts_per_page' => $per_page,
			'paged'          => $page,
			'post__not_in'   => $exclude,
			'no_found_rows'  => true,
		) );
		$q = rr_query_for_section( $q_args );
		if ( ! $q->have_posts() ) { wp_reset_postdata(); break; }
		while ( $q->have_posts() ) {
			$q->the_post();
			$pid = get_the_ID();
			if ( ! has_post_thumbnail( $pid ) ) { continue; }
			if ( ! rr_thumb_file_exists( $pid ) ) { continue; }
			if ( ! rr_title_looks_ptbr( get_the_title() ) ) { continue; }
			if ( in_array( $pid, $ids, true ) ) { continue; }
			$ids[] = $pid;
			$exclude[] = $pid;
			if ( count( $ids ) >= $target ) { break 2; }
		}
		wp_reset_postdata();
		if ( count( $q->posts ) < $per_page ) { break; }
	}
	return $ids;
}

function rr_relative_time( $post_id = null ) {
	$post_id = $post_id ?: get_the_ID();
	$pub  = get_the_time( 'U', $post_id );
	$now  = current_time( 'timestamp' );
	$diff = $now - $pub;
	if ( $diff < 60 ) { return 'agora'; }
	if ( $diff < 3600 ) { $m = floor( $diff / 60 ); return "há {$m} min"; }
	if ( $diff < 86400 ) { $h = floor( $diff / 3600 ); return "há {$h}h"; }
	if ( $diff < 604800 ) { $d = floor( $diff / 86400 ); return $d === 1 ? "há 1 dia" : "há {$d} dias"; }
	return rr_date_pt( $post_id );
}

/* date_format=j_F_Y => "5 de junho de 2026" */
function rr_date_pt( $post_id = null ) {
	$post_id = $post_id ?: get_the_ID();
	$months = array( '', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro' );
	$ts = get_the_time( 'U', $post_id );
	$d  = (int) date( 'j', $ts );
	$m  = (int) date( 'n', $ts );
	$y  = (int) date( 'Y', $ts );
	return $d . ' de ' . $months[ $m ] . ' de ' . $y;
}

function rr_primary_category( $post_id = null ) {
	$post_id = $post_id ?: get_the_ID();
	$cats = get_the_category( $post_id );
	if ( empty( $cats ) ) { return null; }
	foreach ( $cats as $c ) {
		if ( $c->slug !== 'uncategorized' ) { return $c; }
	}
	return $cats[0];
}

function rr_read_time( $post_id = null ) {
	$post_id = $post_id ?: get_the_ID();
	$content = get_post_field( 'post_content', $post_id );
	$words = str_word_count( wp_strip_all_tags( $content ) );
	$min = max( 1, (int) round( $words / 220 ) );
	return $min . ' min';
}

/**
 * Card padrao (image_top, 16x9, regra 2.2: return early se nao tem thumb).
 */
function rr_card_default() {
	if ( ! has_post_thumbnail() ) { return; }
	$cat = rr_primary_category();
	?>
	<article class="rr-card">
		<a class="rr-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
			<?php the_post_thumbnail( 'rr-card', array( 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
		</a>
		<div class="rr-card__body">
			<?php if ( $cat ) : ?>
				<a class="rr-card__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
			<?php endif; ?>
			<h3 class="rr-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
			<div class="rr-card__meta">
				<?php echo esc_html( rr_relative_time() ); ?>
				<?php // meta_visibility=category_readtime ?>
				<span> | <?php echo esc_html( rr_read_time() ); ?> de leitura</span>
			</div>
		</div>
	</article>
	<?php
}

/**
 * Stream card (full-width, image-left/right alternando via CSS).
 */
function rr_card_stream() {
	if ( ! has_post_thumbnail() ) { return; }
	$cat = rr_primary_category();
	?>
	<article class="rr-stream-card">
		<a class="rr-stream-card__media-wrap" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
			<span class="rr-stream-card__media">
				<?php the_post_thumbnail( 'rr-stream', array( 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
			</span>
		</a>
		<div class="rr-stream-card__body">
			<?php if ( $cat ) : ?>
				<a class="rr-stream-card__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
			<?php endif; ?>
			<h3 class="rr-stream-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
			<p class="rr-stream-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 32 ) ); ?></p>
			<div class="rr-stream-card__meta">
				<span><?php echo esc_html( rr_relative_time() ); ?></span>
				<span> | <?php echo esc_html( rr_read_time() ); ?> de leitura</span>
			</div>
		</div>
	</article>
	<?php
}

/**
 * Hero feature (1 post grande, primeiro do slider, LCP image).
 */
function rr_card_hero_feature( $is_lcp = false ) {
	if ( ! has_post_thumbnail() ) { return; }
	$cat = rr_primary_category();
	$img_attrs = $is_lcp
		? array( 'loading' => 'eager', 'fetchpriority' => 'high', 'decoding' => 'async' )
		: array( 'loading' => 'eager', 'decoding' => 'async' );
	?>
	<article class="rr-hero__feature">
		<a class="rr-hero__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
			<?php the_post_thumbnail( 'rr-hero', $img_attrs ); ?>
		</a>
		<div class="rr-hero__body">
			<?php if ( $cat ) : ?>
				<a class="rr-hero__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
			<?php endif; ?>
			<h2 class="rr-hero__feature-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
			<p class="rr-hero__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 28 ) ); ?></p>
		</div>
	</article>
	<?php
}

/**
 * Hero secondary card (col direita do slider).
 */
function rr_card_hero_small() {
	if ( ! has_post_thumbnail() ) { return; }
	$cat = rr_primary_category();
	?>
	<article class="rr-hero__small">
		<a class="rr-hero__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
			<?php the_post_thumbnail( 'rr-card', array( 'loading' => 'eager', 'decoding' => 'async' ) ); ?>
		</a>
		<div class="rr-hero__small-body">
			<?php if ( $cat ) : ?>
				<span class="rr-hero__small-cat"><?php echo esc_html( $cat->name ); ?></span>
			<?php endif; ?>
			<h3 class="rr-hero__small-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
		</div>
	</article>
	<?php
}

/**
 * Archive card (editorial column, image-left + body-right).
 */
function rr_card_archive() {
	if ( ! has_post_thumbnail() ) { return; }
	$cat = rr_primary_category();
	?>
	<article class="rr-archive-card">
		<a class="rr-archive-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
			<?php the_post_thumbnail( 'rr-stream', array( 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
		</a>
		<div class="rr-archive-card__body">
			<?php if ( $cat ) : ?>
				<a class="rr-archive-card__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
			<?php endif; ?>
			<h2 class="rr-archive-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
			<p class="rr-archive-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 30 ) ); ?></p>
			<div class="rr-archive-card__meta">
				<?php echo esc_html( rr_date_pt() ); ?> | <?php echo esc_html( rr_read_time() ); ?> de leitura
			</div>
		</div>
	</article>
	<?php
}

function rr_today_pt_long() {
	$days = array( 'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado' );
	$months = array( '', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro' );
	$ts = current_time( 'timestamp' );
	$dn = (int) date( 'w', $ts );
	$d  = (int) date( 'j', $ts );
	$m  = (int) date( 'n', $ts );
	return ucfirst( $days[ $dn ] ) . ', ' . $d . ' de ' . $months[ $m ];
}

/**
 * Split a menu structure (or top categories) into two halves: left + right of logo.
 * Used by header H3 centered split.
 */
function rr_split_top_categories( $count = 6 ) {
	$cats = get_categories( array(
		'orderby'    => 'count',
		'order'      => 'DESC',
		'number'     => $count,
		'hide_empty' => true,
		'exclude'    => rr_excluded_lang_cat_ids(),
	) );
	$half = (int) ceil( count( $cats ) / 2 );
	return array(
		'left'  => array_slice( $cats, 0, $half ),
		'right' => array_slice( $cats, $half ),
	);
}
