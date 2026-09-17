<?php
/**
 * Portal: AdVivo (advivo.com.br) - 404
 * Gerado: 09/08/2026
 */

get_header();
?>

<div class="av-wrap" style="padding:var(--av-s6) 0;text-align:center">
	<p class="av-art__kicker">Erro 404</p>
	<h1 class="av-arch__h">Esta página não existe mais</h1>
	<p class="av-card__dek" style="max-width:520px;margin:var(--av-s2) auto var(--av-s4)">
		O endereço pode ter mudado ou o conteúdo saiu do ar. Veja o que está em alta agora
		ou use a busca para achar o que procurava.
	</p>
	<a class="av-btn" href="<?php echo esc_url( home_url( '/' ) ); ?>">Voltar para a capa</a>
</div>

<div class="av-wrap">
	<?php $ids404 = av_ids( 3 ); if ( $ids404 ) : ?>
		<section class="av-sec">
			<div class="av-sec__head"><h2 class="av-sec__h">Em Alta Agora</h2></div>
			<div class="av-grid-3">
				<?php foreach ( $ids404 as $id ) { av_card( $id, 'default', array( 'size' => 'av-card' ) ); } ?>
			</div>
		</section>
	<?php endif; ?>
</div>

<?php get_footer(); ?>
