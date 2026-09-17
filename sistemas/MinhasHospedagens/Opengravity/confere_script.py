# -*- coding: utf-8 -*-
"""Conta `<script>` sem fechamento na PAGINA publicada, portal a portal.

O corpo importado pode trazer um `<script>` truncado. Na pagina montada isso faz
o navegador engolir todo o HTML seguinte: compartilhar, relacionados e **rodape**
somem da tela, e o `</footer>` continua no arquivo, entao nenhum auditor de HTML
acusa.

O sinal e simples: numero de `<script` diferente de numero de `</script>`.
"""
import io
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
RAIZ = '/srv/portais'
RX_A = re.compile(r'(?i)<script\b')
RX_F = re.compile(r'(?i)</script>')
tot = 0
for slug in sorted(os.listdir(RAIZ)):
    PUB = os.path.join(RAIZ, slug, 'public')
    if slug.startswith('_') or not os.path.isdir(PUB):
        continue
    n = 0
    ex = []
    for r, ds, fs in os.walk(PUB):
        if 'index.html' not in fs:
            continue
        p = os.path.join(r, 'index.html')
        try:
            h = io.open(p, encoding='utf-8', errors='replace').read()
        except Exception:
            continue
        if len(RX_A.findall(h)) != len(RX_F.findall(h)):
            n += 1
            if len(ex) < 2:
                ex.append(p[len(PUB):])
    if n:
        tot += n
        print('  %-22s %d paginas | %s' % (slug, n, ' '.join(ex)))
print('  paginas com <script> sem fechamento: %d' % tot)
