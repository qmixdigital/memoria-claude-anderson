<?php
/**
 * EUVO News, cabecalho.
 *
 * Roll: header=H1_classic_3row | menu_position=hidden_burger | search=visible_input_box
 *       sticky=sticky_after_scroll_300px | separator=none_just_spacing
 *       capitalization=title_case | heading_hierarchy=p_logo
 *
 * @package EuvoNews
 * @since   1.0.0
 * @author  QMIX Digital
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a class="ev-skip" href="#ev-conteudo">Pular para o conteúdo</a>

<header class="ev-head" id="ev-head">

    <?php // Linha 1: marca e busca. ?>
    <div class="ev-wrap ev-head__brandrow">
        <?php
        /*
         * A logomarca vem do custom_logo do core, nao de opcao de tema.
         * Assim ela sobrevive a qualquer troca de tema futura.
         * heading_hierarchy=p_logo: a marca e um paragrafo, o h1 fica com a matéria.
         */
        if ( has_custom_logo() ) {
            echo '<p class="ev-brand">';
            the_custom_logo();
            echo '</p>';
        } else {
            printf(
                '<p class="ev-brand"><a class="ev-brand__txt" href="%s">%s</a></p>',
                esc_url( home_url( '/' ) ),
                esc_html( get_bloginfo( 'name' ) )
            );
        }
        ?>

        <form class="ev-search" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
            <label class="ev-sr" for="ev-q">Buscar no EUVO News</label>
            <input type="search" id="ev-q" name="s" placeholder="Buscar matérias" value="<?php echo esc_attr( get_search_query() ); ?>" required>
            <button type="submit">Buscar</button>
        </form>
    </div>

    <?php // Linha 2: menu atras do botao. ?>
    <div class="ev-wrap ev-head__navrow">
        <button class="ev-burger" id="ev-burger" type="button" aria-expanded="false" aria-controls="ev-nav" aria-label="Abrir o menu principal">
            <span class="ev-burger__bars" aria-hidden="true"></span>
            <span>Seções</span>
        </button>
    </div>

    <nav class="ev-nav" id="ev-nav" aria-label="Menu principal">
        <?php
        wp_nav_menu(
            array(
                'theme_location' => 'ev_primary',
                'container'      => false,
                'depth'          => 1,
                'fallback_cb'    => 'ev_menu_fallback',
                'items_wrap'     => '<ul id="%1$s" class="%2$s">%3$s</ul>',
            )
        );
        ?>
    </nav>

    <?php // Linha 3: data da edicao. ?>
    <div class="ev-head__metarow">
        <div class="ev-wrap ev-head__metarow-in">
            <p class="ev-head__date"><?php echo esc_html( ev_edition_date() ); ?></p>
            <p class="ev-head__tag">Publicação digital desde 2020</p>
        </div>
    </div>

</header>

<div class="ev-head__spacer" id="ev-spacer" aria-hidden="true"></div>
