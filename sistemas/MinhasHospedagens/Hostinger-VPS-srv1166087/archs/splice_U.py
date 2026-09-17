# -*- coding: utf-8 -*-
"""Troca as funcoes da arquitetura W no archs.js do servidor.

Faz backup datado antes. So a W e tocada: as funcoes sao localizadas pelo nome
e substituidas uma a uma, o que evita o erro ja conhecido de cortar ate o
'const ARCHS' e levar a arquitetura vizinha junto.
"""
import io, os, shutil, time

P = '/opt/portal-engine/src/archs.js'
NOVO = '/tmp/U_novo.js'

bak = P + '.bak-Uredesign-' + time.strftime('%Y%m%d-%H%M%S')
shutil.copyfile(P, bak)
print('backup:', bak)

t = io.open(P, encoding='utf-8').read()
novo = io.open(NOVO, encoding='utf-8').read()


def bloco(txt, nome):
    # o fim de uma funcao e o proximo bloco de topo: outra funcao, um
    # comentario de arquitetura ou uma const. wList e a ultima da W e vem
    # seguida do comentario da arquitetura X, entao so 'function ' nao serve.
    i = txt.index('function %s(' % nome)
    cands = [txt.find(chr(10) + m, i + 1) for m in ('function ', '/*', 'const ', 'module.exports')]
    cands = [x for x in cands if x > 0]
    j = min(cands) if cands else len(txt) - 1
    return i, j + 1


novas = {}
for nome in ('uCss', 'uCard', 'uIt', 'uSech', 'uHeader', 'uFooter', 'uHome', 'uArticle', 'uList'):
    i, j = bloco(novo, nome)
    novas[nome] = novo[i:j]

antes = len(t)

# idempotente: se a funcao ja existe, troca; se nao existe, entra depois da wFila.
# sem isso, rodar duas vezes deixava wCard e wSech duplicadas no arquivo.
existentes, faltando = [], []
for nome in ('uCss', 'uCard', 'uIt', 'uSech', 'uHeader', 'uFooter', 'uHome', 'uArticle', 'uList'):
    while t.count('function %s(' % nome) > 1:
        i, j = bloco(t, nome)
        t = t[:i] + t[j:]
        print('removida copia duplicada de', nome)
    if 'function %s(' % nome in t:
        existentes.append(nome)
    else:
        faltando.append(nome)

alvos = []
for nome in existentes:
    i, j = bloco(t, nome)
    alvos.append((i, j, nome))
alvos.sort(reverse=True)
for i, j, nome in alvos:
    t = t[:i] + novas[nome] + t[j:]

if faltando:
    i, j = bloco(t, 'uCss')
    t = t[:j] + ''.join(novas[n] for n in faltando) + t[j:]
    print('inseridas:', faltando)

io.open(P, 'w', encoding='utf-8').write(t)
print('antes %d, depois %d' % (antes, len(t)))
