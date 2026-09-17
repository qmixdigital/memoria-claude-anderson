<?php
/**
 * Single archetype IV: Sidebar-rich classic
 * Lead image + content em coluna principal, sidebar sticky com widgets:
 * "Mais lidos", "Da mesma editoria", "Newsletter mini".
 * Regra 16: $post global em loops manuais.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();

while ( have_posts() ) : the_post();
	$cat       = exq_primary_category();
	$author    = get_the_author();
	$author_id = (int) get_the_author_meta( 'ID' );
	$avatar    = exq_avatar_url( $author_id, 72 );
	$bio       = get_the_author_meta( 'description' );
?>

<main id="exq-main" role="main">

<div class="exq-container">
	<nav class="exq-breadcrumb" aria-label="Breadcrumb">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>">Início</a>
		<?php if ( $cat ) : ?>
			<span class="exq-breadcrumb__sep">/</span>
			<a href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
		<?php endif; ?>
	</nav>
</div>

<div class="exq-single">
	<article class="exq-single__main" id="post-<?php the_ID(); ?>">
		<header class="exq-post__head">
			<?php if ( $cat ) : ?>
				<a class="exq-post__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
			<?php endif; ?>
			<h1 class="exq-post__title"><?php the_title(); ?></h1>
			<?php $excerpt = get_the_excerpt(); if ( $excerpt ) : ?>
				<p class="exq-post__sub"><?php echo esc_html( wp_trim_words( $excerpt, 28 ) ); ?></p>
			<?php endif; ?>
			<div class="exq-post__byline">
				<div class="exq-post__avatar">
					<img src="<?php echo esc_url( $avatar ); ?>" alt="<?php echo esc_attr( $author ); ?>" width="36" height="36" loading="eager" decoding="async">
				</div>
				<span>Por <strong><?php echo esc_html( $author ); ?></strong></span>
				<span aria-hidden="true">&middot;</span>
				<time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( get_the_date( 'j \\d\\e F \\d\\e Y, H:i' ) ); ?></time>
			</div>
		</header>

		<?php if ( has_post_thumbnail() ) : ?>
		<figure class="exq-post__lead-image">
			<?php the_post_thumbnail( 'full', array(
				'fetchpriority' => 'high', 'decoding' => 'async',
				'loading' => 'eager', 'data-no-lazy' => '1', 'class' => 'no-lazyload',
			) ); ?>
			<?php $caption = get_the_post_thumbnail_caption(); if ( $caption ) : ?>
				<figcaption><?php echo esc_html( $caption ); ?></figcaption>
			<?php endif; ?>
		</figure>
		<?php endif; ?>

		<div class="exq-post__content">
			<?php the_content(); ?>
		</div>

		<div class="exq-post__share" aria-label="Compartilhar">
			<span class="exq-post__share-label">Compartilhar</span>
			<a href="https://wa.me/?text=<?php echo rawurlencode( get_the_title() . ' ' . get_permalink() ); ?>" target="_blank" rel="noopener">WhatsApp</a>
			<a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo rawurlencode( get_permalink() ); ?>" target="_blank" rel="noopener">Facebook</a>
			<a href="https://twitter.com/intent/tweet?url=<?php echo rawurlencode( get_permalink() ); ?>&text=<?php echo rawurlencode( get_the_title() ); ?>" target="_blank" rel="noopener">X</a>
			<a href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo rawurlencode( get_permalink() ); ?>" target="_blank" rel="noopener">LinkedIn</a>
		</div>

		<?php if ( $bio ) : ?>
		<section class="exq-post__author-box" aria-label="Sobre o autor">
			<img src="<?php echo esc_url( get_avatar_url( $author_id, array( 'size' => 160 ) ) ); ?>" alt="<?php echo esc_attr( $author ); ?>" width="80" height="80" loading="lazy" decoding="async">
			<div>
				<h3 class="exq-post__author-box__name"><?php echo esc_html( $author ); ?></h3>
				<p class="exq-post__author-box__bio"><?php echo esc_html( wp_trim_words( $bio, 50 ) ); ?></p>
			</div>
		</section>
		<?php endif; ?>
	</article>

	<aside class="exq-single__sidebar" aria-label="Conteúdo lateral">
		<?php
		// Widget 1: Mais lidos da editoria
		$rel_args = array(
			'posts_per_page' => 5,
			'post__not_in'   => array( get_the_ID() ),
			'orderby'        => 'comment_count',
		);
		if ( $cat ) { $rel_args['cat'] = $cat->term_id; }
		$rel_ids = exq_collect_ids_with_thumb( $rel_args, 5 );
		if ( ! empty( $rel_ids ) ) :
		?>
		<div class="exq-widget">
			<h3 class="exq-widget__title">Mais de <?php echo esc_html( $cat ? $cat->name : 'Exquisito' ); ?></h3>
			<ul class="exq-widget__list">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $rel_ids as $rid ) {
					$post = get_post( $rid );
					setup_postdata( $post );
					exq_widget_item();
				}
				$post = $_orig;
				wp_reset_postdata();
				?>
			</ul>
		</div>
		<?php endif; ?>

		<?php
		// Widget 2: Últimos posts geral
		$latest_ids = exq_collect_ids_with_thumb( array( 'post__not_in' => array_merge( array( get_the_ID() ), $rel_ids ), 'posts_per_page' => 5 ), 5 );
		if ( ! empty( $latest_ids ) ) :
		?>
		<div class="exq-widget">
			<h3 class="exq-widget__title">Últimos posts</h3>
			<ul class="exq-widget__list">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $latest_ids as $rid ) {
					$post = get_post( $rid );
					setup_postdata( $post );
					exq_widget_item();
				}
				$post = $_orig;
				wp_reset_postdata();
				?>
			</ul>
		</div>
		<?php endif; ?>

		<?php // Widget 3: AD ?>
		<div class="exq-ad" aria-label="Espaço publicitário" style="margin:0;">
			<div class="exq-ad__inner">
				<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-PORTAL_PUB_ID" data-ad-slot="EXQ_SLOT_SINGLE_SIDEBAR" data-ad-format="auto" data-full-width-responsive="true"></ins>
			</div>
		</div>
	</aside>
</div>

</main>

<?php endwhile; ?>

<?php get_footer(); ?>
