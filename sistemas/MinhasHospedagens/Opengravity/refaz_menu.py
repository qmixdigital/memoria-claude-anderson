# -*- coding: utf-8 -*-
"""Reescreve o `_menuSanfona` inteiro, cobrindo os dois arranjos de cabecalho.

Uso, no servidor:  python3 /tmp/refaz_menu.py [--aplica]

Dois arranjos aparecem nas 135 arquiteturas, e eles pedem tratamento diferente:

  - **A, a nav DENTRO do `<header>`**: o botao entra logo antes dela. E o caso do
    barranews e do medicodasmaos
  - **B, a nav numa FAIXA PROPRIA, depois do `</header>`**: e o caso do
    agoranoticias. Ali o botao nao pode ficar solto entre as duas: ele vai para
    dentro do cabecalho, como ultimo filho da linha da marca

🔴 **A regra de linha nao pode cair no `<body>`.** No arranjo B a nav e filha
direta do corpo da pagina: um `:has(> #nav)` transformaria o `<body>` inteiro em
`display:flex;flex-direction:row` e desmontaria a pagina. A regra passa a mirar o
**pai do botao**, que em qualquer dos dois arranjos e um contentor de cabecalho,
e ainda leva `:not(body):not(html)` como cinto de seguranca.

⚠️ A regra de linha existe porque varias arquiteturas empilham o cabecalho no
celular (`flex-direction:column`), e o botao caia numa linha propria, embaixo da
marca. Seletor com classe do botao mais `:has` tem especificidade suficiente, e o
`!important` fecha o caso onde a arquitetura usa media query mais especifica.
"""
import io
import re
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/src/render.js'
t = io.open(P, encoding='utf-8').read()

NOVA = r'''function _menuSanfona(site, html) {
  // a barra de editorias nem sempre esta dentro do <header>: a busca vai ate o <main>
  const iMain = html.indexOf('<main');
  const iCab = html.indexOf('</header>');
  const fimBusca = iMain > 0 ? iMain : iCab;
  if (fimBusca < 0) return html;
  const cab = html.slice(0, fimBusca);
  // arquitetura que ja resolveu o menu fica como esta, nos tres padroes:
  // botao com aria-expanded, truque de checkbox sem JS, ou injecao anterior
  if (/aria-expanded/.test(cab)) return html;
  if (/<input[^>]+type="checkbox"/i.test(cab) && /<label/i.test(cab)) return html;
  if (/data-mh=/.test(cab)) return html;
  // a nav das editorias: preferir a que se identifica, senao a primeira
  let m = /<nav\b[^>]*aria-label="Editorias"[^>]*>/i.exec(cab);
  if (!m) m = /<nav\b[^>]*>/i.exec(cab);
  if (!m) return html;
  const d = _mhDados(site);
  // 🔴 saber ONDE o botao vai antes de montar o CSS: com a nav em faixa propria
  // o botao entra no cabecalho, e ali a linha nao pode quebrar, senao ele cai
  // embaixo da marca. Com a nav ao lado, a linha PRECISA quebrar, para a nav
  // aberta descer inteira
  const dentro = iCab > 0 && m.index < iCab;
  const quebra = dentro ? 'wrap' : 'nowrap';
  const tagNav = m[0];
  const novaNav = tagNav.replace(/^<nav\b/i, '<nav id="' + d.id + '" data-aberto="0"');
  const botao = '<button type="button" class="' + d.id + '-b" data-mh="' + d.id + '"'
    + ' aria-expanded="false" aria-controls="' + d.id + '"'
    + ' aria-label="' + esc(d.abrir) + '"><i></i></button>';
  const est = '<style>'
    + '.' + d.id + '-b{display:none;width:46px;height:46px;flex:none;padding:0;'
    + 'position:relative;background:none;border:2px solid currentColor;color:inherit;'
    + 'cursor:pointer;border-radius:' + d.raio + ';margin-left:auto}'
    + '.' + d.id + '-b i,.' + d.id + '-b i::before,.' + d.id + '-b i::after{position:absolute;'
    + 'left:11px;width:20px;height:2px;background:currentColor;content:"";border-radius:2px}'
    + '.' + d.id + '-b i{top:21px}'
    + '.' + d.id + '-b i::before{top:-6px;left:0}'
    + '.' + d.id + '-b i::after{top:6px;left:0}'
    + '@media(max-width:1100px){'
    // 🔴 a regra mira o PAI DO BOTAO, e nunca o pai da nav: no arranjo em que a
    // nav e filha direta do corpo, mirar nela poria display:flex no <body>
    + ':not(body):not(html):has(> .' + d.id + '-b){display:flex !important;'
    + 'flex-direction:row !important;align-items:center !important;'
    + 'flex-wrap:' + quebra + ' !important;gap:12px}'
    + '.' + d.id + '-b{display:block}'
    + '#' + d.id + '{display:none;flex-basis:100%;width:100%;'
    + 'flex-direction:column;align-items:flex-start;gap:0;margin-top:12px;'
    + 'border-top:1px solid currentColor;overflow:visible;max-height:none}'
    + '#' + d.id + '[data-aberto="1"]{display:flex}'
    + '#' + d.id + ' a{display:block;width:100%;padding:13px 0;'
    + 'border-bottom:1px solid rgba(128,128,128,.32);white-space:normal}'
    + '}</style>';
  const js = '<script>(function(){var b=document.querySelector(\'[data-mh="' + d.id + '"]\');'
    + 'var n=document.getElementById("' + d.id + '");if(!b||!n)return;'
    + 'b.addEventListener("click",function(){var a=b.getAttribute("aria-expanded")==="true";'
    + 'b.setAttribute("aria-expanded",a?"false":"true");n.setAttribute("data-aberto",a?"0":"1");'
    + 'b.setAttribute("aria-label",a?' + JSON.stringify(d.abrir) + ':'
    + JSON.stringify(d.fechar) + ');});})();<\/script>';
  const html2 = html.slice(0, m.index) + novaNav
    + html.slice(m.index + tagNav.length, fimBusca) + est + js + html.slice(fimBusca);
  // onde entra o botao: com a nav dentro do cabecalho, logo antes dela; com a
  // nav em faixa propria, como ultimo filho da linha da marca, dentro do header
  if (dentro) {
    return html2.slice(0, m.index) + botao + html2.slice(m.index);
  }
  const fecha = html2.indexOf('</header>');
  if (fecha < 0) return html2.slice(0, m.index) + botao + html2.slice(m.index);
  const ultimoDiv = html2.lastIndexOf('</div>', fecha);
  const onde = ultimoDiv > 0 ? ultimoDiv : fecha;
  return html2.slice(0, onde) + botao + html2.slice(onde);
}'''

i = t.find('function _menuSanfona(site, html) {')
if i < 0:
    print('  🔴 nao achei a funcao')
    raise SystemExit(1)
j = t.find('\n}', i)
if j < 0:
    print('  🔴 nao achei o fim da funcao')
    raise SystemExit(1)
antigo = t[i:j + 2]
t2 = t[:i] + NOVA + t[j + 2:]
print('  _menuSanfona reescrita: %d -> %d bytes' % (len(antigo), len(NOVA)))
if APLICA:
    shutil.copyfile(P, P + '.bak-menu2-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(P, 'w', encoding='utf-8', newline='\n').write(t2)
    print('  gravado')
else:
    io.open('/tmp/render-menu2-preview.js', 'w', encoding='utf-8', newline='\n').write(t2)
    print('  ensaio. previa em /tmp/render-menu2-preview.js')
