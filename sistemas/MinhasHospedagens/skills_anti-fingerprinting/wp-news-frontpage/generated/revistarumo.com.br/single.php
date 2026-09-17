<?php
/**
 * Portal: Revista Rumo (revistarumo.com.br)
 * Single archetype III: Tabloid (mobile-first, condensed, lots of ads via auto-ads).
 *  Title large + date strip + lead inline (no full-bleed)
 *  byline_position=floating_left (sticky autor avatar lateral no desktop)
 *  in_article_ad_pattern=auto_ads (Google Auto Ads ON, sem slots manuais)
 *  share_buttons_position=bottom_only
 *  related_posts_layout=grid_4
 *  comments_treatment=disabled
 *  Regra 17: $post global em loops manuais.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();

while ( have_posts() ) : the_post();
	$cat       = rr_primary_category();
	$author    = get_the_author();
	$author_id = (int) get_the_author_meta( 'ID' );
	$avatar    = get_avatar_url( $author_id, array( 'size' => 80 ) );
	$bio       = get_the_author_meta( 'description' );
?>

<main id="rr-main" role="main">

<div class="rr-single-wrap">

	<aside class="rr-single__floating" aria-label="Autor e data">
		<div class="rr-single__floating-avatar">
			<img src="<?php echo esc_url( $avatar ); ?>" alt="<?php echo esc_attr( $author ); ?>" width="64" height="64" loading="lazy" decoding="async">
		</div>
		<div class="rr-single__floating-author"><?php echo esc_html( $author ); ?></div>
		<div class="rr-single__floating-date"><?php echo esc_html( rr_date_pt() ); ?></div>
		<div class="rr-single__floating-date"><?php echo esc_html( rr_read_time() ); ?> de leitura</div>
	</aside>

	<article id="post-<?php the_ID(); ?>" <?php post_class( 'rr-single' ); ?>>

		<header class="rr-single__header">
			<?php if ( $cat ) : ?>
				<a class="rr-single__kicker" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
			<?php endif; ?>
			<h1 class="rr-single__title"><?php the_title(); ?></h1>
			<div class="rr-single__date-strip">
				<time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><strong><?php echo esc_html( rr_date_pt() ); ?></strong></time>
				<?php if ( get_the_modified_date( 'Y-m-d' ) !== get_the_date( 'Y-m-d' ) ) : ?>
					<span>Atualizado em <?php echo esc_html( rr_date_pt() ); ?></span>
				<?php endif; ?>
				<span><?php echo esc_html( rr_read_time() ); ?> de leitura</span>
			</div>
		</header>

		<?php if ( has_post_thumbnail() ) : ?>
		<figure class="rr-single__lead">
			<?php the_post_thumbnail( 'large', array(
				'fetchpriority' => 'high', 'decoding' => 'async',
				'loading'       => 'eager', 'data-no-lazy' => '1', 'class' => 'no-lazyload',
			) ); ?>
			<?php $caption = get_the_post_thumbnail_caption(); if ( $caption ) : ?>
				<figcaption><?php echo esc_html( $caption ); ?></figcaption>
			<?php endif; ?>
		</figure>
		<?php endif; ?>

		<div class="rr-single__body">
			<?php the_content(); ?>
		</div>

		<?php // bio compact (author_bio_box=compact) ?>
		<?php if ( $bio ) : ?>
		<section class="rr-single__author" aria-label="Sobre o autor">
			<img src="<?php echo esc_url( get_avatar_url( $author_id, array( 'size' => 96 ) ) ); ?>" alt="<?php echo esc_attr( $author ); ?>" width="48" height="48" loading="lazy" decoding="async">
			<div>
				<div class="rr-single__author-name"><?php echo esc_html( $author ); ?></div>
				<p class="rr-single__author-bio"><?php echo esc_html( wp_trim_words( $bio, 24 ) ); ?></p>
			</div>
		</section>
		<?php endif; ?>

		<?php // share bottom_only ?>
		<div class="rr-single__share" aria-label="Compartilhar">
			<span class="rr-single__share-label">Compartilhe</span>
			<a href="https://wa.me/?text=<?php echo rawurlencode( get_the_title() . ' ' . get_permalink() ); ?>" target="_blank" rel="noopener" aria-label="Compartilhar no WhatsApp">
				<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
			</a>
			<a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo rawurlencode( get_permalink() ); ?>" target="_blank" rel="noopener" aria-label="Compartilhar no Facebook">
				<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 011.141.195v3.325a8.623 8.623 0 00-.653-.036 26.805 26.805 0 00-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 00-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>
			</a>
			<a href="https://twitter.com/intent/tweet?url=<?php echo rawurlencode( get_permalink() ); ?>&text=<?php echo rawurlencode( get_the_title() ); ?>" target="_blank" rel="noopener" aria-label="Compartilhar no X (Twitter)">
				<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
			</a>
			<a href="https://t.me/share/url?url=<?php echo rawurlencode( get_permalink() ); ?>&text=<?php echo rawurlencode( get_the_title() ); ?>" target="_blank" rel="noopener" aria-label="Compartilhar no Telegram">
				<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
			</a>
			<a href="mailto:?subject=<?php echo rawurlencode( get_the_title() ); ?>&body=<?php echo rawurlencode( get_permalink() ); ?>" aria-label="Enviar por e-mail">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
			</a>
		</div>

		<?php
		// Related posts em grid 4 (related_posts_layout=grid_4).
		$rel_args = array(
			'posts_per_page' => 4,
			'post__not_in'   => array( get_the_ID() ),
		);
		if ( $cat ) { $rel_args['cat'] = $cat->term_id; }
		$rel_ids = rr_collect_ids_with_thumb( $rel_args, 4 );

		if ( ! empty( $rel_ids ) ) :
		?>
		<section class="rr-single__related" aria-label="Posts relacionados">
			<h2 class="rr-single__related-title">Veja também</h2>
			<div class="rr-single__related-grid">
				<?php
				global $post;
				$_orig_post = $post;
				foreach ( $rel_ids as $rid ) {
					$post = get_post( $rid );
					setup_postdata( $post );
					rr_card_default();
				}
				$post = $_orig_post;
				wp_reset_postdata();
				?>
			</div>
		</section>
		<?php endif; ?>

	</article>

</div>

</main>

<?php endwhile; ?>

<?php get_footer(); ?>
