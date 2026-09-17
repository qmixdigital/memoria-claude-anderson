<?php
/**
 * Front-page archetype A: print-matched layout
 *  Trending strip (4 manchetes)
 *  AD slot horizontal
 *  Layout 3 col: sidebar Recentes | Hero cover | Rail Geral
 *  Section "Notícias Brasil" 3x2 cards
 *  Section "Insights" 3x2 cards
 *  AD slot
 *  Footer (template)
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();

// Coleta IDs (com thumb) para cada bloco, sem repetir.
$used = array();

// HERO (1 post da categoria mais ativa, com thumb)
$hero_ids = adon_collect_ids_with_thumb( array( 'posts_per_page' => 1 ), 1 );
$used = array_merge( $used, $hero_ids );

// TRENDING strip (4 manchetes)
$trend_ids = adon_collect_ids_with_thumb( array( 'post__not_in' => $used, 'posts_per_page' => 4 ), 4 );
$used = array_merge( $used, $trend_ids );

// RECENTES (sidebar esquerda: 6 posts)
$recent_ids = adon_collect_ids_with_thumb( array( 'post__not_in' => $used, 'posts_per_page' => 6 ), 6 );
$used = array_merge( $used, $recent_ids );

// RAIL Geral: categoria "Geral" preferencialmente, 1 featured + 4 list
$geral_term = get_category_by_slug( 'geral' );
$rail_args  = array( 'post__not_in' => $used, 'posts_per_page' => 5 );
if ( $geral_term ) { $rail_args['cat'] = $geral_term->term_id; }
$rail_ids = adon_collect_ids_with_thumb( $rail_args, 5 );
if ( count( $rail_ids ) < 5 ) {
	$extra = adon_collect_ids_with_thumb( array( 'post__not_in' => array_merge( $used, $rail_ids ) ), 5 - count( $rail_ids ) );
	$rail_ids = array_merge( $rail_ids, $extra );
}
$used = array_merge( $used, $rail_ids );

// SECTION 1: "Notícias Brasil" (categoria Notícias, 6 posts)
$noticias_term = get_category_by_slug( 'noticias' );
$s1_args = array( 'post__not_in' => $used, 'posts_per_page' => 6 );
if ( $noticias_term ) { $s1_args['cat'] = $noticias_term->term_id; }
$s1_ids = adon_collect_ids_with_thumb( $s1_args, 6 );
$used = array_merge( $used, $s1_ids );

// SECTION 2: "Insights" (categoria Insights, 6 posts)
$insights_term = get_category_by_slug( 'insights' );
$s2_args = array( 'post__not_in' => $used, 'posts_per_page' => 6 );
if ( $insights_term ) { $s2_args['cat'] = $insights_term->term_id; }
$s2_ids = adon_collect_ids_with_thumb( $s2_args, 6 );
$used = array_merge( $used, $s2_ids );

// SECTION 3: "Entretenimento" (categoria Entretenimento, 6 posts)
$ent_term = get_category_by_slug( 'entretenimento' );
$s3_args = array( 'post__not_in' => $used, 'posts_per_page' => 6 );
if ( $ent_term ) { $s3_args['cat'] = $ent_term->term_id; }
$s3_ids = adon_collect_ids_with_thumb( $s3_args, 6 );
?>

<?php // ===== TRENDING STRIP ===== ?>
<?php if ( ! empty( $trend_ids ) ) : ?>
<section class="adon-trend-strip" aria-label="Em destaque">
	<div class="adon-trend-strip__grid">
		<?php foreach ( $trend_ids as $tid ) : $post = get_post( $tid ); setup_postdata( $post ); ?>
			<?php adon_trend_item(); ?>
		<?php endforeach; wp_reset_postdata(); ?>
	</div>
</section>
<?php endif; ?>

<?php // ===== AD SLOT TOP ===== ?>
<div class="adon-container" style="margin-top:24px;">
	<div class="adon-ad" aria-label="Espaço publicitário">
		<div class="adon-ad__inner">
			<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-PORTAL_PUB_ID" data-ad-slot="ADON_SLOT_HOME_TOP" data-ad-format="auto" data-full-width-responsive="true"></ins>
		</div>
	</div>
</div>

<main id="adon-main" class="adon-main" role="main">
	<div class="adon-layout">

		<?php // ===== LEFT SIDEBAR: Recentes ===== ?>
		<aside class="adon-recent" aria-label="Posts recentes">
			<div class="adon-recent__head">
				<h2 class="adon-recent__title">Recentes</h2>
				<p class="adon-recent__sub">Veja os posts mais recentes</p>
			</div>
			<ul class="adon-recent__list">
				<?php foreach ( $recent_ids as $rid ) : $post = get_post( $rid ); setup_postdata( $post ); ?>
					<?php adon_card_compact(); ?>
				<?php endforeach; wp_reset_postdata(); ?>
			</ul>
		</aside>

		<?php // ===== CENTER: Hero cover + body ===== ?>
		<div class="adon-layout__hero">
			<?php if ( ! empty( $hero_ids ) ) : foreach ( $hero_ids as $hid ) : $post = get_post( $hid ); setup_postdata( $post ); ?>
				<?php adon_cover_hero(); ?>
			<?php endforeach; wp_reset_postdata(); endif; ?>

			<?php // Mid-content ad ?>
			<div class="adon-ad" aria-label="Espaço publicitário">
				<div class="adon-ad__inner">
					<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-PORTAL_PUB_ID" data-ad-slot="ADON_SLOT_HOME_MID" data-ad-format="auto" data-full-width-responsive="true"></ins>
				</div>
			</div>
		</div>

		<?php // ===== RIGHT RAIL: Geral ===== ?>
		<aside class="adon-rail" aria-label="Geral">
			<div class="adon-rail__block">
				<span class="adon-rail__cat-pill">Geral</span>
				<?php
				$first_rail = ! empty( $rail_ids ) ? array_shift( $rail_ids ) : null;
				if ( $first_rail ) {
					$post = get_post( $first_rail ); setup_postdata( $post );
					adon_rail_featured();
					wp_reset_postdata();
				}
				?>
				<ul class="adon-rail__list">
					<?php foreach ( $rail_ids as $rid ) : $post = get_post( $rid ); setup_postdata( $post ); ?>
						<?php adon_card_text(); ?>
					<?php endforeach; wp_reset_postdata(); ?>
				</ul>
			</div>
		</aside>
	</div>

	<?php // ===== SECTION: Notícias Brasil ===== ?>
	<?php if ( ! empty( $s1_ids ) ) : ?>
	<div class="adon-container">
		<section class="adon-section" aria-label="Notícias Brasil">
			<div class="adon-section__head">
				<h2 class="adon-section__title"><?php echo esc_html( $noticias_term ? $noticias_term->name : 'Notícias' ); ?></h2>
				<?php if ( $noticias_term ) : ?>
					<a class="adon-section__more" href="<?php echo esc_url( get_category_link( $noticias_term->term_id ) ); ?>">Ver todas →</a>
				<?php endif; ?>
			</div>
			<div class="adon-section__grid">
				<?php foreach ( $s1_ids as $id ) : $post = get_post( $id ); setup_postdata( $post ); ?>
					<?php adon_card_default(); ?>
				<?php endforeach; wp_reset_postdata(); ?>
			</div>
		</section>
	</div>
	<?php endif; ?>

	<?php // ===== SECTION: Insights ===== ?>
	<?php if ( ! empty( $s2_ids ) ) : ?>
	<div class="adon-container">
		<section class="adon-section" aria-label="Insights">
			<div class="adon-section__head">
				<h2 class="adon-section__title"><?php echo esc_html( $insights_term ? $insights_term->name : 'Insights' ); ?></h2>
				<?php if ( $insights_term ) : ?>
					<a class="adon-section__more" href="<?php echo esc_url( get_category_link( $insights_term->term_id ) ); ?>">Ver todos →</a>
				<?php endif; ?>
			</div>
			<div class="adon-section__grid">
				<?php foreach ( $s2_ids as $id ) : $post = get_post( $id ); setup_postdata( $post ); ?>
					<?php adon_card_default(); ?>
				<?php endforeach; wp_reset_postdata(); ?>
			</div>
		</section>
	</div>
	<?php endif; ?>

	<?php // ===== AD SLOT MID-2 ===== ?>
	<div class="adon-container">
		<div class="adon-ad" aria-label="Espaço publicitário">
			<div class="adon-ad__inner">
				<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-PORTAL_PUB_ID" data-ad-slot="ADON_SLOT_HOME_BOT" data-ad-format="auto" data-full-width-responsive="true"></ins>
			</div>
		</div>
	</div>

	<?php // ===== SECTION: Entretenimento ===== ?>
	<?php if ( ! empty( $s3_ids ) ) : ?>
	<div class="adon-container">
		<section class="adon-section" aria-label="Entretenimento">
			<div class="adon-section__head">
				<h2 class="adon-section__title"><?php echo esc_html( $ent_term ? $ent_term->name : 'Entretenimento' ); ?></h2>
				<?php if ( $ent_term ) : ?>
					<a class="adon-section__more" href="<?php echo esc_url( get_category_link( $ent_term->term_id ) ); ?>">Ver todos →</a>
				<?php endif; ?>
			</div>
			<div class="adon-section__grid">
				<?php foreach ( $s3_ids as $id ) : $post = get_post( $id ); setup_postdata( $post ); ?>
					<?php adon_card_default(); ?>
				<?php endforeach; wp_reset_postdata(); ?>
			</div>
		</section>
	</div>
	<?php endif; ?>

</main>

<?php get_footer(); ?>
