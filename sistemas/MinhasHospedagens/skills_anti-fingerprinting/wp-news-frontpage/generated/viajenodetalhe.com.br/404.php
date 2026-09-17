<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<div class="vd-shell">
  <section class="vd-404">
    <span class="vd-404__num">// 404 — página fora do almanaque</span>
    <h1 class="vd-404__title">página perdida</h1>
    <p class="vd-404__lead">Esta entrada não existe (ou foi arquivada). Use a busca abaixo, volte ao índice principal ou explore um caderno editorial.</p>
    <form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" class="vd-404__form">
      <input type="search" name="s" placeholder="o que procura?">
      <button type="submit" class="vd-btn">buscar →</button>
    </form>
    <p style="margin-top:var(--vd-sp-5);"><a class="vd-btn" href="<?php echo esc_url( home_url( '/' ) ); ?>">voltar ao índice</a></p>
  </section>
</div>
<style>
.vd-404 { padding: var(--vd-sp-7) 0; max-width: 60ch; }
.vd-404__num { display: inline-block; font-family: var(--vd-mono); font-size: 11px; color: var(--vd-coral); letter-spacing: .22em; text-transform: lowercase; font-weight: 600; margin-bottom: var(--vd-sp-3); }
.vd-404__title { font-family: var(--vd-display); font-size: clamp(40px, 7vw, 72px); font-weight: 800; letter-spacing: -0.024em; margin: 0 0 var(--vd-sp-3); }
.vd-404__title::before { content: "§ "; color: var(--vd-coral); font-style: italic; font-weight: 400; }
.vd-404__lead { font-family: var(--vd-serif); font-size: 18px; line-height: 1.55; color: var(--vd-muted); font-style: italic; margin: 0 0 var(--vd-sp-5); }
.vd-404__form { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.vd-404__form input { flex: 1; min-width: 220px; }
</style>
<?php get_footer();
