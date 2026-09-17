<?php
/**
 * Header H1 — Classic 3-row: topline + main (logo + tagline + tools) + nav row
 * Search: icon modal on click. Logo SVG inline (substitui logo PNG antiga).
 */
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

<a class="bx-skip" href="#bx-content">Pular para o conteúdo</a>

<header class="bx-header" role="banner">
    <div class="bx-header__topline">
        <div class="bx-shell">
            <span><span class="bx-dot" aria-hidden="true"></span>Edição do dia</span>
            <span><?php echo esc_html( date_i18n( 'l, j \d\e F \d\e Y' ) ); ?></span>
        </div>
    </div>
    <div class="bx-header__main">
        <div class="bx-shell">
            <a class="bx-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php bloginfo( 'name' ); ?> - página inicial">
                <?php echo bx_logo_svg(); ?>
            </a>
            <p class="bx-header__tagline">Cultura, comportamento e o que está acontecendo agora.</p>
            <div class="bx-header__tools">
                <button type="button" class="bx-icon-btn" id="bx-search-open" aria-label="Abrir busca">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.6" y2="16.6"></line>
                    </svg>
                </button>
                <div class="bx-social-row" aria-label="Redes sociais">
                    <a href="https://www.instagram.com/" class="bx-icon-btn" aria-label="Instagram" target="_blank" rel="noopener">
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c2.7 0 3 0 4.1.1 1 0 1.7.2 2.4.5.7.3 1.3.7 1.9 1.3.6.6 1 1.2 1.3 1.9.3.7.5 1.4.5 2.4.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c0 1-.2 1.7-.5 2.4-.3.7-.7 1.3-1.3 1.9-.6.6-1.2 1-1.9 1.3-.7.3-1.4.5-2.4.5-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-1 0-1.7-.2-2.4-.5-.7-.3-1.3-.7-1.9-1.3-.6-.6-1-1.2-1.3-1.9-.3-.7-.5-1.4-.5-2.4-.1-1.1-.1-1.4-.1-4.1s0-3 .1-4.1c0-1 .2-1.7.5-2.4.3-.7.7-1.3 1.3-1.9.6-.6 1.2-1 1.9-1.3.7-.3 1.4-.5 2.4-.5C9 2 9.3 2 12 2zm0 5.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm0 7.4a2.9 2.9 0 1 1 2.9-2.9A2.9 2.9 0 0 1 12 14.9zm5.6-7.7a1.1 1.1 0 1 0-1.1-1.1 1.1 1.1 0 0 0 1.1 1.1z"/></svg>
                    </a>
                    <a href="https://www.facebook.com/" class="bx-icon-btn" aria-label="Facebook" target="_blank" rel="noopener">
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 22v-8h3l.5-4H13V7.5c0-1.1.4-2 2-2h2V2.1c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8V10H6v4h3.5v8H13z"/></svg>
                    </a>
                </div>
                <button type="button" class="bx-menu-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="bx-drawer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    </div>
    <nav class="bx-nav" aria-label="Menu principal">
        <div class="bx-shell">
            <?php
            if ( function_exists( 'wp_nav_menu' ) ) {
                wp_nav_menu( array(
                    'theme_location'  => 'primary',
                    'container'       => false,
                    'menu_class'      => 'bx-nav__list',
                    'fallback_cb'     => 'bx_default_menu_fallback',
                    'depth'           => 1,
                ) );
            }
            ?>
        </div>
    </nav>
</header>

<?php
if ( ! function_exists( 'bx_default_menu_fallback' ) ) {
    function bx_default_menu_fallback() {
        $cats = get_categories( array(
            'orderby'    => 'count', 'order' => 'DESC', 'number' => 8,
            'hide_empty' => true, 'exclude' => bx_excluded_lang_cat_ids(),
        ) );
        echo '<ul class="bx-nav__list">';
        foreach ( $cats as $c ) {
            echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
        }
        echo '</ul>';
    }
}
?>

<!-- Search modal -->
<div class="bx-search-modal" id="bx-search-modal" role="dialog" aria-label="Buscar no site">
    <button type="button" class="bx-search-modal__close" id="bx-search-close" aria-label="Fechar busca">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    </button>
    <form class="bx-search-modal__form" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
        <input type="search" name="s" id="bx-search-input" placeholder="O que está procurando?" aria-label="Buscar">
        <button type="submit">Buscar</button>
    </form>
</div>

<!-- Drawer mobile -->
<div class="bx-drawer__backdrop" id="bx-drawer-backdrop" hidden></div>
<aside class="bx-drawer" id="bx-drawer" aria-hidden="true">
    <div class="bx-drawer__head">
        <h2>Editorias</h2>
        <button type="button" class="bx-drawer__close" id="bx-drawer-close" aria-label="Fechar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    </div>
    <?php bx_default_menu_fallback(); ?>
</aside>

<script>
(function(){
    var modal = document.getElementById('bx-search-modal');
    var openBtn = document.getElementById('bx-search-open');
    var closeBtn = document.getElementById('bx-search-close');
    var input = document.getElementById('bx-search-input');
    if (modal && openBtn) {
        openBtn.addEventListener('click', function(){
            modal.classList.add('is-open');
            if (input) setTimeout(function(){ input.focus(); }, 50);
        });
    }
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.classList.remove('is-open'); });
    document.addEventListener('keydown', function(e){
        if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) modal.classList.remove('is-open');
    });
    if (modal) modal.addEventListener('click', function(e){ if (e.target === modal) modal.classList.remove('is-open'); });

    var toggle = document.querySelector('.bx-menu-toggle');
    var drawer = document.getElementById('bx-drawer');
    var backdrop = document.getElementById('bx-drawer-backdrop');
    var drawerClose = document.getElementById('bx-drawer-close');
    if (toggle && drawer && backdrop) {
        backdrop.removeAttribute('hidden');
        function shut() {
            drawer.classList.remove('is-open');
            backdrop.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            drawer.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
        toggle.addEventListener('click', function(){
            if (drawer.classList.contains('is-open')) { shut(); } else {
                drawer.classList.add('is-open');
                backdrop.classList.add('is-open');
                toggle.setAttribute('aria-expanded', 'true');
                drawer.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            }
        });
        backdrop.addEventListener('click', shut);
        if (drawerClose) drawerClose.addEventListener('click', shut);
        document.addEventListener('keydown', function(e){
            if (e.key === 'Escape' && drawer.classList.contains('is-open')) shut();
        });
    }
})();
</script>

<main id="bx-content" class="bx-main">
    <div class="bx-shell">
