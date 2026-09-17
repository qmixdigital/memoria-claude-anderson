<?php
/**
 * Archive — Archetype δ (Hub with subcategories).
 *
 * Características:
 *  - posts_per_archive=15
 *  - Densidade 3_2_1 (3 grandes, 2 médios, 1 col lista)
 *  - Infinite scroll
 *  - H1 com descrição
 *  - Subcategorias em breadcrumb_chain
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

$qo = get_queried_object();
$is_cat = is_category();
$desc = is_archive() ? term_description() : '';
?>

<header class="oie-archive__head" role="banner">
    <?php if ( $is_cat && $qo ) : ?>
        <nav class="oie-archive__chain" aria-label="Trilha de categorias">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php bloginfo( 'name' ); ?></a>
            <?php
            if ( $qo->parent ) {
                $parents = array_reverse( get_ancestors( $qo->term_id, 'category' ) );
                foreach ( $parents as $pid ) {
                    $p = get_term( $pid, 'category' );
                    echo ' › <a href="' . esc_url( get_category_link( $pid ) ) . '">' . esc_html( $p->name ) . '</a>';
                }
            }
            echo ' › <strong>' . esc_html( $qo->name ) . '</strong>';
            ?>
        </nav>
    <?php endif; ?>

    <h1 class="oie-archive__h1"><?php
        if ( $is_cat ) { single_cat_title(); }
        elseif ( is_tag() ) { single_tag_title(); }
        elseif ( is_author() ) { the_archive_title(); }
        elseif ( is_search() ) { printf( 'Resultados para "%s"', esc_html( get_search_query() ) ); }
        else { the_archive_title(); }
    ?></h1>

    <?php if ( $desc ) : ?>
        <p class="oie-archive__sub"><?php echo wp_kses_post( $desc ); ?></p>
    <?php endif; ?>

    <?php
    // Subcategorias (chain strip)
    if ( $is_cat ) {
        $subs = get_terms( array(
            'taxonomy'   => 'category',
            'parent'     => $qo->term_id,
            'hide_empty' => true,
            'number'     => 12,
        ) );
        if ( $subs && ! is_wp_error( $subs ) ) {
            echo '<div class="oie-archive__strip" aria-label="Subcategorias">';
            foreach ( $subs as $s ) {
                echo '<a href="' . esc_url( get_category_link( $s ) ) . '">' . esc_html( $s->name ) . '</a>';
            }
            echo '</div>';
        }
    }
    ?>
</header>

<?php if ( have_posts() ) : ?>
    <div id="oie-archive-list" data-cat="<?php echo esc_attr( $is_cat && $qo ? $qo->term_id : '' ); ?>" data-page="1">
        <?php
        // Densidade 3_2_1: 3 grandes / 2 médios / 1 coluna lista
        $i = 0;
        $row3 = array(); $row2 = array(); $row1 = array();
        while ( have_posts() ) :
            the_post();
            if ( $i < 3 )      { $row3[] = get_the_ID(); }
            elseif ( $i < 5 )  { $row2[] = get_the_ID(); }
            else               { $row1[] = get_the_ID(); }
            $i++;
        endwhile;
        wp_reset_postdata();

        if ( ! empty( $row3 ) ) : ?>
            <div class="oie-archive__row3">
                <?php foreach ( $row3 as $pid ) : ?>
                    <?php $GLOBALS['post'] = get_post( $pid ); setup_postdata( $GLOBALS['post'] ); ?>
                    <?php get_template_part( 'template-parts/card-featured' ); ?>
                <?php endforeach; wp_reset_postdata(); ?>
            </div>
        <?php endif;

        if ( ! empty( $row2 ) ) : ?>
            <div class="oie-archive__row2">
                <?php foreach ( $row2 as $pid ) : ?>
                    <?php $GLOBALS['post'] = get_post( $pid ); setup_postdata( $GLOBALS['post'] ); ?>
                    <?php oie_card( 'lg' ); ?>
                <?php endforeach; wp_reset_postdata(); ?>
            </div>
        <?php endif;

        if ( ! empty( $row1 ) ) : ?>
            <div class="oie-archive__row1">
                <?php foreach ( $row1 as $pid ) : ?>
                    <?php $GLOBALS['post'] = get_post( $pid ); setup_postdata( $GLOBALS['post'] ); ?>
                    <?php oie_card( 'default' ); ?>
                <?php endforeach; wp_reset_postdata(); ?>
            </div>
        <?php endif; ?>
    </div>

    <div class="oie-archive__loader" id="oie-archive-loader" data-loading="false">
        carregando mais publicações…
    </div>

<?php else : ?>
    <div class="oie-card" style="padding:var(--oie-sp-4)">
        <h2 style="font-size:22px">Nenhum resultado encontrado</h2>
        <p>Tente outra busca ou navegue pelas <a href="<?php echo esc_url( home_url( '/' ) ); ?>">editorias do portal</a>.</p>
    </div>
<?php endif;

get_footer();
