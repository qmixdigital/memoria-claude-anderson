<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
$density = isset( $args['density'] ) ? $args['density'] : 'default';
ic_card( $density );
