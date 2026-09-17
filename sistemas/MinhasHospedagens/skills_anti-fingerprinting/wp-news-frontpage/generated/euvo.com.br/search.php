<?php
/**
 * EUVO News, resultados de busca.
 *
 * Segue o arquivo: mesma grade, mesma paginacao, e sem filtro de imagem.
 *
 * @package EuvoNews
 * @since   1.0.0
 * @author  QMIX Digital
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

get_header();

global $wp_query;
$ev_q = get_search_query();
?>

<div class="ev-wrap">
    <div class="ev-layout">

        <main class="ev-main" id="ev-conteudo">

            <header class="ev-arch__head">
                <h1 class="ev-arch__t">Busca por &ldquo;<?php echo esc_html( $ev_q ); ?>&rdquo;</h1>
                <p class="ev-arch__n">
                    <?php
                    printf(
                        '%s %s',
                        esc_html( number_format_i18n( (int) $wp_query->found_posts ) ),
                        esc_html( 1 === (int) $wp_query->found_posts ? 'matéria encontrada' : 'matérias encontradas' )
                    );
                    ?>
                </p>
            </header>

            <?php if ( have_posts() ) : ?>

                <div class="ev-arch__grid">
                    <?php
                    while ( have_posts() ) :
                        the_post();
                        ev_card_any( 'default' );
                    endwhile;
                    ?>
                </div>

                <nav class="ev-pager" aria-label="Paginação da busca">
                    <span><?php echo get_previous_posts_link( 'Resultados anteriores' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
                    <span><?php echo get_next_posts_link( 'Próximos resultados' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
                </nav>

            <?php else : ?>

                <div class="ev-empty">
                    <p>Nenhuma matéria corresponde a essa busca. Vale tentar um termo mais curto ou sem acento.</p>

                    <form class="ev-search ev-search--wide" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
                        <label class="ev-sr" for="ev-q2">Buscar no EUVO News</label>
                        <input type="search" id="ev-q2" name="s" placeholder="Buscar matérias" value="<?php echo esc_attr( $ev_q ); ?>" required>
                        <button type="submit">Buscar</button>
                    </form>

                    <h2 class="ev-empty__h">Comece por Aqui</h2>
                    <ul class="ev-empty__list">
                        <?php
                        $ev_cats = get_categories(
                            array(
                                'orderby'    => 'count',
                                'order'      => 'DESC',
                                'number'     => 6,
                                'hide_empty' => true,
                                'exclude'    => ev_hidden_cats(),
                            )
                        );
                        foreach ( $ev_cats as $ev_c ) :
                            ?>
                            <li>
                                <a href="<?php echo esc_url( get_category_link( $ev_c->term_id ) ); ?>"><?php echo esc_html( $ev_c->name ); ?></a>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </div>

            <?php endif; ?>

        </main>

        <aside class="ev-aside" aria-label="Destaques">

            <?php
            $ev_lidos = ev_most_read_ids( 5 );
            if ( ! empty( $ev_lidos ) ) :
                ?>
                <section class="ev-w">
                    <h2 class="ev-w__h">Mais Lidos</h2>
                    <ol class="ev-rank">
                        <?php
                        $ev_pos = 1;
                        foreach ( $ev_lidos as $ev_lid ) :
                            ?>
                            <li>
                                <span class="ev-rank__n" aria-hidden="true"><?php echo (int) $ev_pos; ?></span>
                                <a class="ev-rank__t" href="<?php echo esc_url( get_permalink( $ev_lid ) ); ?>"><?php echo esc_html( get_the_title( $ev_lid ) ); ?></a>
                            </li>
                            <?php
                            $ev_pos++;
                        endforeach;
                        ?>
                    </ol>
                </section>
            <?php endif; ?>

            <?php if ( is_active_sidebar( 'ev-aside' ) ) : ?>
                <?php dynamic_sidebar( 'ev-aside' ); ?>
            <?php endif; ?>

        </aside>

    </div>
</div>

<?php
get_footer();
