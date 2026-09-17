<?php
/**
 * Front-page archetype B: Magazine Feature (Veja-style).
 *  Hero lead (image-left + title+excerpt+sublist right)
 *  Features grid (4 cards image-top)
 *  Section "Notícias Agora" (4 cards)
 *  Columns row (avatar + nome + título 4 colunas)
 *  Section "Dicas/Insights" (4 cards)
 *  Section "Automotivo" (4 cards)
 *  AD slot
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();

$used = array();

// HERO lead (1 post grande)
$hero_ids = fn_collect_ids_with_thumb( array( 'posts_per_page' => 1 ), 1 );
$used = array_merge( $used, $hero_ids );

// HERO sublist (4 manchetes secundárias com link)
$sub_ids = fn_collect_ids_with_thumb( array( 'post__not_in' => $used, 'posts_per_page' => 4 ), 4 );
$used = array_merge( $used, $sub_ids );

// FEATURES grid (4 cards)
$feat_ids = fn_collect_ids_with_thumb( array( 'post__not_in' => $used, 'posts_per_page' => 4 ), 4 );
$used = array_merge( $used, $feat_ids );

// SECTION 1: Notícias Agora (cat 43)
$noticias_term = get_category_by_slug( 'noticias-agora' );
$s1_args = array( 'post__not_in' => $used, 'posts_per_page' => 4 );
if ( $noticias_term ) { $s1_args['cat'] = $noticias_term->term_id; }
$s1_ids = fn_collect_ids_with_thumb( $s1_args, 4 );
$used = array_merge( $used, $s1_ids );

// COLUMNS row (4 colunistas, posts recentes)
$col_ids = fn_collect_ids_with_thumb( array( 'post__not_in' => $used, 'posts_per_page' => 4 ), 4 );
$used = array_merge( $used, $col_ids );

// SECTION 2: Dicas/Insights (cat 41, maior categoria)
$dicas_term = get_category_by_slug( 'dicas' );
$s2_args = array( 'post__not_in' => $used, 'posts_per_page' => 4 );
if ( $dicas_term ) { $s2_args['cat'] = $dicas_term->term_id; }
$s2_ids = fn_collect_ids_with_thumb( $s2_args, 4 );
$used = array_merge( $used, $s2_ids );

// SECTION 3: Automotivo (cat 42)
$auto_term = get_category_by_slug( 'automotivo' );
$s3_args = array( 'post__not_in' => $used, 'posts_per_page' => 4 );
if ( $auto_term ) { $s3_args['cat'] = $auto_term->term_id; }
$s3_ids = fn_collect_ids_with_thumb( $s3_args, 4 );
?>

<main id="fn-main" class="fn-main" role="main">
	<div class="fn-container">

		<?php // ===== HERO LEAD ===== ?>
		<?php if ( ! empty( $hero_ids ) ) : ?>
		<section class="fn-hero" aria-label="Manchete principal">
			<?php
			global $post;
			$_orig = $post;
			foreach ( $hero_ids as $hid ) {
				$post = get_post( $hid );
				setup_postdata( $post );
				fn_hero_lead();
			}
			$post = $_orig;
			wp_reset_postdata();
			?>
			<aside class="fn-hero__rail" aria-label="Sub-manchetes">
				<?php fn_hero_sublist( $sub_ids ); ?>
			</aside>
		</section>
		<?php endif; ?>

		<?php // ===== AD TOP ===== ?>
		<div class="fn-ad" aria-label="Espaço publicitário">
			<div class="fn-ad__inner">
				<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-PORTAL_PUB_ID" data-ad-slot="FN_SLOT_HOME_TOP" data-ad-format="auto" data-full-width-responsive="true"></ins>
			</div>
		</div>

		<?php // ===== FEATURES GRID 4 ===== ?>
		<?php if ( ! empty( $feat_ids ) ) : ?>
		<section class="fn-features" aria-label="Destaques">
			<div class="fn-features__grid">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $feat_ids as $fid ) {
					$post = get_post( $fid );
					setup_postdata( $post );
					fn_card_default();
				}
				$post = $_orig;
				wp_reset_postdata();
				?>
			</div>
		</section>
		<?php endif; ?>

		<?php // ===== SECTION Notícias Agora ===== ?>
		<?php if ( ! empty( $s1_ids ) ) : ?>
		<section class="fn-section" aria-label="Notícias Agora">
			<div class="fn-section__head">
				<h2 class="fn-section__title"><?php echo esc_html( $noticias_term ? $noticias_term->name : 'Notícias' ); ?></h2>
				<?php if ( $noticias_term ) : ?>
					<a class="fn-section__more" href="<?php echo esc_url( get_category_link( $noticias_term->term_id ) ); ?>">Ver todas →</a>
				<?php endif; ?>
			</div>
			<div class="fn-section__grid">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $s1_ids as $id ) {
					$post = get_post( $id );
					setup_postdata( $post );
					fn_card_default();
				}
				$post = $_orig;
				wp_reset_postdata();
				?>
			</div>
		</section>
		<?php endif; ?>

		<?php // ===== COLUMNS ROW ===== ?>
		<?php if ( ! empty( $col_ids ) ) : ?>
		<section class="fn-columns" aria-label="Colunas">
			<div class="fn-columns__head">
				<h3 class="fn-columns__title">Colunas</h3>
			</div>
			<div class="fn-columns__grid">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $col_ids as $cid ) {
					$post = get_post( $cid );
					setup_postdata( $post );
					fn_column_card();
				}
				$post = $_orig;
				wp_reset_postdata();
				?>
			</div>
		</section>
		<?php endif; ?>

		<?php // ===== SECTION Dicas / Insights ===== ?>
		<?php if ( ! empty( $s2_ids ) ) : ?>
		<section class="fn-section" aria-label="Dicas">
			<div class="fn-section__head">
				<h2 class="fn-section__title"><?php echo esc_html( $dicas_term ? $dicas_term->name : 'Dicas' ); ?></h2>
				<?php if ( $dicas_term ) : ?>
					<a class="fn-section__more" href="<?php echo esc_url( get_category_link( $dicas_term->term_id ) ); ?>">Ver todas →</a>
				<?php endif; ?>
			</div>
			<div class="fn-section__grid">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $s2_ids as $id ) {
					$post = get_post( $id );
					setup_postdata( $post );
					fn_card_default();
				}
				$post = $_orig;
				wp_reset_postdata();
				?>
			</div>
		</section>
		<?php endif; ?>

		<?php // ===== AD MID ===== ?>
		<div class="fn-ad" aria-label="Espaço publicitário">
			<div class="fn-ad__inner">
				<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-PORTAL_PUB_ID" data-ad-slot="FN_SLOT_HOME_MID" data-ad-format="auto" data-full-width-responsive="true"></ins>
			</div>
		</div>

		<?php // ===== SECTION Automotivo ===== ?>
		<?php if ( ! empty( $s3_ids ) ) : ?>
		<section class="fn-section" aria-label="Automotivo">
			<div class="fn-section__head">
				<h2 class="fn-section__title"><?php echo esc_html( $auto_term ? $auto_term->name : 'Automotivo' ); ?></h2>
				<?php if ( $auto_term ) : ?>
					<a class="fn-section__more" href="<?php echo esc_url( get_category_link( $auto_term->term_id ) ); ?>">Ver todas →</a>
				<?php endif; ?>
			</div>
			<div class="fn-section__grid">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $s3_ids as $id ) {
					$post = get_post( $id );
					setup_postdata( $post );
					fn_card_default();
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
