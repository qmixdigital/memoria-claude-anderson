<?php
# Header H2: single-row compact, sticky always, search inline, social top-right, menu right-of-logo
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

<a class="skip-link" href="#site-content">Pular para o conteúdo</a>

<header class="site-header" role="banner">
  <div class="shell">
    <a class="site-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php bloginfo( 'name' ); ?> - página inicial">
      <img fetchpriority="high"
           src="https://qmixdigital.com.br/wp-content/uploads/2023/11/Revista-Qmix-branco.webp"
           class="logo-image logo-image-dark"
           alt="Revista QMIX"
           width="300" height="60">
    </a>
    <nav class="site-nav" aria-label="Menu principal">
      <?php
      if ( function_exists( 'wp_nav_menu' ) ) {
        wp_nav_menu( array(
          'theme_location'  => 'primary',
          'container'       => false,
          'menu_class'      => '',
          'fallback_cb'     => 'qmix_default_menu_fallback',
          'depth'           => 1,
        ) );
      }
      ?>
    </nav>
    <div class="site-tools">
      <form class="site-search" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
        <input type="search" name="s" placeholder="Buscar..." aria-label="Buscar">
        <button type="submit" aria-label="Buscar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.6" y2="16.6"></line>
          </svg>
        </button>
      </form>
      <div class="social-icons" aria-label="Redes sociais">
        <a href="https://www.facebook.com/" aria-label="Facebook" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 22v-8h3l.5-4H13V7.5c0-1.1.4-2 2-2h2V2.1c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8V10H6v4h3.5v8H13z"/></svg>
        </a>
        <a href="https://www.instagram.com/" aria-label="Instagram" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c2.7 0 3 0 4.1.1 1 0 1.7.2 2.4.5.7.3 1.3.7 1.9 1.3.6.6 1 1.2 1.3 1.9.3.7.5 1.4.5 2.4.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c0 1-.2 1.7-.5 2.4-.3.7-.7 1.3-1.3 1.9-.6.6-1.2 1-1.9 1.3-.7.3-1.4.5-2.4.5-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-1 0-1.7-.2-2.4-.5-.7-.3-1.3-.7-1.9-1.3-.6-.6-1-1.2-1.3-1.9-.3-.7-.5-1.4-.5-2.4-.1-1.1-.1-1.4-.1-4.1s0-3 .1-4.1c0-1 .2-1.7.5-2.4.3-.7.7-1.3 1.3-1.9.6-.6 1.2-1 1.9-1.3.7-.3 1.4-.5 2.4-.5C9 2 9.3 2 12 2zm0 5.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm0 7.4a2.9 2.9 0 1 1 2.9-2.9A2.9 2.9 0 0 1 12 14.9zm5.6-7.7a1.1 1.1 0 1 0-1.1-1.1 1.1 1.1 0 0 0 1.1 1.1z"/></svg>
        </a>
        <a href="https://www.linkedin.com/" aria-label="LinkedIn" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM9 17H6.5v-7H9v7zM7.7 8.9c-.8 0-1.4-.6-1.4-1.4S6.9 6.1 7.7 6.1c.8 0 1.4.6 1.4 1.4S8.5 8.9 7.7 8.9zM18 17h-2.5v-3.6c0-.9-.3-1.5-1.1-1.5-.6 0-1 .4-1.2.9-.1.2-.1.4-.1.6V17H10.6v-7h2.4v1.1c.3-.5 1-1.2 2.4-1.2 1.7 0 3 1.1 3 3.6V17z"/></svg>
        </a>
      </div>
      <button type="button" class="menu-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="qmix-mobile-menu">
        <svg class="menu-toggle__open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
        <svg class="menu-toggle__close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </div>
</header>

<div class="mobile-menu__backdrop" id="qmix-menu-backdrop" hidden></div>
<aside class="mobile-menu" id="qmix-mobile-menu" aria-hidden="true">
  <div class="mobile-menu__head">
    <h2>Navegação</h2>
    <button type="button" class="mobile-menu__close" aria-label="Fechar menu">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
  <?php
  if ( function_exists( 'wp_nav_menu' ) ) {
    wp_nav_menu( array(
      'theme_location' => 'primary',
      'container'      => false,
      'menu_class'     => '',
      'fallback_cb'    => 'qmix_default_menu_fallback',
      'depth'          => 1,
    ) );
  }
  ?>
  <form class="mobile-menu__search" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
    <input type="search" name="s" placeholder="Buscar matérias..." aria-label="Buscar">
    <button type="submit" aria-label="Buscar">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.6" y2="16.6"></line>
      </svg>
    </button>
  </form>
  <div class="mobile-menu__social" aria-label="Redes sociais">
    <a href="https://www.facebook.com/" aria-label="Facebook" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 22v-8h3l.5-4H13V7.5c0-1.1.4-2 2-2h2V2.1c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8V10H6v4h3.5v8H13z"/></svg>
    </a>
    <a href="https://www.instagram.com/" aria-label="Instagram" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c2.7 0 3 0 4.1.1 1 0 1.7.2 2.4.5.7.3 1.3.7 1.9 1.3.6.6 1 1.2 1.3 1.9.3.7.5 1.4.5 2.4.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c0 1-.2 1.7-.5 2.4-.3.7-.7 1.3-1.3 1.9-.6.6-1.2 1-1.9 1.3-.7.3-1.4.5-2.4.5-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-1 0-1.7-.2-2.4-.5-.7-.3-1.3-.7-1.9-1.3-.6-.6-1-1.2-1.3-1.9-.3-.7-.5-1.4-.5-2.4-.1-1.1-.1-1.4-.1-4.1s0-3 .1-4.1c0-1 .2-1.7.5-2.4.3-.7.7-1.3 1.3-1.9.6-.6 1.2-1 1.9-1.3.7-.3 1.4-.5 2.4-.5C9 2 9.3 2 12 2zm0 5.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm0 7.4a2.9 2.9 0 1 1 2.9-2.9A2.9 2.9 0 0 1 12 14.9zm5.6-7.7a1.1 1.1 0 1 0-1.1-1.1 1.1 1.1 0 0 0 1.1 1.1z"/></svg>
    </a>
    <a href="https://www.linkedin.com/" aria-label="LinkedIn" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM9 17H6.5v-7H9v7zM7.7 8.9c-.8 0-1.4-.6-1.4-1.4S6.9 6.1 7.7 6.1c.8 0 1.4.6 1.4 1.4S8.5 8.9 7.7 8.9zM18 17h-2.5v-3.6c0-.9-.3-1.5-1.1-1.5-.6 0-1 .4-1.2.9-.1.2-.1.4-.1.6V17H10.6v-7h2.4v1.1c.3-.5 1-1.2 2.4-1.2 1.7 0 3 1.1 3 3.6V17z"/></svg>
    </a>
  </div>
</aside>
<script>
(function(){
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('qmix-mobile-menu');
  var backdrop = document.getElementById('qmix-menu-backdrop');
  var close = document.querySelector('.mobile-menu__close');
  if (!toggle || !menu || !backdrop) return;
  backdrop.removeAttribute('hidden');
  function open() {
    menu.classList.add('is-open');
    backdrop.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function shut() {
    menu.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  toggle.addEventListener('click', function(){
    if (menu.classList.contains('is-open')) { shut(); } else { open(); }
  });
  backdrop.addEventListener('click', shut);
  if (close) close.addEventListener('click', shut);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && menu.classList.contains('is-open')) shut();
  });
})();
</script>

<?php
if ( ! function_exists( 'qmix_default_menu_fallback' ) ) {
  function qmix_default_menu_fallback() {
    $cats = get_categories( array(
      'orderby' => 'count', 'order' => 'DESC', 'number' => 8,
      'hide_empty' => true,
      'exclude' => qmix_excluded_lang_cat_ids(),
    ) );
    echo '<ul>';
    foreach ( $cats as $c ) {
      echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
    }
    echo '</ul>';
  }
}
?>

<main id="site-content" class="site-main">
  <div class="shell">
