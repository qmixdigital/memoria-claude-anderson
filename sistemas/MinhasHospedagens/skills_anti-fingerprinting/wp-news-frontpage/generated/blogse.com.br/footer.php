<?php
/* Footer F1 minimal + LGPD cookie banner */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
    </div>
</main>

<footer class="bx-footer" role="contentinfo">
    <div class="bx-shell">
        <div class="bx-footer__main">
            <div class="bx-footer__brand">
                <span style="color: var(--bx-cream);"><?php echo bx_logo_svg(); ?></span>
                <p><?php echo esc_html( get_bloginfo( 'description' ) ?: 'Cultura, comportamento e o que está acontecendo agora.' ); ?></p>
            </div>
            <div class="bx-footer__nav">
                <h4>Editorias</h4>
                <ul>
                    <?php
                    $cats = get_categories( array(
                        'orderby' => 'count', 'order' => 'DESC', 'number' => 6,
                        'hide_empty' => true, 'exclude' => bx_excluded_lang_cat_ids(),
                    ) );
                    foreach ( $cats as $c ) {
                        echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
                    }
                    ?>
                </ul>
            </div>
            <div class="bx-footer__nav">
                <h4>Institucional</h4>
                <ul>
                    <?php $priv = get_privacy_policy_url(); if ( $priv ) : ?>
                        <li><a href="<?php echo esc_url( $priv ); ?>">Privacidade</a></li>
                    <?php endif; ?>
                    <li><a href="<?php echo esc_url( home_url( '/sobre/' ) ); ?>">Sobre</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Contato</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/feed/' ) ); ?>">RSS</a></li>
                </ul>
            </div>
        </div>
        <div class="bx-footer__bottom">
            <span>&copy; <?php echo date( 'Y' ); ?> Blog-Se</span>
            <div class="flex" style="display:flex;gap:18px;flex-wrap:wrap;">
                <?php if ( $priv ) : ?><a href="<?php echo esc_url( $priv ); ?>">Privacidade</a><?php endif; ?>
                <a href="<?php echo esc_url( home_url( '/termos-de-uso/' ) ); ?>">Termos</a>
                <a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Contato</a>
            </div>
        </div>
    </div>
</footer>

<div class="bx-consent" id="bx-consent" role="dialog" aria-labelledby="bx-consent-title" aria-hidden="true">
    <div class="bx-consent__text">
        <strong id="bx-consent-title">Cookies</strong>
        Usamos cookies para melhorar sua experiência e medir audiência.
        <?php $priv_url = get_privacy_policy_url(); if ( $priv_url ) : ?>
            <a href="<?php echo esc_url( $priv_url ); ?>">Saiba mais</a>.
        <?php endif; ?>
    </div>
    <div class="bx-consent__actions">
        <button type="button" class="bx-consent__btn" data-consent="necessary">Apenas necessários</button>
        <button type="button" class="bx-consent__btn bx-consent__btn--primary" data-consent="accepted">Aceitar todos</button>
    </div>
</div>
<script>
(function(){
    if (document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]+)/)) return;
    var el = document.getElementById('bx-consent');
    if (!el) return;
    requestAnimationFrame(function(){ el.classList.add('is-visible'); el.setAttribute('aria-hidden','false'); });
    el.addEventListener('click', function(e){
        var btn = e.target.closest('[data-consent]');
        if (!btn) return;
        document.cookie = 'cookie_consent=' + btn.getAttribute('data-consent') + ';path=/;max-age=31536000;samesite=lax';
        el.classList.remove('is-visible');
        el.setAttribute('aria-hidden','true');
    });
})();
</script>

<?php wp_footer(); ?>
</body>
</html>
