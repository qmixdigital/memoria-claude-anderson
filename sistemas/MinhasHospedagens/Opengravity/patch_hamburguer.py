# -*- coding: utf-8 -*-
"""Menu sanfonado universal, para a arquitetura que nao tem um.

Uso, no servidor:  python3 /tmp/patch_hamburguer.py [--aplica]

🔴 **68 dos 101 portais estao sem botao de menu.** A skill trata isso como
obrigatorio, e a razao aparece na captura de celular: as editorias quebram em
duas ou tres linhas e empurram a materia de abertura para baixo da dobra. No
barranews, com nove editorias, sao duas linhas so de menu antes de qualquer
conteudo.

Editar 68 arquiteturas seria caro e fragil. O conserto entra no **funil unico**
`_renomClasses`, por onde toda pagina passa, e vale para qualquer arquitetura:

  1. se o `<header>` ja tem `aria-expanded`, nao faz nada. Arquitetura que ja
     resolveu isso sozinha continua como esta
  2. acha a primeira `<nav>` do cabecalho, da a ela um `id` e `data-aberto="0"`
  3. insere um `<button>` de 46px logo antes dela
  4. acrescenta estilo e script

⚠️ **O estilo e escopado pelo `id` da nav.** Seletor de id ganha de qualquer
seletor de classe da arquitetura, entao o `display:none` abaixo de 1100px vale
sem precisar conhecer o nome da classe de cada uma das 135.

⚠️ **A cor sai de `currentColor`**, e nao de token do tema: o botao herda a cor
do texto do proprio cabecalho e fica legivel em qualquer paleta, clara ou escura.

⚠️ **O `id` e o rotulo variam por portal**, por hash do dominio, pela mesma
razao de sempre: marcacao identica em 68 portais e impressao digital de rede.
"""
import io
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/src/render.js'

BLOCO = r'''
// ---------------------------------------------------------------- menu sanfonado
// 🔴 68 dos 101 portais usam arquitetura sem botao de menu, e no celular as
// editorias quebram em duas ou tres linhas antes de qualquer conteudo. Editar
// as 135 arquiteturas seria caro e fragil: o botao entra aqui, no funil unico,
// e so quando a arquitetura ainda nao tem um.
const _MH_ROTULOS = ['Editorias', 'Seções', 'Menu', 'Navegação'];
function _mhDados(site) {
  const dom = String(site.baseUrl || site.domain || '').replace(/^https?:\/\//, '')
    .replace(/^www\./, '').replace(/\/$/, '');
  let h = 0;
  for (let i = 0; i < dom.length; i++) h = (h * 31 + dom.charCodeAt(i)) >>> 0;
  const pre = ((site.fp || {}).prefix) || 'p';
  return { id: pre + 'mn' + (h % 4096).toString(16),
           rot: _MH_ROTULOS[h % _MH_ROTULOS.length],
           raio: (h % 3) === 0 ? '999px' : ((h % 3) === 1 ? '8px' : '2px') };
}
function _menuSanfona(site, html) {
  const fimCab = html.indexOf('</header>');
  if (fimCab < 0) return html;
  const cab = html.slice(0, fimCab);
  // arquitetura que ja tem botao de menu fica como esta
  if (/aria-expanded/.test(cab)) return html;
  // a nav das editorias: preferir a que se identifica, senao a primeira
  let m = /<nav\b[^>]*aria-label="Editorias"[^>]*>/i.exec(cab);
  if (!m) m = /<nav\b[^>]*>/i.exec(cab);
  if (!m) return html;
  const d = _mhDados(site);
  const tagNav = m[0];
  const novaNav = tagNav.replace(/^<nav\b/i,
    '<nav id="' + d.id + '" data-aberto="0"');
  const botao = '<button type="button" class="' + d.id + '-b" data-mh="' + d.id + '"'
    + ' aria-expanded="false" aria-controls="' + d.id + '"'
    + ' aria-label="Abrir o menu de ' + esc(d.rot.toLowerCase()) + '"><i></i></button>';
  const est = '<style>'
    // ⚠️ seletor de id ganha de qualquer classe da arquitetura, entao nao e
    // preciso conhecer o nome da classe de cada uma das 135
    + '.' + d.id + '-b{display:none;width:46px;height:46px;flex:none;padding:0;'
    + 'position:relative;background:none;border:2px solid currentColor;color:inherit;'
    + 'cursor:pointer;border-radius:' + d.raio + ';order:2;margin-left:auto}'
    + '.' + d.id + '-b i,.' + d.id + '-b i::before,.' + d.id + '-b i::after{position:absolute;'
    + 'left:11px;width:20px;height:2px;background:currentColor;content:"";border-radius:2px}'
    + '.' + d.id + '-b i{top:21px}'
    + '.' + d.id + '-b i::before{top:-6px;left:0}'
    + '.' + d.id + '-b i::after{top:6px;left:0}'
    + '@media(max-width:1100px){'
    + '.' + d.id + '-b{display:block}'
    + '#' + d.id + '{display:none;order:9;flex-basis:100%;width:100%;'
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
    + 'b.setAttribute("aria-label",(a?"Abrir":"Fechar")+" o menu de '
    + esc(d.rot.toLowerCase()) + '");});})();<\/script>';
  return html.slice(0, m.index) + botao + novaNav
    + html.slice(m.index + tagNav.length, fimCab) + est + js + html.slice(fimCab);
}
'''

t = io.open(P, encoding='utf-8').read()
if '_menuSanfona' in t:
    print('  o motor ja tem o menu sanfonado universal')
    raise SystemExit()

anc = 'const H = {'
if anc not in t:
    print('  🔴 nao achei o objeto H')
    raise SystemExit(1)
t = t.replace(anc, BLOCO.strip('\n') + '\n\n' + anc, 1)

# entra no funil unico, depois da renomeacao de classes e antes do _lcpEager
alvo = '  return _lcpEager(out);'
if alvo not in t:
    print('  🔴 nao achei o fim do _renomClasses')
    raise SystemExit(1)
t = t.replace(alvo, '  out = _menuSanfona(site, out);\n' + alvo, 1)

print('  _menuSanfona inserido e ligado no funil unico')
if APLICA:
    shutil.copyfile(P, P + '.bak-menu-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(P, 'w', encoding='utf-8', newline='\n').write(t)
    print('  gravado')
else:
    io.open('/tmp/render-menu-preview.js', 'w', encoding='utf-8', newline='\n').write(t)
    print('  ensaio. previa em /tmp/render-menu-preview.js')
