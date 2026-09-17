<?php
/**
 * Template Name: Contato (Folha do Noroeste)
 *
 * Form 4-fields: nome / email / motivo / texto
 * Padrão da skill wp-news-portal-fullsetup.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();

$state = isset( $_GET['st'] ) ? sanitize_key( $_GET['st'] ) : '';
$ok    = $state === 'recebido';
$erro  = $state === 'erro' ? sanitize_text_field( $_GET['m'] ?? '' ) : '';
$nonce = wp_create_nonce( 'fn_pauta' );
$ts    = time();
?>

<main id="fn-main" role="main">
<article class="fn-post" style="max-width:760px;">

	<nav class="fn-breadcrumb" aria-label="Breadcrumb">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>">Início</a>
		<span class="fn-breadcrumb__sep">/</span>
		<span>Contato</span>
	</nav>

	<header class="fn-post__head">
		<span class="fn-post__cat">Redação</span>
		<h1 class="fn-post__title">Fale com a redação</h1>
		<p class="fn-post__sub">Sugestões de pauta, correções, indicações de leitura, parcerias editoriais. A redação lê tudo. Releases sem contexto e propostas de SEO/backlink são descartadas.</p>
	</header>

	<?php if ( $ok ) : ?>
		<div class="fn-flash fn-flash--ok" role="status">
			<strong>Mensagem recebida.</strong>
			<p>A redação confirma. Em até 48h em dias úteis um editor responde no e-mail informado.</p>
		</div>
	<?php endif; ?>
	<?php if ( $erro ) : ?>
		<div class="fn-flash fn-flash--err" role="alert">
			<strong>Não foi possível enviar.</strong>
			<p><?php echo esc_html( $erro ); ?></p>
		</div>
	<?php endif; ?>

	<form method="post" action="" class="fn-pauta" novalidate>
		<input type="hidden" name="fn_envio_pauta" value="enviar">
		<input type="hidden" name="fn_pauta_nonce" value="<?php echo esc_attr( $nonce ); ?>">
		<input type="hidden" name="fn_pauta_ts" value="<?php echo esc_attr( $ts ); ?>">

		<div class="fn-pauta__honey" aria-hidden="true">
			<label for="fn-honey">Número de assinatura (deixe vazio)</label>
			<input type="text" id="fn-honey" name="numero_assinatura" tabindex="-1" autocomplete="off">
		</div>

		<div class="fn-pauta__field">
			<label>Nome <span class="req">*</span></label>
			<input type="text" name="assinante" required maxlength="120" placeholder="Seu nome completo" autocomplete="name">
		</div>
		<div class="fn-pauta__field">
			<label>E-mail <span class="req">*</span></label>
			<input type="email" name="endereco_retorno" required maxlength="180" placeholder="seu@email.com" autocomplete="email">
		</div>
		<div class="fn-pauta__field">
			<label>Assunto <span class="req">*</span></label>
			<select name="motivo" required>
				<option value="">escolha um motivo</option>
				<option value="pauta">Sugestão de pauta</option>
				<option value="correcao">Correção em texto publicado</option>
				<option value="leitura">Indicação de leitura</option>
				<option value="release">Release / lançamento</option>
				<option value="parceria">Parceria editorial</option>
				<option value="outro">Outro</option>
			</select>
		</div>
		<div class="fn-pauta__field">
			<label>Mensagem <span class="req">*</span></label>
			<textarea name="texto" rows="9" required minlength="40" maxlength="4000" placeholder="40 a 4000 caracteres. Quanto mais contexto, melhor."></textarea>
		</div>
		<div class="fn-pauta__sign">
			<button type="submit" class="fn-btn">Enviar mensagem</button>
			<p class="fn-pauta__note">Ao enviar você concorda com nossa <a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">política de privacidade</a>.</p>
		</div>
	</form>
</article>
</main>

<style>
.fn-flash { padding: 14px 18px; margin: 18px 0; border-left: 4px solid; background: var(--fn-paper-2); border-radius: var(--fn-r-card); }
.fn-flash--ok  { border-left-color: #1E8449; }
.fn-flash--err { border-left-color: var(--fn-red); }
.fn-flash strong { display: block; font-size: 14px; font-weight: 700; margin-bottom: 4px; color: var(--fn-ink); font-family: var(--fn-font-meta); }
.fn-flash p { margin: 0; font-size: 14px; color: var(--fn-muted-2); font-family: var(--fn-font-meta); }
.fn-pauta { margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--fn-line); font-family: var(--fn-font-meta); }
.fn-pauta__honey { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
.fn-pauta__field { margin: 0 0 18px; }
.fn-pauta__field label { display: block; font-size: 13px; font-weight: 700; letter-spacing: .04em; margin-bottom: 6px; color: var(--fn-ink-2); text-transform: uppercase; }
.fn-pauta__field .req { color: var(--fn-red); margin-left: 2px; }
.fn-pauta__field input,
.fn-pauta__field select,
.fn-pauta__field textarea {
	width: 100%; padding: 12px 14px; border: 1px solid var(--fn-line);
	border-radius: var(--fn-r-button); font-family: inherit; font-size: 15px;
	background: var(--fn-paper); color: var(--fn-ink); transition: border-color .15s ease, box-shadow .15s ease;
}
.fn-pauta__field input:focus,
.fn-pauta__field select:focus,
.fn-pauta__field textarea:focus {
	outline: none; border-color: var(--fn-red); box-shadow: 0 0 0 3px var(--fn-red-soft);
}
.fn-pauta__field textarea { resize: vertical; min-height: 140px; line-height: 1.55; }
.fn-pauta__sign { margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--fn-line-soft); display: flex; flex-wrap: wrap; gap: 18px; align-items: center; }
.fn-btn { padding: 12px 28px; background: var(--fn-ink); color: var(--fn-paper); border: 0; border-radius: var(--fn-r-button); font-family: inherit; font-weight: 800; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; transition: background .15s ease; }
.fn-btn:hover { background: var(--fn-red); }
.fn-pauta__note { margin: 0; font-size: 12px; color: var(--fn-muted); flex: 1; min-width: 240px; }
.fn-pauta__note a { color: var(--fn-red-ink); border-bottom: 1px solid var(--fn-red); }
</style>

<?php get_footer();
