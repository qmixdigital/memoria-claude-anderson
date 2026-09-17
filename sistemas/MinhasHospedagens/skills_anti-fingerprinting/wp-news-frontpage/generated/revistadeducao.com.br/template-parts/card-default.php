<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
$density = isset( $args['density'] ) ? $args['density'] : 'default';
rde_card( $density );
