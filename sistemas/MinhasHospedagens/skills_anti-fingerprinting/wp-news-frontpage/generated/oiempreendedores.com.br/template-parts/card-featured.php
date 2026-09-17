<?php
/**
 * Card destaque — delega para oie_card( 'lg' ) que já garante a imagem destacada
 * e a estrutura uniforme do site. Mantido como template-part para preservar
 * compatibilidade com get_template_part( 'template-parts/card-featured' ).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
oie_card( 'lg' );
