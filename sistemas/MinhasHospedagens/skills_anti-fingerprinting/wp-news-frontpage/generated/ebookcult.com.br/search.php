<?php
/**
 * Portal: ebookcult.com.br
 * Search results — herda padrão visual de archive (alpha_dense_list).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();
?>

<div class="ec-layout">
    <div class="ec-main">

        <header class="ec-archive__head">
            <nav class="ec-breadcrumb" aria-label="Localização">
                <a href="<?php echo esc_url( home_url( '/' ) ); ?>">Início</a>
                <span class="ec-breadcrumb__sep">|</span>
                <span>Busca</span>
            </nav>
            <span class="ec-archive__kicker">Busca</span>
            <h1 class="ec-archive__h1">
                Resultados para "<?php echo esc_html( get_search_query() ); ?>"
            </h1>
            <?php if ( have_posts() ) : ?>
                <p class="ec-archive__desc">
                    Encontramos <?php echo (int) $GLOBALS['wp_query']->found_posts; ?> textos relacionados ao termo buscado.
                </p>
            <?php endif; ?>
        </header>

        <?php if ( have_posts() ) : ?>
            <div class="ec-archive__grid">
                <?php while ( have_posts() ) : the_post(); ?>
                    <article class="ec-archive__item">
                        <?php if ( has_post_thumbnail() ) : ?>
                        <a class="ec-archive__item-media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
                            <?php the_post_thumbnail( 'medium', array( 'alt' => '' ) ); ?>
                        </a>
                        <?php endif; ?>
                        <div class="ec-archive__item-body">
                            <?php
                            $sc = get_the_category();
                            if ( ! empty( $sc ) ) {
                                echo '<span class="ec-archive__item-cat">' . esc_html( $sc[0]->name ) . '</span>';
                            }
                            ?>
                            <h3 class="ec-archive__item-title">
                                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                            </h3>
                            <p class="ec-archive__item-meta"><?php echo esc_html( ec_post_date() ); ?></p>
                        </div>
                    </article>
                <?php endwhile; ?>
            </div>
            <nav class="ec-pagination" aria-label="Paginação">
                <?php echo paginate_links( array( 'mid_size' => 1 ) ); ?>
            </nav>
        <?php else : ?>
            <div class="ec-empty">
                <h2>Nada encontrado</h2>
                <p>Nenhum texto corresponde a esse termo. Tente palavras-chave mais curtas, ou explore as <a href="<?php echo esc_url( home_url( '/' ) ); ?>">leituras em destaque na página inicial</a>.</p>
                <?php get_search_form(); ?>
            </div>
        <?php endif; ?>

    </div>

    <aside class="ec-sidebar" role="complementary">
        <div class="ec-widget">
            <h4>Refinar busca</h4>
            <?php get_search_form(); ?>
        </div>
        <?php if ( is_active_sidebar( 'sidebar-1' ) ) : dynamic_sidebar( 'sidebar-1' ); endif; ?>
    </aside>
</div>

<?php
get_footer();
