<?php
/**
 * EUVO News, rodape.
 *
 * Roll: footer=F2_classic_4col | credits=publicacao_digital_desde_2020
 *       social_icons_position=inline_in_post_meta (nenhum icone social aqui)
 *
 * @package EuvoNews
 * @since   1.0.0
 * @author  QMIX Digital
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$ev_cats = get_categories(
    array(
        'orderby'    => 'count',
        'order'      => 'DESC',
        'number'     => 6,
        'hide_empty' => true,
        'exclude'    => ev_hidden_cats(),
    )
);
?>

<footer class="ev-foot" role="contentinfo">
    <div class="ev-wrap">

        <div class="ev-foot__cols">

            <div class="ev-foot__brand">
                <?php
                /*
                 * O rodape tem fundo escuro e a logomarca do portal e preta:
                 * usada aqui, ela simplesmente sumia. Filtro CSS nao resolve
                 * (invert deixaria o selo NEWS ciano, e brightness(0) apagaria
                 * o texto branco dentro dele), entao existe uma versao clara,
                 * com o wordmark em creme e o selo intacto.
                 *
                 * Cai para a logomarca padrao se a versao clara for removida:
                 * marca escura e ruim, marca nenhuma e pior.
                 */
                $ev_logo_id = (int) get_theme_mod( 'ev_footer_logo' );
                if ( ! $ev_logo_id || ! wp_get_attachment_url( $ev_logo_id ) ) {
                    $ev_logo_id = (int) get_theme_mod( 'custom_logo' );
                }
                if ( $ev_logo_id ) {
                    printf(
                        '<a href="%s" aria-label="Ir para a capa do EUVO News">%s</a>',
                        esc_url( home_url( '/' ) ),
                        wp_get_attachment_image(
                            $ev_logo_id,
                            'medium',
                            false,
                            array(
                                'alt'     => esc_attr( get_bloginfo( 'name' ) ),
                                'loading' => 'lazy',
                            )
                        )
                    );
                } else {
                    printf(
                        '<p class="ev-brand__txt"><a href="%s">%s</a></p>',
                        esc_url( home_url( '/' ) ),
                        esc_html( get_bloginfo( 'name' ) )
                    );
                }
                ?>
                <p>O EUVO News acompanha o que move a cultura, o entretenimento e o mercado, com apuração própria e leitura rápida.</p>
                <p>Sugestões de pauta e correções chegam pelo nosso <a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">canal de contato</a>.</p>
            </div>

            <div>
                <h4>Editorias</h4>
                <ul>
                    <?php foreach ( $ev_cats as $ev_cat ) : ?>
                        <li>
                            <a href="<?php echo esc_url( get_category_link( $ev_cat->term_id ) ); ?>"><?php echo esc_html( $ev_cat->name ); ?></a>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>

            <div>
                <h4>Institucional</h4>
                <?php
                if ( has_nav_menu( 'ev_footer' ) ) {
                    wp_nav_menu(
                        array(
                            'theme_location' => 'ev_footer',
                            'container'      => false,
                            'depth'          => 1,
                            'items_wrap'     => '<ul id="%1$s" class="%2$s">%3$s</ul>',
                        )
                    );
                } else {
                    ?>
                    <ul>
                        <li><a href="<?php echo esc_url( home_url( '/equipe/' ) ); ?>">Quem faz o EUVO</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Fale com a redação</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/termos-de-uso/' ) ); ?>">Termos de uso</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">Política de privacidade</a></li>
                    </ul>
                    <?php
                }
                ?>
            </div>

            <div>
                <h4>Acompanhe</h4>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/feed/' ) ); ?>">Assinar o RSS</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Últimas do dia</a></li>
                    <?php
                    $ev_top = get_categories(
                        array(
                            'orderby'    => 'count',
                            'order'      => 'DESC',
                            'number'     => 2,
                            'hide_empty' => true,
                            'exclude'    => ev_hidden_cats(),
                        )
                    );
                    foreach ( $ev_top as $ev_t ) :
                        ?>
                        <li>
                            <a href="<?php echo esc_url( get_category_link( $ev_t->term_id ) ); ?>">Tudo sobre <?php echo esc_html( $ev_t->name ); ?></a>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>

        </div>

        <div class="ev-foot__bar">
            <span>&copy; <?php echo esc_html( wp_date( 'Y' ) ); ?> <?php echo esc_html( get_bloginfo( 'name' ) ); ?></span>
            <span>Publicação digital desde 2020</span>
        </div>

    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
