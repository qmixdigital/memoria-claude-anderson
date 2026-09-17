<?php
/** Footer F2 — classic 4 columns. footer_credits: todos_direitos_reservados. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
    </div><!-- .rde-container -->
</main>

<footer class="rde-footer" role="contentinfo">
    <div class="rde-container">
        <div class="rde-footer__grid">
            <div class="rde-footer__col">
                <div class="rde-footer__brand"><?php echo esc_html( get_bloginfo( 'name' ) ); ?></div>
                <p><?php echo esc_html( get_bloginfo( 'description' ) ?: 'Portal editorial de finanças, investimento e empreendedorismo.' ); ?></p>
            </div>
            <div class="rde-footer__col">
                <h4>Editorias</h4>
                <ul>
                    <?php
                    $cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 6, 'hide_empty' => true ) );
                    foreach ( $cats as $c ) {
                        echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
                    }
                    ?>
                </ul>
            </div>
            <div class="rde-footer__col">
                <h4>Institucional</h4>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/sobre/' ) ); ?>">Sobre o portal</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Contato</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">Política de privacidade</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/termos-de-uso/' ) ); ?>">Termos de uso</a></li>
                </ul>
            </div>
            <div class="rde-footer__col">
                <h4>Acompanhe</h4>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/feed/' ) ); ?>">RSS do portal</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/sobre/' ) ); ?>">Sobre o conteúdo</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Pauta e sugestões</a></li>
                </ul>
            </div>
        </div>
        <div class="rde-footer__bottom">
            © <?php echo esc_html( date( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?>. Todos os direitos reservados.
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
