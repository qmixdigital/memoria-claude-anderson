<?php
/**
 * EUVO News, arquivo e editoria. Arquetipo delta, hub.
 *
 * A taxonomia do portal e plana: as 13 categorias tem parent 0, nenhuma tem
 * filha. Entao a faixa do topo lista as editorias irmas, que e a outra metade
 * da regra do arquetipo (children ou related categories).
 *
 * Aqui nao existe filtro de imagem destacada, ao contrario da capa: o arquivo
 * existe para listar o acervo inteiro, e 3 de cada 4 matérias nao tem capa.
 *
 * Roll: archive=delta_hub_subcategories | density=4_2_1 | per_page=10
 *       pagination=prev_next_only | h1=h1_with_description
 *       category_description_position=sidebar_only | subcat=breadcrumb_chain
 *
 * @package EuvoNews
 * @since   1.0.0
 * @author  QMIX Digital
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

get_header();

$ev_term = get_queried_object();
$ev_desc = ( $ev_term instanceof WP_Term ) ? term_description( $ev_term ) : '';
$ev_isc  = is_category();
?>

<div class="ev-wrap">

    <?php ev_crumbs(); ?>

    <?php // subcategory_strip_treatment=breadcrumb_chain, corrente das editorias irmas. ?>
    <?php
    if ( $ev_isc ) :
        $ev_irmas = get_categories(
            array(
                'orderby'    => 'count',
                'order'      => 'DESC',
                'number'     => 8,
                'hide_empty' => true,
                'exclude'    => ev_hidden_cats(),
            )
        );

        if ( count( $ev_irmas ) > 1 ) :
            ?>
            <nav class="ev-chain" aria-label="Outras editorias">
                <?php
                $ev_first = true;
                foreach ( $ev_irmas as $ev_ir ) :
                    if ( ! $ev_first ) {
                        echo '<span class="ev-chain__sep" aria-hidden="true">&rsaquo;</span>';
                    }
                    $ev_first = false;
                    $ev_now   = ( $ev_term instanceof WP_Term && (int) $ev_ir->term_id === (int) $ev_term->term_id );
                    printf(
                        '<a class="ev-chain__i%s" href="%s"%s>%s</a>',
                        $ev_now ? ' is-now' : '',
                        esc_url( get_category_link( $ev_ir->term_id ) ),
                        $ev_now ? ' aria-current="page"' : '',
                        esc_html( $ev_ir->name )
                    );
                endforeach;
                ?>
            </nav>
            <?php
        endif;
    endif;
    ?>

    <div class="ev-layout">

        <main class="ev-main" id="ev-conteudo">

            <header class="ev-arch__head">
                <?php // archive_h1_treatment=h1_with_description ?>
                <h1 class="ev-arch__t"><?php the_archive_title(); ?></h1>
                <p class="ev-arch__n">
                    <?php
                    global $wp_query;
                    printf(
                        '%s %s nesta editoria',
                        esc_html( number_format_i18n( (int) $wp_query->found_posts ) ),
                        esc_html( 1 === (int) $wp_query->found_posts ? 'matéria' : 'matérias' )
                    );
                    ?>
                </p>
            </header>

            <?php if ( have_posts() ) : ?>

                <?php // archive_card_density=4_2_1 ?>
                <div class="ev-arch__grid">
                    <?php
                    while ( have_posts() ) :
                        the_post();
                        ev_card_any( 'default' );
                    endwhile;
                    ?>
                </div>

                <?php // archive_pagination=prev_next_only ?>
                <nav class="ev-pager" aria-label="Paginação da editoria">
                    <span><?php echo get_previous_posts_link( 'Matérias mais recentes' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
                    <span><?php echo get_next_posts_link( 'Matérias anteriores' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
                </nav>

            <?php else : ?>

                <p class="ev-empty">Não há matérias publicadas nesta editoria por enquanto. Veja o que saiu <a href="<?php echo esc_url( home_url( '/' ) ); ?>">na capa do EUVO News</a>.</p>

            <?php endif; ?>

        </main>

        <aside class="ev-aside" aria-label="Sobre a editoria e destaques">

            <?php // category_description_position=sidebar_only ?>
            <?php if ( $ev_desc ) : ?>
                <section class="ev-w">
                    <h2 class="ev-w__h">Sobre a Editoria</h2>
                    <div class="ev-w__txt"><?php echo wp_kses_post( $ev_desc ); ?></div>
                </section>
            <?php endif; ?>

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

            <section class="ev-w ev-news">
                <h2 class="ev-w__h">Receba a Nossa Seleção</h2>
                <p>As matérias que a redação destacou na semana, direto no seu e-mail. Sem cobrança e sem spam.</p>
                <a class="ev-btn" href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Quero receber</a>
            </section>

            <?php if ( is_active_sidebar( 'ev-aside' ) ) : ?>
                <?php dynamic_sidebar( 'ev-aside' ); ?>
            <?php endif; ?>

        </aside>

    </div>
</div>

<?php
get_footer();
