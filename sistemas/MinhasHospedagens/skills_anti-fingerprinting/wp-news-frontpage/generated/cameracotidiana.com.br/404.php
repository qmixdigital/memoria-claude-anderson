<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<div class="cc__shell">
    <section class="cc__404">
        <span class="cc__404__num">— 404 —</span>
        <h1 class="cc__404__title">filme velado</h1>
        <p class="cc__404__lead">A página que você procurou não existe (ou existiu e foi para o arquivo morto). Continua de alguma forma. Tente buscar abaixo ou volte ao início.</p>
        <form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" class="cc__404__form">
            <input type="search" name="s" placeholder="o que procura?">
            <button type="submit" class="cc__btn">buscar</button>
        </form>
        <p style="margin-top:var(--cc-sp-5);"><a class="cc__btn cc__btn--filled" href="<?php echo esc_url( home_url( '/' ) ); ?>">› voltar ao início</a></p>
    </section>
</div>
<style>
.cc__404 { padding: var(--cc-sp-7) 0; max-width: 60ch; }
.cc__404__num { display: inline-block; font-family: var(--cc-mono); font-size: 11px; color: var(--cc-accent); letter-spacing: .26em; text-transform: lowercase; font-weight: 700; margin-bottom: var(--cc-sp-3); }
.cc__404__title { font-family: var(--cc-display); font-size: clamp(40px, 8vw, 88px); font-style: italic; font-weight: 800; letter-spacing: -0.04em; text-transform: lowercase; margin: 0 0 var(--cc-sp-3); }
.cc__404__lead { font-family: var(--cc-serif); font-size: 18px; line-height: 1.65; color: var(--cc-muted); font-style: italic; margin: 0 0 var(--cc-sp-5); }
.cc__404__form { display: flex; gap: 14px; align-items: end; flex-wrap: wrap; }
.cc__404__form input { flex: 1; min-width: 220px; }
</style>
<?php get_footer();
