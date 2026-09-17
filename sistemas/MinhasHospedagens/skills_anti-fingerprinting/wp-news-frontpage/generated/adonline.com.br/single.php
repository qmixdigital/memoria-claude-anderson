<?php
/**
 * Single archetype I: Classic news article
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();

while ( have_posts() ) : the_post();
	$cats   = get_the_category();
	$cat    = adon_primary_category();
	$author = get_the_author();
?>

<main id="adon-main" role="main">
<div class="adon-container">
	<nav class="adon-breadcrumb" aria-label="Breadcrumb">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>">Início</a>
		<?php if ( $cat ) : ?>
			<span class="adon-breadcrumb__sep">/</span>
			<a href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
		<?php endif; ?>
		<span class="adon-breadcrumb__sep">/</span>
		<span><?php echo esc_html( wp_trim_words( get_the_title(), 8, '…' ) ); ?></span>
	</nav>
</div>

<article id="post-<?php the_ID(); ?>" <?php post_class( 'adon-post' ); ?>>

	<header class="adon-post__head">
		<?php if ( $cat ) : ?>
			<a class="adon-post__cat" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
		<?php endif; ?>
		<h1 class="adon-post__title"><?php the_title(); ?></h1>
		<div class="adon-post__byline">
			<span>Por <strong><?php echo esc_html( $author ); ?></strong></span>
			<span>·</span>
			<time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( get_the_date( 'j \\d\\e F \\d\\e Y' ) ); ?></time>
			<?php if ( get_the_modified_date( 'Y-m-d' ) !== get_the_date( 'Y-m-d' ) ) : ?>
				<span>·</span>
				<span>Atualizado em <?php echo esc_html( get_the_modified_date( 'j \\d\\e F' ) ); ?></span>
			<?php endif; ?>
		</div>
	</header>

	<?php if ( has_post_thumbnail() ) : ?>
	<figure class="adon-post__lead-image">
		<?php the_post_thumbnail( 'full', array(
			'fetchpriority'   => 'high',
			'decoding'        => 'async',
			'loading'         => 'eager',
			'data-no-lazy'    => '1',
			'class'           => 'no-lazyload',
		) ); ?>
		<?php $caption = get_the_post_thumbnail_caption(); if ( $caption ) : ?>
			<figcaption><?php echo esc_html( $caption ); ?></figcaption>
		<?php endif; ?>
	</figure>
	<?php endif; ?>

	<div class="adon-post__content">
		<?php the_content(); ?>
	</div>

	<div class="adon-post__share" aria-label="Compartilhar">
		<span class="adon-post__share-label">Compartilhar</span>
		<a href="https://wa.me/?text=<?php echo rawurlencode( get_the_title() . ' ' . get_permalink() ); ?>" target="_blank" rel="noopener">WhatsApp</a>
		<a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo rawurlencode( get_permalink() ); ?>" target="_blank" rel="noopener">Facebook</a>
		<a href="https://twitter.com/intent/tweet?url=<?php echo rawurlencode( get_permalink() ); ?>&text=<?php echo rawurlencode( get_the_title() ); ?>" target="_blank" rel="noopener">X</a>
		<a href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo rawurlencode( get_permalink() ); ?>" target="_blank" rel="noopener">LinkedIn</a>
	</div>

	<?php
	// Related posts (same category, exclude current, has thumb, 4 cards)
	$rel_args = array(
		'posts_per_page' => 4,
		'post__not_in'   => array( get_the_ID() ),
	);
	if ( $cat ) { $rel_args['cat'] = $cat->term_id; }
	$rel_ids = adon_collect_ids_with_thumb( $rel_args, 4 );
	if ( ! empty( $rel_ids ) ) :
	?>
	<section class="adon-post__related" aria-label="Posts relacionados">
		<h2 class="adon-post__related-title">Leia também</h2>
		<div class="adon-post__related-grid">
			<?php
			global $post;
			$_orig_post = $post;
			foreach ( $rel_ids as $rid ) :
				$post = get_post( $rid );
				setup_postdata( $post );
				adon_card_default();
			endforeach;
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
