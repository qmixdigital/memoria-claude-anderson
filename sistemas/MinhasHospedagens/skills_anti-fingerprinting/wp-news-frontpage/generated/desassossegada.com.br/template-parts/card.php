<?php
// Wrapper para get_template_part('template-parts/card', $density). Delega para dsg_card().
if ( ! defined( 'ABSPATH' ) ) { exit; }
$density = isset( $args['density'] ) ? $args['density'] : 'default';
if ( function_exists( 'dsg_card' ) ) { dsg_card( $density ); }
