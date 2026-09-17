<?php
/**
 * Footer F4 — mega 6 columns. Credits: "Publicação digital desde 2020."
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
    </div><!-- .oie-container -->
</main>

<footer class="oie-footer" role="contentinfo">
    <div class="oie-container">
        <div class="oie-footer__grid">
            <div class="oie-footer__col">
                <h4>Sobre</h4>
                <p style="font-size:14px;line-height:1.6;color:#cfd3d8;margin:0">
                    <?php echo esc_html( get_bloginfo( 'description' ) ?: 'Portal de empreendedorismo, negócios e inovação.' ); ?>
                </p>
            </div>
            <?php for ( $i = 1; $i <= 4; $i++ ) :
                $loc = 'footer-' . $i;
                if ( ! has_nav_menu( $loc ) ) { continue; }
                ?>
                <div class="oie-footer__col">
                    <h4>Coluna <?php echo $i; ?></h4>
                    <?php wp_nav_menu( array(
                        'theme_location' => $loc,
                        'container'      => false,
                        'menu_class'     => '',
                        'fallback_cb'    => false,
                        'depth'          => 1,
                    ) ); ?>
                </div>
            <?php endfor; ?>

            <?php
            // Fallback: se nenhum menu de footer estiver atribuído, usa categorias mais populares e algumas tags
            if ( ! has_nav_menu( 'footer-1' ) ) {
                $cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 6, 'hide_empty' => true ) );
                if ( $cats ) {
                    echo '<div class="oie-footer__col"><h4>Editorias</h4><ul>';
                    foreach ( $cats as $c ) {
                        echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
                    }
                    echo '</ul></div>';
                }
            }
            ?>

            <div class="oie-footer__col">
                <h4>Institucional</h4>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/sobre/' ) ); ?>">Sobre o portal</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Contato</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">Política de privacidade</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/termos-de-uso/' ) ); ?>">Termos de uso</a></li>
                </ul>
            </div>
            <div class="oie-footer__col">
                <h4>Acompanhe</h4>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/feed/' ) ); ?>">RSS do portal</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/sobre/' ) ); ?>">Sobre o conteúdo</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Pauta e sugestões</a></li>
                </ul>
            </div>
        </div>

        <div class="oie-footer__bottom">
            Publicação digital desde 2020. © <?php echo esc_html( date( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?>.
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
