<?php
/**
 * Helpers Exquisito Wire
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function exq_excluded_lang_cat_ids() {
	static $cache = null;
	if ( $cache !== null ) { return $cache; }
	$slugs = array(); // operador adiciona se houver categorias multilang
	$ids = array();
	foreach ( $slugs as $slug ) {
		$term = get_category_by_slug( $slug );
		if ( $term ) { $ids[] = (int) $term->term_id; }
	}
	$cache = $ids;
	return $ids;
}

function exq_title_looks_ptbr( $title ) {
	if ( preg_match( '/[áàâãäéèêëíïîóôõöúüùûçÁÀÂÃÄÉÈÊËÍÏÎÓÔÕÖÚÜÙÛÇ]/u', $title ) ) { return true; }
	if ( preg_match( '/\\b(de|do|da|dos|das|em|no|na|nos|nas|que|com|para|por|pelo|pela|sobre|sua|seu|este|esta|esse|essa|isso|aqui|onde|quando|como|sem|mais|menos|porque|tem)\\b/iu', $title ) ) { return true; }
	return false;
}

/**
 * Cover URL: tenta featured image primeiro. Se não houver, extrai a primeira
 * <img> do post_content (imagem real do próprio post, NÃO placeholder).
 * Retorna null se o post não tiver nenhuma imagem (caso em que o card é pulado).
 *
 * Justificativa: Antonio (importer QMIX) publica posts sem featured image, mas
 * com imagens inline. Bloquear esses posts esconde os mais recentes da home.
 * Aceitar inline preserva ordem cronológica sem cair em placeholder.
 */
function exq_first_inline_image_url( $post_id = null ) {
	$post_id = $post_id ?: get_the_ID();
	$content = get_post_field( 'post_content', $post_id );
	if ( ! $content ) { return null; }
	if ( preg_match( '/<img[^>]+src=["\']([^"\']+)["\']/i', $content, $m ) ) {
		$src = trim( $m[1] );
		if ( $src && filter_var( $src, FILTER_VALIDATE_URL ) ) { return $src; }
	}
	return null;
}

function exq_post_cover_url( $id = null, $size = 'large' ) {
	$id = $id ?: get_the_ID();
	if ( has_post_thumbnail( $id ) ) {
		$url = get_the_post_thumbnail_url( $id, $size );
		if ( $url ) { return $url; }
	}
	return exq_first_inline_image_url( $id );
}

function exq_has_cover( $id = null ) {
	return exq_post_cover_url( $id, 'thumbnail' ) !== null;
}

/**
 * Query padrão da home: ordem cronológica reversa (date DESC), sem filtro de
 * thumbnail no SQL — o filtro de cover acontece no PHP via exq_collect_ids_with_thumb.
 */
function exq_query_for_section( $args = array() ) {
	$defaults = array(
		'posts_per_page'      => 5,
		'no_found_rows'       => true,
		'ignore_sticky_posts' => true,
		'orderby'             => 'date',
		'order'               => 'DESC',
		'category__not_in'    => exq_excluded_lang_cat_ids(),
	);
	$merged = wp_parse_args( $args, $defaults );
	if ( ! empty( $args['cat'] ) && empty( $args['category__not_in'] ) ) {
		$merged['category__not_in'] = exq_excluded_lang_cat_ids();
	}
	return new WP_Query( $merged );
}

/**
 * Coleta IDs dos N posts mais recentes em ordem cronológica reversa estrita.
 * Sem filtro de imagem, sem heurística PT-BR. Ordem por post_date DESC.
 * Cards renderizam text-only quando não há cover.
 */
function exq_collect_ids_with_thumb( $args, $target ) {
	$args['posts_per_page'] = $target;
	$q   = exq_query_for_section( $args );
	$ids = array();
	while ( $q->have_posts() ) {
		$q->the_post();
		$ids[] = get_the_ID();
	}
	wp_reset_postdata();
	return $ids;
}

/**
 * Alias legacy: usado por templates antigos. Sempre retorna cover (featured ou inline).
 */
function exq_post_image_url( $id = null, $size = 'large' ) {
	return exq_post_cover_url( $id, $size );
}

function exq_relative_time( $post_id = null ) {
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

function exq_primary_category( $post_id = null ) {
	$post_id = $post_id ?: get_the_ID();
	$cats = get_the_category( $post_id );
	if ( empty( $cats ) ) { return null; }
	foreach ( $cats as $c ) {
		if ( $c->slug !== 'uncategorized' ) { return $c; }
	}
	return $cats[0];
}

function exq_card_default() {
	$img = exq_post_cover_url( get_the_ID(), 'large' );
	$cat = exq_primary_category();
	?>
	<article class="exq-card<?php echo $img ? '' : ' exq-card--text'; ?>">
		<?php if ( $img ) : ?>
		<a class="exq-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
			<img src="<?php echo esc_attr( $img ); ?>" alt="" loading="lazy" decoding="async">
		</a>
		<?php endif; ?>
		<?php if ( $cat ) : ?>
			<a class="exq-card__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
		<?php endif; ?>
		<h3 class="exq-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
		<div class="exq-card__meta"><?php echo esc_html( exq_relative_time() ); ?></div>
	</article>
	<?php
}

function exq_hero_main() {
	$img = exq_post_cover_url( get_the_ID(), 'full' );
	$cat = exq_primary_category();
	?>
	<a class="exq-hero__main<?php echo $img ? '' : ' exq-hero__main--text'; ?>" href="<?php the_permalink(); ?>">
		<?php if ( $img ) : ?>
		<img src="<?php echo esc_attr( $img ); ?>" alt="" loading="eager" fetchpriority="high" decoding="async">
		<div class="exq-hero__overlay"></div>
		<?php endif; ?>
		<div class="exq-hero__body">
			<?php if ( $cat ) : ?>
				<span class="exq-hero__cat"><?php echo esc_html( $cat->name ); ?></span>
			<?php endif; ?>
			<h2 class="exq-hero__title"><?php the_title(); ?></h2>
			<?php $excerpt = get_the_excerpt(); if ( $excerpt ) : ?>
				<p class="exq-hero__excerpt"><?php echo esc_html( wp_trim_words( $excerpt, 22 ) ); ?></p>
			<?php endif; ?>
		</div>
	</a>
	<?php
}

function exq_hero_feat() {
	$img = exq_post_cover_url( get_the_ID(), 'large' );
	$cat = exq_primary_category();
	?>
	<a class="exq-hero__feat<?php echo $img ? '' : ' exq-hero__feat--text'; ?>" href="<?php the_permalink(); ?>">
		<?php if ( $img ) : ?>
		<div class="exq-hero__feat-media">
			<img src="<?php echo esc_attr( $img ); ?>" alt="" loading="eager" decoding="async">
		</div>
		<div class="exq-hero__feat-overlay"></div>
		<?php endif; ?>
		<div class="exq-hero__feat-body">
			<?php if ( $cat ) : ?>
				<span class="exq-hero__feat-cat"><?php echo esc_html( $cat->name ); ?></span>
			<?php endif; ?>
			<h3 class="exq-hero__feat-title"><?php the_title(); ?></h3>
		</div>
	</a>
	<?php
}

function exq_stream_card() {
	$img = exq_post_cover_url( get_the_ID(), 'large' );
	$cat = exq_primary_category();
	?>
	<article class="exq-stream__card<?php echo $img ? '' : ' exq-stream__card--text'; ?>">
		<?php if ( $img ) : ?>
		<a class="exq-stream__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
			<img src="<?php echo esc_attr( $img ); ?>" alt="" loading="lazy" decoding="async">
		</a>
		<?php endif; ?>
		<div class="exq-stream__body">
			<?php if ( $cat ) : ?>
				<a class="exq-stream__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
			<?php endif; ?>
			<h3 class="exq-stream__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
			<?php $excerpt = get_the_excerpt(); if ( $excerpt ) : ?>
				<p class="exq-stream__excerpt"><?php echo esc_html( wp_trim_words( $excerpt, 28 ) ); ?></p>
			<?php endif; ?>
			<div class="exq-stream__meta">
				<span><?php echo esc_html( exq_relative_time() ); ?></span>
				<span aria-hidden="true">&middot;</span>
				<span>Por <?php echo esc_html( get_the_author() ); ?></span>
			</div>
		</div>
	</article>
	<?php
}

function exq_widget_item() {
	$img = exq_post_cover_url( get_the_ID(), 'medium' );
	$cat = exq_primary_category();
	?>
	<li class="exq-widget__item<?php echo $img ? '' : ' exq-widget__item--text'; ?>">
		<?php if ( $img ) : ?>
		<a class="exq-widget__thumb" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
			<img src="<?php echo esc_attr( $img ); ?>" alt="" loading="lazy" decoding="async">
		</a>
		<?php endif; ?>
		<div>
			<?php if ( $cat ) : ?>
				<a class="exq-widget__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
			<?php endif; ?>
			<a class="exq-widget__title-link" href="<?php the_permalink(); ?>"><?php echo esc_html( wp_trim_words( get_the_title(), 14, '…' ) ); ?></a>
		</div>
	</li>
	<?php
}

/**
 * Avatar URL com fallback: gravatar OR SVG placeholder com inicial.
 * Evita avatares quebrados de plugins desativados (simple-local-avatars com URLs legacy).
 */
function exq_avatar_url( $author_id, $size = 72 ) {
	$email = get_the_author_meta( 'user_email', $author_id );
	$hash  = $email ? md5( strtolower( trim( $email ) ) ) : '';
	$url   = "https://secure.gravatar.com/avatar/{$hash}?s={$size}&d=mp&r=g";
	return $url;
}

function exq_today_pt_long() {
	$days = array( 'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado' );
	$months = array( '', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro' );
	$ts = current_time( 'timestamp' );
	$dn = (int) date( 'w', $ts );
	$d  = (int) date( 'j', $ts );
	$m  = (int) date( 'n', $ts );
	return ucfirst( $days[ $dn ] ) . ', ' . $d . ' de ' . $months[ $m ];
}
