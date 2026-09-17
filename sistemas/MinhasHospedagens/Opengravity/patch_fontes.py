# -*- coding: utf-8 -*-
"""Botao de Fonte Preferida do Google no motor, com variantes por portal.

Uso, no servidor:  python3 /tmp/patch_fontes.py [--aplica]

Implementa `D:\\PORTAIS\\fontes-preferidas-portal-engine.md`.

Dois pontos de insercao, e os dois sao **ponto unico** no motor, o que evita
mexer nas 135 arquiteturas das tres maquinas:

  - **fim do corpo da materia, antes dos relacionados**: o bloco entra numa
    COPIA de `art.content`, dentro de `_raw_articleHtml`, que e a unica funcao
    que chama `arch.article` em qualquer das tres maquinas
  - **rodape**: o bloco entra no fim de `H.instLinks()`, que toda arquitetura
    chama no rodape (conferido nas 135)

🔴 **A copia do artigo e obrigatoria.** Escrever no `art.content` original faria
o bloco entrar na descricao, no resumo e na busca, e ele acabaria gravado no
JSON na proxima passada de manutencao.

⚠️ **O dominio sai do `site.baseUrl`**, e nunca do `window.location`: a
documentacao pede a variavel de config quando ela existe, e ela existe.

⚠️ **O CSS sai uma vez por pagina, do rodape.** O botao do artigo aparece antes
dele no DOM, e isso nao e problema: folha de estilo vale para o documento
inteiro, independentemente da posicao.

⚠️ **Nenhuma requisicao nova**: SVG embutido, estilo embutido, sem fonte e sem
biblioteca.

⚠️ A variante sai de hash do dominio, entao o mesmo portal renderiza sempre a
mesma coisa, sem piscar entre paginas, e a rede fica heterogenea. O sufixo de
classe leva o **prefixo do proprio portal**, que ja e unico na maquina: hash de
quatro digitos sozinho poderia colidir.
"""
import io
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/src/render.js'

BLOCO = r'''
// ---------------------------------------------------------------- fonte preferida
// Botao que leva o visitante a marcar o portal como fonte preferida na Pesquisa
// Google. Especificacao em D:\PORTAIS\fontes-preferidas-portal-engine.md.
//
// A variante sai de hash do dominio: o mesmo portal renderiza sempre a mesma
// coisa e a rede fica heterogenea. Sem requisicao nova: SVG e CSS embutidos.
const _FP_TEXTOS = [
  'Nos torne uma fonte preferida no Google',
  'Prefira {ARTIGO} {NOME} no Google',
  'Adicione {ARTIGO} {NOME} como fonte preferida',
  'Quer ver mais publicações nossas? Marque como fonte preferida',
  'Siga {ARTIGO} {NOME} na Pesquisa Google',
  'Marque nosso portal como fonte preferida no Google',
];
const _FP_BASES = ['fp-btn', 'src-google', 'gpref', 'prefer'];
function _fpHash(d) {
  let h = 0;
  for (let i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) >>> 0;
  return h;
}
function _fpDados(site) {
  const dom = String(site.baseUrl || '').replace(/^https?:\/\//, '').replace(/^www\./, '')
    .replace(/\/$/, '') || String(site.domain || '');
  const h = _fpHash(dom);
  const t = site.theme || {};
  const nome = site.shortName || site.name || dom;
  // "o" ou "a" pelo genero que o proprio registro ja declara em nomeArtigo
  const artigo = String(site.nomeArtigo || 'do').trim() === 'da' ? 'a' : 'o';
  const texto = _FP_TEXTOS[h % _FP_TEXTOS.length]
    .replace('{ARTIGO}', artigo).replace('{NOME}', nome);
  const sufixo = (((site.fp || {}).prefix) || 'p') + '-' + (h % 4096).toString(16);
  const cls = _FP_BASES[Math.floor(h / 7) % _FP_BASES.length] + '-' + sufixo;
  const estilo = Math.floor(h / 13) % 4;
  const icone = Math.floor(h / 17) % 3;
  return { dom, nome, texto, cls, estilo, icone, t,
           url: 'https://google.com/preferences/source?q=' + dom };
}
const _FP_G = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">'
  + '<path fill="currentColor" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13'
  + 'c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/></svg>';
const _FP_ESTRELA = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
  + '<path fill="currentColor" d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>';
function _fpBotao(site) {
  const d = _fpDados(site);
  const ic = d.icone === 0 ? _FP_G : (d.icone === 1 ? _FP_ESTRELA : '');
  return '<a class="' + d.cls + '" href="' + esc(d.url) + '" target="_blank" rel="noopener"'
    + ' data-fp="1">' + ic + '<span>' + esc(d.texto) + '</span></a>';
}
// o bloco do fim da materia leva uma linha de contexto; o do rodape vai solto,
// junto dos demais links institucionais
function _fpArtigo(site) {
  const d = _fpDados(site);
  return '<aside class="' + d.cls + '-box">'
    + '<p>Gostou do que leu? Diga ao Google que quer ver mais publicações '
    + esc(String(site.nomeArtigo || 'do')) + ' ' + esc(d.nome) + '.</p>'
    + _fpBotao(site) + '</aside>';
}
function _fpEstilo(site) {
  const d = _fpDados(site);
  const t = d.t || {};
  const pri = t.primary || '#1a73e8';
  const sob = t.onPrimary || '#fff';
  const viva = t.vivid || pri;
  const c = '.' + d.cls;
  let base = c + '{display:inline-flex;align-items:center;gap:8px;font-weight:600;'
    + 'font-size:15px;line-height:1.25;text-decoration:none;'
    + 'transition:background .25s ease,color .25s ease,transform .25s ease,box-shadow .25s ease}'
    + c + ' svg{flex:none}'
    + c + '-box{margin:30px 0 0;padding:18px 20px;border-radius:12px;'
    + 'background:rgba(0,0,0,.035);border:1px solid rgba(0,0,0,.08)}'
    + c + '-box p{margin:0 0 13px;font-size:14.5px;line-height:1.55;text-align:left}';
  if (d.estilo === 0) {
    base += c + '{background:#1a73e8;color:#fff;padding:12px 22px;border-radius:8px}'
      + c + ':hover{background:#188038;color:#fff;transform:translateY(-2px);'
      + 'box-shadow:0 4px 12px rgba(0,0,0,.2)}';
  } else if (d.estilo === 1) {
    base += c + '{background:#fff;color:#1a73e8;border:2px solid #1a73e8;padding:10px 20px;'
      + 'border-radius:8px}'
      + c + ':hover{background:#1a73e8;color:#fff;transform:translateY(-2px);'
      + 'box-shadow:0 4px 12px rgba(0,0,0,.18)}';
  } else if (d.estilo === 2) {
    base += c + '{background:#202124;color:#fff;padding:12px 24px;border-radius:24px}'
      + c + ':hover{background:#1a73e8;color:#fff;transform:translateY(-2px);'
      + 'box-shadow:0 4px 14px rgba(0,0,0,.24)}';
  } else {
    // a cor primaria do proprio tema, com a viva no hover
    base += c + '{background:' + pri + ';color:' + sob + ';padding:12px 22px;border-radius:10px}'
      + c + ':hover{background:' + viva + ';color:' + sob + ';transform:translateY(-2px);'
      + 'box-shadow:0 4px 12px rgba(0,0,0,.2)}';
  }
  // no rodape o botao herda o respiro dos links institucionais
  base += '.' + d.cls + '-fim{display:block;margin-top:12px}';
  return '<style>' + base + '</style>';
}
// o popup e progressivo: com ele bloqueado, o proprio href abre em nova aba
function _fpScript() {
  return '<script>(function(){document.addEventListener("click",function(e){'
    + 'var a=e.target&&e.target.closest?e.target.closest("[data-fp]"):null;if(!a)return;'
    + 'var w=480,h=640,l=(screen.width-w)/2,t=(screen.height-h)/2;'
    + 'var p=window.open(a.href,"gpref","width="+w+",height="+h+",top="+t+",left="+l);'
    + 'if(p){e.preventDefault();try{p.focus();}catch(x){}}},false);})();<\/script>';
}
'''

t = io.open(P, encoding='utf-8').read()
if '_fpBotao' in t:
    print('  o motor ja tem o bloco de fonte preferida')
    raise SystemExit()

# 1. o bloco de funcoes entra antes do objeto H
anc = 'const H = {'
if anc not in t:
    print('  🔴 nao achei o objeto H')
    raise SystemExit(1)
t2 = t.replace(anc, BLOCO.strip('\n') + '\n\n' + anc, 1)

# 2. o rodape: o botao e o estilo saem no fim de instLinks
velho_inst = None
for l in t2.split('\n'):
    if l.strip().startswith('instLinks:'):
        velho_inst = l
        break
if not velho_inst:
    print('  🔴 nao achei o instLinks')
    raise SystemExit(1)
novo_inst = (velho_inst.rstrip().rstrip(',')
             + " + `<span class=\"${_fpDados(_SITE_ATUAL||{}).cls}-fim\">` + _fpBotao(_SITE_ATUAL||{}) "
               "+ '</span>' + _fpEstilo(_SITE_ATUAL||{}) + _fpScript(),")
t2 = t2.replace(velho_inst, novo_inst, 1)

# o instLinks nao recebe o site: o motor guarda o registro atual em buildCtx
t2 = t2.replace('function buildCtx(site) {\n  _FLAT = !!site.flatUrl;',
                'function buildCtx(site) {\n  _FLAT = !!site.flatUrl;\n  _SITE_ATUAL = site;', 1)
if '_SITE_ATUAL = site;' not in t2:
    print('  🔴 nao consegui guardar o site atual no buildCtx')
    raise SystemExit(1)
t2 = t2.replace('const H = {', 'let _SITE_ATUAL = null;\nconst H = {', 1)

# 3. o artigo: o bloco entra numa COPIA do conteudo, no unico ponto que chama
#    arch.article em qualquer das tres maquinas
velho_art = None
for l in t2.split('\n'):
    if 'function _raw_articleHtml' in l:
        velho_art = l
        break
if not velho_art:
    print('  🔴 nao achei o _raw_articleHtml')
    raise SystemExit(1)
novo_art = ('function _raw_articleHtml(site, art, menu, related) {\n'
            '  const ctx = buildCtx(site);\n'
            '  // 🔴 COPIA: escrever no art.content original poria o bloco na descricao,\n'
            '  //    no resumo e na busca, e ele acabaria gravado no JSON\n'
            '  const _a = Object.assign({}, art, { content: (art.content || "") + _fpArtigo(site) });\n'
            '  return getArch(ctx.fp.arch).article(ctx, _a, menu, related, buildP(ctx, art));\n'
            '}')
t2 = t2.replace(velho_art, novo_art, 1)

print('  bloco de funcoes inserido antes do H')
print('  instLinks passa a emitir botao, estilo e script')
print('  _raw_articleHtml passa a acrescentar o bloco numa copia do conteudo')
if APLICA:
    shutil.copyfile(P, P + '.bak-fontes-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(P, 'w', encoding='utf-8', newline='\n').write(t2)
    print('  gravado')
else:
    io.open('/tmp/render-fontes-preview.js', 'w', encoding='utf-8', newline='\n').write(t2)
    print('  ensaio. previa em /tmp/render-fontes-preview.js')
