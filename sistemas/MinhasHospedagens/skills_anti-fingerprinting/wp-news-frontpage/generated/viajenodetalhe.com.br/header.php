<?php
/**
 * Viaje no Detalhe — header (H4 sticky megamenu + hidden_burger).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>
    (function () {
      try {
        var t = localStorage.getItem('vd-theme');
        if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      } catch (e) {}
    })();
  </script>
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php if ( function_exists( 'wp_body_open' ) ) wp_body_open(); ?>

<a class="vd-skip" href="#vd-content">pular para o conteúdo</a>

<header class="vd-chrome" role="banner" id="vd-chrome">

  <div class="vd-chrome__util">
    <div class="vd-shell">
      <div class="vd-chrome__util-row">
        <span class="vd-chrome__util-tag">almanaque editorial · <?php echo esc_html( wp_date( 'D, j \\d\\e F' ) ); ?></span>
        <div class="vd-chrome__util-actions">
          <button type="button" class="vd-chrome__theme-toggle" aria-label="Alternar tema claro/escuro">tema</button>
        </div>
      </div>
    </div>
  </div>

  <div class="vd-chrome__masthead">
    <button type="button" class="vd-chrome__burger" aria-label="Abrir menu" aria-expanded="false">índice</button>
    <div class="vd-shell">
      <a class="vd-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
        <span class="vd-brand__seal" aria-hidden="true">
          <span class="vd-brand__seal-frame">
            <span class="vd-brand__seal-mark">VND</span>
            <span class="vd-brand__seal-year"><?php echo esc_html( wp_date( 'Y' ) ); ?></span>
          </span>
        </span>
        <span class="vd-brand__text">
          <span class="vd-brand__name">VIAJE NO DETALHE</span>
          <span class="vd-brand__rule"></span>
          <span class="vd-brand__tag">almanaque editorial · notas e ensaios</span>
        </span>
      </a>
    </div>
  </div>

  <div class="vd-chrome__bottom"></div>
</header>

<aside class="vd-drawer" aria-hidden="true" inert role="dialog" aria-label="Índice">
  <button type="button" class="vd-drawer__close" aria-label="Fechar índice">[ fechar × ]</button>
  <p class="vd-drawer__title">// índice editorial</p>
  <?php
  if ( has_nav_menu( 'primary' ) ) {
    wp_nav_menu( array(
      'theme_location' => 'primary',
      'container'      => false,
      'menu_class'     => 'vd-menu',
      'depth'          => 1,
      'fallback_cb'    => 'vd_menu_fallback',
    ) );
  } else {
    vd_menu_fallback();
  }
  ?>
</aside>

<main id="vd-content" role="main">
