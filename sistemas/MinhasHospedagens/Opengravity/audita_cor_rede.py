# -*- coding: utf-8 -*-
"""Mede a cor EFETIVA do botao em todos os portais, com o navegador.

Uso:  python audita_cor_rede.py

🔴 Ler o CSS que o motor gerou nao serve: a regra esta escrita e correta, e
perde para a da arquitetura por especificidade. O unico jeito honesto de saber e
perguntar ao navegador, com `getComputedStyle`.

Sai a razao de contraste de cada botao, no corpo do artigo e no rodape, e a
lista dos que ficam abaixo de 4,5:1.
"""
import io
import os
import re
import subprocess
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
CH = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
S = os.path.dirname(os.path.abspath(__file__))
TMP = os.path.join(S, 'fp')

SCRIPT = '''<script>window.addEventListener('load',function(){
 var r=[];document.querySelectorAll('[data-fp]').forEach(function(a,i){
  var c=getComputedStyle(a);
  var el=a,bg='rgba(0, 0, 0, 0)';
  while(el&&(bg==='rgba(0, 0, 0, 0)'||bg==='transparent')){bg=getComputedStyle(el).backgroundColor;el=el.parentElement;}
  r.push(i+'|'+c.color+'|'+c.backgroundColor+'|'+bg);
 });document.title='FP::'+r.join('##');});</script>'''


def rgb(s):
    m = re.findall(r'[\d.]+', s or '')
    if len(m) < 3:
        return None
    return tuple(float(x) for x in m[:3])


def lum(c):
    f = lambda x: (x / 255) / 12.92 if (x / 255) <= 0.03928 else (((x / 255) + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])


def razao(a, b):
    a, b = rgb(a), rgb(b)
    if not a or not b:
        return None
    la, lb = lum(a), lum(b)
    if la < lb:
        la, lb = lb, la
    return (la + 0.05) / (lb + 0.05)


def mede(url):
    r = subprocess.run(['curl', '-s', '-m', '30', url], capture_output=True)
    t = r.stdout.decode('utf-8', 'replace')
    if '</head>' not in t:
        return None
    dom = re.search(r'https?://([^/]+)', url).group(1)
    t = t.replace('</head>', '<base href="https://%s/">%s</head>' % (dom, SCRIPT), 1)
    p = os.path.join(TMP, 'medir.html')
    io.open(p, 'w', encoding='utf-8').write(t)
    q = subprocess.run([CH, '--headless', '--disable-gpu', '--no-sandbox',
                        '--virtual-time-budget=6000', '--dump-dom', 'file:///' + p],
                       capture_output=True)
    d = q.stdout.decode('utf-8', 'replace')
    m = re.search(r'<title>FP::(.*?)</title>', d)
    return m.group(1) if m else None


ruins, ok, falhou = [], 0, []
linhas = [l.rstrip('\n').split('\t') for l in
          io.open(os.path.join(S, 'urls-artigo.tsv'), encoding='utf-8') if l.strip()]
for slug, url in linhas:
    r = mede(url)
    if not r:
        falhou.append(slug)
        print('  ?? %-24s nao consegui medir' % slug)
        continue
    pior, ondepior = 99, ''
    for parte in r.split('##'):
        i, cor, bgb, bg = parte.split('|')
        fundo = bgb if rgb(bgb) and 'rgba(0, 0, 0, 0)' not in bgb else bg
        rz = razao(cor, fundo)
        if rz and rz < pior:
            pior, ondepior = rz, ('corpo' if i == '0' else 'rodapé')
    if pior < 4.5:
        ruins.append((slug, pior, ondepior))
        print('  🔴 %-24s %.2f:1 no %s' % (slug, pior, ondepior))
    else:
        ok += 1
        print('  ok %-24s %.2f:1' % (slug, pior))

print('  ---')
print('  medidos: %d | abaixo de 4,5:1: %d | nao mediu: %d'
      % (ok + len(ruins), len(ruins), len(falhou)))
io.open(os.path.join(S, 'fp-contraste-ruim.txt'), 'w', encoding='utf-8', newline='\n').write(
    ''.join('%s\t%.2f\t%s\n' % x for x in ruins))
