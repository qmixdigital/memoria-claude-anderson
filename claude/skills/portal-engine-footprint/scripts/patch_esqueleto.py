# -*- coding: utf-8 -*-
# Roda NA VPS: as paginas do motor (institucional, autor, mapa, busca) passam a usar
# V.esqueleto, e o bloco "Ultimas de" da pagina de autor passa a usar V.ultimasDe.
import io, re, sys, shutil, time
P = '/opt/portal-engine/src/render.js'
s = io.open(P, encoding='utf-8').read()
if 'V.esqueleto(' in s:
    print('ja aplicado'); sys.exit(0)
n = 0
# 1) pagina institucional / autor: avatar + h1 + upd + content
rx1 = re.compile(r'<main><article class="page">\n(\$\{(?:\(_eq|_temAv)[^\n]*\})\n<h1>\$\{esc\(page\.title\)\}</h1>\n<p class="upd">Última atualização: \$\{esc\(page\.updated\)\}</p>\n\$\{page\.content\}\n</article></main>')
def r1(m):
    return "${V.esqueleto(site, { avatar: " + m.group(1)[2:-1] + ", h1: `<h1>${esc(page.title)}</h1>`, updated: esc(page.updated), content: page.content })}"
s, k = rx1.subn(r1, s); n += k; print('institucional/autor:', k)
# 2) mapa do site: h1 + body
rx2 = re.compile(r'<main><article class="page">\n<h1>\$\{esc\(sm\.title\)\}</h1>\n\$\{body\}\n</article></main>')
s, k = rx2.subn(lambda m: "${V.esqueleto(site, { semTopo: true, h1: `<h1>${esc(sm.title)}</h1>`, content: body })}", s); n += k; print('mapa:', k)
# 3) busca: so body
rx3 = re.compile(r'<main><article class="page">\n\$\{body\}\n</article></main>')
s, k = rx3.subn(lambda m: "${V.esqueleto(site, { semTopo: true, content: body })}", s); n += k; print('busca:', k)
# 4) "Ultimas de" (duas formas)
a = "pg.content = (pg.content || '') + '<h2>Últimas de ' + esc(eq.nome.split(' ')[0]) + '</h2><ul>' + itens + '</ul>';"
b = "pg.content += `<h2>Últimas de ${esc(nome.split(' ')[0])}</h2><ul class=\"autor-posts\">${itens}</ul>`;"
if a in s: s = s.replace(a, "pg.content = (pg.content || '') + V.ultimasDe(site, esc(eq.nome.split(' ')[0]), itens, '');"); print('ultimas: forma a')
elif b in s: s = s.replace(b, "pg.content += V.ultimasDe(site, esc(nome.split(' ')[0]), itens, 'autor-posts');"); print('ultimas: forma b')
else: print('FALHOU: ultimas de'); sys.exit(1)
if n < 2: print('FALHOU: esqueletos trocados =', n); sys.exit(1)
shutil.copy(P, P + '.bak-esqueleto-' + time.strftime('%Y%m%d%H%M'))
io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('gravado')
