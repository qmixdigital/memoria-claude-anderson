'use strict';
// Alerta por Telegram para o motor (bot em /opt/portal-engine/telegram.json:
// { "token": "...", "chat": <<REMOVIDO>> }). Nunca lanca excecao: alerta que
// falha nao pode derrubar publicacao. Junta mensagens iguais em 10 min.
const fs = require('fs'), https = require('https'), os = require('os');
let _cfg = null, _lidoEm = 0;
const _ultimos = new Map();
function cfg() {
  if (Date.now() - _lidoEm > 60000) {
    try { _cfg = JSON.parse(fs.readFileSync('/opt/portal-engine/telegram.json', 'utf8')); } catch (e) { _cfg = null; }
    _lidoEm = Date.now();
  }
  return _cfg;
}
function alerta(texto) {
  try {
    const c = cfg();
    if (!c || !c.token || !c.chat) return;
    const chave = texto.slice(0, 80);
    const agora = Date.now();
    if (_ultimos.get(chave) && agora - _ultimos.get(chave) < 600000) return;
    _ultimos.set(chave, agora);
    const corpo = JSON.stringify({ chat_id: c.chat, text: '[' + os.hostname().split('.')[0] + '] ' + texto.slice(0, 3500), disable_web_page_preview: true });
    const req = https.request({ hostname: 'api.telegram.org', path: '/bot' + c.token + '/sendMessage', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(corpo) }, timeout: 8000 }, r => r.resume());
    req.on('error', () => {}); req.on('timeout', () => req.destroy());
    req.end(corpo);
  } catch (e) {}
}
module.exports = { alerta };
