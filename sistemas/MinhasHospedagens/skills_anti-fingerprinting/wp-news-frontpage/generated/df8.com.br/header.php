<?php
/**
 * Portal: DF8 News (df8.com.br)
 * Header archetype H5: Magazine masthead (utility top + logo central + navbar sticky)
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$logo = ''; // Logo via texto (wordmark Bebas) por enquanto; substituir por URL quando o ativo estiver pronto.
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

<a class="screen-reader-text" href="#d8-main">Pular para o conteúdo</a>

<div class="d8-utility" role="complementary">
	<div class="d8-utility__inner">
		<div class="d8-utility__date"><?php echo esc_html( d8_today_pt_long() ); ?></div>
		<div class="d8-utility__meta">
			<?php
			if ( has_nav_menu( 'utility' ) ) {
				wp_nav_menu( array(
					'theme_location' => 'utility',
					'container'      => false,
					'menu_class'     => 'd8-utility__list',
					'items_wrap'     => '%3$s',
					'depth'          => 1,
					'fallback_cb'    => false,
				) );
			} else {
				echo '<a href="' . esc_url( home_url( '/sobre/' ) ) . '">Sobre</a>';
				echo '<a href="' . esc_url( home_url( '/contato/' ) ) . '">Contato</a>';
				echo '<a href="' . esc_url( home_url( '/politica-de-privacidade/' ) ) . '">Privacidade</a>';
			}
			?>
		</div>
	</div>
</div>

<div class="d8-masthead">
	<div class="d8-masthead__inner">
		<div class="d8-masthead__left">
			<button class="d8-masthead__burger" aria-label="Abrir menu" aria-expanded="false" aria-controls="d8-mobile-panel">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
			</button>
		</div>
		<a class="d8-masthead__logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home" aria-label="DF8 News, página inicial">
			<?php if ( $logo ) : ?>
				<img src="<?php echo esc_url( $logo ); ?>" alt="DF8 News" width="320" height="60" fetchpriority="high">
			<?php else : ?>
				<span class="d8-masthead__logo-text">DF<em>8</em> News</span>
			<?php endif; ?>
		</a>
		<div class="d8-masthead__right">
			<a class="d8-masthead__cta" href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Anuncie</a>
			<button class="d8-masthead__search-btn" aria-label="Abrir busca" aria-expanded="false" aria-controls="d8-search-panel">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
			</button>
		</div>
	</div>
</div>

<nav class="d8-navbar" aria-label="Editorias">
	<div class="d8-navbar__inner">
		<?php
		if ( has_nav_menu( 'primary' ) ) {
			wp_nav_menu( array(
				'theme_location' => 'primary',
				'container'      => false,
				'menu_class'     => 'd8-navbar__menu',
				'depth'          => 1,
				'fallback_cb'    => false,
			) );
		} else {
			echo '<ul class="d8-navbar__menu">';
			$cats = get_categories( array(
				'orderby'    => 'count',
				'order'      => 'DESC',
				'number'     => 8,
				'hide_empty' => true,
				'exclude'    => d8_excluded_lang_cat_ids(),
			) );
			foreach ( $cats as $c ) {
				echo '<li><a href="' . esc_url( get_category_link( $c->term_id ) ) . '">' . esc_html( $c->name ) . '</a></li>';
			}
			echo '</ul>';
		}
		?>
	</div>
</nav>

<div id="d8-search-panel" hidden inert aria-label="Painel de busca" style="background:var(--d8-paper);border-bottom:1px solid var(--d8-line);padding:16px 18px;">
	<form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" style="max-width:760px;margin:0 auto;display:flex;gap:8px;">
		<label for="d8-s" class="screen-reader-text">Buscar</label>
		<input id="d8-s" type="search" name="s" placeholder="Buscar no DF8 News" value="<?php echo esc_attr( get_search_query() ); ?>" style="flex:1;padding:11px 14px;border:1px solid var(--d8-line);font-family:inherit;font-size:15px;border-radius:var(--d8-r-button);">
		<button type="submit" style="padding:11px 22px;background:var(--d8-primary);color:var(--d8-paper);border:0;font-family:var(--d8-font-display);font-weight:400;letter-spacing:.12em;text-transform:uppercase;border-radius:var(--d8-r-button);">Buscar</button>
	</form>
</div>

<script>
(function(){
	var btn = document.querySelector('.d8-masthead__search-btn');
	var panel = document.getElementById('d8-search-panel');
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
