<?php
/**
 * Header H1: Classic 3-row (top utility bar + masthead logo + navbar)
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$logo_color = 'https://adonline.com.br/wp-content/uploads/2025/10/adonline-logomarca.webp';
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

<a class="screen-reader-text" href="#adon-main">Pular para o conteúdo</a>

<div class="adon-toolbar" role="banner">
	<div class="adon-toolbar__inner">
		<nav class="adon-toolbar__nav" aria-label="Menu institucional">
			<?php
			if ( has_nav_menu( 'utility' ) ) {
				wp_nav_menu( array(
					'theme_location' => 'utility',
					'container'      => false,
					'menu_class'     => 'adon-toolbar__list',
					'items_wrap'     => '%3$s',
					'depth'          => 1,
					'fallback_cb'    => false,
				) );
			} else {
				echo '<a href="' . esc_url( home_url( '/termos-de-uso/' ) ) . '">Termos de uso</a>';
				echo '<a href="' . esc_url( home_url( '/politica-de-privacidade/' ) ) . '">Política de privacidade</a>';
				echo '<a href="' . esc_url( home_url( '/sobre-nos/' ) ) . '">Sobre nós</a>';
				echo '<a href="' . esc_url( home_url( '/contato/' ) ) . '">Contato</a>';
			}
			?>
		</nav>
	</div>
</div>

<div class="adon-masthead">
	<a class="adon-masthead__logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home" aria-label="<?php bloginfo( 'name' ); ?>: página inicial">
		<img src="<?php echo esc_url( $logo_color ); ?>" alt="AdOnline" width="400" height="70" fetchpriority="high">
	</a>
</div>

<div class="adon-navbar">
	<div class="adon-navbar__inner">
		<div class="adon-navbar__date"><?php echo esc_html( adon_today_pt() ); ?></div>
		<nav aria-label="Categorias">
			<?php
			if ( has_nav_menu( 'primary' ) ) {
				wp_nav_menu( array(
					'theme_location' => 'primary',
					'container'      => false,
					'menu_class'     => 'adon-navbar__menu',
					'depth'          => 1,
					'fallback_cb'    => false,
				) );
			} else {
				echo '<ul class="adon-navbar__menu">';
				$cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 8, 'hide_empty' => true ) );
				foreach ( $cats as $c ) {
					echo '<li><a href="' . esc_url( get_category_link( $c->term_id ) ) . '">' . esc_html( $c->name ) . '</a></li>';
				}
				echo '</ul>';
			}
			?>
		</nav>
		<div class="adon-navbar__tools">
			<button class="adon-navbar__search-btn" aria-label="Abrir busca" aria-expanded="false" aria-controls="adon-search-panel">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
			</button>
		</div>
	</div>
	<div id="adon-search-panel" hidden inert aria-label="Painel de busca" style="background:var(--adon-paper-2);border-top:1px solid var(--adon-line);padding:18px 24px;">
		<form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" style="max-width:760px;margin:0 auto;display:flex;gap:8px;">
			<label for="adon-s" class="screen-reader-text">Buscar</label>
			<input id="adon-s" type="search" name="s" placeholder="Buscar no AdOnline" value="<?php echo esc_attr( get_search_query() ); ?>" style="flex:1;padding:12px 16px;border:1px solid var(--adon-line);border-radius:var(--adon-r-button);font-family:inherit;font-size:15px;">
			<button type="submit" style="padding:12px 22px;background:var(--adon-ink);color:var(--adon-paper);border:0;border-radius:var(--adon-r-button);font-weight:700;letter-spacing:.04em;">Buscar</button>
		</form>
	</div>
</div>

<script>
(function(){
	var btn = document.querySelector('.adon-navbar__search-btn');
	var panel = document.getElementById('adon-search-panel');
	if(!btn || !panel) return;
	btn.addEventListener('click', function(){
		var open = panel.hasAttribute('hidden') === false;
		if(open){
			panel.setAttribute('hidden','');
			panel.setAttribute('inert','');
			btn.setAttribute('aria-expanded','false');
		} else {
			panel.removeAttribute('hidden');
			panel.removeAttribute('inert');
			btn.setAttribute('aria-expanded','true');
			var inp = panel.querySelector('input[type=search]');
			if(inp) inp.focus();
		}
	});
})();
</script>
