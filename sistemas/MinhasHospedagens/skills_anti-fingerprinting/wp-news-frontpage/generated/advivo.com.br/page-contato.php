<?php
/**
 * Template Name: Contato (AdVivo)
 *
 * Portal: AdVivo (advivo.com.br)
 * Gerado: 09/08/2026
 *
 * Campos, action e nonce preservados da versao anterior para nao quebrar o
 * receptor do formulario. So a marcacao e o estilo foram refeitos no novo
 * sistema visual.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

$state = isset( $_GET['s'] ) ? sanitize_key( $_GET['s'] ) : '';
$ok    = $state === 'ok';
$erro  = $state === 'erro' ? sanitize_text_field( $_GET['m'] ?? '' ) : '';
$nonce = wp_create_nonce( 'av_pauta' );
$ts    = time();
?>

<div class="av-wrap" style="max-width:820px">
	<article class="av-article">

		<nav class="av-crumb" aria-label="Trilha de navegacao">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>">Início</a> &rsaquo; <span>Contato</span>
		</nav>

		<header class="av-art__head" style="margin-left:0">
			<span class="av-art__kicker">Redação</span>
			<h1 class="av-art__title">Mande sua pauta</h1>
			<p class="av-art__dek">
				Sugestão de matéria, correção, parceria editorial ou direito de resposta. Lemos tudo.
				Releases automáticos sem contexto são descartados. O retorno chega em até 48h em dias úteis.
			</p>
		</header>

		<?php if ( $ok ) : ?>
			<div class="av-flash av-flash--ok" role="status">
				<strong>Recebido.</strong>
				<p>A redação confirma. Em até 48h em dias úteis um editor responde no e-mail informado.</p>
			</div>
		<?php endif; ?>

		<?php if ( $erro ) : ?>
			<div class="av-flash av-flash--err" role="alert">
				<strong>Não foi possível enviar.</strong>
				<p><?php echo esc_html( $erro ); ?></p>
			</div>
		<?php endif; ?>

		<form method="post" action="" class="av-form" novalidate>
			<input type="hidden" name="av_envio_pauta" value="enviar">
			<input type="hidden" name="av_pauta_nonce" value="<?php echo esc_attr( $nonce ); ?>">
			<input type="hidden" name="av_pauta_ts" value="<?php echo esc_attr( $ts ); ?>">

			<div class="av-form__honey" aria-hidden="true">
				<label for="av-honey">Link adicional (deixe vazio)</label>
				<input type="text" id="av-honey" name="link_aleatorio" tabindex="-1" autocomplete="off">
			</div>

			<div class="av-form__row">
				<div class="av-form__field">
					<label for="av-rep">Nome de quem assina</label>
					<input type="text" id="av-rep" name="reporter" required maxlength="120" autocomplete="name">
				</div>
				<div class="av-form__field">
					<label for="av-em">E-mail para retorno</label>
					<input type="email" id="av-em" name="contato_email" required maxlength="180" autocomplete="email">
				</div>
			</div>

			<div class="av-form__field">
				<label for="av-cn">Assunto do contato</label>
				<select id="av-cn" name="canal" required>
					<option value="">Selecione</option>
					<option value="pauta">Sugestão de pauta</option>
					<option value="correcao">Correção</option>
					<option value="resposta">Direito de resposta</option>
					<option value="release">Release editorial</option>
					<option value="parceria">Parceria</option>
					<option value="outro">Outro</option>
				</select>
			</div>

			<div class="av-form__field">
				<label for="av-as">Resumo em uma linha</label>
				<input type="text" id="av-as" name="assunto" required maxlength="160">
			</div>

			<div class="av-form__field">
				<label for="av-cp">Mensagem</label>
				<textarea id="av-cp" name="corpo" rows="9" required minlength="40" maxlength="4000" placeholder="De 40 a 4000 caracteres. Quanto mais contexto, melhor."></textarea>
			</div>

			<div class="av-form__sign">
				<button type="submit" class="av-btn">Enviar mensagem</button>
				<p class="av-form__note">
					Ao enviar você concorda com a nossa
					<a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">política de privacidade</a>.
				</p>
			</div>
		</form>

	</article>
</div>

<?php get_footer(); ?>
