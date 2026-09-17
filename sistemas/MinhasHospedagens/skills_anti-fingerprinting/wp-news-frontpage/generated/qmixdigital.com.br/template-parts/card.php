<?php
# Wrapper para get_template_part('template-parts/card'). Delega para qmix_stream_card.
if ( ! defined( 'ABSPATH' ) ) { exit; }
$variant = isset( $args['variant'] ) ? $args['variant'] : 'left';
if ( function_exists( 'qmix_stream_card' ) ) { qmix_stream_card( $variant ); }
