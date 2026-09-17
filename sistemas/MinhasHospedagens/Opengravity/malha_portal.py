# -*- coding: utf-8 -*-
"""Constroi a malha interna de um portal do zero. Recebe o slug por argumento.

Usado aqui para repor os links internos de `noticias9` e `noticiasdasemana`,
que perderam o bloco "Na agenda da semana" na limpeza do cabecalho duplicado.
O bloco novo e melhor que o antigo: ancora com o titulo correto (o antigo saia
com "tCU envia...", inicial trocada), e respeitando o teto de 8 usos.

Depois da poda o portal ficou com os links que sobraram para 821 artigos: muitos sem
nenhuma saida e muitos sem nenhuma entrada. Nao e defeito da poda, e consequencia
dela: o WordPress linkava para artigos que hoje sao 410, e esses links foram
removidos na Fase 7 justamente para nao levar o leitor a uma pagina morta.

**Rodizio dentro da editoria, e nao "os mais parecidos".** Escolher por
similaridade concentra: os mesmos poucos artigos populares recebem tudo e a
cauda continua orfa. O rodizio ordena a editoria por data e cada artigo linka
para os tres seguintes em circulo, entao **entrada e saida ficam iguais para
todos**, tres e tres, sem excecao e sem calculo de similaridade que erra.

**A ancora e o titulo do destino.** Ele carrega a palavra-chave do destino por
construcao, e cada titulo e unico, entao nenhuma ancora passa do teto de oito
usos: cada artigo recebe exatamente tres links.

**O bloco entra antes dos dois ultimos paragrafos**, e nao no fim, para nao virar
rodape ignorado. Se o texto for curto, vai no fim mesmo. Nunca dentro de lista,
tabela, citacao ou item de FAQ, o que quebraria o `itemprop` do schema.

Editoria com menos de quatro artigos usa a editoria vizinha mais proxima em
tamanho para completar, senao o circulo nao fecha.
"""
import collections
import glob
import io
import json
import os
import re
import sys
import unicodedata

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

APLICA = '--aplica' in sys.argv
PORTAL = [a for a in sys.argv[1:] if not a.startswith('--')][0]
DATA = '/srv/portais/%s/data' % PORTAL
POR_ARTIGO = 3
# ⚠️ nome de classe literal nao pode repetir entre portais: e impressao
# digital de rede. Ele sai do `fp.prefix` do proprio portal, que e o mesmo que a
# arquitetura usa no CSS.
# ⚠️ As tres primeiras letras do SLUG nao servem: no pontonaturalbrasil dariam
# `pon-veja` enquanto a arquitetura estiliza `.pnb-veja`, e o bloco sobe sem
# estilo nenhum, o que nao aparece em auditoria de HTML
_cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
_site = [x for x in _cfg['sites'] if x['slug'] == PORTAL][0]
MARCA = ((_site.get('fp') or {}).get('prefix') or PORTAL[:3]) + '-veja'

RX_A = re.compile(r'(?i)<a\s[^>]*href="(/[^"#?]*)"')
RX_P = re.compile(r'(?is)</p>')


def esc(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;')
            .replace('>', '&gt;').replace('"', '&quot;'))


arts = {}
for f in glob.glob(DATA + '/*.json'):
    a = json.load(io.open(f, encoding='utf-8'))
    arts[a['slug']] = a

# tira bloco de passada anterior, para o script poder rodar de novo
RX_BLOCO = re.compile(r'(?is)<aside class="%s">.*?</aside>' % MARCA)
for a in arts.values():
    a['content'] = RX_BLOCO.sub('', a.get('content') or '')

por_cat = collections.defaultdict(list)
for s, a in arts.items():
    por_cat[a['category']['slug']].append(s)

# editoria pequena demais para fechar circulo de 3 se junta a maior vizinha
pequenas = [c for c, v in por_cat.items() if len(v) < POR_ARTIGO + 1]
maior = max(por_cat, key=lambda c: len(por_cat[c]))
for c in pequenas:
    if c != maior:
        por_cat[maior].extend(por_cat.pop(c))
print('  editorias no rodizio: %d | juntadas por serem pequenas: %s'
      % (len(por_cat), ', '.join(pequenas) or 'nenhuma'))

# ⚠️ o formato da URL sai do sites.json, e nao de copia do portal anterior. Este
# portal e PLANO: o artigo mora em /<slug>/, na raiz. Montar /<editoria>/<slug>/
# aqui geraria 1.728 links para 404, e a auditoria so pega depois do rebuild
_cfg = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
_site = [x for x in _cfg['sites'] if x['slug'] == PORTAL][0]
FLAT = bool(_site.get('flatUrl'))
print('  portal: %s' % PORTAL)
print('  formato da URL: %s' % ('/<slug>/ (plano)' if FLAT else '/<editoria>/<slug>/'))

url = {}
for s, a in arts.items():
    # ⚠️ o ARTIGO mora em /<editoria>/<slug>/, mesmo com categoryBase: o
    # `categoria` da configuracao vale para o arquivo de editoria, e nao para o
    # artigo. Montar /categoria/<editoria>/<slug>/ aqui geraria 603 links para 404.
    url[s] = ('/%s/' % s) if FLAT else ('/%s/%s/' % (a['category']['slug'], s))

dados = collections.Counter()
recebidos = collections.Counter()
plano = {}
for cat, lista in por_cat.items():
    lista.sort(key=lambda s: (arts[s].get('date') or ''), reverse=True)
    n = len(lista)
    for i, s in enumerate(lista):
        alvos = []
        k = 1
        while len(alvos) < POR_ARTIGO and k < n:
            cand = lista[(i + k) % n]
            if cand != s and cand not in alvos:
                alvos.append(cand)
            k += 1
        plano[s] = alvos
        dados[s] = len(alvos)
        for x in alvos:
            recebidos[x] += 1

sem_saida = [s for s in arts if not plano.get(s)]
sem_entrada = [s for s in arts if not recebidos[s]]
print('  artigos: %d | com saida: %d | com entrada: %d'
      % (len(arts), len(arts) - len(sem_saida), len(arts) - len(sem_entrada)))
print('  sem saida: %d | sem entrada: %d' % (len(sem_saida), len(sem_entrada)))
anc = collections.Counter()
for s, alvos in plano.items():
    for x in alvos:
        anc[arts[x]['title'].lower()] += 1
acima = [(a, n) for a, n in anc.items() if n > 8]
print('  ancoras distintas: %d | mais usada: %d | acima do teto de 8: %d'
      % (len(anc), max(anc.values()) if anc else 0, len(acima)))

if not APLICA:
    print('  ensaio. rode com --aplica.')
    sys.exit()

gravados = 0
for s, alvos in plano.items():
    if not alvos:
        continue
    a = arts[s]
    itens = ''.join('<li><a href="%s">%s</a></li>' % (url[x], esc(arts[x]['title']))
                    for x in alvos)
    bloco = ('<aside class="%s"><h2>Veja também</h2><ul>%s</ul></aside>'
             % (MARCA, itens))
    c = a['content'] or ''
    fins = [m.end() for m in RX_P.finditer(c)]
    # antes dos dois ultimos paragrafos; se o texto e curto, no fim
    pos = fins[-3] if len(fins) >= 4 else (fins[-1] if fins else len(c))
    a['content'] = c[:pos] + bloco + c[pos:]
    io.open(os.path.join(DATA, s + '.json'), 'w', encoding='utf-8').write(
        json.dumps(a, ensure_ascii=False, indent=2))
    gravados += 1

print('  artigos com bloco novo: %d | links internos criados: %d'
      % (gravados, sum(len(v) for v in plano.values())))
