<?php
/**
 * EUVO News, página.
 *
 * Faltava no pacote, e a falta tinha custo: sem page.php no filho, /equipe/,
 * /sobre/, /contato/ e as páginas legais caiam no page.php do Neve, que
 * embrulha tudo no layout dele e ainda imprime o titulo por cima do conteudo.
 *
 * As páginas institucionais deste portal sao de dois tipos, e o template
 * atende os dois sem precisar de escolha manual:
 *
 * 1. Página com desenho proprio (equipe, sobre): o conteudo ja traz o proprio
 *    h1 e a propria capa. Aqui o template se cala e so entrega a moldura.
 * 2. Página de texto corrido (termos, privacidade): nao tem h1 nenhum, e o
 *    template precisa dar um.
 *
 * A deteccao e por conteudo, nao por opcao no admin: um h1 duplicado e erro de
 * SEO e de leitor de tela, e ninguem vai lembrar de marcar a caixinha certa.
 *
 * Sem barra lateral de proposito: página institucional nao disputa atencao
 * com "mais lidos".
 *
 * @package EuvoNews
 * @since   1.0.0
 * @author  QMIX Digital
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

get_header();

while ( have_posts() ) :
    the_post();

    $ev_conteudo = get_the_content();
    $ev_tem_h1   = (bool) preg_match( '/<h1[\s>]/i', (string) $ev_conteudo );
    ?>

<div class="ev-wrap">
    <main class="ev-main ev-page" id="ev-conteudo">
        <article <?php post_class( 'ev-page__art' ); ?>>

            <?php ev_crumbs(); ?>

            <?php if ( ! $ev_tem_h1 ) : ?>
                <header class="ev-page__head">
                    <h1 class="ev-page__t"><?php the_title(); ?></h1>
                    <?php if ( get_the_modified_time( 'U' ) > get_the_time( 'U' ) + DAY_IN_SECONDS ) : ?>
                        <p class="ev-page__when">Atualizada em <?php echo esc_html( get_the_modified_date( 'j \d\e F \d\e Y' ) ); ?></p>
                    <?php endif; ?>
                </header>
            <?php endif; ?>

            <div class="ev-page__body<?php echo $ev_tem_h1 ? ' ev-page__body--solta' : ''; ?>">
                <?php the_content(); ?>
            </div>

        </article>
    </main>
</div>

    <?php
endwhile;

get_footer();
