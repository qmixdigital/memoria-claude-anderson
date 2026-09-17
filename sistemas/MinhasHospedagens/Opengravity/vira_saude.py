# -*- coding: utf-8 -*-
"""Virada de DNS dos cinco portais de saude para a opengravity.

Uso:  python vira_saude.py <dominio> --vira     (aponta o A, sem proxy)
      python vira_saude.py <dominio> --fecha    (proxy de volta e SSL strict)

🔴 **Este e o unico ponto de parada da conversao.** Nada aqui roda sem ordem.

A ordem importa e nao e livre:

 1. o registro A vai para 77.37.69.175 **sem proxy**, porque o desafio HTTP-01
    do certbot precisa alcancar a origem direto
 2. `certbot certonly --webroot -w /var/www/acme -d <dom> -d www.<dom>`
 3. o vhost de HTTPS e escrito a partir do corpo do de HTTP, `nginx -t` pelo
    EXIT CODE e reload
 4. so entao o proxy volta e o SSL da zona sobe para **strict**
 5. purga geral, na zona certa

⚠️ **A zona destes cinco esta em `full` ou `flexible`, e nao em strict**, entao
nao ha risco de 526 durante a emissao. Ainda assim o A vai sem proxy: com proxy
ligado o desafio bate na borda da Cloudflare, e nao na origem.

⚠️ **Purgar na zona errada responde `success`** e some com horas de
investigacao. O zone id de cada dominio esta aqui, conferido pelo `acha_zona`.

⚠️ **O matogrossosaude e canonico no `www`**: os dois nomes apontam para o mesmo
IP, e quem redireciona e o vhost, nao o DNS.
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
IP = '77.37.69.175'

ZONA = {
    'saudeacessivel.com.br': 'e02d73fea0fafe0a8e6aa4789e614303',
    'saudicas.com.br': 'd3e5c0c77539ee8fac50366a064b271b',
    'saudeemalta.net.br': '367c56ba481b264b2a99e3823db003c0',
    'revistatopsaude.com.br': 'af2d8b3aa2ffdb84fe8a2edb3aff3e79',
    'matogrossosaude.com.br': '513cc6db98cb1aea0fcede2a48399a1b',
}

DOM = sys.argv[1] if len(sys.argv) > 1 else ''
if DOM not in ZONA:
    print('  uso: vira_saude.py <dominio> [--vira|--fecha]')
    print('  dominios: %s' % ', '.join(sorted(ZONA)))
    raise SystemExit(2)
ZID = ZONA[DOM]


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
print('  %s | zona %s' % (DOM, ZID))
print('  registros de endereco antes: %d' % len(antes))
for r in antes:
    print('    %-6s %-30s %-26s proxy=%s' % (r['type'], r['name'], r['content'][:26],
                                             r.get('proxied')))
io.open('cf-antes-%s.json' % DOM, 'w', encoding='utf-8').write(
    json.dumps(antes, ensure_ascii=False, indent=2))
print('  estado anterior guardado em cf-antes-%s.json' % DOM)

if '--vira' in sys.argv:
    # TODOS os registros de endereco saem: deixar um para tras faz o resolvedor
    # devolver os dois, e metade das visitas continua caindo no WordPress
    for r in antes:
        ok = cf('/zones/%s/dns_records/%s' % (ZID, r['id']), 'DELETE').get('success')
        print('    apagado %-6s %-30s %s' % (r['type'], r['name'], ok))
    for nome in (DOM, 'www.' + DOM):
        ok = cf('/zones/%s/dns_records' % ZID, 'POST',
                {'type': 'A', 'name': nome, 'content': IP, 'ttl': 60,
                 'proxied': False}).get('success')
        print('  A %-30s -> %s sem proxy: %s' % (nome, IP, ok))
    print('  purga: %s' % cf('/zones/%s/purge_cache' % ZID, 'POST',
                             {'purge_everything': True}).get('success'))
    print('  agora, no servidor:')
    print('    certbot certonly --webroot -w /var/www/acme -d %s -d www.%s' % (DOM, DOM))
    print('    e depois o vhost de HTTPS, nginx -t pelo exit code, reload, e --fecha')

if '--fecha' in sys.argv:
    recs = (cf('/zones/%s/dns_records?per_page=200' % ZID) or {}).get('result') or []
    for r in recs:
        if r['type'] == 'A' and r['name'] in (DOM, 'www.' + DOM):
            ok = cf('/zones/%s/dns_records/%s' % (ZID, r['id']), 'PUT',
                    {'type': 'A', 'name': r['name'], 'content': IP, 'ttl': 1,
                     'proxied': True}).get('success')
            print('  A %-30s proxy ligado: %s' % (r['name'], ok))
    print('  SSL para strict: %s' % cf('/zones/%s/settings/ssl' % ZID, 'PATCH',
                                       {'value': 'strict'}).get('success'))
    print('  always_use_https: %s' % cf('/zones/%s/settings/always_use_https' % ZID,
                                        'PATCH', {'value': 'on'}).get('success'))
    time.sleep(2)
    print('  purga: %s' % cf('/zones/%s/purge_cache' % ZID, 'POST',
                             {'purge_everything': True}).get('success'))

if '--vira' not in sys.argv and '--fecha' not in sys.argv:
    print('  ensaio. nada foi alterado.')
