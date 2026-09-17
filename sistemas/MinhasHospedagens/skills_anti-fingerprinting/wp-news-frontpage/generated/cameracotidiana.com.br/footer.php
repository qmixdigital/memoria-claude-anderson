<?php
/**
 * Câmera Cotidiana — footer (F5 sticky bar + voice forward, omit copyright).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
</main><!-- /#cc-content -->

<footer class="cc__footer" role="contentinfo">
    <div class="cc__shell">
        <div class="cc__footer__grid">
            <div>
                <span class="cc__footer__brand">
                    <svg viewBox="0 0 28 28" width="22" height="22" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" style="vertical-align:-3px;margin-right:6px;color:var(--cc-accent);">
                        <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" stroke-width="1.6"/>
                        <circle cx="14" cy="14" r="4" fill="currentColor"/>
                    </svg>câmera cotidiana
                </span>
                <p class="cc__footer__voice">
                    Caderno de campo digital. Pequenos ensaios sobre o que se vê todo dia, escritos por uma redação que ainda acredita em apurar antes de publicar.
                </p>
            </div>
            <div>
                <h4>navegar</h4>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>">início</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/sobre/' ) ); ?>">sobre</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">contato</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/feed/' ) ); ?>">rss</a></li>
                </ul>
            </div>
            <div>
                <h4>cadernos</h4>
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
        </div>
    </div>
</footer>

<!-- Sticky bar (F5) -->
<div class="cc__sticky-bar" role="region" aria-label="Barra fixa">
    <div class="cc__sticky-bar__inner">
        <span>› <a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">manda sua pauta</a> ou siga o boletim semanal</span>
        <button type="button" class="cc__sticky-bar__close" aria-label="Fechar barra">[ fechar ]</button>
    </div>
</div>

<?php wp_footer(); ?>
</body>
</html>
