<?php
/**
 * Header H3: Centered logo with split menu
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="profile" href="https://gmpg.org/xfn/11">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a class="screen-reader-text" href="#exq-main">Pular para o conteúdo</a>

<?php
// Ticker breaking news (5 últimos posts)
$ticker_q = exq_query_for_section( array( 'posts_per_page' => 8 ) );
if ( $ticker_q->have_posts() ) : ?>
<aside class="exq-ticker" aria-label="Últimas notícias">
	<div class="exq-ticker__inner">
		<span class="exq-ticker__label">Últimas</span>
		<div class="exq-ticker__track">
			<div class="exq-ticker__list">
				<?php
				global $post;
				$_orig = $post;
				while ( $ticker_q->have_posts() ) {
					$ticker_q->the_post();
					echo '<a href="' . esc_url( get_permalink() ) . '">' . esc_html( get_the_title() ) . '</a>';
				}
				$post = $_orig; wp_reset_postdata();
				?>
			</div>
		</div>
	</div>
</aside>
<?php endif; ?>

<div class="exq-utility" role="complementary">
	<div class="exq-utility__inner">
		<span class="exq-utility__date"><?php echo esc_html( exq_today_pt_long() ); ?></span>
		<nav class="exq-utility__nav" aria-label="Menu institucional">
			<?php
			if ( has_nav_menu( 'utility' ) ) {
				wp_nav_menu( array(
					'theme_location' => 'utility',
					'container'      => false,
					'menu_class'     => 'exq-utility__list',
					'items_wrap'     => '%3$s',
					'depth'          => 1,
					'fallback_cb'    => false,
				) );
			} else {
				echo '<a href="' . esc_url( home_url( '/sobre-nos/' ) ) . '">Sobre nós</a>';
				echo '<a href="' . esc_url( home_url( '/contato/' ) ) . '">Contato</a>';
				echo '<a href="' . esc_url( home_url( '/politica-de-privacidade/' ) ) . '">Privacidade</a>';
			}
			?>
		</nav>
	</div>
</div>

<header class="exq-masthead" style="position:relative;">
	<div class="exq-masthead__row exq-masthead__row--centered">
		<button class="exq-burger exq-masthead__side-left" aria-label="Abrir menu" aria-expanded="false" aria-controls="exq-mobile">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
		</button>
		<?php
		$logo_path = get_stylesheet_directory() . '/assets/exquisito-logo.svg';
		$logo_uri  = get_stylesheet_directory_uri() . '/assets/exquisito-logo.svg';
		$logo_ver  = file_exists( $logo_path ) ? filemtime( $logo_path ) : '1';
		?>
		<a class="exq-masthead__logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home" aria-label="<?php bloginfo( 'name' ); ?>, página inicial" style="display:flex;align-items:center;">
			<img src="<?php echo esc_url( $logo_uri . '?v=' . $logo_ver ); ?>" alt="Exquisito" width="320" height="58" fetchpriority="high" class="no-lazyload litespeed-no-lazy" data-no-lazy="1" data-no-optimize="1" style="height:clamp(58px,6.5vw,64px);width:auto;max-width:100%;display:block;">
		</a>
		<button class="exq-masthead__btn exq-masthead__side-right" aria-label="Buscar" aria-expanded="false" aria-controls="exq-search-panel">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
		</button>
	</div>
</header>

<nav class="exq-mainnav" aria-label="Categorias">
	<ul class="exq-mainnav__list">
		<?php
		if ( has_nav_menu( 'primary' ) ) {
			wp_nav_menu( array(
				'theme_location' => 'primary',
				'container'      => false,
				'menu_class'     => 'exq-mainnav__list',
				'items_wrap'     => '%3$s',
				'depth'          => 1,
				'fallback_cb'    => false,
			) );
		} else {
			$cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 9, 'hide_empty' => true, 'exclude' => exq_excluded_lang_cat_ids() ) );
			foreach ( $cats as $c ) {
				echo '<li><a href="' . esc_url( get_category_link( $c->term_id ) ) . '">' . esc_html( $c->name ) . '</a></li>';
			}
		}
		?>
	</ul>
</nav>

<div id="exq-search-panel" hidden inert aria-label="Painel de busca" style="background:var(--exq-bg);border-bottom:1px solid var(--exq-line);padding:18px 24px;">
	<form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" style="max-width:760px;margin:0 auto;display:flex;gap:8px;">
		<label for="exq-s" class="screen-reader-text">Buscar</label>
		<input id="exq-s" type="search" name="s" placeholder="Buscar no Exquisito" value="<?php echo esc_attr( get_search_query() ); ?>" style="flex:1;padding:12px 16px;border:1px solid var(--exq-line);border-radius:var(--exq-r-button);font-family:inherit;font-size:15px;background:var(--exq-paper);color:var(--exq-ink);">
		<button type="submit" style="padding:12px 22px;background:var(--exq-cyan);color:var(--exq-ink);border:0;border-radius:var(--exq-r-button);font-family:inherit;font-weight:800;letter-spacing:.04em;text-transform:uppercase;">Buscar</button>
	</form>
</div>

<div id="exq-mobile" hidden inert style="background:var(--exq-paper);border-bottom:1px solid var(--exq-line);padding:18px 24px;">
	<nav aria-label="Menu mobile">
		<ul style="list-style:none;margin:0;padding:0;display:grid;gap:10px;font-family:var(--exq-font-meta);">
		<?php
		$cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 12, 'hide_empty' => true, 'exclude' => exq_excluded_lang_cat_ids() ) );
		foreach ( $cats as $c ) {
			echo '<li><a href="' . esc_url( get_category_link( $c->term_id ) ) . '" style="font-weight:600;text-transform:uppercase;letter-spacing:.04em;font-size:13px;color:var(--exq-ink);">' . esc_html( $c->name ) . '</a></li>';
		}
		?>
		</ul>
	</nav>
</div>

<script>
(function(){
	function toggle(btnSel, panelId) {
		var btn = document.querySelector(btnSel);
		var panel = document.getElementById(panelId);
		if (!btn || !panel) return;
		btn.addEventListener('click', function(){
			var open = !panel.hasAttribute('hidden');
			if (open) {
				panel.setAttribute('hidden',''); panel.setAttribute('inert','');
				btn.setAttribute('aria-expanded','false');
			} else {
				panel.removeAttribute('hidden'); panel.removeAttribute('inert');
				btn.setAttribute('aria-expanded','true');
				var inp = panel.querySelector('input[type=search]'); if (inp) inp.focus();
			}
		});
	}
	toggle('.exq-masthead__btn[aria-controls=exq-search-panel]', 'exq-search-panel');
	toggle('.exq-burger', 'exq-mobile');
})();
</script>
