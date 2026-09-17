<?php
/**
 * Portal: DF8 News (df8.com.br)
 * Single archetype I: Classic news article (G1/Folha-style).
 *  Breadcrumb + kicker + title + byline + lead full-bleed + body + share top + author bio + related 3 inline
 *  Regra 17: $post global em loops manuais (NUNCA setup_postdata($rp) com local var).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();

while ( have_posts() ) : the_post();
	$cat       = d8_primary_category();
	$author    = get_the_author();
	$author_id = (int) get_the_author_meta( 'ID' );
	$avatar    = get_avatar_url( $author_id, array( 'size' => 80 ) );
	$bio       = get_the_author_meta( 'description' );
?>

<main id="d8-main" role="main">

<article id="post-<?php the_ID(); ?>" <?php post_class( 'd8-single' ); ?>>

	<nav class="d8-breadcrumb" aria-label="Breadcrumb">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>">Início</a>
		<?php if ( $cat ) : ?>
			<span class="d8-breadcrumb__sep">&rarr;</span>
			<a href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
		<?php endif; ?>
	</nav>

	<header class="d8-single__head">
		<?php if ( $cat ) : ?>
			<a class="d8-single__kicker" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
		<?php endif; ?>
		<h1 class="d8-single__title"><?php the_title(); ?></h1>
		<?php $excerpt = get_the_excerpt(); if ( $excerpt ) : ?>
			<p class="d8-single__sub"><?php echo esc_html( wp_trim_words( $excerpt, 36 ) ); ?></p>
		<?php endif; ?>
		<div class="d8-single__byline">
			<span><strong>Por <?php echo esc_html( $author ); ?></strong></span>
			<time class="d8-single__time" datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( get_the_date( 'd/m/Y, H:i' ) ); ?></time>
			<?php if ( get_the_modified_date( 'Y-m-d' ) !== get_the_date( 'Y-m-d' ) ) : ?>
				<span class="d8-single__time">Atualizado em <?php echo esc_html( get_the_modified_date( 'd/m/Y' ) ); ?></span>
			<?php endif; ?>
		</div>
	</header>

	<?php if ( has_post_thumbnail() ) : ?>
	<figure class="d8-single__lead">
		<?php the_post_thumbnail( 'full', array(
			'fetchpriority' => 'high', 'decoding' => 'async',
			'loading'       => 'eager', 'data-no-lazy' => '1', 'class' => 'no-lazyload',
		) ); ?>
		<?php $caption = get_the_post_thumbnail_caption(); if ( $caption ) : ?>
			<figcaption><?php echo esc_html( $caption ); ?></figcaption>
		<?php endif; ?>
	</figure>
	<?php endif; ?>

	<div class="d8-single__share" aria-label="Compartilhar">
		<span class="d8-single__share-label">Compartilhar</span>
		<a href="https://wa.me/?text=<?php echo rawurlencode( get_the_title() . ' ' . get_permalink() ); ?>" target="_blank" rel="noopener" aria-label="Compartilhar no WhatsApp">
			<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
		</a>
		<a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo rawurlencode( get_permalink() ); ?>" target="_blank" rel="noopener" aria-label="Compartilhar no Facebook">
			<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 011.141.195v3.325a8.623 8.623 0 00-.653-.036 26.805 26.805 0 00-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 00-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>
		</a>
		<a href="https://twitter.com/intent/tweet?url=<?php echo rawurlencode( get_permalink() ); ?>&text=<?php echo rawurlencode( get_the_title() ); ?>" target="_blank" rel="noopener" aria-label="Compartilhar no X (Twitter)">
			<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
		</a>
		<a href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo rawurlencode( get_permalink() ); ?>" target="_blank" rel="noopener" aria-label="Compartilhar no LinkedIn">
			<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z"/></svg>
		</a>
		<a href="mailto:?subject=<?php echo rawurlencode( get_the_title() ); ?>&body=<?php echo rawurlencode( get_permalink() ); ?>" aria-label="Enviar por e-mail">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
		</a>
	</div>

	<div class="d8-single__body">
		<?php the_content(); ?>
	</div>

	<?php if ( $bio ) : ?>
	<section class="d8-single__author-box" aria-label="Sobre o autor">
		<img src="<?php echo esc_url( get_avatar_url( $author_id, array( 'size' => 160 ) ) ); ?>" alt="<?php echo esc_attr( $author ); ?>" width="80" height="80" loading="lazy" decoding="async">
		<div>
			<h3 class="d8-single__author-box__name"><?php echo esc_html( $author ); ?></h3>
			<p class="d8-single__author-box__bio"><?php echo esc_html( wp_trim_words( $bio, 50 ) ); ?></p>
			<a class="d8-single__author-box__more" href="<?php echo esc_url( get_author_posts_url( $author_id ) ); ?>">Mais textos do autor</a>
		</div>
	</section>
	<?php endif; ?>

	<?php
	// Related posts em grid 3 (inline_3_during_content visual: bloco após author bio).
	$rel_args = array(
		'posts_per_page' => 3,
		'post__not_in'   => array( get_the_ID() ),
	);
	if ( $cat ) { $rel_args['cat'] = $cat->term_id; }
	$rel_ids = d8_collect_ids_with_thumb( $rel_args, 3 );

	if ( ! empty( $rel_ids ) ) :
	?>
	<section class="d8-single__related" aria-label="Posts relacionados">
		<h2 class="d8-single__related-title">Veja também</h2>
		<div class="d8-single__related-grid">
			<?php
			global $post;
			$_orig_post = $post;
			foreach ( $rel_ids as $rid ) {
				$post = get_post( $rid );
				setup_postdata( $post );
				d8_card_default();
			}
			$post = $_orig_post;
			wp_reset_postdata();
			?>
		</div>
	</section>
	<?php endif; ?>

</article>

</main>

<?php endwhile; ?>

<?php get_footer(); ?>
