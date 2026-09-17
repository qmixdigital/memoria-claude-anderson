<?php
/**
 * Viaje no Detalhe — footer F3 (newsletter featured + credits noticias_responsabilidade).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
</main><!-- /#vd-content -->

<footer class="vd-footer" role="contentinfo">
  <div class="vd-shell">

    <div class="vd-footer__newsletter">
      <p class="vd-footer__nl-kicker">// boletim semanal</p>
      <h3 class="vd-footer__nl-title">Receba o caderno editorial toda quinta</h3>
      <p class="vd-footer__nl-sub">Curadoria de leituras, dicas e bastidores. Sem spam, sem listas patrocinadas. Cancele quando quiser.</p>
      <form class="vd-footer__nl-form" method="post" action="<?php echo esc_url( home_url( '/contato/?nl=1' ) ); ?>">
        <input type="email" name="nl_email" placeholder="seu@email.com" aria-label="Seu e-mail" required>
        <button type="submit" class="vd-btn">assinar →</button>
      </form>
    </div>

    <div class="vd-footer__row">
      <div class="vd-footer__brand">
        <span class="vd-footer__brand-name">Viaje no <em>Detalhe</em></span>
        <p class="vd-footer__brand-line">Almanaque editorial. Conteúdo independente, redação própria. Notícia é responsabilidade.</p>
      </div>
      <div class="vd-footer__col">
        <h4>// editorial</h4>
        <ul>
          <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>">página inicial</a></li>
          <li><a href="<?php echo esc_url( home_url( '/sobre/' ) ); ?>">sobre</a></li>
          <li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">contato</a></li>
          <li><a href="<?php echo esc_url( home_url( '/feed/' ) ); ?>">rss</a></li>
        </ul>
      </div>
      <div class="vd-footer__col">
        <h4>// cadernos</h4>
        <ul>
          <?php
          $cats = get_categories( array(
            'orderby'    => 'count',
            'order'      => 'DESC',
            'number'     => 6,
            'hide_empty' => true,
          ) );
          foreach ( $cats as $c ) {
            echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( strtolower( $c->name ) ) . '</a></li>';
          }
          ?>
        </ul>
      </div>
      <div class="vd-footer__col">
        <h4>// institucional</h4>
        <ul>
          <li><a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">privacidade</a></li>
          <li><a href="<?php echo esc_url( home_url( '/termos-de-uso/' ) ); ?>">termos</a></li>
          <li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">fale com a redação</a></li>
        </ul>
      </div>
    </div>

    <div class="vd-footer__credits">
      <span>© <?php echo esc_html( wp_date( 'Y' ) ); ?> Viaje no Detalhe · Notícia é responsabilidade — apuração antes de publicação</span>
    </div>

  </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
