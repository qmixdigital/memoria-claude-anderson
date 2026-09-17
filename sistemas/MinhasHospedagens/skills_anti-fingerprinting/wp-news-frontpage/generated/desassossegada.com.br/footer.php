<?php
// Footer F1: minimal single row, slashes separator, credit "Pelo direito à informação clara."
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
  </div><!-- /.dsg-shell -->
</main>

<footer class="dsg-footer" role="contentinfo">
  <div class="dsg-shell">
    <div class="dsg-footer__row">
      <div>
        <div class="text-sm text-muted">&copy; <?php echo date( 'Y' ); ?> <?php bloginfo( 'name' ); ?></div>
        <div class="dsg-footer__credit">Pelo direito à informação clara.</div>
      </div>
      <div class="flex gap-4 wrap items-center">
        <?php
        $cats = get_categories( array(
          'orderby'    => 'count',
          'order'      => 'DESC',
          'number'     => 6,
          'hide_empty' => true,
          'exclude'    => dsg_excluded_lang_cat_ids(),
        ) );
        foreach ( $cats as $i => $c ) {
          if ( $i > 0 ) { echo '<span class="text-muted">/</span>'; }
          echo '<a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a>';
        }
        ?>
      </div>
    </div>
  </div>
</footer>

<!-- LGPD cookie consent (auto-load, dispensavel) -->
<div class="dsg-consent" id="dsg-consent" role="dialog" aria-labelledby="dsg-consent-title" aria-hidden="true">
  <div class="dsg-consent__text">
    <strong id="dsg-consent-title">Cookies e privacidade</strong>
    Usamos cookies para melhorar sua experiência, lembrar suas preferências e medir audiência. Você pode aceitar todos ou apenas os necessários.
    <?php
    $priv_url = get_privacy_policy_url();
    if ( $priv_url ) {
      echo ' <a href="' . esc_url( $priv_url ) . '">Política de privacidade</a>.';
    }
    ?>
  </div>
  <div class="dsg-consent__actions">
    <button type="button" class="dsg-consent__btn" data-consent="necessary">Apenas necessários</button>
    <button type="button" class="dsg-consent__btn dsg-consent__btn--primary" data-consent="accepted">Aceitar todos</button>
  </div>
</div>
<script>
(function(){
  var KEY = 'cookie_consent';
  var match = document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]+)/);
  if (match) return;
  var el = document.getElementById('dsg-consent');
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
      window.dispatchEvent(new CustomEvent('dsg:consent-accepted'));
    }
  });
})();
</script>

<?php wp_footer(); ?>
</body>
</html>
