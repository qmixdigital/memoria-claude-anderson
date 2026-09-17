# -*- coding: utf-8 -*-
"""301 condicional das editorias que ficaram sem nenhum artigo preservado.

Uso, no servidor:  python3 /tmp/orfas_saude.py [--aplica]

🔴 **Editoria orfa responde 404 e nenhuma auditoria ve.** O motor so gera a
listagem de editoria que tem artigo. Numa poda de 70% e comum uma editoria
inteira ficar sem preservado: o menu nao a mostra, entao o grafo de links da zero
orfa, e o sitemap tambem nao a lista. So quem tinha a URL indexada cai no 404.

⚠️ **Condicional, e nao `return 301` seco.** A editoria continua no
`categoryMap`, e no dia em que a plataforma do Antonio publicar nela a pagina
passa a existir: o `try_files` entrega o arquivo se ele estiver la, e so cai no
redirecionamento quando nao estiver.
"""
import io
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
APLICA = '--aplica' in sys.argv

# editoria orfa -> editoria mais proxima que existe
MAPA = {
    'saudeemalta': ('categoria', {
        'alimentacao': ['frutas'],
        'suplementos': ['nutrientes-essenciais', 'produtos-naturais'],
        'chas': ['temperos-e-ervas'],
    }),
    'revistatopsaude': ('category', {
        'alimentacao': ['chas', 'frutas', 'nutrientes-essenciais', 'temperos-e-ervas'],
        'saude': ['produtos-naturais'],
    }),
    'matogrossosaude': ('categoria', {
        'viver-melhor': ['insights'],
        'noticias': ['servicos'],
    }),
}

ANCORA = '    # o motor serve estes dois: precisam vir antes da regra generica de sitemap'

for slug, (base, grupos) in MAPA.items():
    p = '/etc/nginx/conf.d/portal-%s.conf' % slug
    t = io.open(p, encoding='utf-8').read()
    if 'editoria_vazia' in t:
        print('  %s ja tinha o bloco' % slug)
        continue
    bloco = ['    # ---- editoria que ficou sem artigo preservado',
             '    # 🔴 sem isto ela responde 404, e nenhuma auditoria enxerga: o menu nao a',
             '    # mostra, o grafo de links da zero orfa e o sitemap nao a lista. So quem',
             '    # tinha a URL indexada cai no erro.',
             '    # ⚠️ condicional: se a plataforma publicar nela, o arquivo passa a existir',
             '    #    e o try_files entrega a pagina em vez de redirecionar']
    n = 0
    for destino, orfas in grupos.items():
        n += 1
        nome = '@ed_vazia_%d' % n
        bloco.append('    location ~* "^/%s/(%s)/?$" { try_files $uri $uri/ $uri/index.html %s; }'
                     % (base, '|'.join(sorted(orfas)), nome))
        bloco.append('    location %s { return 301 /%s/%s/; }' % (nome, base, destino))
    bloco.append('')
    novo = t.replace(ANCORA, '\n'.join(bloco) + ANCORA, 1)
    if novo == t:
        print('  ⚠️ %s: nao achei a ancora' % slug)
        continue
    total = sum(len(v) for v in grupos.values())
    print('  %-18s %d editoria(s) orfa(s) -> %d destino(s)' % (slug, total, len(grupos)))
    for d, o in grupos.items():
        print('     %-40s -> /%s/%s/' % (', '.join(sorted(o)), base, d))
    if APLICA:
        io.open(p, 'w', encoding='utf-8', newline='\n').write(novo)

if not APLICA:
    print('  ensaio. rode com --aplica.')
