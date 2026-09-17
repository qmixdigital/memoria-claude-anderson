<?php
/**
 * Card default — image left (1:1), body right.
 * Hard stop on no thumbnail (rule 2.2 defense-in-depth).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! has_post_thumbnail() ) { return; }
?>
<article class="ec-card">
    <a class="ec-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
        <?php the_post_thumbnail( 'medium', array( 'alt' => '' ) ); ?>
    </a>
    <div class="ec-card__body">
        <?php
        $cats = get_the_category();
        if ( ! empty( $cats ) ) {
            $cats_out = array();
            foreach ( array_slice( $cats, 0, 2 ) as $cc ) {
                $cats_out[] = '<a href="' . esc_url( get_category_link( $cc ) ) . '">' . esc_html( $cc->name ) . '</a>';
            }
            echo '<span class="ec-card__cat">' . implode( '', $cats_out ) . '</span>';
        }
        ?>
        <h3 class="ec-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
        <p class="ec-card__meta">
            <?php echo esc_html( ec_post_date() ); ?>
            <span aria-hidden="true"> | </span>
            <?php the_author(); ?>
        </p>
    </div>
</article>
