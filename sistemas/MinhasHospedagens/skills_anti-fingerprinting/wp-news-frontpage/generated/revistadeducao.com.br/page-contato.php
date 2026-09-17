<?php
/**
 * Template Name: Contato (Revista de Educação)
 *
 * Formulário próprio com 5 camadas anti-spam:
 *   1. Nonce CSRF do WP
 *   2. Honeypot invisível (campo "website" — humanos não veem, bots preenchem)
 *   3. Time-trap (rejeita se submit < 3s do page load)
 *   4. Rate-limit por IP (1 envio a cada 5 min, transient)
 *   5. Email do destinatário NUNCA exposto no HTML — só server-side
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

// Estado da submissão (set por rde_handle_contact_form em functions.php)
$state   = isset( $_GET['contato'] ) ? sanitize_key( $_GET['contato'] ) : '';
$ok      = $state === 'ok';
$err     = $state === 'erro' ? sanitize_text_field( $_GET['msg'] ?? '' ) : '';
$nonce   = wp_create_nonce( 'rde_contact_form' );
$ts      = time();
?>

<div class="rde-layout--single">

    <!-- Sidebar à esquerda (mantém layout do site) -->
    <aside class="rde-sidebar" role="complementary">
        <div class="rde-widget">
            <h4>Editorias</h4>
            <ul>
                <?php
                $cats = get_categories( array( 'orderby' => 'count', 'order' => 'DESC', 'number' => 8, 'hide_empty' => true ) );
                foreach ( $cats as $c ) {
                    echo '<li><a href="' . esc_url( get_category_link( $c ) ) . '">' . esc_html( $c->name ) . '</a></li>';
                }
                ?>
            </ul>
        </div>
        <div class="rde-widget">
            <h4>Pauta editorial</h4>
            <p style="font-family:var(--sans);font-size:13px;line-height:1.55;color:var(--ink-2);margin:0">
                Para sugestões de pauta, releases ou parcerias editoriais, escreva pelo formulário ao lado.
                Resposta em até 48h em dias úteis.
            </p>
        </div>
    </aside>

    <article class="rde-post">

        <span class="rde-post__kicker">Contato</span>
        <h1 class="rde-post__title">Fale com a redação</h1>
        <p class="rde-post__deck">
            Sugestões de pauta, releases, correções editoriais e parcerias. Sem agência de cobrança e sem propostas de SEO/backlink.
        </p>

        <?php if ( $ok ) : ?>
            <div class="rde-contact-msg rde-contact-msg--ok" role="status">
                <strong>Mensagem enviada.</strong>
                Recebemos seu contato e responderemos em até 48 horas em dias úteis.
            </div>
        <?php endif; ?>

        <?php if ( $err ) : ?>
            <div class="rde-contact-msg rde-contact-msg--err" role="alert">
                <strong>Não foi possível enviar.</strong>
                <?php echo esc_html( $err ); ?>
            </div>
        <?php endif; ?>

        <form method="post" action="" class="rde-contact-form" novalidate>
            <input type="hidden" name="rde_contact_action" value="send">
            <input type="hidden" name="rde_contact_nonce" value="<?php echo esc_attr( $nonce ); ?>">
            <input type="hidden" name="rde_contact_ts" value="<?php echo esc_attr( $ts ); ?>">

            <!-- Honeypot: invisível para humanos, bots preenchem por reflexo. -->
            <div class="rde-contact-form__hp" aria-hidden="true">
                <label for="rde-website">Website (deixe em branco)</label>
                <input type="text" id="rde-website" name="website" tabindex="-1" autocomplete="off">
            </div>

            <div class="rde-contact-form__row">
                <div class="rde-contact-form__field">
                    <label for="rde-nome">Nome <span aria-hidden="true">*</span></label>
                    <input type="text" id="rde-nome" name="nome" required maxlength="100" autocomplete="name">
                </div>
                <div class="rde-contact-form__field">
                    <label for="rde-email">E-mail <span aria-hidden="true">*</span></label>
                    <input type="email" id="rde-email" name="email" required maxlength="160" autocomplete="email">
                </div>
            </div>

            <div class="rde-contact-form__field">
                <label for="rde-assunto">Assunto <span aria-hidden="true">*</span></label>
                <select id="rde-assunto" name="assunto" required>
                    <option value="">Selecione…</option>
                    <option value="pauta">Sugestão de pauta</option>
                    <option value="release">Release / press</option>
                    <option value="correcao">Correção editorial</option>
                    <option value="parceria">Parceria de conteúdo</option>
                    <option value="outro">Outro assunto</option>
                </select>
            </div>

            <div class="rde-contact-form__field">
                <label for="rde-mensagem">Mensagem <span aria-hidden="true">*</span></label>
                <textarea id="rde-mensagem" name="mensagem" rows="6" required minlength="20" maxlength="3000"></textarea>
                <small class="rde-contact-form__hint">Entre 20 e 3000 caracteres.</small>
            </div>

            <button type="submit" class="rde-btn rde-btn--accent">Enviar mensagem &rarr;</button>

            <p class="rde-contact-form__legal">
                Ao enviar, você concorda com nossa <a href="<?php echo esc_url( home_url( '/politica-de-privacidade/' ) ); ?>">política de privacidade</a>. Seus dados não serão compartilhados.
            </p>
        </form>
    </article>
</div>

<?php get_footer();
