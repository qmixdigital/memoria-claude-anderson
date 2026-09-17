# -*- coding: utf-8 -*-
"""Poe a meta description das paginas institucionais dentro da regua.

654 paginas das tres maquinas estavam **abaixo de 100 caracteres**: quem somos,
contato, equipe, termos, politica e as paginas de autor. Elas nascem de moldes
curtos do proprio motor ("Conheca o X.", 20 caracteres) ou do `lead` do autor.

⚠️ Nao adianta alongar o molde: molde igual em 81 portais e assinatura de rede.
O que completa a frase e o **`metaDescription` do proprio site**, que ja e
escrito um a um, cortado em fronteira de frase.

Regra aplicada em `staticPages`, que e por onde passam TODAS as institucionais,
inclusive as `extraPages` de equipe, politica editorial e autor:

  - abaixo de 100: completa com a descricao do site ate caber em 170
  - acima de 175: corta na ultima fronteira de frase antes de 170

⚠️ Nao mexe em artigo nem em listagem de editoria: aqueles vem do `catDesc` e do
corpo, e ja passaram por regua propria.
"""
import io
import re
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv
P = '/opt/portal-engine/src/render.js'
s = io.open(P, encoding='utf-8').read()

if '_descNaRegua' in s:
    print('  ja aplicado')
    raise SystemExit()

FUNC = """// A meta description das paginas institucionais dentro da regua de 100 a 175.
// ⚠️ O complemento sai do `metaDescription` do PROPRIO site: molde igual em
// dezenas de portais e assinatura de rede.
function _descNaRegua(site, d) {
  const limpa = x => String(x || '').replace(/\\s+/g, ' ').trim();
  let t = limpa(d);
  if (t.length >= 100 && t.length <= 175) return t;
  if (t.length > 175) {
    const corte = t.slice(0, 172);
    const p = Math.max(corte.lastIndexOf('. '), corte.lastIndexOf('; '));
    return p > 100 ? corte.slice(0, p + 1) : corte.replace(/\\s+\\S*$/, '');
  }
  const extra = limpa(site.metaDescription || site.description || '');
  if (!extra) return t;
  let junto = t ? (t.replace(/[.\\s]+$/, '') + '. ' + extra) : extra;
  if (junto.length > 175) {
    const corte = junto.slice(0, 172);
    const p = corte.lastIndexOf('. ');
    junto = p > 100 ? corte.slice(0, p + 1) : corte.replace(/\\s+\\S*$/, '');
  }
  return junto;
}

"""

i = s.index('function staticPages(site) {')
s = s[:i] + FUNC + s[i:]

# a lista sai por um `return [` dentro de staticPages: envolve o resultado
i = s.index('function staticPages(site) {')
j = s.index('  return [', i)
k = s.index('\n}', j)
corpo = s[j:k]
novo = corpo.replace('  return [', '  const _lista = [', 1)
novo = novo + ("\n  ];\n"
               "  return _lista.map(x => Object.assign({}, x, "
               "{ desc: _descNaRegua(site, x.desc) }));")
# o `];` original vira parte do bloco novo
fim = novo.rfind('\n  ];\n  return _lista.map')
antes_fecha = novo[:fim].rstrip()
if antes_fecha.endswith('];'):
    antes_fecha = antes_fecha[:-2].rstrip()
novo = antes_fecha + novo[fim:]
s = s[:j] + novo + s[k:]

io.open('/tmp/render-novo.js', 'w', encoding='utf-8', newline='\n').write(s)
print('  render.js novo escrito em /tmp/render-novo.js')

if not APLICA:
    print('  ensaio. rode com --aplica.')
    raise SystemExit()

shutil.copyfile(P, P + '.bak-desc-' + time.strftime('%Y%m%d-%H%M%S'))
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('  gravado. conferir com node antes de reiniciar.')
