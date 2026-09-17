<?php
/**
 * Portal: Revista Rumo (revistarumo.com.br)
 * Front-page archetype D: Feature-Led Stream (full-width, sidebar=none, mobile-first).
 *  Hero slider (1 feature LCP + 2 secondary)
 *  Breaking strip (5 manchetes)
 *  Stream principal: 15 cards image-left/right alternando (Notícias)
 *  Block Dicas (8 cards)
 *  Block Entretenimento (8 cards)
 *  Block Saúde e Beleza (8 cards)
 *  Newsletter CTA
 *  Latest grid (12 cards)
 *  Ads Set C: top + mid + bottom (auto-ads ja injeta no resto)
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();

$used = array();

/* ===== HERO SLIDER ===== */
$hero_main = rr_collect_ids_with_thumb( array( 'posts_per_page' => 1 ), 1 );
$used = array_merge( $used, $hero_main );
$hero_secondary = rr_collect_ids_with_thumb( array( 'post__not_in' => $used, 'posts_per_page' => 2 ), 2 );
$used = array_merge( $used, $hero_secondary );

/* ===== BREAKING STRIP (5 manchetes) ===== */
$breaking_ids = rr_collect_ids_with_thumb( array( 'post__not_in' => $used, 'posts_per_page' => 5 ), 5 );
$used = array_merge( $used, $breaking_ids );

/* ===== STREAM PRINCIPAL (15 cards de Notícias) ===== */
$noticias_term = get_category_by_slug( 'noticias' );
$stream_args = array( 'post__not_in' => $used, 'posts_per_page' => 15 );
if ( $noticias_term ) { $stream_args['cat'] = $noticias_term->term_id; }
$stream_ids = rr_collect_ids_with_thumb( $stream_args, 15 );
$used = array_merge( $used, $stream_ids );

/* ===== BLOCK 1: Dicas (8 cards) ===== */
$dicas_term = get_category_by_slug( 'dicas' );
$b1_args = array( 'post__not_in' => $used, 'posts_per_page' => 8 );
if ( $dicas_term ) { $b1_args['cat'] = $dicas_term->term_id; }
$b1_ids = rr_collect_ids_with_thumb( $b1_args, 8 );
$used = array_merge( $used, $b1_ids );

/* ===== BLOCK 2: Entretenimento (8 cards) ===== */
$ent_term = get_category_by_slug( 'entretenimento' );
$b2_args = array( 'post__not_in' => $used, 'posts_per_page' => 8 );
if ( $ent_term ) { $b2_args['cat'] = $ent_term->term_id; }
$b2_ids = rr_collect_ids_with_thumb( $b2_args, 8 );
$used = array_merge( $used, $b2_ids );

/* ===== BLOCK 3: Saúde e Beleza (8 cards) ===== */
$saude_term = get_category_by_slug( 'saude-e-beleza' );
$b3_args = array( 'post__not_in' => $used, 'posts_per_page' => 8 );
if ( $saude_term ) { $b3_args['cat'] = $saude_term->term_id; }
$b3_ids = rr_collect_ids_with_thumb( $b3_args, 8 );
$used = array_merge( $used, $b3_ids );

/* ===== LATEST GRID (12 cards, qualquer categoria) ===== */
$latest_ids = rr_collect_ids_with_thumb( array( 'post__not_in' => $used, 'posts_per_page' => 12 ), 12 );
?>

<main id="rr-main" class="rr-main" role="main">
	<div class="rr-container">

		<?php // ===== HERO SLIDER ===== ?>
		<?php if ( ! empty( $hero_main ) || ! empty( $hero_secondary ) ) : ?>
		<section class="rr-hero" aria-label="Destaques da edição">
			<div class="rr-hero__title-bar">
				<h2 class="rr-hero__title-text">Em destaque</h2>
			</div>
			<div class="rr-hero__slider">
				<?php
				global $post;
				$_orig = $post;
				$is_lcp = true;
				foreach ( $hero_main as $hid ) {
					$post = get_post( $hid );
					setup_postdata( $post );
					rr_card_hero_feature( $is_lcp );
					$is_lcp = false;
				}
				?>
				<?php if ( ! empty( $hero_secondary ) ) : ?>
				<div class="rr-hero__secondary">
					<?php
					foreach ( $hero_secondary as $hid ) {
						$post = get_post( $hid );
						setup_postdata( $post );
						rr_card_hero_small();
					}
					?>
				</div>
				<?php endif; ?>
				<?php
				$post = $_orig;
				wp_reset_postdata();
				?>
			</div>
		</section>
		<?php endif; ?>

	</div>

	<?php // ===== BREAKING STRIP (full-bleed) ===== ?>
	<?php if ( ! empty( $breaking_ids ) ) : ?>
	<aside class="rr-breaking" aria-label="Manchetes em destaque">
		<div class="rr-breaking__inner">
			<span class="rr-breaking__label">Agora</span>
			<ul class="rr-breaking__list">
				<?php foreach ( $breaking_ids as $bid ) : ?>
					<li><a href="<?php echo esc_url( get_permalink( $bid ) ); ?>"><?php echo esc_html( get_the_title( $bid ) ); ?></a></li>
				<?php endforeach; ?>
			</ul>
		</div>
	</aside>
	<?php endif; ?>

	<div class="rr-container">

		<?php // ===== AD TOP ===== ?>
		<div class="rr-ad" aria-label="Espaço publicitário">
			<div class="rr-ad__inner">
				<span class="rr-ad__label">Publicidade</span>
				<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-PORTAL_PUB_ID" data-ad-slot="RR_SLOT_HOME_TOP" data-ad-format="auto" data-full-width-responsive="true"></ins>
			</div>
		</div>

		<?php // ===== STREAM PRINCIPAL ===== ?>
		<?php if ( ! empty( $stream_ids ) ) : ?>
		<section class="rr-stream" aria-label="Notícias">
			<div class="rr-stream__head">
				<h2 class="rr-stream__title"><?php echo esc_html( $noticias_term ? $noticias_term->name : 'Notícias' ); ?></h2>
				<?php if ( $noticias_term ) : ?>
					<a class="rr-stream__more" href="<?php echo esc_url( get_category_link( $noticias_term->term_id ) ); ?>">Ver tudo em Notícias</a>
				<?php endif; ?>
			</div>
			<div class="rr-stream__list">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $stream_ids as $sid ) {
					$post = get_post( $sid );
					setup_postdata( $post );
					rr_card_stream();
				}
				$post = $_orig;
				wp_reset_postdata();
				?>
			</div>
		</section>
		<?php endif; ?>

		<?php // ===== BLOCK Dicas ===== ?>
		<?php if ( ! empty( $b1_ids ) ) : ?>
		<section class="rr-block" aria-label="Dicas">
			<div class="rr-block__head">
				<div>
					<div class="rr-block__kicker">Editoria</div>
					<h2 class="rr-block__title"><?php echo esc_html( $dicas_term ? $dicas_term->name : 'Dicas' ); ?></h2>
				</div>
				<?php if ( $dicas_term ) : ?>
					<a class="rr-block__more" href="<?php echo esc_url( get_category_link( $dicas_term->term_id ) ); ?>">Ver mais</a>
				<?php endif; ?>
			</div>
			<div class="rr-block__grid">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $b1_ids as $id ) {
					$post = get_post( $id );
					setup_postdata( $post );
					rr_card_default();
				}
				$post = $_orig;
				wp_reset_postdata();
				?>
			</div>
		</section>
		<?php endif; ?>

		<?php // ===== AD MID ===== ?>
		<div class="rr-ad" aria-label="Espaço publicitário">
			<div class="rr-ad__inner">
				<span class="rr-ad__label">Publicidade</span>
				<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-PORTAL_PUB_ID" data-ad-slot="RR_SLOT_HOME_MID" data-ad-format="auto" data-full-width-responsive="true"></ins>
			</div>
		</div>

		<?php // ===== BLOCK Entretenimento ===== ?>
		<?php if ( ! empty( $b2_ids ) ) : ?>
		<section class="rr-block" aria-label="Entretenimento">
			<div class="rr-block__head">
				<div>
					<div class="rr-block__kicker">Editoria</div>
					<h2 class="rr-block__title"><?php echo esc_html( $ent_term ? $ent_term->name : 'Entretenimento' ); ?></h2>
				</div>
				<?php if ( $ent_term ) : ?>
					<a class="rr-block__more" href="<?php echo esc_url( get_category_link( $ent_term->term_id ) ); ?>">Ver mais</a>
				<?php endif; ?>
			</div>
			<div class="rr-block__grid">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $b2_ids as $id ) {
					$post = get_post( $id );
					setup_postdata( $post );
					rr_card_default();
				}
				$post = $_orig;
				wp_reset_postdata();
				?>
			</div>
		</section>
		<?php endif; ?>

		<?php // ===== NEWSLETTER CTA ===== ?>
		<section class="rr-newsletter" aria-label="Inscreva-se na newsletter">
			<h2 class="rr-newsletter__title">A semana inteira em poucos minutos</h2>
			<p class="rr-newsletter__desc">Receba a curadoria da Revista Rumo no seu e-mail toda sexta. Sem ruído, sem clickbait, só o que importa.</p>
			<form class="rr-newsletter__form" action="#" method="post" onsubmit="return false">
				<label for="rr-newsletter-home" class="screen-reader-text">Seu e-mail</label>
				<input id="rr-newsletter-home" type="email" name="email" placeholder="seu@email.com" required>
				<button type="submit">Quero receber</button>
			</form>
		</section>

		<?php // ===== BLOCK Saúde e Beleza ===== ?>
		<?php if ( ! empty( $b3_ids ) ) : ?>
		<section class="rr-block" aria-label="Saúde e Beleza">
			<div class="rr-block__head">
				<div>
					<div class="rr-block__kicker">Editoria</div>
					<h2 class="rr-block__title"><?php echo esc_html( $saude_term ? $saude_term->name : 'Saúde e Beleza' ); ?></h2>
				</div>
				<?php if ( $saude_term ) : ?>
					<a class="rr-block__more" href="<?php echo esc_url( get_category_link( $saude_term->term_id ) ); ?>">Ver mais</a>
				<?php endif; ?>
			</div>
			<div class="rr-block__grid">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $b3_ids as $id ) {
					$post = get_post( $id );
					setup_postdata( $post );
					rr_card_default();
				}
				$post = $_orig;
				wp_reset_postdata();
				?>
			</div>
		</section>
		<?php endif; ?>

		<?php // ===== AD BOTTOM ===== ?>
		<div class="rr-ad" aria-label="Espaço publicitário">
			<div class="rr-ad__inner">
				<span class="rr-ad__label">Publicidade</span>
				<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-PORTAL_PUB_ID" data-ad-slot="RR_SLOT_HOME_BOTTOM" data-ad-format="auto" data-full-width-responsive="true"></ins>
			</div>
		</div>

		<?php // ===== LATEST GRID ===== ?>
		<?php if ( ! empty( $latest_ids ) ) : ?>
		<section class="rr-block" aria-label="Últimas publicações" style="background:transparent;padding:0;">
			<div class="rr-block__head">
				<div>
					<div class="rr-block__kicker">Recentes</div>
					<h2 class="rr-block__title">Últimas publicações</h2>
				</div>
				<a class="rr-block__more" href="<?php echo esc_url( home_url( '/categoria/noticias/' ) ); ?>">Ver mais</a>
			</div>
			<div class="rr-block__grid">
				<?php
				global $post;
				$_orig = $post;
				foreach ( $latest_ids as $id ) {
					$post = get_post( $id );
					setup_postdata( $post );
					rr_card_default();
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
