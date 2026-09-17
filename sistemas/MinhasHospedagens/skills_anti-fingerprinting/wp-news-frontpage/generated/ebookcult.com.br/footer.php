<?php
/**
 * Portal: ebookcult.com.br
 * Footer — manifesto literário + index of pages
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
</main><!-- /#ec-content -->

<footer class="ec-footer" role="contentinfo">
    <div class="ec-shell">
        <div class="ec-footer__grid">
            <div class="ec-footer__brand">
                <span class="ec-brand__mark">ebook<span>cult</span></span>
                <p class="ec-footer__manifesto">
                    Lemos para fugir do barulho. Aqui você encontra resenhas de livros que importam, formação online avaliada com critério, e marketing escrito por quem pratica. Sem release pago como matéria, sem listas patrocinadas.
                </p>
            </div>
            <div>
                <h4>Editorial</h4>
                <?php
                if ( has_nav_menu( 'footer-1' ) ) {
                    wp_nav_menu( array(
                        'theme_location' => 'footer-1',
                        'container'      => false,
                        'menu_class'     => '',
                        'depth'          => 1,
                    ) );
                } else {
                    echo '<ul>';
                    echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">Edições anteriores</a></li>';
                    echo '<li><a href="' . esc_url( home_url( '/sobre/' ) ) . '">Quem escreve</a></li>';
                    echo '<li><a href="' . esc_url( home_url( '/contato/' ) ) . '">Proponha pauta</a></li>';
                    echo '<li><a href="' . esc_url( home_url( '/feed/' ) ) . '">RSS</a></li>';
                    echo '</ul>';
                }
                ?>
            </div>
            <div>
                <h4>Estantes</h4>
                <ul>
                    <?php
                    $cats = get_categories( array(
                        'orderby'    => 'count',
                        'order'      => 'DESC',
                        'number'     => 6,
                        'hide_empty' => true,
                    ) );
                    foreach ( $cats as $c ) {
                        echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
                    }
                    ?>
                </ul>
            </div>
            <div>
                <h4>Colofão</h4>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">Política de privacidade</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/termos-de-uso/' ) ); ?>">Termos de uso</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Fale com a redação</a></li>
                </ul>
            </div>
        </div>
        <div class="ec-footer__copy">
            <span>© <?php echo esc_html( wp_date( 'Y' ) ); ?> Ebookcult · Conteúdo independente, redação própria</span>
            <span>Tipografia em sistema · Sem rastreadores além de analytics</span>
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
