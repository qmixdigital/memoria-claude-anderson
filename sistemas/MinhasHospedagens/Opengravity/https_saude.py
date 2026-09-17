# -*- coding: utf-8 -*-
"""Etapa 2 do vhost: HTTPS, a partir do corpo do arquivo de HTTP.

Uso, no servidor:  python3 /tmp/https_saude.py <slug> [--aplica]

⚠️ **O corpo nao e reescrito.** Ele vem inteiro do arquivo de HTTP, que ja foi
testado com o `Host` na mao: reescrever aqui e a forma mais facil de perder uma
regra de 410 ou um 301 no caminho.

⚠️ **O desafio ACME continua respondendo em HTTP**, para a renovacao automatica
nao depender do certificado que ela mesma renova.
"""
import io
import os
import re
import shutil
import sys
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
SLUG = sys.argv[1]
APLICA = '--aplica' in sys.argv
P = '/etc/nginx/conf.d/portal-%s.conf' % SLUG
IP = '77.37.69.175'

t = io.open(P, encoding='utf-8').read()
if 'listen %s:443' % IP in t:
    print('  %s ja esta em HTTPS' % SLUG)
    raise SystemExit()

m = re.search(r'server_name ([^;]+);', t)
nomes = m.group(1).strip()
dom = nomes.split()[0]
cert = '/etc/letsencrypt/live/%s/fullchain.pem' % dom
if not os.path.isfile(cert):
    print('  🔴 sem certificado em %s' % cert)
    raise SystemExit(1)

# o corpo e tudo que esta DENTRO do server, sem a linha de listen e sem o root
i = t.find('{', t.find('server {'))
j = t.rfind('}')
corpo = t[i + 1:j]
corpo = re.sub(r'\n\s*listen [^\n]*\n', '\n', corpo, count=1)

cabeca = t[:t.find('server {')].rstrip('\n')
cabeca = cabeca.replace('# ETAPA 1: so HTTP.', '# ETAPA 2: HTTPS.')
cabeca = re.sub(r'# ETAPA 2: HTTPS\..*?(?=\n#|\Z)', '# ETAPA 2: HTTPS. O corpo veio do '
                'arquivo de HTTP, sem reescrita.', cabeca, flags=re.S)

novo = '''%s

server {
    listen %s:80;
    server_name %s;
    # o desafio ACME continua respondendo em HTTP, para a renovacao
    location ^~ /.well-known/acme-challenge/ { root /var/www/acme; default_type text/plain; }
    location / { return 301 https://$host$request_uri; }
    access_log off;
}

server {
    listen %s:443 ssl;
    http2 on;
    ssl_certificate     /etc/letsencrypt/live/%s/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/%s/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    add_header Strict-Transport-Security "max-age=31536000" always;
%s}
''' % (cabeca, IP, nomes, IP, dom, dom, corpo)

print('  %s -> HTTPS | server_name: %s | %d bytes' % (SLUG, nomes, len(novo)))
if APLICA:
    shutil.copyfile(P, P + '.bak-http-' + time.strftime('%Y%m%d-%H%M%S'))
    io.open(P, 'w', encoding='utf-8', newline='\n').write(novo)
    print('  gravado')
else:
    print('  ensaio. rode com --aplica.')
