<?php
/**
 * Archive alpha — dense list (20 posts per page)
 * posts_per_archive_page: 20 | archive_h1: h1_only | pagination: prev_next
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();
$obj = get_queried_object();
$is_cat = is_category();
?>

<header class="bx-archive-head">
    <h1><?php single_term_title(); ?></h1>
    <?php if ( $is_cat && isset( $obj->count ) ) : ?>
        <span class="bx-archive-head__count"><?php echo (int) $obj->count; ?> matérias publicadas</span>
    <?php endif; ?>
</header>

<?php if ( have_posts() ) : ?>
    <div class="bx-list">
        <?php while ( have_posts() ) : the_post();
            $rcats = get_the_category();
            ?>
            <article class="bx-list-card" id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                <?php if ( has_post_thumbnail() ) : ?>
                    <a class="bx-list-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
                        <?php the_post_thumbnail( 'bx-card', array( 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
                    </a>
                <?php endif; ?>
                <div class="bx-list-card__body">
                    <?php if ( $rcats ) : ?>
                        <div class="bx-list-card__cat"><?php echo esc_html( $rcats[0]->name ); ?></div>
                    <?php endif; ?>
                    <h2 class="bx-list-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                    <p class="bx-list-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 28 ) ); ?></p>
                    <div class="bx-list-card__meta"><?php echo esc_html( get_the_date( 'd/m/Y' ) ); ?> &nbsp;|&nbsp; <?php echo esc_html( get_the_author() ); ?></div>
                </div>
            </article>
        <?php endwhile; ?>
    </div>

    <nav class="bx-pagination" aria-label="Paginação">
        <?php
        $prev = get_previous_posts_link( '&laquo; Mais recentes' );
        $next = get_next_posts_link( 'Mais antigas &raquo;' );
        echo $prev ? $prev : '<span style="opacity:.3">&laquo; Mais recentes</span>';
        echo $next ? $next : '<span style="opacity:.3">Mais antigas &raquo;</span>';
        ?>
    </nav>
<?php else : ?>
    <p style="color: var(--bx-muted); font-family: var(--bx-font-body);">Nenhum conteúdo encontrado.</p>
<?php endif;

get_footer();
