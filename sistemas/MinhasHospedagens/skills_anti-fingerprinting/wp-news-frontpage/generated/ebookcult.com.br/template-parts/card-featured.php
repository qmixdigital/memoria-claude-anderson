<?php
/**
 * Card featured — image top (4:3), big title below.
 * Hard stop on no thumbnail (rule 2.2 defense-in-depth).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! has_post_thumbnail() ) { return; }
?>
<article class="ec-card ec-card--lg">
    <a class="ec-card__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
        <?php the_post_thumbnail( 'large', array( 'alt' => '', 'loading' => 'eager', 'decoding' => 'async' ) ); ?>
    </a>
    <div class="ec-card__body">
        <?php
        $cats = get_the_category();
        if ( ! empty( $cats ) ) {
            echo '<span class="ec-card__cat"><a href="' . esc_url( get_category_link( $cats[0] ) ) . '">' . esc_html( $cats[0]->name ) . '</a></span>';
        }
        ?>
        <h2 class="ec-card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
        <p class="ec-card__meta">
            <?php echo esc_html( ec_post_date() ); ?>
            <span aria-hidden="true"> | </span>
            <?php the_author(); ?>
        </p>
    </div>
</article>
