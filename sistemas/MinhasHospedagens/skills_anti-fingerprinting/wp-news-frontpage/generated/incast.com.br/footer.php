<?php
/** Footer F2 — classic 4 columns, sem redes sociais. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
    </div><!-- .ic-container -->
</main>

<footer class="ic-footer" role="contentinfo">
    <div class="ic-container">
        <div class="ic-footer__grid">
            <div class="ic-footer__col">
                <div class="ic-footer__brand"><?php echo esc_html( get_bloginfo( 'name' ) ); ?></div>
                <p><?php echo esc_html( get_bloginfo( 'description' ) ?: 'Portal de famosos, TV e entretenimento.' ); ?></p>
            </div>
            <div class="ic-footer__col">
                <h4>Editorias</h4>
                <ul>
                    <?php
                    $cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 6, 'hide_empty' => true, 'exclude' => ic_excluded_lang_cat_ids() ) );
                    foreach ( $cats as $c ) {
                        echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
                    }
                    ?>
                </ul>
            </div>
            <div class="ic-footer__col">
                <h4>Institucional</h4>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/sobre/' ) ); ?>">Sobre o portal</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Contato</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">Política de privacidade</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/termos-de-uso/' ) ); ?>">Termos de uso</a></li>
                </ul>
            </div>
            <div class="ic-footer__col">
                <h4>Acompanhe</h4>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/feed/' ) ); ?>">RSS do portal</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/sobre/' ) ); ?>">Sobre o conteúdo</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Pauta e sugestões</a></li>
                </ul>
            </div>
        </div>
        <div class="ic-footer__bottom">
            Publicação digital desde 2020. © <?php echo esc_html( date( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?>.
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
