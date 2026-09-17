<?php
/**
 * Template Name: Contato (Câmera Cotidiana)
 *
 * Form single-column tipo "letter to the editor" — campos com border-bottom
 * apenas, sem labels acima, placeholders italics. Honeypot: numero_whatsapp.
 * Action: cc_envio_proposta=enviar.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

$state = isset( $_GET['e'] ) ? sanitize_key( $_GET['e'] ) : '';
$ok    = $state === 'recebido';
$erro  = $state === 'falhou' ? sanitize_text_field( $_GET['detalhe'] ?? '' ) : '';
$nonce = wp_create_nonce( 'cc_proposta' );
$ts    = time();
?>

<div class="cc__shell cc__shell--narrow" style="max-width:740px;">

    <article class="cc__post" style="margin: var(--cc-sp-5) auto;">

        <nav class="cc__breadcrumb" aria-label="Localização">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>">início</a>
            <span class="cc__breadcrumb__sep" aria-hidden="true"></span>
            <span>contato</span>
        </nav>

        <span class="cc__post__kicker">redação</span>
        <h1 class="cc__post__title">escreva pra cá</h1>
        <p class="cc__post__lead">
            Sugestão de pauta, retrato de cidade, ensaio, correção, parceria editorial. Lemos tudo que chega. Press releases sem contexto e propostas de SEO/backlink são descartadas em silêncio. O retorno chega em até 48 horas em dias úteis.
        </p>

        <?php if ( $ok ) : ?>
            <div class="cc__flash cc__flash--ok" role="status">
                <strong>recebido.</strong>
                <p style="margin:8px 0 0;">A redação confirma. Em até 48h em dias úteis um editor responde no e-mail informado.</p>
            </div>
        <?php endif; ?>

        <?php if ( $erro ) : ?>
            <div class="cc__flash cc__flash--err" role="alert">
                <strong>não foi possível enviar.</strong>
                <p style="margin:8px 0 0;"><?php echo esc_html( $erro ); ?></p>
            </div>
        <?php endif; ?>

        <form method="post" action="" class="cc__letter" novalidate>
            <input type="hidden" name="cc_envio_proposta" value="enviar">
            <input type="hidden" name="cc_proposta_nonce" value="<?php echo esc_attr( $nonce ); ?>">
            <input type="hidden" name="cc_proposta_ts" value="<?php echo esc_attr( $ts ); ?>">

            <div class="cc__letter__honey" aria-hidden="true">
                <label for="cc-honey">Número de WhatsApp (deixe vazio)</label>
                <input type="text" id="cc-honey" name="numero_whatsapp" tabindex="-1" autocomplete="off">
            </div>

            <p class="cc__letter__opener">› carta para a redação</p>

            <div class="cc__letter__line">
                <input type="text" name="signatario" required maxlength="120" placeholder="seu nome completo" autocomplete="name">
            </div>

            <div class="cc__letter__line">
                <input type="email" name="caixa_postal" required maxlength="180" placeholder="seu e-mail (caixa postal de retorno)" autocomplete="email">
            </div>

            <div class="cc__letter__line">
                <input type="text" name="cidade_origem" maxlength="120" placeholder="cidade de origem (opcional)">
            </div>

            <div class="cc__letter__line">
                <select name="natureza" required>
                    <option value="">› natureza da carta</option>
                    <option value="pauta">sugestão de pauta</option>
                    <option value="ensaio">submissão de ensaio</option>
                    <option value="retrato">retrato de cidade / coluna visual</option>
                    <option value="correcao">correção em texto publicado</option>
                    <option value="parceria">parceria editorial</option>
                    <option value="outro">outro</option>
                </select>
            </div>

            <div class="cc__letter__line cc__letter__line--message">
                <textarea name="conteudo" rows="9" required minlength="40" maxlength="4000" placeholder="o que vem dizer? (40 a 4000 caracteres)"></textarea>
            </div>

            <div class="cc__letter__sign">
                <button type="submit" class="cc__btn cc__btn--filled">› expedir</button>
                <p class="cc__letter__note">
                    Ao enviar você concorda com nossa <a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">política de privacidade</a>.
                </p>
            </div>
        </form>

    </article>

</div>

<style>
.cc__flash { padding: var(--cc-sp-3) var(--cc-sp-4); margin: var(--cc-sp-4) 0; border-left: 4px solid; }
.cc__flash--ok  { background: var(--cc-paper-2); border-left-color: var(--cc-accent); }
.cc__flash--err { background: #FBE9E5; border-left-color: #8E2F0C; color: #5A1B05; }
html[data-theme="dark"] .cc__flash--ok { background: var(--cc-dark-paper-2); }
.cc__flash strong { display: block; font-family: var(--cc-mono); font-size: 11px; letter-spacing: .22em; text-transform: lowercase; }

.cc__letter { margin-top: var(--cc-sp-5); }
.cc__letter__honey { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
.cc__letter__opener { font-family: var(--cc-mono); font-size: 11px; letter-spacing: .26em; color: var(--cc-accent); text-transform: lowercase; margin: 0 0 var(--cc-sp-4); padding-bottom: var(--cc-sp-2); border-bottom: 1px solid var(--cc-line); }
.cc__letter__line { margin: 0 0 var(--cc-sp-4); }
.cc__letter__line--message textarea { min-height: 240px; }

.cc__letter__sign { display: flex; flex-wrap: wrap; gap: var(--cc-sp-3); align-items: center; padding-top: var(--cc-sp-4); border-top: 1px solid var(--cc-line); }
.cc__letter__note { margin: 0; font-family: var(--cc-mono); font-size: 10px; color: var(--cc-muted); letter-spacing: .12em; flex: 1; min-width: 240px; text-transform: lowercase; }
.cc__letter__note a { color: var(--cc-accent); border-bottom: 1px solid var(--cc-accent); padding-bottom: 1px; }
</style>

<?php get_footer();
