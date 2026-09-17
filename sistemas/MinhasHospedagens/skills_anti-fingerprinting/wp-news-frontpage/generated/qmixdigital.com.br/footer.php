<?php
# Footer (F5 sticky bar adaptado para layout normal + bar inferior)
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
  </div>
</main>

<footer class="site-footer" role="contentinfo">
  <div class="site-footer__main">
    <div class="shell">
      <div class="site-footer__brand-col">
        <a class="site-footer__brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php bloginfo( 'name' ); ?>">
          <img src="https://qmixdigital.com.br/wp-content/uploads/2023/11/Revista-Qmix-branco.webp" alt="Revista QMIX" width="200" height="40" loading="lazy">
        </a>
        <div class="site-footer__about">
          <p><?php echo esc_html( get_bloginfo( 'description' ) ?: 'Revista digital independente. Marketing, negócios, saúde, tecnologia e o que move a economia criativa brasileira.' ); ?></p>
        </div>
      </div>
      <div class="site-footer__nav">
        <h4>Editorias</h4>
        <ul>
          <?php
          $cats = get_categories( array(
            'orderby' => 'count', 'order' => 'DESC', 'number' => 6,
            'hide_empty' => true, 'exclude' => qmix_excluded_lang_cat_ids(),
          ) );
          foreach ( $cats as $c ) {
            echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
          }
          ?>
        </ul>
      </div>
      <div class="site-footer__nav">
        <h4>Institucional</h4>
        <ul>
          <?php
          $priv = get_privacy_policy_url();
          if ( $priv ) {
            echo '<li><a href="' . esc_url( $priv ) . '">Privacidade</a></li>';
          }
          ?>
          <li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Contato</a></li>
          <li><a href="<?php echo esc_url( home_url( '/sobre/' ) ); ?>">Sobre</a></li>
          <li><a href="<?php echo esc_url( home_url( '/feed/' ) ); ?>">RSS</a></li>
        </ul>
      </div>
    </div>
  </div>
  <div class="site-footer__bottom">
    <div class="shell">
      <span class="site-footer__copyright">&copy; <?php echo date( 'Y' ); ?> Revista QMIX. Conteúdo independente.</span>
      <div class="flex" style="display:flex;gap:18px;flex-wrap:wrap;">
        <?php if ( $priv ) : ?>
          <a href="<?php echo esc_url( $priv ); ?>">Privacidade</a>
        <?php endif; ?>
        <a href="<?php echo esc_url( home_url( '/termos-de-uso/' ) ); ?>">Termos</a>
        <a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Contato</a>
      </div>
    </div>
  </div>
</footer>

<div class="consent-banner" id="qmix-consent" role="dialog" aria-labelledby="qmix-consent-title" aria-hidden="true">
  <div class="consent-banner__text">
    <strong id="qmix-consent-title">Cookies e privacidade</strong>
    Usamos cookies para melhorar sua experiência e medir audiência. Você pode aceitar todos ou apenas os necessários.
    <?php
    $priv_url = get_privacy_policy_url();
    if ( $priv_url ) {
      echo ' <a href="' . esc_url( $priv_url ) . '">Saiba mais</a>.';
    }
    ?>
  </div>
  <div class="consent-banner__actions">
    <button type="button" class="consent-banner__btn" data-consent="necessary">Apenas necessários</button>
    <button type="button" class="consent-banner__btn consent-banner__btn--primary" data-consent="accepted">Aceitar todos</button>
  </div>
</div>
<script>
(function(){
  var KEY = 'cookie_consent';
  if (document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]+)/)) return;
  var el = document.getElementById('qmix-consent');
  if (!el) return;
  requestAnimationFrame(function(){
    el.classList.add('is-visible');
    el.setAttribute('aria-hidden', 'false');
  });
  el.addEventListener('click', function(e){
    var btn = e.target.closest('[data-consent]');
    if (!btn) return;
    var val = btn.getAttribute('data-consent');
    document.cookie = KEY + '=' + val + ';path=/;max-age=31536000;samesite=lax';
    el.classList.remove('is-visible');
    el.setAttribute('aria-hidden', 'true');
    if (val === 'accepted') {
      window.dispatchEvent(new CustomEvent('qmix:consent-accepted'));
    }
  });
})();
</script>

<?php wp_footer(); ?>
</body>
</html>
