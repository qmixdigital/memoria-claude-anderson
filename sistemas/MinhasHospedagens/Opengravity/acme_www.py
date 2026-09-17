# -*- coding: utf-8 -*-
"""O redirecionamento do apex para o www engole o desafio do certbot.

🔴 O `if` em contexto de `server` roda na fase de rewrite, **antes** de o nginx
escolher a `location`. Entao o `location ^~ /.well-known/acme-challenge/` nunca
chega a ser considerado: o apex responde 301 e a emissao do certificado falha
para o nome do apex, dizendo que o desafio nao foi encontrado.

O conserto e o idioma padrao do nginx: marcar a intencao numa variavel, desmarcar
para o caminho do ACME, e so entao redirecionar.
"""
import io
import re
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
P = '/etc/nginx/conf.d/portal-matogrossosaude.conf'
t = io.open(P, encoding='utf-8').read()
VELHO = ('    if ($host = matogrossosaude.com.br) '
         '{ return 301 https://www.matogrossosaude.com.br$request_uri; }')
NOVO = ('''    # 🔴 o `if` de server roda ANTES de o nginx escolher a location, entao um
    # `return 301` seco aqui engole o desafio do certbot e a emissao falha para
    # o nome do apex. A variavel guarda a intencao e o caminho do ACME a desfaz
    set $vai_www 0;
    if ($host = matogrossosaude.com.br) { set $vai_www 1; }
    if ($request_uri ~ ^/\.well-known/) { set $vai_www 0; }
    if ($vai_www = 1) { return 301 https://www.matogrossosaude.com.br$request_uri; }''')
if 'vai_www' in t:
    print('  ja estava corrigido')
    raise SystemExit()
if VELHO not in t:
    print('  🔴 nao achei a linha do redirecionamento')
    raise SystemExit(1)
shutil.copyfile(P, P + '.bak-acme-' + time.strftime('%Y%m%d-%H%M%S'))
io.open(P, 'w', encoding='utf-8', newline='\n').write(t.replace(VELHO, NOVO, 1))
print('  redirecionamento do apex passa a liberar o caminho do ACME')
