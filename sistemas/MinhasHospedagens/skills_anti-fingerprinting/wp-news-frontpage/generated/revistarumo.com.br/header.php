<?php
/**
 * Portal: Revista Rumo (revistarumo.com.br)
 * Header archetype H3: Centered split (logo central, menu nos dois lados, search inline icon)
 * menu_position_in_header=split_around_logo, header_sticky_behavior=not_sticky, header_search_treatment=icon_inline_dropdown
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$rr_split = rr_split_top_categories( 6 );
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

<a class="screen-reader-text" href="#rr-main">Pular para o conteúdo</a>

<header class="rr-site-header" role="banner">
	<div class="rr-site-header__inner">
		<button class="rr-site-header__burger" aria-label="Abrir menu de editorias" aria-expanded="false" aria-controls="rr-mobile-nav">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
		</button>
		<nav class="rr-site-header__menu-left" aria-label="Editorias (lado esquerdo)">
			<?php
			if ( has_nav_menu( 'primary_left' ) ) {
				wp_nav_menu( array(
					'theme_location' => 'primary_left',
					'container'      => false,
					'menu_class'     => 'rr-menu rr-menu--left',
					'depth'          => 1,
					'fallback_cb'    => false,
				) );
			} else {
				echo '<ul class="rr-menu rr-menu--left">';
				foreach ( $rr_split['left'] as $c ) {
					echo '<li><a href="' . esc_url( get_category_link( $c->term_id ) ) . '">' . esc_html( $c->name ) . '</a></li>';
				}
				echo '</ul>';
			}
			?>
		</nav>

		<a class="rr-site-header__brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home" aria-label="Revista Rumo, página inicial">
			<?php
			$logo_id = function_exists( 'get_theme_mod' ) ? get_theme_mod( 'custom_logo' ) : 0;
			if ( $logo_id ) {
				echo wp_get_attachment_image( $logo_id, 'full', false, array(
					'class'         => 'rr-site-header__logo-img',
					'fetchpriority' => 'high',
					'alt'           => 'Revista Rumo',
				) );
			} else {
			?>
				<span class="rr-site-header__logo">Revista <em>Rumo</em></span>
			<?php } ?>
		</a>

		<nav class="rr-site-header__menu-right" aria-label="Editorias (lado direito)">
			<?php
			if ( has_nav_menu( 'primary_right' ) ) {
				wp_nav_menu( array(
					'theme_location' => 'primary_right',
					'container'      => false,
					'menu_class'     => 'rr-menu rr-menu--right',
					'depth'          => 1,
					'fallback_cb'    => false,
				) );
			} else {
				echo '<ul class="rr-menu rr-menu--right">';
				foreach ( $rr_split['right'] as $c ) {
					echo '<li><a href="' . esc_url( get_category_link( $c->term_id ) ) . '">' . esc_html( $c->name ) . '</a></li>';
				}
				echo '</ul>';
			}
			?>
		</nav>

		<button class="rr-site-header__search" aria-label="Abrir busca" aria-expanded="false" aria-controls="rr-search-panel">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
		</button>
	</div>
</header>

<div id="rr-mobile-nav" class="rr-mobile-nav" hidden inert aria-label="Menu de editorias">
	<div class="rr-mobile-nav__head">
		<span class="rr-mobile-nav__title">Editorias</span>
		<button class="rr-mobile-nav__close" aria-label="Fechar menu">&times;</button>
	</div>
	<ul class="rr-mobile-nav__list">
		<li><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Início</a></li>
		<?php
		$rr_all = array_merge( $rr_split['left'], $rr_split['right'] );
		foreach ( $rr_all as $c ) {
			echo '<li><a href="' . esc_url( get_category_link( $c->term_id ) ) . '">' . esc_html( $c->name ) . '</a></li>';
		}
		?>
	</ul>
</div>
<div class="rr-mobile-nav__backdrop" hidden></div>

<div id="rr-search-panel" class="rr-search-panel" hidden inert aria-label="Painel de busca">
	<form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
		<label for="rr-s" class="screen-reader-text">Buscar</label>
		<input id="rr-s" type="search" name="s" placeholder="Buscar na Revista Rumo" value="<?php echo esc_attr( get_search_query() ); ?>">
		<button type="submit">Buscar</button>
	</form>
</div>

<script>
(function(){
	var btn = document.querySelector('.rr-site-header__search');
	var panel = document.getElementById('rr-search-panel');
	if (btn && panel) {
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

	var burger   = document.querySelector('.rr-site-header__burger');
	var mnav     = document.getElementById('rr-mobile-nav');
	var backdrop = document.querySelector('.rr-mobile-nav__backdrop');
	var closeBtn = mnav ? mnav.querySelector('.rr-mobile-nav__close') : null;
	function closeNav(){
		if (!mnav) return;
		mnav.setAttribute('hidden',''); mnav.setAttribute('inert','');
		if (backdrop) backdrop.setAttribute('hidden','');
		if (burger) burger.setAttribute('aria-expanded','false');
		document.body.style.overflow = '';
	}
	function openNav(){
		if (!mnav) return;
		mnav.removeAttribute('hidden'); mnav.removeAttribute('inert');
		if (backdrop) backdrop.removeAttribute('hidden');
		if (burger) burger.setAttribute('aria-expanded','true');
		document.body.style.overflow = 'hidden';
		var first = mnav.querySelector('a'); if (first) first.focus();
	}
	if (burger && mnav) {
		burger.addEventListener('click', function(){
			(mnav.hasAttribute('hidden') ? openNav : closeNav)();
		});
		if (closeBtn) closeBtn.addEventListener('click', closeNav);
		if (backdrop) backdrop.addEventListener('click', closeNav);
		document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeNav(); });
	}
})();
</script>
