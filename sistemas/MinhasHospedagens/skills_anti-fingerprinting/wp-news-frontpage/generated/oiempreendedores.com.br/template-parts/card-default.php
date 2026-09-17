<?php
/**
 * Card padrão (text_only) — usado em grids e listas.
 *
 * Variáveis disponíveis: $args['density'] = compact|default|lg|xl
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

$density = isset( $args['density'] ) ? $args['density'] : 'default';
oie_card( $density );
