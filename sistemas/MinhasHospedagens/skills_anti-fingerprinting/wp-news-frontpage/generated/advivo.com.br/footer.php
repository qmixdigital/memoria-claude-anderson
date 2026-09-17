<?php
/**
 * Portal: AdVivo (advivo.com.br) - Footer F3 (newsletter em destaque)
 * Gerado: 09/08/2026
 */
?>
</main>

<footer class="av-foot">
	<section class="av-news" aria-labelledby="av-news-h">
		<div class="av-wrap">
			<h2 class="av-news__h" id="av-news-h">Receba as principais notícias por e-mail</h2>
			<p class="av-news__p">Um resumo por dia, sem ruído. Você cancela quando quiser.</p>
			<form method="post" action="<?php echo esc_url( home_url( '/contato/' ) ); ?>">
				<label class="screen-reader-text" for="av-news-email">Seu e-mail</label>
				<input type="email" id="av-news-email" name="email" placeholder="seu@email.com.br" required>
				<button type="submit">Inscrever</button>
			</form>
		</div>
	</section>

	<div class="av-wrap av-foot__cols">
		<div>
			<div class="av-foot__brand"><?php bloginfo( 'name' ); ?></div>
			<p class="av-foot__about">
				Portal de notícias e conteúdo editorial no ar desde 2018. Cobertura diária de atualidade,
				entretenimento, negócios e comportamento, com apuração própria e fontes checadas.
			</p>
		</div>

		<div>
			<h3 class="av-foot__h">Editorias</h3>
			<ul>
				<?php
				$cats_rodape = get_categories( array(
					'orderby'    => 'count',
					'order'      => 'DESC',
					'number'     => 6,
					'hide_empty' => true,
					'exclude'    => av_cat_ids_excluidas(),
				) );
				foreach ( $cats_rodape as $t ) :
					?>
					<li><a href="<?php echo esc_url( get_category_link( $t->term_id ) ); ?>"><?php echo esc_html( $t->name ); ?></a></li>
				<?php endforeach; ?>
			</ul>
		</div>

		<div>
			<h3 class="av-foot__h">Institucional</h3>
			<ul>
				<li><a href="<?php echo esc_url( home_url( '/sobre/' ) ); ?>">Sobre o AdVivo</a></li>
				<li><a href="<?php echo esc_url( home_url( '/contato/' ) ); ?>">Fale com a redação</a></li>
				<li><a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">Política de Privacidade</a></li>
				<li><a href="<?php echo esc_url( home_url( '/termos-de-uso/' ) ); ?>">Termos de Uso</a></li>
			</ul>
		</div>

		<div>
			<h3 class="av-foot__h">Acompanhe</h3>
			<ul>
				<li><a href="<?php echo esc_url( home_url( '/feed/' ) ); ?>">Assinar RSS</a></li>
				<li><a href="<?php echo esc_url( home_url( '/mapa-do-site/' ) ); ?>">Mapa do site</a></li>
				<li><a href="<?php echo esc_url( home_url( '/?s=' ) ); ?>">Buscar no acervo</a></li>
			</ul>
		</div>
	</div>

	<div class="av-wrap av-foot__bar">
		<span>&copy; <?php echo esc_html( wp_date( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?>. Todos os direitos reservados.</span>
		<span>O conteúdo é de responsabilidade da redação. Reprodução permitida com crédito e link.</span>
	</div>
</footer>

<script>
/* Chrome do portal: drawer, busca e barra que some ao descer. */
(function () {
	var burger = document.querySelector('[data-av-burger]');
	var drawer = document.getElementById('av-drawer');
	var scrim  = document.querySelector('[data-av-scrim]');
	var fechar = document.querySelector('[data-av-close]');
	var busca  = document.querySelector('[data-av-search]');
	var caixa  = document.getElementById('av-searchbox');
	var strip  = document.querySelector('[data-av-strip]');

	function abrir(v) {
		if (!drawer) { return; }
		drawer.classList.toggle('is-open', v);
		if (scrim) { scrim.classList.toggle('is-open', v); }
		if (burger) { burger.setAttribute('aria-expanded', v ? 'true' : 'false'); }
		document.body.style.overflow = v ? 'hidden' : '';
	}

	if (burger) { burger.addEventListener('click', function () { abrir(!drawer.classList.contains('is-open')); }); }
	if (scrim)  { scrim.addEventListener('click', function () { abrir(false); }); }
	if (fechar) { fechar.addEventListener('click', function () { abrir(false); }); }
	document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { abrir(false); } });

	if (busca && caixa) {
		busca.addEventListener('click', function () {
			var aberto = caixa.classList.toggle('is-open');
			busca.setAttribute('aria-expanded', aberto ? 'true' : 'false');
			if (aberto) { var i = caixa.querySelector('input'); if (i) { i.focus(); } }
		});
	}

	if (strip) {
		var ultimo = window.pageYOffset;
		window.addEventListener('scroll', function () {
			var y = window.pageYOffset;
			strip.classList.toggle('is-hidden', y > ultimo && y > 260);
			ultimo = y;
		}, { passive: true });
	}
})();
</script>

<?php wp_footer(); ?>
</body>
</html>
