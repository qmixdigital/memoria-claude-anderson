<?php
/**
 * Portal: AdVivo (advivo.com.br) - Single arquetipo III (tabloide)
 * Gerado: 09/08/2026
 *
 * Schema de artigo nao sai daqui: quem emite e o Rank Math mais o mu-plugin
 * qmix-news-portal. Duplicar geraria dois nos de NewsArticle na mesma pagina.
 */

get_header();

while ( have_posts() ) :
	the_post();
	$cat = av_cat_do_post();
	?>

	<article class="av-article" itemscope itemtype="https://schema.org/ImageObject">
		<div class="av-wrap">

			<nav class="av-crumb" aria-label="Trilha de navegacao">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>">Início</a>
				<?php if ( $cat ) : ?>
					&rsaquo; <a href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
				<?php endif; ?>
				&rsaquo; <span><?php echo esc_html( wp_trim_words( get_the_title(), 8, '' ) ); ?></span>
			</nav>

			<header class="av-art__head">
				<?php if ( $cat ) : ?>
					<a class="av-art__kicker" href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
				<?php endif; ?>

				<div class="av-art__byline">
					<span>Por <?php the_author(); ?></span>
					<span>&middot;</span>
					<time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( get_the_date( 'j \d\e F \d\e Y' ) ); ?></time>
					<span>&middot;</span>
					<span><?php echo esc_html( av_tempo_leitura() ); ?> min de leitura</span>
				</div>

				<h1 class="av-art__title"><?php the_title(); ?></h1>

				<?php if ( has_excerpt() ) : ?>
					<p class="av-art__dek"><?php echo esc_html( get_the_excerpt() ); ?></p>
				<?php endif; ?>
			</header>

			<?php if ( has_post_thumbnail() ) : ?>
				<figure class="av-art__media">
					<?php the_post_thumbnail( 'av-hero', array( 'loading' => 'eager', 'fetchpriority' => 'high', 'decoding' => 'async' ) ); ?>
					<?php if ( wp_get_attachment_caption( get_post_thumbnail_id() ) ) : ?>
						<figcaption><?php echo esc_html( wp_get_attachment_caption( get_post_thumbnail_id() ) ); ?></figcaption>
					<?php endif; ?>
				</figure>
			<?php endif; ?>

			<div class="av-art__body">
				<?php the_content(); ?>
			</div>

			<div class="av-share">
				<span class="av-share__label">Compartilhar</span>
				<?php
				$url_art = rawurlencode( get_permalink() );
				$tit_art = rawurlencode( get_the_title() );
				?>
				<a href="https://api.whatsapp.com/send/?text=<?php echo $tit_art . '%20' . $url_art; ?>" rel="nofollow noopener" target="_blank">WhatsApp</a>
				<a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $url_art; ?>" rel="nofollow noopener" target="_blank">Facebook</a>
				<a href="https://twitter.com/intent/tweet?url=<?php echo $url_art; ?>&text=<?php echo $tit_art; ?>" rel="nofollow noopener" target="_blank">X</a>
				<a href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo $url_art; ?>" rel="nofollow noopener" target="_blank">LinkedIn</a>
			</div>

			<?php if ( get_the_author_meta( 'description' ) ) : ?>
				<div class="av-author">
					<?php echo get_avatar( get_the_author_meta( 'ID' ), 64 ); ?>
					<div>
						<div class="av-author__name"><?php the_author(); ?></div>
						<p class="av-author__bio"><?php echo esc_html( get_the_author_meta( 'description' ) ); ?></p>
					</div>
				</div>
			<?php endif; ?>

		</div>
	</article>

	<?php
	/* Veja tambem: ids explicitos, sem mexer na global $post. */
	$relacionados = array();
	if ( $cat ) {
		$relacionados = av_ids( 4, array(
			'cat'          => $cat->term_id,
			'post__not_in' => array( get_the_ID() ),
		) );
	}
	if ( count( $relacionados ) < 4 ) {
		$relacionados = array_merge(
			$relacionados,
			av_ids( 4 - count( $relacionados ), array( 'post__not_in' => array_merge( $relacionados, array( get_the_ID() ) ) ) )
		);
	}
	if ( $relacionados ) :
		?>
		<section class="av-sec av-wrap" aria-labelledby="av-veja">
			<div class="av-sec__head">
				<h2 class="av-sec__h" id="av-veja">Veja Também</h2>
			</div>
			<div class="av-grid-3">
				<?php foreach ( array_slice( $relacionados, 0, 3 ) as $rid ) { av_card( $rid, 'default', array( 'size' => 'av-card' ) ); } ?>
			</div>
		</section>
	<?php endif; ?>

	<?php
endwhile;

get_footer();
