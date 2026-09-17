<?php
/**
 * EUVO News, página nao encontrada.
 *
 * @package EuvoNews
 * @since   1.0.0
 * @author  QMIX Digital
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

get_header();
?>

<div class="ev-wrap">
    <main class="ev-main ev-404" id="ev-conteudo">

        <p class="ev-404__n" aria-hidden="true">404</p>
        <h1 class="ev-404__t">Esta página saiu do ar</h1>
        <p class="ev-404__x">O endereço pode ter mudado ou a matéria pode ter sido retirada. A redação segue publicando, e o caminho de volta esta logo abaixo.</p>

        <p class="ev-404__cta">
            <a class="ev-btn" href="<?php echo esc_url( home_url( '/' ) ); ?>">Ir para a capa</a>
        </p>

        <form class="ev-search ev-search--wide" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
            <label class="ev-sr" for="ev-q404">Buscar no EUVO News</label>
            <input type="search" id="ev-q404" name="s" placeholder="Buscar matérias" required>
            <button type="submit">Buscar</button>
        </form>

        <section class="ev-section" aria-labelledby="ev-h-404">
            <div class="ev-section__h">
                <h2 id="ev-h-404">Publicadas Recentemente</h2>
            </div>

            <div class="ev-grid-3">
                <?php
                $ev_ids = ev_collect_ids( 6 );

                global $post;
                $ev_keep = $post;

                foreach ( $ev_ids as $ev_id ) {
                    $post = get_post( $ev_id );
                    setup_postdata( $post );
                    ev_card( 'default' );
                }

                $post = $ev_keep;
                wp_reset_postdata();
                ?>
            </div>
        </section>

        <nav class="ev-404__cats" aria-label="Editorias do portal">
            <h2 class="ev-w__h">Editorias</h2>
            <div class="ev-tags">
                <?php
                $ev_cats = get_categories(
                    array(
                        'orderby'    => 'count',
                        'order'      => 'DESC',
                        'number'     => 8,
                        'hide_empty' => true,
                        'exclude'    => ev_hidden_cats(),
                    )
                );
                foreach ( $ev_cats as $ev_c ) :
                    ?>
                    <a href="<?php echo esc_url( get_category_link( $ev_c->term_id ) ); ?>"><?php echo esc_html( $ev_c->name ); ?></a>
                <?php endforeach; ?>
            </div>
        </nav>

    </main>
</div>

<?php
get_footer();
