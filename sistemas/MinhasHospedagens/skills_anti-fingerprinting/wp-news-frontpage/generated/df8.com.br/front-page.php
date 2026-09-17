<?php
/**
 * Portal: DF8 News (df8.com.br)
 * Front-page archetype B: Magazine Feature (Veja-style).
 *  Hero lead (image-left + title+excerpt+rail right)
 *  Features grid (4 cards image-top)
 *  Section "Notícias" (4 cards)
 *  Columns row (avatar + nome + título 4 colunas)
 *  Section "Insights" (4 cards)
 *  Section "Entretenimento" (4 cards)
 *  AD slot
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();

$used = array();

// HERO lead (1 post grande)
$hero_ids = d8_collect_ids_with_thumb( array( 'posts_per_page' => 1 ), 1 );
$used = array_merge( $used, $hero_ids );

// HERO sublist (4 manchetes secundárias)
$sub_ids = d8_collect_ids_with_thumb( array( 'post__not_in' => $used, 'posts_per_page' => 4 ), 4 );
$used = array_merge( $used, $sub_ids );

// FEATURES grid (4 cards)
$feat_ids = d8_collect_ids_with_thumb( array( 'post__not_in' => $used, 'posts_per_page' => 4 ), 4 );
$used = array_merge( $used, $feat_ids );

// SECTION 1: Notícias (cat 41, slug noticias)
$noticias_term = get_category_by_slug( 'noticias' );
$s1_args = array( 'post__not_in' => $used, 'posts_per_page' => 4 );
if ( $noticias_term ) { $s1_args['cat'] = $noticias_term->term_id; }
$s1_ids = d8_collect_ids_with_thumb( $s1_args, 4 );
$used = array_merge( $used, $s1_ids );

// COLUMNS row (4 colunistas, posts recentes)
$col_ids = d8_collect_ids_with_thumb( array( 'post__not_in' => $used, 'posts_per_page' => 4 ), 4 );
$used = array_merge( $used, $col_ids );

// SECTION 2: Insights (cat 39, maior categoria do portal)
$insights_term = get_category_by_slug( 'insights' );
$s2_args = array( 'post__not_in' => $used, 'posts_per_page' => 4 );
if ( $insights_term ) { $s2_args['cat'] = $insights_term->term_id; }
$s2_ids = d8_collect_ids_with_thumb( $s2_args, 4 );
$used = array_merge( $used, $s2_ids );

// SECTION 3: Entretenimento (cat 40)
$ent_term = get_category_by_slug( 'entretenimento' );
$s3_args = array( 'post__not_in' => $used, 'posts_per_page' => 4 );
if ( $ent_term ) { $s3_args['cat'] = $ent_term->term_id; }
$s3_ids = d8_collect_ids_with_thumb( $s3_args, 4 );
?>

<main id="d8-main" class="d8-main" role="main">
	<div class="d8-container">

		<?php // ===== HERO LEAD ===== ?>
		<?php if ( ! empty( $hero_ids ) ) : ?>
		<section class="d8-hero" aria-label="Manchete principal">
			<?php
			global $post;
			$_orig = $post;
			foreach ( $hero_ids as $hid ) {
				$post = get_post( $hid );
				setup_postdata( $post );
				d8_hero_lead();
			}
			$post = $_orig;
			wp_reset_postdata();
			?>
			<aside class="d8-hero__rail" aria-label="Sub-manchetes">
				<h3>Em destaque</h3>
				<?php d8_hero_sublist( $sub_ids ); ?>
			</aside>
		</section>
		<?php endif; ?>

		<?php // ===== AD TOP ===== ?>
		<div class="d8-ad" aria-label="Espaço publicitário">
			<div class="d8-ad__inner">
				<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-PORTAL_PUB_ID" data-ad-slot="D8_SLOT_HOME_TOP" data-ad-format="auto" data-full-width-responsive="true"></ins>
			</div>
		</div>

		<?php // ===== FEATURES GRID 4 ===== ?>
		<?php if ( ! empty( $feat_ids ) ) : ?>
		<section class="d8-features" aria-label="Destaques">
			<div class="d8-features__grid">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $feat_ids as $fid ) {
					$post = get_post( $fid );
					setup_postdata( $post );
					d8_card_default();
				}
				$post = $_orig;
				wp_reset_postdata();
				?>
			</div>
		</section>
		<?php endif; ?>

		<?php // ===== SECTION Notícias ===== ?>
		<?php if ( ! empty( $s1_ids ) ) : ?>
		<section class="d8-section" aria-label="Notícias">
			<div class="d8-section__head">
				<h2 class="d8-section__title"><?php echo esc_html( $noticias_term ? $noticias_term->name : 'Notícias' ); ?></h2>
				<?php if ( $noticias_term ) : ?>
					<a class="d8-section__more" href="<?php echo esc_url( get_category_link( $noticias_term->term_id ) ); ?>">Ver todas</a>
				<?php endif; ?>
			</div>
			<div class="d8-section__grid">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $s1_ids as $id ) {
					$post = get_post( $id );
					setup_postdata( $post );
					d8_card_default();
				}
				$post = $_orig;
				wp_reset_postdata();
				?>
			</div>
		</section>
		<?php endif; ?>

		<?php // ===== COLUMNS ROW ===== ?>
		<?php if ( ! empty( $col_ids ) ) : ?>
		<section class="d8-columns" aria-label="Colunas">
			<div class="d8-columns__head">
				<h3 class="d8-columns__title">Colunas</h3>
			</div>
			<div class="d8-columns__grid">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $col_ids as $cid ) {
					$post = get_post( $cid );
					setup_postdata( $post );
					d8_column_card();
				}
				$post = $_orig;
				wp_reset_postdata();
				?>
			</div>
		</section>
		<?php endif; ?>

		<?php // ===== SECTION Insights ===== ?>
		<?php if ( ! empty( $s2_ids ) ) : ?>
		<section class="d8-section" aria-label="Insights">
			<div class="d8-section__head">
				<h2 class="d8-section__title"><?php echo esc_html( $insights_term ? $insights_term->name : 'Insights' ); ?></h2>
				<?php if ( $insights_term ) : ?>
					<a class="d8-section__more" href="<?php echo esc_url( get_category_link( $insights_term->term_id ) ); ?>">Ver todas</a>
				<?php endif; ?>
			</div>
			<div class="d8-section__grid">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $s2_ids as $id ) {
					$post = get_post( $id );
					setup_postdata( $post );
					d8_card_default();
				}
				$post = $_orig;
				wp_reset_postdata();
				?>
			</div>
		</section>
		<?php endif; ?>

		<?php // ===== AD MID ===== ?>
		<div class="d8-ad" aria-label="Espaço publicitário">
			<div class="d8-ad__inner">
				<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-PORTAL_PUB_ID" data-ad-slot="D8_SLOT_HOME_MID" data-ad-format="auto" data-full-width-responsive="true"></ins>
			</div>
		</div>

		<?php // ===== SECTION Entretenimento ===== ?>
		<?php if ( ! empty( $s3_ids ) ) : ?>
		<section class="d8-section" aria-label="Entretenimento">
			<div class="d8-section__head">
				<h2 class="d8-section__title"><?php echo esc_html( $ent_term ? $ent_term->name : 'Entretenimento' ); ?></h2>
				<?php if ( $ent_term ) : ?>
					<a class="d8-section__more" href="<?php echo esc_url( get_category_link( $ent_term->term_id ) ); ?>">Ver todas</a>
				<?php endif; ?>
			</div>
			<div class="d8-section__grid">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $s3_ids as $id ) {
					$post = get_post( $id );
					setup_postdata( $post );
					d8_card_default();
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
