# -*- coding: utf-8 -*-
"""Mede a cor EFETIVA do botao, com o navegador, e nao lendo o CSS.

🔴 Ler a regra que o motor gerou nao basta: a arquitetura tem regras como
`.xxbody a{color:var(--p)}` e `.xxfoot a{color:var(--footer-tx)}`, com
especificidade (0,1,1), que **ganham** da minha (0,1,0). O botao herda a cor de
link do corpo ou do rodape, e num botao de fundo escuro isso vira texto escuro
sobre fundo escuro.

O jeito de saber e perguntar ao navegador: baixa a pagina, roda um script que le
`getComputedStyle` do botao no corpo e no rodape, e escreve o resultado no
titulo, que o `--dump-dom` devolve.
"""
import io
import re
import subprocess
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
CH = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
S = (r'C:\Users\User\AppData\Local\Temp\claude\d--PORTAIS'
     r'\351fca13-824e-437d-9151-aec38077c276\scratchpad\fp')

SCRIPT = '''<script>window.addEventListener('load',function(){
 var r=[];document.querySelectorAll('[data-fp]').forEach(function(a,i){
  var c=getComputedStyle(a);
  var el=a,bg='rgba(0, 0, 0, 0)';
  while(el&&bg==='rgba(0, 0, 0, 0)'){bg=getComputedStyle(el).backgroundColor;el=el.parentElement;}
  r.push(i+'|'+c.color+'|'+c.backgroundColor+'|'+bg);
 });document.title='FP::'+r.join('##');});</script>'''


def mede(url):
    r = subprocess.run(['curl', '-s', '-m', '30', url], capture_output=True)
    t = r.stdout.decode('utf-8', 'replace')
    dom = re.search(r'https?://([^/]+)', url).group(1)
    t = t.replace('</head>', '<base href="https://%s/">%s</head>' % (dom, SCRIPT), 1)
    p = S + r'\medir.html'
    io.open(p, 'w', encoding='utf-8').write(t)
    q = subprocess.run([CH, '--headless', '--disable-gpu', '--no-sandbox',
                        '--virtual-time-budget=7000', '--dump-dom', 'file:///' + p],
                       capture_output=True)
    d = q.stdout.decode('utf-8', 'replace')
    m = re.search(r'<title>FP::(.*?)</title>', d)
    return m.group(1) if m else None


if __name__ == '__main__':
    for u in sys.argv[1:]:
        print('  %s' % u)
        r = mede(u)
        if not r:
            print('     nao consegui medir')
            continue
        for parte in r.split('##'):
            i, cor, bgb, bg = parte.split('|')
            print('     botao %s | texto %s | fundo do botao %s | fundo atras %s'
                  % (i, cor, bgb, bg))
