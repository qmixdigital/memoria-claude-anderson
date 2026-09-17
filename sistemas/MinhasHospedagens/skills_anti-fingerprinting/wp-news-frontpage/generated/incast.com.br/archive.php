<?php
/** Archive — gamma editorial column. h1_with_count, paginação numerada, sem subcategorias strip. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

global $wp_query;
$is_cat = is_category();
$qo     = get_queried_object();
$total  = (int) ( $wp_query->found_posts ?? 0 );
?>

<header class="ic-archive__head">
    <h1 class="ic-archive__h1"><?php
        if ( $is_cat ) { single_cat_title(); }
        elseif ( is_tag() ) { single_tag_title(); }
        elseif ( is_author() ) { the_archive_title(); }
        elseif ( is_search() ) { printf( 'Resultados para "%s"', esc_html( get_search_query() ) ); }
        else { the_archive_title(); }
        ?>
        <span class="ic-count"><?php echo esc_html( number_format_i18n( $total ) ); ?> publicações</span>
    </h1>

    <?php if ( $is_cat ) :
        $subs = get_terms( array(
            'taxonomy'   => 'category',
            'parent'     => $qo->term_id,
            'hide_empty' => true,
            'number'     => 12,
        ) );
        if ( $subs && ! is_wp_error( $subs ) ) : ?>
            <div class="ic-archive__strip" aria-label="Subcategorias">
                <?php foreach ( $subs as $s ) : ?>
                    <a href="<?php echo esc_url( get_category_link( $s ) ); ?>"><?php echo esc_html( $s->name ); ?></a>
                <?php endforeach; ?>
            </div>
        <?php endif;
    endif; ?>
</header>

<div class="ic-layout">
    <div class="ic-main-col">
        <?php if ( have_posts() ) : ?>
            <div class="ic-archive__list">
                <?php while ( have_posts() ) : the_post(); ic_card( 'default' ); endwhile; ?>
            </div>

            <?php
            $pagination = paginate_links( array(
                'mid_size'  => 1,
                'prev_text' => '←',
                'next_text' => '→',
                'type'      => 'list',
            ) );
            if ( $pagination ) : ?>
                <nav class="ic-archive__pagination" aria-label="Paginação">
                    <?php echo $pagination; ?>
                </nav>
            <?php endif;
        else : ?>
            <div class="ic-widget">
                <h4>Nenhum resultado</h4>
                <p>Tente outra busca ou navegue pelas <a href="<?php echo esc_url( home_url( '/' ) ); ?>">editorias do portal</a>.</p>
            </div>
        <?php endif; ?>
    </div>

    <aside class="ic-sidebar" role="complementary">
        <?php if ( is_active_sidebar( 'sidebar-1' ) ) {
            dynamic_sidebar( 'sidebar-1' );
        } else {
            // category_description_position: sidebar_only
            if ( $is_cat && $qo && $qo->description ) {
                echo '<div class="ic-widget"><h4>Sobre esta editoria</h4><p>' . wp_kses_post( $qo->description ) . '</p></div>';
            }
        } ?>
    </aside>
</div>

<?php get_footer();
