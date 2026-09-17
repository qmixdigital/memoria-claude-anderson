<?php
/**
 * Header H5: Magazine masthead (utility top + logo central + navbar)
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$logo = 'https://folhadonoroeste.com.br/wp-content/uploads/2025/09/Folha-do-Noroeste-logomarca.png';
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

<a class="screen-reader-text" href="#fn-main">Pular para o conteúdo</a>

<div class="fn-utility" role="complementary">
	<div class="fn-utility__inner">
		<div class="fn-utility__date"><?php echo esc_html( fn_today_pt_long() ); ?></div>
		<div class="fn-utility__meta">
			<?php
			if ( has_nav_menu( 'utility' ) ) {
				wp_nav_menu( array(
					'theme_location' => 'utility',
					'container'      => false,
					'menu_class'     => 'fn-utility__list',
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
		</div>
	</div>
</div>

<div class="fn-masthead">
	<div class="fn-masthead__inner">
		<div class="fn-masthead__left">
			<button class="fn-masthead__burger" aria-label="Abrir menu" aria-expanded="false" aria-controls="fn-mobile-panel">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
			</button>
		</div>
		<a class="fn-masthead__logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home" aria-label="<?php bloginfo( 'name' ); ?>, página inicial">
			<img src="<?php echo esc_url( $logo ); ?>" alt="Folha do Noroeste" width="600" height="120" fetchpriority="high">
		</a>
		<div class="fn-masthead__right">
			<a class="fn-masthead__cta" href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Anuncie</a>
			<button class="fn-masthead__search-btn" aria-label="Abrir busca" aria-expanded="false" aria-controls="fn-search-panel">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
			</button>
		</div>
	</div>
</div>

<nav class="fn-navbar" aria-label="Categorias">
	<div class="fn-navbar__inner">
		<?php
		if ( has_nav_menu( 'primary' ) ) {
			wp_nav_menu( array(
				'theme_location' => 'primary',
				'container'      => false,
				'menu_class'     => 'fn-navbar__menu',
				'depth'          => 1,
				'fallback_cb'    => false,
			) );
		} else {
			echo '<ul class="fn-navbar__menu">';
			$cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 8, 'hide_empty' => true ) );
			foreach ( $cats as $c ) {
				echo '<li><a href="' . esc_url( get_category_link( $c->term_id ) ) . '">' . esc_html( $c->name ) . '</a></li>';
			}
			echo '</ul>';
		}
		?>
	</div>
</nav>

<div id="fn-search-panel" hidden inert aria-label="Painel de busca" style="background:var(--fn-bg);border-bottom:1px solid var(--fn-line);padding:18px 24px;">
	<form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" style="max-width:760px;margin:0 auto;display:flex;gap:8px;">
		<label for="fn-s" class="screen-reader-text">Buscar</label>
		<input id="fn-s" type="search" name="s" placeholder="Buscar na Folha do Noroeste" value="<?php echo esc_attr( get_search_query() ); ?>" style="flex:1;padding:12px 16px;border:1px solid var(--fn-line);border-radius:var(--fn-r-button);font-family:inherit;font-size:15px;">
		<button type="submit" style="padding:12px 22px;background:var(--fn-ink);color:var(--fn-paper);border:0;border-radius:var(--fn-r-button);font-family:inherit;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">Buscar</button>
	</form>
</div>

<script>
(function(){
	var btn = document.querySelector('.fn-masthead__search-btn');
	var panel = document.getElementById('fn-search-panel');
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
})();
</script>
