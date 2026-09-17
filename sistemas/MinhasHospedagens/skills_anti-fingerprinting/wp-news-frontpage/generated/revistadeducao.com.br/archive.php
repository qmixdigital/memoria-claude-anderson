<?php
/** Archive — alpha_dense_list (lista densa horizontal). h1_with_description, paginação numerada top+bottom. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

$is_cat = is_category();
$qo     = get_queried_object();
?>

<header class="rde-archive__head">
    <h1 class="rde-archive__h1"><?php
        if ( $is_cat ) { single_cat_title(); }
        elseif ( is_tag() ) { single_tag_title(); }
        elseif ( is_author() ) { the_archive_title(); }
        elseif ( is_search() ) { printf( 'Resultados para "%s"', esc_html( get_search_query() ) ); }
        else { the_archive_title(); }
    ?></h1>
    <?php $desc = is_archive() ? term_description() : ''; if ( $desc ) : ?>
        <p class="rde-archive__sub"><?php echo wp_kses_post( $desc ); ?></p>
    <?php endif; ?>
</header>

<div class="rde-layout">

    <!-- Sidebar à esquerda -->
    <aside class="rde-sidebar" role="complementary">
        <?php
        $cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 8, 'hide_empty' => true ) );
        if ( $cats ) {
            echo '<div class="rde-widget"><h4>Editorias</h4><ul>';
            foreach ( $cats as $c ) {
                echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
            }
            echo '</ul></div>';
        }

        // Mais lidos
        $pop = rde_query_for_section( array( 'posts_per_page' => 15, 'orderby' => 'comment_count', 'order' => 'DESC' ) );
        $items = ''; $pc = 0;
        while ( $pop->have_posts() ) {
            $pop->the_post();
            if ( ! has_post_thumbnail() ) { continue; }
            if ( $pc >= 5 ) { break; }
            $items .= '<li><a href="' . esc_url( get_permalink() ) . '">' . esc_html( get_the_title() ) . '</a></li>';
            $pc++;
        }
        wp_reset_postdata();
        if ( $items ) { echo '<div class="rde-widget"><h4>Mais lidos</h4><ol>' . $items . '</ol></div>'; }

        if ( defined( 'RDE_ADSENSE_CLIENT' ) && RDE_ADSENSE_CLIENT ) : ?>
            <div class="rde-widget rde-widget--ad">
                <ins class="adsbygoogle" style="display:block" data-ad-client="<?php echo esc_attr( RDE_ADSENSE_CLIENT ); ?>" data-ad-format="auto" data-full-width-responsive="true"></ins>
                <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
            </div>
        <?php endif; ?>
    </aside>

    <!-- Lista densa -->
    <div class="rde-main-col">
        <?php if ( have_posts() ) : ?>

            <?php
            $pagination_args = array( 'mid_size' => 1, 'prev_text' => '←', 'next_text' => '→' );
            $pagination = paginate_links( $pagination_args );
            if ( $pagination ) : ?>
                <nav class="rde-archive__pagination" aria-label="Paginação superior"><?php echo $pagination; ?></nav>
            <?php endif; ?>

            <div class="rde-archive__list">
                <?php while ( have_posts() ) : the_post(); rde_card( 'default' ); endwhile; ?>
            </div>

            <?php if ( $pagination ) : ?>
                <nav class="rde-archive__pagination" aria-label="Paginação inferior"><?php echo $pagination; ?></nav>
            <?php endif; ?>

        <?php else : ?>
            <div class="rde-widget">
                <h4>Nenhum resultado</h4>
                <p>Tente outra busca ou navegue pelas <a href="<?php echo esc_url( home_url( '/' ) ); ?>">editorias do portal</a>.</p>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php get_footer();
