# -*- coding: utf-8 -*-
"""Virada de DNS do incast.com.br para a opengravity.

🔴 **O incast esta FORA DO AR hoje**, e nao apenas apontando para o WordPress
antigo: os registros A do apex e do www apontam para **IPs da propria
Cloudflare** (104.21.16.153 e 172.67.213.169), o que ela recusa com o erro 1000,
"DNS points to prohibited IP". O dominio responde 403 para qualquer visitante.

🔴 **Cada nome tem DOIS registros A**, e o script de virada dos outros portais so
troca o primeiro. O segundo continuaria apontando para o IP proibido, e o
resolvedor devolveria os dois: metade das visitas cairia no erro. Aqui **todos os
A, AAAA e CNAME do apex e do www sao apagados**, e um unico A e criado.

⚠️ A zona esta em Full: ate o certificado existir, o SSL desce para `full` e o A
vai **sem proxy**, para o desafio do certbot alcancar a origem.

A zona esta na conta `Incast`, e o token master **alcanca** ela: a tentativa
anterior falhou porque a listagem devolvia `pending`, e a leitura direta da zona
mostra `active`.
"""
import io
import json
import sys
import time
import urllib.error
import urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
TOKEN = '<<REMOVIDO>>'
API = 'https://api.cloudflare.com/client/v4'
DOM = 'incast.com.br'
ZID = 'eb6fe552caae44f4fe0f4260cb23abc6'
IP = '77.37.69.175'


def cf(caminho, metodo='GET', corpo=None):
    dados = json.dumps(corpo).encode() if corpo is not None else None
    r = urllib.request.Request(API + caminho, data=dados, method=metodo,
                               headers={'Authorization': 'Bearer ' + TOKEN,
                                        'Content-Type': 'application/json'})
    try:
        return json.load(urllib.request.urlopen(r, timeout=40))
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode())


recs = (cf('/zones/%s/dns_records?per_page=200' % ZID) or {}).get('result') or []
antes = [r for r in recs if r['type'] in ('A', 'AAAA', 'CNAME')
         and r['name'] in (DOM, 'www.' + DOM)]
print('  registros de endereco antes da virada: %d' % len(antes))
for r in antes:
    print('    %-6s %-24s %-34s proxy=%s' % (r['type'], r['name'], r['content'],
                                             r.get('proxied')))
io.open('cf-antes-incast.json', 'w', encoding='utf-8').write(
    json.dumps(antes, ensure_ascii=False, indent=2))
print('  estado anterior guardado em cf-antes-incast.json')

if '--vira' in sys.argv:
    print('  SSL para full: %s' % cf('/zones/%s/settings/ssl' % ZID, 'PATCH',
                                     {'value': 'full'}).get('success'))
    # 🔴 TODOS os registros de endereco saem, e nao so o primeiro
    for r in antes:
        ok = cf('/zones/%s/dns_records/%s' % (ZID, r['id']), 'DELETE').get('success')
        print('    apagado %-6s %-24s %-34s %s' % (r['type'], r['name'],
                                                   r['content'][:34], ok))
    for nome in (DOM, 'www.' + DOM):
        ok = cf('/zones/%s/dns_records' % ZID, 'POST',
                {'type': 'A', 'name': nome, 'content': IP, 'ttl': 60,
                 'proxied': False}).get('success')
        print('  A %-24s -> %s sem proxy: %s' % (nome, IP, ok))
    print('  purga: %s' % cf('/zones/%s/purge_cache' % ZID, 'POST',
                             {'purge_everything': True}).get('success'))
    print('  agora: certbot pelo webroot, depois o vhost de HTTPS, depois --fecha')

if '--fecha' in sys.argv:
    recs = (cf('/zones/%s/dns_records?per_page=200' % ZID) or {}).get('result') or []
    for r in recs:
        if r['type'] == 'A' and r['name'] in (DOM, 'www.' + DOM):
            ok = cf('/zones/%s/dns_records/%s' % (ZID, r['id']), 'PUT',
                    {'type': 'A', 'name': r['name'], 'content': IP, 'ttl': 1,
                     'proxied': True}).get('success')
            print('  A %-24s proxy ligado: %s' % (r['name'], ok))
    print('  SSL para strict: %s' % cf('/zones/%s/settings/ssl' % ZID, 'PATCH',
                                       {'value': 'strict'}).get('success'))
    print('  always_use_https: %s' % cf('/zones/%s/settings/always_use_https' % ZID,
                                        'PATCH', {'value': 'on'}).get('success'))
    time.sleep(2)
    print('  purga: %s' % cf('/zones/%s/purge_cache' % ZID, 'POST',
                             {'purge_everything': True}).get('success'))

if '--vira' not in sys.argv and '--fecha' not in sys.argv:
    print('  ensaio. rode com --vira e depois com --fecha.')
