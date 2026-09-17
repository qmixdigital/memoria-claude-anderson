<?php
// Header — centered magazine masthead (logo centralizada, topline preto, nav abaixo)
if ( ! defined( 'ABSPATH' ) ) { exit; }
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="profile" href="https://gmpg.org/xfn/11">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php if ( function_exists( 'wp_body_open' ) ) { wp_body_open(); } ?>

<a class="dsg-skip" href="#dsg-content">Pular para o conteúdo</a>

<header class="dsg-header" role="banner">
  <div class="dsg-header__topline">
    <div class="dsg-shell">
      <span><span class="dsg-dot" aria-hidden="true"></span>No ar agora</span>
      <span><?php echo esc_html( date_i18n( 'l, j \d\e F \d\e Y' ) ); ?></span>
    </div>
  </div>
  <div class="dsg-shell">
    <div class="dsg-header__bar">
      <div class="dsg-header__bar-left">conteúdo plural, redação independente</div>
      <a class="dsg-header__brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php bloginfo( 'name' ); ?> - página inicial">
        <img fetchpriority="high"
             src="https://desassossegada.com.br/wp-content/uploads/2024/11/desassossegada-logo-600-x-120-px.png"
             class="logo-image"
             alt="<?php bloginfo( 'name' ); ?>"
             width="600" height="120">
      </a>
      <div class="dsg-header__bar-right">
        <a class="dsg-header__icon" href="<?php echo esc_url( home_url( '/?s=' ) ); ?>" aria-label="Buscar no site">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.6" y2="16.6"></line>
          </svg>
        </a>
      </div>
    </div>
  </div>
  <nav class="dsg-nav" aria-label="Menu principal">
    <div class="dsg-shell">
      <?php
      $menu_args = array(
        'theme_location'  => 'primary',
        'container'       => false,
        'menu_class'      => 'dsg-nav__list',
        'fallback_cb'     => 'dsg_default_menu_fallback',
        'depth'           => 1,
      );
      if ( function_exists( 'wp_nav_menu' ) ) { wp_nav_menu( $menu_args ); }
      ?>
    </div>
  </nav>
</header>

<?php
if ( ! function_exists( 'dsg_default_menu_fallback' ) ) {
  function dsg_default_menu_fallback() {
    $cats = get_categories( array(
      'orderby'    => 'count',
      'order'      => 'DESC',
      'number'     => 9,
      'hide_empty' => true,
      'exclude'    => dsg_excluded_lang_cat_ids(),
    ) );
    echo '<ul class="dsg-nav__list">';
    foreach ( $cats as $c ) {
      echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
    }
    echo '</ul>';
  }
}
?>

<main id="dsg-content" class="dsg-main">
  <div class="dsg-shell">
