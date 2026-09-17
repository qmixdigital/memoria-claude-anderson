<?php
/**
 * Portal: ebookcult.com.br
 * Header — nameplate de revista literária (Library Stack)
 * Layout: 3-col (edition info | brand | data ISO)
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="profile" href="https://gmpg.org/xfn/11">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php if ( function_exists( 'wp_body_open' ) ) { wp_body_open(); } ?>

<a class="ec-skip" href="#ec-content"><?php esc_html_e( 'Pular para o conteúdo', 'ebookcult' ); ?></a>

<header class="ec-chrome" role="banner">
    <div class="ec-chrome__top">
        <div class="ec-shell">
            <div class="ec-chrome__row">
                <div class="ec-chrome__edition">
                    <strong>No ar desde 2018</strong>
                    Conteúdo independente
                </div>

                <?php
                $brand_inner = '<span class="ec-brand__mark">ebook<span>cult</span></span>'
                             . '<span class="ec-brand__tag">Leitura · Cursos · Marketing</span>';
                $brand_link  = '<a class="ec-brand" href="' . esc_url( home_url( '/' ) ) . '" rel="home">' . $brand_inner . '</a>';
                if ( is_front_page() && is_home() ) {
                    echo '<h1 style="margin:0; line-height:1;">' . $brand_link . '</h1>';
                } else {
                    echo $brand_link;
                }
                ?>

                <div class="ec-chrome__date">
                    <strong><?php echo esc_html( wp_date( 'l' ) ); ?></strong>
                    <?php echo esc_html( wp_date( 'Y-m-d' ) ); ?>
                </div>
            </div>
        </div>
    </div>
    <nav class="ec-chrome__nav" role="navigation" aria-label="Menu principal">
        <div class="ec-shell">
            <?php
            if ( has_nav_menu( 'primary' ) ) {
                wp_nav_menu( array(
                    'theme_location' => 'primary',
                    'container'      => false,
                    'menu_class'     => 'ec-menu',
                    'depth'          => 1,
                    'fallback_cb'    => 'ec_menu_fallback',
                ) );
            } else {
                ec_menu_fallback();
            }
            ?>
        </div>
    </nav>
</header>

<main id="ec-content" class="ec-shell" role="main">
