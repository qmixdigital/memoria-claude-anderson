<?php
/**
 * Template Name: Contato (Viaje no Detalhe)
 *
 * Form 4-fields layout almanaque: assinante / endereço / motivação / texto
 * action: vd_envio_pauta=enviar, honeypot: numero_assinatura.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();

$state = isset( $_GET['st'] ) ? sanitize_key( $_GET['st'] ) : '';
$ok    = $state === 'recebido';
$erro  = $state === 'erro' ? sanitize_text_field( $_GET['m'] ?? '' ) : '';
$nonce = wp_create_nonce( 'vd_pauta' );
$ts    = time();
?>

<div class="vd-shell" style="max-width:740px;">

  <article class="vd-post" style="margin: var(--vd-sp-4) auto;">

    <nav class="vd-breadcrumb" aria-label="Localização">
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>">início</a>
      <span class="vd-breadcrumb__sep" aria-hidden="true"></span>
      <span>contato</span>
    </nav>

    <header class="vd-post__head">
      <span class="vd-post__kicker">// redação</span>
      <h1 class="vd-post__title">escreva ao almanaque</h1>
      <p class="vd-post__lead">
        Sugestões de pauta, correções, indicações de leitura, parcerias editoriais. A redação lê tudo. Releases sem contexto editorial e propostas de SEO/backlink são descartadas em silêncio.
      </p>
    </header>

    <?php if ( $ok ) : ?>
      <div class="vd-flash vd-flash--ok" role="status">
        <strong>// recebido.</strong>
        <p>A redação confirma. Em até 48h em dias úteis um editor responde no e-mail informado.</p>
      </div>
    <?php endif; ?>

    <?php if ( $erro ) : ?>
      <div class="vd-flash vd-flash--err" role="alert">
        <strong>// não foi possível enviar.</strong>
        <p><?php echo esc_html( $erro ); ?></p>
      </div>
    <?php endif; ?>

    <form method="post" action="" class="vd-pauta" novalidate>
      <input type="hidden" name="vd_envio_pauta" value="enviar">
      <input type="hidden" name="vd_pauta_nonce" value="<?php echo esc_attr( $nonce ); ?>">
      <input type="hidden" name="vd_pauta_ts" value="<?php echo esc_attr( $ts ); ?>">

      <div class="vd-pauta__honey" aria-hidden="true">
        <label for="vd-honey">Número de assinatura (deixe vazio)</label>
        <input type="text" id="vd-honey" name="numero_assinatura" tabindex="-1" autocomplete="off">
      </div>

      <p class="vd-pauta__field-label">// quem escreve</p>
      <div class="vd-pauta__field">
        <input type="text" name="assinante" required maxlength="120" placeholder="seu nome completo" autocomplete="name">
      </div>

      <p class="vd-pauta__field-label">// endereço para retorno</p>
      <div class="vd-pauta__field">
        <input type="email" name="endereco_retorno" required maxlength="180" placeholder="seu@email.com" autocomplete="email">
      </div>

      <p class="vd-pauta__field-label">// motivação</p>
      <div class="vd-pauta__field">
        <select name="motivo" required>
          <option value="">— escolha —</option>
          <option value="pauta">sugestão de pauta</option>
          <option value="correcao">correção em texto publicado</option>
          <option value="leitura">indicação de leitura</option>
          <option value="release">release / lançamento</option>
          <option value="parceria">parceria editorial</option>
          <option value="outro">outro</option>
        </select>
      </div>

      <p class="vd-pauta__field-label">// texto integral</p>
      <div class="vd-pauta__field">
        <textarea name="texto" rows="9" required minlength="40" maxlength="4000" placeholder="40 a 4000 caracteres. Quanto mais contexto, melhor."></textarea>
      </div>

      <div class="vd-pauta__sign">
        <button type="submit" class="vd-btn">→ enviar</button>
        <p class="vd-pauta__note">Ao enviar você concorda com nossa <a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">política de privacidade</a>.</p>
      </div>
    </form>

  </article>
</div>

<style>
.vd-flash { padding: var(--vd-sp-3) var(--vd-sp-4); margin: var(--vd-sp-4) 0; border-left: 4px solid; background: var(--vd-paper-2); }
.vd-flash--ok  { border-left-color: var(--vd-teal); }
.vd-flash--err { border-left-color: var(--vd-coral); }
.vd-flash strong { display: block; font-family: var(--vd-mono); font-size: 11px; letter-spacing: .22em; text-transform: lowercase; }

.vd-pauta { margin-top: var(--vd-sp-5); }
.vd-pauta__honey { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
.vd-pauta__field-label { margin: var(--vd-sp-3) 0 6px; font-family: var(--vd-mono); font-size: 10px; color: var(--vd-coral); letter-spacing: .22em; text-transform: lowercase; font-weight: 600; }
.vd-pauta__field { margin: 0 0 var(--vd-sp-3); }
.vd-pauta__sign { margin-top: var(--vd-sp-4); padding-top: var(--vd-sp-3); border-top: 1px solid var(--vd-line); display: flex; flex-wrap: wrap; gap: var(--vd-sp-3); align-items: center; }
.vd-pauta__note { margin: 0; font-family: var(--vd-mono); font-size: 10px; color: var(--vd-muted); letter-spacing: .12em; flex: 1; min-width: 240px; text-transform: lowercase; }
.vd-pauta__note a { color: var(--vd-coral); }
</style>

<?php get_footer();
