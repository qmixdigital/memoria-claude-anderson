<?php
/**
 * Front-page archetype D: Feature-Led Stream
 *  Hero triptych (1 main + 2 side feats)
 *  AD slot
 *  Stream alternating cards (image left/right)
 *  Section "Notícias"
 *  Section "Insights"
 *  AD slot
 *  Section "Viajar"
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();

$used = array();

// HERO main + 4 feats (5 posts no bento grid)
$hero_main_ids = exq_collect_ids_with_thumb( array( 'posts_per_page' => 1 ), 1 );
$used = array_merge( $used, $hero_main_ids );
$hero_feat_ids = exq_collect_ids_with_thumb( array( 'post__not_in' => $used, 'posts_per_page' => 4 ), 4 );
$used = array_merge( $used, $hero_feat_ids );

// STREAM (4 alternating cards)
$stream_ids = exq_collect_ids_with_thumb( array( 'post__not_in' => $used, 'posts_per_page' => 4 ), 4 );
$used = array_merge( $used, $stream_ids );

// SECTION 1 Dicas (substituiu Notícias, que tem muitos posts sem imagem)
$dicas_term = get_category_by_slug( 'dicas' );
$s1_args = array( 'post__not_in' => $used, 'posts_per_page' => 9 );
if ( $dicas_term ) { $s1_args['cat'] = $dicas_term->term_id; }
$s1_ids = exq_collect_ids_with_thumb( $s1_args, 9 );
$used = array_merge( $used, $s1_ids );

// SECTION 2 Insights
$insights_term = get_category_by_slug( 'insights' );
$s2_args = array( 'post__not_in' => $used, 'posts_per_page' => 9 );
if ( $insights_term ) { $s2_args['cat'] = $insights_term->term_id; }
$s2_ids = exq_collect_ids_with_thumb( $s2_args, 9 );
$used = array_merge( $used, $s2_ids );

// SECTION 3 Viajar
$viajar_term = get_category_by_slug( 'viajar' );
$s3_args = array( 'post__not_in' => $used, 'posts_per_page' => 9 );
if ( $viajar_term ) { $s3_args['cat'] = $viajar_term->term_id; }
$s3_ids = exq_collect_ids_with_thumb( $s3_args, 9 );
?>

<main id="exq-main" class="exq-main" role="main">
	<div class="exq-container">

		<?php // HERO BENTO 1+4 ?>
		<?php if ( ! empty( $hero_main_ids ) ) : ?>
		<section class="exq-hero" aria-label="Manchete principal">
			<?php
			global $post;
			$_orig = $post;
			foreach ( $hero_main_ids as $id ) {
				$post = get_post( $id );
				setup_postdata( $post );
				exq_hero_main();
			}
			foreach ( $hero_feat_ids as $id ) {
				$post = get_post( $id );
				setup_postdata( $post );
				exq_hero_feat();
			}
			$post = $_orig;
			wp_reset_postdata();
			?>
		</section>
		<?php endif; ?>

		<?php // AD ?>
		<div class="exq-ad" aria-label="Espaço publicitário">
			<div class="exq-ad__inner">
				<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-PORTAL_PUB_ID" data-ad-slot="EXQ_SLOT_HOME_TOP" data-ad-format="auto" data-full-width-responsive="true"></ins>
			</div>
		</div>

		<?php // STREAM ?>
		<?php if ( ! empty( $stream_ids ) ) : ?>
		<section class="exq-stream" aria-label="Em destaque">
			<?php
			global $post;
			$_orig = $post;
			foreach ( $stream_ids as $id ) {
				$post = get_post( $id );
				setup_postdata( $post );
				exq_stream_card();
			}
			$post = $_orig;
			wp_reset_postdata();
			?>
		</section>
		<?php endif; ?>

		<?php // SECTION Dicas ?>
		<?php if ( ! empty( $s1_ids ) ) : ?>
		<section class="exq-section" aria-label="Dicas">
			<div class="exq-section__head">
				<h2 class="exq-section__title"><?php echo esc_html( $dicas_term ? $dicas_term->name : 'Dicas' ); ?></h2>
				<?php if ( $dicas_term ) : ?>
					<a class="exq-section__more" href="<?php echo esc_url( get_category_link( $dicas_term->term_id ) ); ?>">Ver todas →</a>
				<?php endif; ?>
			</div>
			<div class="exq-section__grid">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $s1_ids as $id ) {
					$post = get_post( $id );
					setup_postdata( $post );
					exq_card_default();
				}
				$post = $_orig;
				wp_reset_postdata();
				?>
			</div>
		</section>
		<?php endif; ?>

		<?php // SECTION Insights ?>
		<?php if ( ! empty( $s2_ids ) ) : ?>
		<section class="exq-section" aria-label="Insights">
			<div class="exq-section__head">
				<h2 class="exq-section__title"><?php echo esc_html( $insights_term ? $insights_term->name : 'Insights' ); ?></h2>
				<?php if ( $insights_term ) : ?>
					<a class="exq-section__more" href="<?php echo esc_url( get_category_link( $insights_term->term_id ) ); ?>">Ver todos →</a>
				<?php endif; ?>
			</div>
			<div class="exq-section__grid">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $s2_ids as $id ) {
					$post = get_post( $id );
					setup_postdata( $post );
					exq_card_default();
				}
				$post = $_orig;
				wp_reset_postdata();
				?>
			</div>
		</section>
		<?php endif; ?>

		<?php // AD ?>
		<div class="exq-ad" aria-label="Espaço publicitário">
			<div class="exq-ad__inner">
				<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-PORTAL_PUB_ID" data-ad-slot="EXQ_SLOT_HOME_MID" data-ad-format="auto" data-full-width-responsive="true"></ins>
			</div>
		</div>

		<?php // SECTION Viajar ?>
		<?php if ( ! empty( $s3_ids ) ) : ?>
		<section class="exq-section" aria-label="Viajar">
			<div class="exq-section__head">
				<h2 class="exq-section__title"><?php echo esc_html( $viajar_term ? $viajar_term->name : 'Viajar' ); ?></h2>
				<?php if ( $viajar_term ) : ?>
					<a class="exq-section__more" href="<?php echo esc_url( get_category_link( $viajar_term->term_id ) ); ?>">Ver todos →</a>
				<?php endif; ?>
			</div>
			<div class="exq-section__grid">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $s3_ids as $id ) {
					$post = get_post( $id );
					setup_postdata( $post );
					exq_card_default();
				}
				$post = $_orig;
				wp_reset_postdata();
				?>
			</div>
		</section>
		<?php endif; ?>

	</div>
</main>

<?php get_footer(); ?>
