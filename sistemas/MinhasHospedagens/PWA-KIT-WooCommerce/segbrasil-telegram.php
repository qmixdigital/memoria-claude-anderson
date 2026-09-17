<?php
/**
 * Plugin Name: Seguidores Brasil - Notificacoes Telegram
 * Description: Envia eventos do site (vendas, pagamento, cadastros, app instalado, status de pedido) para o bot do Telegram @Seguidores_brasil_bot.
 * Author: QMIX
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) { exit; }

if (!defined('SB_TG_TOKEN')) { define('SB_TG_TOKEN', '<<REMOVIDO>>'); }

/** chat_id destino (setar via: wp option update sb_tg_chat_id <id>) */
function sb_tg_chat_id() { return trim((string) get_option('sb_tg_chat_id', '')); }

/** Liga/desliga tipos de evento (option sb_tg_events, default tudo ligado) */
function sb_tg_enabled($event) {
    $opt = get_option('sb_tg_events', array());
    if (!is_array($opt)) { $opt = array(); }
    return !isset($opt[$event]) || $opt[$event] !== 'off';
}

/** Envia mensagem (nao-bloqueante, nao atrasa o site) */
function sb_tg_send($text) {
    $chat = sb_tg_chat_id();
    if (!$chat) { return false; }
    wp_remote_post('https://api.telegram.org/bot' . SB_TG_TOKEN . '/sendMessage', array(
        'timeout'  => 8,
        'blocking' => false,
        'body'     => array(
            'chat_id'                  => $chat,
            'text'                     => $text,
            'parse_mode'               => 'HTML',
            'disable_web_page_preview' => true,
        ),
    ));
    return true;
}

function sb_tg_money($v) { return 'R$ ' . number_format((float) $v, 2, ',', '.'); }
function sb_tg_esc($s) { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); }

/** Resumo dos itens de um pedido */
function sb_tg_order_items($order) {
    $lines = array();
    foreach ($order->get_items() as $item) {
        $qty = $item->get_quantity();
        $lines[] = '• ' . sb_tg_esc($item->get_name()) . ($qty > 1 ? ' (x' . $qty . ')' : '');
    }
    return implode("\n", array_slice($lines, 0, 8));
}

function sb_tg_customer($order) {
    $name = trim($order->get_formatted_billing_full_name());
    $email = $order->get_billing_email();
    $bits = array();
    if ($name) { $bits[] = sb_tg_esc($name); }
    if ($email) { $bits[] = sb_tg_esc($email); }
    return $bits ? implode(' · ', $bits) : 'Visitante';
}

/* ============================================================
 * VENDA (pagamento confirmado: pending/on-hold -> processing)
 * ============================================================ */
add_action('woocommerce_order_status_processing', 'sb_tg_on_paid', 20, 2);
add_action('woocommerce_payment_complete', 'sb_tg_on_paid', 20, 1);
function sb_tg_on_paid($order_id, $order = null) {
    if (!sb_tg_enabled('sale')) { return; }
    $order = $order instanceof WC_Order ? $order : wc_get_order($order_id);
    if (!$order) { return; }
    if ($order->get_meta('_sb_tg_paid')) { return; } // dedup
    $order->update_meta_data('_sb_tg_paid', 1);
    $order->save();

    $app = $order->get_meta('_Mercado_Pago_Payment_IDs'); // so pra info
    $via_app = ($order->get_coupon_codes() && in_array('app10', array_map('strtolower', $order->get_coupon_codes()), true));

    $msg  = "💰 <b>Nova venda!</b>\n";
    $msg .= sb_tg_order_items($order) . "\n\n";
    $msg .= "💵 <b>" . sb_tg_money($order->get_total()) . "</b>\n";
    $msg .= "💳 " . sb_tg_esc($order->get_payment_method_title() ?: $order->get_payment_method()) . "\n";
    $msg .= "👤 " . sb_tg_customer($order) . "\n";
    if ($via_app) { $msg .= "📲 <b>Compra pelo app (10% off)</b>\n"; }
    $msg .= "🧾 Pedido #" . $order->get_id();
    sb_tg_send($msg);
}

/* ============================================================
 * PEDIDO CONCLUIDO
 * ============================================================ */
add_action('woocommerce_order_status_completed', function ($order_id, $order = null) {
    if (!sb_tg_enabled('completed')) { return; }
    $order = $order instanceof WC_Order ? $order : wc_get_order($order_id);
    if (!$order) { return; }
    if ($order->get_meta('_sb_tg_done')) { return; }
    $order->update_meta_data('_sb_tg_done', 1);
    $order->save();
    sb_tg_send("✅ <b>Pedido concluído</b>\n🧾 #" . $order->get_id() . " · " . sb_tg_money($order->get_total()));
}, 20, 2);

/* ============================================================
 * CANCELADO / REEMBOLSADO
 * ============================================================ */
add_action('woocommerce_order_status_cancelled', function ($order_id, $order = null) {
    if (!sb_tg_enabled('cancelled')) { return; }
    $order = $order instanceof WC_Order ? $order : wc_get_order($order_id);
    if (!$order) { return; }
    sb_tg_send("❌ <b>Pedido cancelado</b>\n🧾 #" . $order->get_id() . " · " . sb_tg_money($order->get_total()));
}, 20, 2);

add_action('woocommerce_order_status_refunded', function ($order_id, $order = null) {
    if (!sb_tg_enabled('refunded')) { return; }
    $order = $order instanceof WC_Order ? $order : wc_get_order($order_id);
    if (!$order) { return; }
    sb_tg_send("↩️ <b>Pedido reembolsado</b>\n🧾 #" . $order->get_id() . " · " . sb_tg_money($order->get_total()));
}, 20, 2);

/* ============================================================
 * NOVO CADASTRO
 * ============================================================ */
add_action('user_register', function ($user_id) {
    if (!sb_tg_enabled('signup')) { return; }
    $u = get_userdata($user_id);
    if (!$u) { return; }
    sb_tg_send("👤 <b>Novo cadastro</b>\n📧 " . sb_tg_esc($u->user_email) . "\n🕐 " . date_i18n('d/m/Y H:i'));
}, 20, 1);

/* ============================================================
 * APP INSTALADO (chamado pelo JS via admin-ajax quando o PWA e instalado)
 * ============================================================ */
add_action('wp_ajax_nopriv_sb_app_installed', 'sb_tg_app_installed');
add_action('wp_ajax_sb_app_installed', 'sb_tg_app_installed');
function sb_tg_app_installed() {
    // anti-flood simples: no maximo 1 aviso a cada 20s por IP
    $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'x';
    $k = 'sb_tg_appinst_' . md5($ip);
    if (get_transient($k)) { wp_send_json_success(); }
    set_transient($k, 1, 20);
    if (sb_tg_enabled('install')) {
        sb_tg_send("📲 <b>Alguém instalou o app!</b>\n🎉 Novo usuário do aplicativo (10% de desconto ativado)");
    }
    wp_send_json_success();
}

/* ============================================================
 * Helper: comando /status simples (opcional) - envia teste
 * wp eval "sb_tg_send('✅ Teste do bot Seguidores Brasil');"
 * ============================================================ */
