<?php
/**
 * Header — H4 sticky megamenu, hidden burger, icon search modal.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="profile" href="https://gmpg.org/xfn/11">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Inter:<<REMOVIDO>>;500;600;700;800&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Inter:<<REMOVIDO>>;500;600;700;800&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Inter:<<REMOVIDO>>;500;600;700;800&display=swap"></noscript>
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<header class="oie-header" role="banner">
    <div class="oie-container">
        <div class="oie-header__bar">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="oie-header__brand" aria-label="<?php bloginfo( 'name' ); ?>">
                <?php echo esc_html( get_bloginfo( 'name' ) ); ?><span class="oie-brand__dot">.</span>
            </a>
            <div class="oie-header__actions">
                <button class="oie-header__icon" id="oie-search-toggle" aria-label="Buscar" aria-controls="oie-search-modal" aria-expanded="false">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                </button>
                <button class="oie-header__icon oie-theme-toggle" id="oie-theme-toggle" aria-label="Alternar tema escuro">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>
                </button>
                <button class="oie-header__icon oie-header__burger" id="oie-burger" aria-label="Abrir menu" aria-controls="oie-megamenu" aria-expanded="false">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                </button>
            </div>
        </div>
    </div>

    <?php
    // Breaking strip — manchete única mais recente (com thumbnail)
    $bk = oie_query_for_section( array( 'posts_per_page' => 5, 'orderby' => 'date', 'order' => 'DESC' ) );
    $bk_post = null;
    while ( $bk->have_posts() ) {
        $bk->the_post();
        if ( has_post_thumbnail() ) { $bk_post = get_post(); break; }
    }
    wp_reset_postdata();
    ?>
    <?php if ( $bk_post ) : ?>
    <div class="oie-breaking">
        <div class="oie-container">
            <div class="oie-breaking__inner">
                <span class="oie-breaking__label">Agora</span>
                <a class="oie-breaking__headline" href="<?php echo esc_url( get_permalink( $bk_post ) ); ?>">
                    <?php echo esc_html( get_the_title( $bk_post ) ); ?>
                </a>
            </div>
        </div>
    </div>
    <?php endif; ?>
</header>

<!-- Megamenu (aberto via burger) -->
<div class="oie-megamenu" id="oie-megamenu" role="dialog" aria-modal="true" aria-labelledby="oie-megamenu-title">
    <div class="oie-megamenu__inner">
        <button class="oie-megamenu__close" id="oie-megamenu-close" aria-label="Fechar menu">×</button>
        <h2 id="oie-megamenu-title" class="oie-sr-only">Menu</h2>
        <?php
        if ( has_nav_menu( 'primary' ) ) {
            wp_nav_menu( array(
                'theme_location' => 'primary',
                'container'      => false,
                'menu_class'     => 'oie-megamenu__list',
                'fallback_cb'    => false,
            ) );
        } else {
            echo '<ul class="oie-megamenu__list">';
            wp_list_categories( array( 'title_li' => '', 'orderby' => 'count', 'order' => 'DESC', 'number' => 12, 'hide_empty' => true ) );
            echo '</ul>';
        }
        ?>
    </div>
</div>

<!-- Search modal -->
<div class="oie-search-modal" id="oie-search-modal" role="dialog" aria-modal="true" aria-label="Buscar">
    <form role="search" method="get" class="oie-search-modal__form" action="<?php echo esc_url( home_url( '/' ) ); ?>">
        <input type="search" name="s" placeholder="Buscar no Oi Empreendedores…" autofocus>
    </form>
</div>

<main id="content" class="oie-main">
    <div class="oie-container">
