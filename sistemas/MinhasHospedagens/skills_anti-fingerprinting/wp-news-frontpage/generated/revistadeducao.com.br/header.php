<?php
/** Header — terminal/tech style. Logo lowercase à esquerda + ticker decorativo + nav mono uppercase. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="profile" href="https://gmpg.org/xfn/11">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:<<REMOVIDO>>;500;600&family=JetBrains+Mono:<<REMOVIDO>>;500;600;700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:<<REMOVIDO>>;500;600&family=JetBrains+Mono:<<REMOVIDO>>;500;600;700&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:<<REMOVIDO>>;500;600&family=JetBrains+Mono:<<REMOVIDO>>;500;600;700&display=swap"></noscript>
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a class="skip-link screen-reader-text" href="#main">Pular para o conteúdo</a>

<header class="rde-header" role="banner">
    <div class="rde-header__topbar">
        <div class="rde-container">
            <div class="rde-header__topbar-row">
                <span><strong>LIVE</strong> · <?php echo esc_html( ucfirst( wp_date( 'l, j \\d\\e F \\d\\e Y' ) ) ); ?></span>
                <span><?php bloginfo( 'description' ); ?></span>
            </div>
        </div>
    </div>

    <div class="rde-container">
        <div class="rde-header__masthead">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="rde-header__brand" aria-label="<?php bloginfo( 'name' ); ?>">
                <?php echo esc_html( strtolower( get_bloginfo( 'name' ) ) ); ?><span class="rde-brand__dot">_</span>
            </a>
            <div class="rde-header__ticker" aria-hidden="true">
                <span class="rde-header__ticker-item"><strong>BTC</strong> <span class="up">▲ 2.4%</span></span>
                <span class="rde-header__ticker-item"><strong>ETH</strong> <span class="down">▼ 0.8%</span></span>
                <span class="rde-header__ticker-item"><strong>USD</strong> <span class="up">▲ R$ 5.12</span></span>
            </div>
        </div>

        <div class="rde-header__nav-row">
            <?php if ( has_nav_menu( 'primary' ) ) :
                wp_nav_menu( array(
                    'theme_location' => 'primary',
                    'container'      => false,
                    'menu_class'     => 'rde-nav',
                    'fallback_cb'    => false,
                    'depth'          => 1,
                ) );
            else : ?>
                <ul class="rde-nav">
                    <?php
                    $cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 7, 'hide_empty' => true ) );
                    foreach ( $cats as $c ) {
                        echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
                    }
                    ?>
                </ul>
            <?php endif; ?>
            <div style="position:relative">
                <button class="rde-header__search-toggle" id="rde-search-toggle" aria-label="Buscar" aria-expanded="false">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                </button>
                <form role="search" method="get" class="rde-header__search-dropdown" id="rde-search-dropdown" action="<?php echo esc_url( home_url( '/' ) ); ?>">
                    <input type="search" name="s" placeholder="search_> " aria-label="Buscar">
                </form>
            </div>
        </div>
    </div>
</header>

<main id="main" class="rde-main">
    <div class="rde-container">
