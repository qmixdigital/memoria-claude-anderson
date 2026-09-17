"""
Converte a regra legada 'Block IPs com threat score >30' (action=block) para
managed_challenge em TODAS as zonas do token mestre — garante que NENHUMA regra
bloqueia humano (block duro pega usuário em IP de má reputação; managed_challenge
é quase invisível e só barra bot).
Também remove a duplicata 'Managed Challenge IPs com threat score >30 (human-safe)'
quando a legada foi convertida (evita 2 regras de threat + libera slot).

Uso: python convert_threat.py --all   (ou dom1 dom2 ...)
"""
import os, sys, requests
from concurrent.futures import ThreadPoolExecutor, as_completed

SD = os.path.dirname(os.path.abspath(__file__))
TOKEN = open(os.path.join(SD, '.token_master'), encoding='utf-8').read().strip()
H = {'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}
API = 'https://api.cloudflare.com/client/v4'

DESC_BLOCK = 'Block IPs com threat score >30'
DESC_DUP = 'Managed Challenge IPs com threat score >30 (human-safe)'


def zones_index():
    idx, page = {}, 1
    while True:
        r = requests.get(f'{API}/zones?per_page=50&page={page}', headers=H, timeout=25).json()
        if not r.get('success'):
            break
        for z in r['result']:
            idx.setdefault(z['name'].lower(), z['id'])
        if page >= r.get('result_info', {}).get('total_pages', 1):
            break
        page += 1
    return idx


def zone_by_name(dom):
    r = requests.get(f'{API}/zones?name={dom}', headers=H, timeout=20).json()
    return r['result'][0]['id'] if r.get('success') and r.get('result') else None


def processar(dom, zid):
    base = f'{API}/zones/{zid}'
    rs = requests.get(f'{base}/rulesets', headers=H, timeout=20).json().get('result', [])
    rid = next((r['id'] for r in rs if r.get('phase') == 'http_request_firewall_custom'), None)
    if not rid:
        return dom, 'sem-firewall'
    full = requests.get(f'{base}/rulesets/{rid}', headers=H, timeout=20).json()
    rules = full.get('result', {}).get('rules', []) if full.get('success') else []
    block = next((r for r in rules if r.get('description') == DESC_BLOCK and r.get('action') == 'block'), None)
    dup = next((r for r in rules if r.get('description') == DESC_DUP), None)
    acts = []
    if block:
        new_rule = {
            'action': 'managed_challenge',
            'expression': block['expression'],
            'description': 'Managed Challenge IPs com threat score >30 (human-safe)',
            'enabled': True,
        }
        r = requests.patch(f'{base}/rulesets/{rid}/rules/{block["id"]}', headers=H, json=new_rule, timeout=20).json()
        acts.append('block->challenge' if r.get('success') else f'conv-ERRO')
        # se converteu e havia duplicata, remove a duplicata
        if r.get('success') and dup:
            dd = requests.delete(f'{base}/rulesets/{rid}/rules/{dup["id"]}', headers=H, timeout=20)
            acts.append('dup-removida' if dd.status_code in (200, 204) else 'dup-erro')
    else:
        acts.append('sem-block-legado')
    return dom, ' '.join(acts)


def main():
    if '--all' in sys.argv:
        items = sorted(zones_index().items())
    else:
        items = [(d, zone_by_name(d)) for d in sys.argv[1:] if not d.startswith('--')]
    print(f'alvos: {len(items)}')
    conv = 0
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = {ex.submit(processar, d, z): d for d, z in items if z}
        for f in as_completed(futs):
            d, st = f.result()
            if 'block->challenge' in st:
                conv += 1
            print(f'  {d:34s} {st}')
    print(f'\nconvertidas (block->challenge): {conv}')


if __name__ == '__main__':
    main()
