# -*- coding: utf-8 -*-
"""Mostra a variante que cada portal vai receber, antes de reconstruir.

Criterio de aceite 4 da documentacao: nenhuma dupla de portais auditados com o
HTML do bloco identico. Aqui isso e conferido ANTES do build, comparando a
assinatura (texto + estilo + icone + classe) de todos os portais da maquina.
"""
import collections
import io
import json
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
TEXTOS = ['Nos torne uma fonte preferida no Google',
          'Prefira {A} {N} no Google',
          'Adicione {A} {N} como fonte preferida',
          'Quer ver mais publicações nossas? Marque como fonte preferida',
          'Siga {A} {N} na Pesquisa Google',
          'Marque nosso portal como fonte preferida no Google']
BASES = ['fp-btn', 'src-google', 'gpref', 'prefer']
ESTILO = ['azul sólido', 'contorno azul', 'pílula escura', 'cor do tema']
ICONE = ['G do Google', 'estrela', 'sem ícone']


def h(d):
    x = 0
    for ch in d:
        x = (x * 31 + ord(ch)) & 0xFFFFFFFF
    return x


cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
linhas = []
assinaturas = collections.Counter()
classes = collections.Counter()
for s in cfg['sites']:
    dom = (s.get('baseUrl') or '').replace('https://', '').replace('http://', '') \
        .replace('www.', '').rstrip('/') or s.get('domain') or ''
    if not dom or dom.endswith('.local'):
        continue
    x = h(dom)
    art = 'a' if str(s.get('nomeArtigo', 'do')).strip() == 'da' else 'o'
    nome = s.get('shortName') or s.get('name') or dom
    txt = TEXTOS[x % 6].replace('{A}', art).replace('{N}', nome)
    suf = ((s.get('fp') or {}).get('prefix') or 'p') + '-' + format(x % 4096, 'x')
    cls = BASES[(x // 7) % 4] + '-' + suf
    est = (x // 13) % 4
    ico = (x // 17) % 3
    linhas.append((s['slug'], dom, txt, cls, ESTILO[est], ICONE[ico]))
    assinaturas[(TEXTOS[x % 6], est, ico)] += 1
    classes[cls] += 1

for l in sorted(linhas):
    print('  %-22s %-28s %-11s %-11s %s' % (l[0], l[1], l[4], l[5], l[2][:44]))
print('  ---')
print('  portais: %d | classes distintas: %d | classe repetida: %d'
      % (len(linhas), len(classes), sum(1 for v in classes.values() if v > 1)))
print('  combinacoes texto+estilo+icone em uso: %d de 72 possiveis' % len(assinaturas))
print('  a combinacao mais repetida aparece em %d portais' % max(assinaturas.values()))
