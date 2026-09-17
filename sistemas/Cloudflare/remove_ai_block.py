"""
Remove a regra 'AI Crawl Control - Block AI bots by User Agent' de TODAS as zonas
do token — EXCETO cliquex.click (que NAO pode ser tocado de forma alguma).
O usuario NAO quer bloquear bots de IA na rede; cliquex.click e a unica excecao e
fica exatamente como esta.

Uso: python remove_ai_block.py --all   (ou dom1 dom2 ...)
"""
import os, sys, requests
from concurrent.futures import ThreadPoolExecutor, as_completed

SD = os.path.dirname(os.path.abspath(__file__))
TOKEN = open(os.path.join(SD, '.token_master'), encoding='utf-8').read().strip()
H = {'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}
API = 'https://api.cloudflare.com/client/v4'

DESC_AI = 'AI Crawl Control - Block AI bots by User Agent'
PROTEGIDO = {'cliquex.click', 'qmix.com.br'}   # NUNCA tocar (cliquex + dominio-marca da QMIX)


def is_protected(name):
    n = name.lower()
    # cliquex (qualquer) + qmix.com.br EXATO (nao pegar qmiximoveis/qmixdigital)
    return n in PROTEGIDO or 'cliquex' in n


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


def remover(dom, zid):
    if is_protected(dom):
        return dom, 'PROTEGIDO - nao tocado'
    base = f'{API}/zones/{zid}'
    rs = requests.get(f'{base}/rulesets', headers=H, timeout=20).json().get('result', [])
    rid = next((r['id'] for r in rs if r.get('phase') == 'http_request_firewall_custom'), None)
    if not rid:
        return dom, 'sem-firewall'
    full = requests.get(f'{base}/rulesets/{rid}', headers=H, timeout=20).json()
    rules = full.get('result', {}).get('rules', []) if full.get('success') else []
    alvo = [r for r in rules if r.get('description') == DESC_AI]
    if not alvo:
        return dom, 'sem-regra-AI'
    n = 0
    for r in alvo:
        rr = requests.delete(f'{base}/rulesets/{rid}/rules/{r["id"]}', headers=H, timeout=20)
        if rr.status_code in (200, 204) or (rr.headers.get('content-type', '').startswith('application/json') and rr.json().get('success')):
            n += 1
    return dom, f'AI-block removido ({n})'


def main():
    if '--all' in sys.argv:
        items = sorted(zones_index().items())
    else:
        items = [(d, zone_by_name(d)) for d in sys.argv[1:] if not d.startswith('--')]
    # blindagem extra: tira cliquex da lista ANTES de qualquer chamada de escrita
    items = [(d, z) for d, z in items if not is_protected(d)]
    print(f'alvos (cliquex ja excluido): {len(items)}')
    rem = 0
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = {ex.submit(remover, d, z): d for d, z in items if z}
        for f in as_completed(futs):
            d, st = f.result()
            if 'removido' in st:
                rem += 1
            print(f'  {d:34s} {st}')
    print(f'\nAI-block removido de {rem} zonas')


if __name__ == '__main__':
    main()
