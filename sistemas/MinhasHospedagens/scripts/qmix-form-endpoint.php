<?php
/**
 * Plugin Name: Contato (endpoint do formulario)
 * Description: Fecha o contrato que a pagina de contato ja esperava: define a variavel de configuracao do formulario e recebe o envio. Sem isso o visitante clica em enviar e nada acontece.
 * Version: 1.0
 * Author: QMIX Digital
 *
 * ANTI-FOOTPRINT: tudo que aparece no HTML publico (id do form, id do botao,
 * id do status, nome da variavel JS, nome do campo de token, nome do honeypot,
 * a rota que recebe o envio e o texto de retorno) e derivado de md5(dominio).
 * Dois portais nunca servem os mesmos identificadores. O arquivo PHP e igual em
 * todos, mas ele nao e visivel para crawler nenhum: o Google le apenas o HTML.
 *
 * POR QUE NAO admin-ajax.php: o Cloudflare da rede responde 403 a POST em
 * /wp-admin/*, entao o formulario continuaria quebrado. A rota fica no
 * front-end, atendida por parse_request, sem rewrite rule (nao exige flush).
 *
 * REMOCAO: apague este arquivo e purgue o cache. Nada e gravado no banco.
 */

if (!defined('ABSPATH')) { exit; }

/** Identificadores unicos por dominio. */
function qmix_fe_ids() {
    static $ids = null;
    if ($ids !== null) { return $ids; }
    $h = md5('contato|' . strtolower((string) parse_url(home_url(), PHP_URL_HOST)));
    $ids = array(
        'form'   => 'f' . substr($h, 0, 7),
        'btn'    => 'b' . substr($h, 7, 7),
        'status' => 's' . substr($h, 14, 7),
        'var'    => 'w' . substr($h, 21, 6) . 'Cfg',
        'token'  => 't_' . substr($h, 3, 8),
        'trap'   => array('site_web', 'url_extra', 'confirme_url', 'endereco_site')[hexdec(substr($h, 30, 2)) % 4],
        'acao'   => 'msg_' . substr($h, 12, 8),
        'rota'   => array('envio', 'recado', 'mensagem', 'fala')[hexdec(substr($h, 26, 2)) % 4] . '-' . substr($h, 24, 6),
        'ok'     => array(
            'Mensagem enviada. Responderemos em breve.',
            'Recebemos sua mensagem. Obrigado pelo contato.',
            'Pronto, sua mensagem chegou até a redação.',
        )[hexdec(substr($h, 28, 2)) % 3],
    );
    return $ids;
}

/** Destinatario: constante no wp-config tem prioridade sobre o padrao da rede. */
if (!defined('QMIX_FORM_TO')) {
    define('QMIX_FORM_TO', 'juliana.moraes.healthinfo@gmail.com');
}
function qmix_fe_destino() {
    if (defined('QMIX_FORM_TO') && QMIX_FORM_TO) { return QMIX_FORM_TO; }
    return get_option('admin_email');
}

/**
 * Formulario gerado para pagina de contato que nao tem nenhum.
 * A estrutura varia por dominio (ordem dos campos, rotulos, texto do botao,
 * presenca do telefone, tag do bloco), entao o markup de dois portais nunca
 * coincide. Sem isto, criar formulario em 65 sites seria um novo padrao.
 */
function qmix_fe_form_gerado() {
    $i = qmix_fe_ids();
    $h = md5('layout|' . strtolower((string) parse_url(home_url(), PHP_URL_HOST)));

    $rot = array(
        array('nome' => 'Nome', 'email' => 'E-mail', 'tel' => 'Telefone', 'msg' => 'Mensagem'),
        array('nome' => 'Seu nome', 'email' => 'Seu e-mail', 'tel' => 'Telefone (opcional)', 'msg' => 'Como podemos ajudar?'),
        array('nome' => 'Nome completo', 'email' => 'E-mail para resposta', 'tel' => 'WhatsApp ou telefone', 'msg' => 'Sua mensagem'),
    );
    $r = $rot[hexdec(substr($h, 0, 2)) % 3];

    $botoes = array('Enviar mensagem', 'Enviar', 'Falar com a redação', 'Enviar contato');
    $botao  = $botoes[hexdec(substr($h, 2, 2)) % 4];

    $titulos = array('Fale com a redação', 'Envie sua mensagem', 'Entre em contato', 'Escreva para nós');
    $titulo  = $titulos[hexdec(substr($h, 4, 2)) % 4];

    $comTel  = (hexdec(substr($h, 6, 2)) % 3) !== 0;              // 2 em 3 portais pedem telefone
    $tagBloc = (hexdec(substr($h, 8, 2)) % 2) ? 'section' : 'div';
    $cls     = 'c' . substr($h, 10, 6);

    $campo = function ($tipo, $nome, $rotulo, $req) use ($cls) {
        $obr = $req ? ' required' : '';
        $el  = ($tipo === 'textarea')
            ? '<textarea name="' . esc_attr($nome) . '" rows="6"' . $obr . '></textarea>'
            : '<input type="' . esc_attr($tipo) . '" name="' . esc_attr($nome) . '"' . $obr . '>';
        return '<p class="' . $cls . '__f"><label>' . esc_html($rotulo) . '</label>' . $el . '</p>';
    };

    $campos = array(
        'nome'  => $campo('text', 'nome', $r['nome'], true),
        'email' => $campo('email', 'email', $r['email'], true),
        'msg'   => $campo('textarea', 'mensagem', $r['msg'], true),
    );
    if ($comTel) { $campos['tel'] = $campo('tel', 'telefone', $r['tel'], false); }

    // Ordem dos campos tambem varia
    $ordens = array(
        array('nome', 'email', 'tel', 'msg'),
        array('nome', 'tel', 'email', 'msg'),
        array('email', 'nome', 'tel', 'msg'),
    );
    $ordem = $ordens[hexdec(substr($h, 12, 2)) % 3];

    // Concatenacao explicita: em string interpolada, "$cls__f" viraria o nome de
    // variavel $cls__f (o underscore entra no identificador) e sairia CSS quebrado.
    $css = '.' . $cls . '{max-width:640px;margin:24px 0}'
         . '.' . $cls . '__f{display:flex;flex-direction:column;gap:6px;margin:0 0 16px}'
         . '.' . $cls . ' label{font-size:.92em;opacity:.85}'
         . '.' . $cls . ' input,.' . $cls . ' textarea{width:100%;padding:11px 13px;border:1px solid rgba(128,128,128,.4);border-radius:8px;font:inherit;background:transparent;color:inherit}'
         . '.' . $cls . ' button{padding:12px 22px;border:0;border-radius:8px;font:inherit;cursor:pointer}'
         . '.' . $cls . ' .ok{color:#0a7c34}.' . $cls . ' .err{color:#b3261e}';

    $out  = '<style>' . $css . '</style>';
    $out .= '<' . $tagBloc . ' class="' . $cls . '">';
    $out .= '<h2>' . esc_html($titulo) . '</h2>';
    $out .= '<form id="' . esc_attr($i['form']) . '" autocomplete="off">';
    foreach ($ordem as $k) { if (isset($campos[$k])) { $out .= $campos[$k]; } }
    $out .= '<p style="position:absolute;left:-9999px" aria-hidden="true">'
          . '<input type="text" name="' . esc_attr($i['trap']) . '" tabindex="-1" autocomplete="off"></p>';
    $out .= '<button type="submit" id="' . esc_attr($i['btn']) . '">' . esc_html($botao) . '</button>';
    $out .= '<span id="' . esc_attr($i['status']) . '"></span>';
    $out .= '</form></' . $tagBloc . '>';

    $out .= '<script>(function(){var f=document.getElementById(' . wp_json_encode($i['form']) . ');if(!f)return;'
          . 'f.addEventListener("submit",function(e){e.preventDefault();'
          . 'var b=document.getElementById(' . wp_json_encode($i['btn']) . '),s=document.getElementById(' . wp_json_encode($i['status']) . ');'
          . 'b.disabled=true;s.textContent="Enviando...";s.className="";'
          . 'var d=new FormData(f);d.append(' . wp_json_encode($i['token']) . ',' . $i['var'] . '.token);'
          . 'fetch(' . $i['var'] . '.url,{method:"POST",body:d}).then(function(r){return r.json();}).then(function(j){'
          . 'b.disabled=false;s.textContent=j.data;s.className=j.success?"ok":"err";if(j.success)f.reset();'
          . '}).catch(function(){b.disabled=false;s.textContent="Erro de conexão. Tente novamente.";s.className="err";});});})();</script>';

    return $out;
}

/**
 * Reescreve os identificadores genericos da pagina e injeta a configuracao.
 * A troca vale para markup, CSS inline e JS inline de uma vez, entao o estilo
 * continua casando com o novo id.
 */
function qmix_fe_conteudo($content) {
    if (is_admin() || !in_the_loop() || !is_main_query()) { return $content; }

    $i   = qmix_fe_ids();
    $cfg = '<script>var ' . $i['var'] . '={url:' . wp_json_encode(home_url('/' . $i['rota']))
         . ',token:' . wp_json_encode(wp_create_nonce($i['acao'])) . '};</script>';

    // Caso 1: a pagina ja traz o formulario. So troca os identificadores genericos.
    if (strpos($content, 'qmix-form') !== false) {
        $de   = array('qmix-form', 'qmix-btn', 'qmix-status', 'qmixAjax', 'qmix_token', 'name="website"');
        $para = array($i['form'], $i['btn'], $i['status'], $i['var'], $i['token'], 'name="' . $i['trap'] . '"');
        return $cfg . str_replace($de, $para, $content);
    }

    // Caso 2: pagina de contato sem formulario nenhum. Gera um.
    if (!qmix_fe_eh_pagina_contato() || stripos($content, '<form') !== false) { return $content; }
    if (!apply_filters('qmix_fe_gerar', true)) { return $content; }

    return $content . $cfg . qmix_fe_form_gerado();
}

/** A pagina atual e a de contato? */
function qmix_fe_eh_pagina_contato() {
    if (!is_page()) { return false; }
    $p = get_post();
    if (!$p) { return false; }
    $slugs = array('contato', 'contact', 'fale-conosco', 'faleconosco', 'fale-com-a-gente', 'contatos');
    if (in_array($p->post_name, $slugs, true)) { return true; }
    return (bool) preg_match('/^\s*(contato|fale conosco|fale com|entre em contato)/iu', $p->post_title);
}
add_filter('the_content', 'qmix_fe_conteudo', 5);

/** Recebe o envio na rota propria do site. */
function qmix_fe_receber() {
    $i   = qmix_fe_ids();
    $uri = strtok((string) (isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : ''), '?');
    if (trim($uri, '/') !== $i['rota']) { return; }

    while (ob_get_level()) { ob_end_clean(); }
    nocache_headers();

    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { wp_send_json_error('Método não permitido.'); }

    if (!isset($_POST[$i['token']]) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST[$i['token']])), $i['acao'])) {
        wp_send_json_error('Sessão expirada. Recarregue a página e tente novamente.');
    }
    // Honeypot: robo preenche, humano nao ve.
    if (!empty($_POST[$i['trap']])) { wp_send_json_success($i['ok']); }

    $ip    = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : '0';
    $chave = 'qfe_' . md5($ip);
    if ((int) get_transient($chave) >= 3) {
        wp_send_json_error('Muitas mensagens seguidas. Tente novamente em alguns minutos.');
    }

    $nome  = sanitize_text_field(wp_unslash($_POST['nome'] ?? ''));
    $email = sanitize_email(wp_unslash($_POST['email'] ?? ''));
    $tel   = sanitize_text_field(wp_unslash($_POST['telefone'] ?? ''));
    $msg   = sanitize_textarea_field(wp_unslash($_POST['mensagem'] ?? ''));

    if ($nome === '' || !is_email($email)) { wp_send_json_error('Preencha nome e e-mail corretamente.'); }
    $tam = mb_strlen($msg);
    if ($tam < 20 || $tam > 3000)          { wp_send_json_error('A mensagem deve ter entre 20 e 3000 caracteres.'); }
    if (preg_match_all('#https?://#i', $msg) > 3) { wp_send_json_error('Mensagem com excesso de links.'); }

    $site = get_bloginfo('name');
    $corpo = "Mensagem enviada pelo formulário de contato de $site\n\n"
           . "Nome:     $nome\n"
           . "E-mail:   $email\n"
           . ($tel ? "Telefone: $tel\n" : '')
           . "IP:       $ip\n"
           . "Página:   " . esc_url_raw(wp_get_referer() ?: home_url('/contato/')) . "\n"
           . str_repeat('-', 56) . "\n\n" . $msg . "\n";

    $enviado = wp_mail(
        qmix_fe_destino(),
        sprintf('[%s] Contato de %s', $site, $nome),
        $corpo,
        array('Reply-To: ' . $nome . ' <' . $email . '>', 'Content-Type: text/plain; charset=UTF-8')
    );

    set_transient($chave, (int) get_transient($chave) + 1, 10 * MINUTE_IN_SECONDS);

    if (!$enviado) { wp_send_json_error('Não foi possível enviar agora. Tente novamente em instantes.'); }
    wp_send_json_success($i['ok']);
}
add_action('parse_request', 'qmix_fe_receber', 1);
