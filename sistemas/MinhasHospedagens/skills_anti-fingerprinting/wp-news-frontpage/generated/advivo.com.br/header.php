<?php
/**
 * Portal: AdVivo (advivo.com.br) - Header H3 (logo centralizado, menu dividido)
 * Gerado: 09/08/2026
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'av' ); ?>>
<?php wp_body_open(); ?>

<a class="av-skip" href="#conteudo">Pular para o conteudo</a>

<div class="av-top">
	<div class="av-wrap av-top__in">
		<span class="av-top__live"><span class="av-top__dot" aria-hidden="true"></span> Ao vivo</span>
		<span class="av-top__date"><?php echo esc_html( ucfirst( wp_date( 'l, j \d\e F \d\e Y' ) ) ); ?></span>
	</div>
</div>

<header class="av-head">
	<div class="av-head__in av-wrap">
		<?php
		// H3: metade do menu de cada lado do logo. No mobile vira burger.
		$editorias = array( 'noticias', 'entretenimento', 'insights', 'dicas', 'saude-beleza', 'tecnologia' );
		$termos    = array();
		foreach ( $editorias as $slug ) {
			$t = get_category_by_slug( $slug );
			if ( $t ) { $termos[] = $t; }
		}
		$metade    = (int) ceil( count( $termos ) / 2 );
		$esquerda  = array_slice( $termos, 0, $metade );
		$direita   = array_slice( $termos, $metade );
		?>

		<div class="av-head__side av-head__side--l">
			<button class="av-burger" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="av-drawer" data-av-burger>
				<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
			</button>
			<nav class="av-nav av-nav--l" aria-label="Editorias principais">
				<?php foreach ( $esquerda as $t ) : ?>
					<a href="<?php echo esc_url( get_category_link( $t->term_id ) ); ?>"><?php echo esc_html( $t->name ); ?></a>
				<?php endforeach; ?>
			</nav>
		</div>

		<a class="av-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
			<?php
			// Nao basta has_custom_logo(): o custom_logo pode apontar pra anexo
			// cujo arquivo foi apagado do disco, e ai o link do logo sai vazio.
			$logo_id   = (int) get_theme_mod( 'custom_logo' );
			$logo_ok   = $logo_id && get_attached_file( $logo_id ) && file_exists( get_attached_file( $logo_id ) );
			if ( $logo_ok ) :
				echo wp_get_attachment_image( $logo_id, 'full', false, array(
					'alt'           => esc_attr( get_bloginfo( 'name' ) ),
					'loading'       => 'eager',
					'fetchpriority' => 'high',
					'class'         => 'av-brand__logo',
				) );
			else :
				?>
				<span class="av-brand__name"><?php bloginfo( 'name' ); ?></span>
				<?php
			endif;
			?>
			<span class="av-brand__tag">Portal de Notícias</span>
		</a>

		<div class="av-head__side av-head__side--r">
			<nav class="av-nav av-nav--r" aria-label="Mais editorias">
				<?php foreach ( $direita as $t ) : ?>
					<a href="<?php echo esc_url( get_category_link( $t->term_id ) ); ?>"><?php echo esc_html( $t->name ); ?></a>
				<?php endforeach; ?>
			</nav>
			<button class="av-search-btn" type="button" aria-label="Buscar no site" aria-expanded="false" aria-controls="av-searchbox" data-av-search>
				<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
			</button>
		</div>
	</div>

	<div class="av-searchbox" id="av-searchbox">
		<form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
			<label class="screen-reader-text" for="av-s">Buscar por</label>
			<input type="search" id="av-s" name="s" placeholder="Buscar reportagens, temas, autores" value="<?php echo esc_attr( get_search_query() ); ?>">
			<button type="submit">Buscar</button>
		</form>
	</div>
</header>

<div class="av-strip" data-av-strip>
	<nav class="av-wrap av-strip__in" aria-label="Todas as editorias">
		<?php
		$todas = get_categories( array(
			'orderby'    => 'count',
			'order'      => 'DESC',
			'number'     => 12,
			'hide_empty' => true,
			'exclude'    => av_cat_ids_excluidas(),
		) );
		foreach ( $todas as $t ) :
			?>
			<a href="<?php echo esc_url( get_category_link( $t->term_id ) ); ?>"><?php echo esc_html( $t->name ); ?></a>
		<?php endforeach; ?>
	</nav>
</div>

<div class="av-scrim" data-av-scrim></div>
<aside class="av-drawer" id="av-drawer" aria-label="Menu de navegacao">
	<div class="av-drawer__head">
		<span class="av-drawer__title">Editorias</span>
		<button class="av-search-btn" type="button" aria-label="Fechar menu" data-av-close>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
		</button>
	</div>
	<nav>
		<?php foreach ( $todas as $t ) : ?>
			<a href="<?php echo esc_url( get_category_link( $t->term_id ) ); ?>"><?php echo esc_html( $t->name ); ?></a>
		<?php endforeach; ?>
	</nav>
</aside>

<main id="conteudo" class="av-main">
