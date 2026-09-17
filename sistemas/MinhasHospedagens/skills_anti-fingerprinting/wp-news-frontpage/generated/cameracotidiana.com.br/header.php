<?php
/**
 * Câmera Cotidiana — header.
 * Layout: util strip + brand row centered + nav row (uma linha, não split).
 * Sticky on scroll up. Search modal on icon click.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<!doctype html>
<html <?php language_attributes(); ?> data-theme="light">
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>
        (function () {
            try { var t = localStorage.getItem('cc-theme');
                  if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark'); } catch (e) {}
        })();
    </script>
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php if ( function_exists( 'wp_body_open' ) ) wp_body_open(); ?>

<a class="cc__skip" href="#cc-content">pular para o conteúdo</a>

<header class="cc__chrome" role="banner" id="cc-chrome">

    <div class="cc__chrome__util">
        <div class="cc__shell">
            <div class="cc__chrome__util-row">
                <span class="cc__chrome__frame">on the air desde 2018</span>
                <div class="cc__chrome__util-actions">
                    <button type="button" class="cc__chrome__theme-toggle" aria-label="Alternar tema claro/escuro">tema</button>
                    <button type="button" class="cc__chrome__search-open" aria-label="Buscar">buscar</button>
                </div>
            </div>
        </div>
    </div>

    <div class="cc__chrome__brand">
        <div class="cc__shell">
            <p class="cc__brand-wrap" style="margin:0;text-align:center;">
                <a class="cc__brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
                    <span class="cc__brand__frame cc__brand__frame--tl"></span>
                    <span class="cc__brand__frame cc__brand__frame--tr"></span>
                    <span class="cc__brand__inner">
                        <span class="cc__brand__sub">desde 2018  ·  o cotidiano em foco</span>
                        <span class="cc__brand__row">
                            <span class="cc__brand__lens" aria-hidden="true">
                                <svg viewBox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg" focusable="false">
                                    <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-width="2"/>
                                    <circle cx="20" cy="20" r="11.5" fill="none" stroke="currentColor" stroke-width="1"/>
                                    <circle cx="20" cy="20" r="5.5" fill="currentColor"/>
                                </svg>
                            </span>
                            <span class="cc__brand__name">
                                <span class="cc__brand__name-1">câmera</span>
                                <span class="cc__brand__name-2">cotidiana</span>
                            </span>
                        </span>
                    </span>
                    <span class="cc__brand__frame cc__brand__frame--bl"></span>
                    <span class="cc__brand__frame cc__brand__frame--br"></span>
                </a>
            </p>
        </div>
    </div>

    <nav class="cc__chrome__nav" role="navigation" aria-label="Menu principal">
        <div class="cc__shell">
            <?php
            if ( has_nav_menu( 'primary' ) ) {
                wp_nav_menu( array(
                    'theme_location' => 'primary',
                    'container'      => false,
                    'menu_class'     => 'cc__menu',
                    'depth'          => 1,
                    'fallback_cb'    => 'cc_menu_fallback',
                ) );
            } else {
                cc_menu_fallback();
            }
            ?>
        </div>
    </nav>

    <div class="cc__chrome__bottom"></div>
</header>

<!-- Search modal -->
<div class="cc__search-modal" aria-hidden="true" role="dialog">
    <button type="button" class="cc__search-modal__close" aria-label="Fechar busca">fechar (esc)</button>
    <form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
        <input type="search" name="s" placeholder="o que procura?" aria-label="Buscar no portal" autocomplete="off">
    </form>
</div>

<main id="cc-content" role="main">
