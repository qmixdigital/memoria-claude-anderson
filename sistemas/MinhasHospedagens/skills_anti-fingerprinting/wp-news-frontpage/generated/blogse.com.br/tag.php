<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
$tag = get_queried_object();
?>

<header class="bx-archive-head">
    <div class="bx-post-cat" style="margin-bottom: var(--bx-sp-2);">Tag</div>
    <h1>#<?php single_tag_title(); ?></h1>
    <?php if ( isset( $tag->count ) ) : ?>
        <span class="bx-archive-head__count"><?php echo (int) $tag->count; ?> matérias</span>
    <?php endif; ?>
</header>

<?php if ( have_posts() ) : ?>
    <div class="bx-list">
        <?php while ( have_posts() ) : the_post(); $rcats = get_the_category(); ?>
            <article class="bx-list-card" id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                <?php if ( has_post_thumbnail() ) : ?>
                    <a class="bx-list-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
                        <?php the_post_thumbnail( 'bx-card', array( 'loading' => 'lazy' ) ); ?>
                    </a>
                <?php endif; ?>
                <div class="bx-list-card__body">
                    <?php if ( $rcats ) : ?><div class="bx-list-card__cat"><?php echo esc_html( $rcats[0]->name ); ?></div><?php endif; ?>
                    <h2 class="bx-list-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                    <p class="bx-list-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 28 ) ); ?></p>
                    <div class="bx-list-card__meta"><?php echo esc_html( get_the_date( 'd/m/Y' ) ); ?></div>
                </div>
            </article>
        <?php endwhile; ?>
    </div>
    <nav class="bx-pagination" aria-label="Paginação">
        <?php
        $prev = get_previous_posts_link( '&laquo; Mais recentes' );
        $next = get_next_posts_link( 'Mais antigas &raquo;' );
        echo $prev ?: '<span style="opacity:.3">&laquo; Mais recentes</span>';
        echo $next ?: '<span style="opacity:.3">Mais antigas &raquo;</span>';
        ?>
    </nav>
<?php else : ?>
    <p>Nenhuma matéria com esta tag.</p>
<?php endif;
get_footer();
