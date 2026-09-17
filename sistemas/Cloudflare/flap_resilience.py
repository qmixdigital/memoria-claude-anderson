"""
Resiliência de outage para os sites que flapam (origem Hostinger oversubscrita):
  - always_online = on  (CF serve a ultima copia boa quando a origem cai / 52x)
  - sobe o edge_ttl do microcache de 300s -> TTL_ALVO (default 1800s) pra a copia
    sobreviver a janela de queda (~10min).
Client-safe: nada disso bloqueia; logado/form continua no bypass (regra separada).
Lookup por nome (rapido, sem paginar as 326 zonas).

Uso: python flap_resilience.py [--ttl 1800] dom1 dom2 ...
"""
import os, sys, requests

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TOKEN = open(os.path.join(SCRIPT_DIR, '.token_master'), encoding='utf-8').read().strip()
H = {'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}
API = 'https://api.cloudflare.com/client/v4'
DESC_CACHE = 'WP edge microcache HTML (rede QMIX)'


def zone_id(dom):
    r = requests.get(f'{API}/zones?name={dom}', headers=H, timeout=20).json()
    return r['result'][0]['id'] if r.get('success') and r.get('result') else None


def run(dom, ttl):
    zid = zone_id(dom)
    if not zid:
        return 'ZONA NAO VISIVEL'
    base = f'{API}/zones/{zid}'
    out = []
    # 1) always_online on
    r = requests.patch(f'{base}/settings/always_online', headers=H, json={'value': 'on'}, timeout=20).json()
    out.append('alwaysonline=on' if r.get('success') else 'alwaysonline=ERRO')
    # 2) bump edge_ttl do microcache
    ep = requests.get(f'{base}/rulesets/phases/http_request_cache_settings/entrypoint', headers=H, timeout=20).json()
    done = False
    if ep.get('success'):
        rs_id = ep['result']['id']
        for rule in ep['result'].get('rules', []):
            if rule.get('description') == DESC_CACHE:
                new_rule = {
                    'action': 'set_cache_settings',
                    'expression': rule['expression'],
                    'description': DESC_CACHE,
                    'enabled': True,
                    'action_parameters': {
                        'cache': True,
                        'edge_ttl': {'mode': 'override_origin', 'default': ttl},
                        'browser_ttl': {'mode': 'respect_origin'},
                    },
                }
                rr = requests.patch(f'{base}/rulesets/{rs_id}/rules/{rule["id"]}', headers=H, json=new_rule, timeout=20).json()
                out.append(f'ttl={ttl}s' if rr.get('success') else f'ttl=ERRO({rr.get("errors")})')
                done = True
                break
    if not done:
        out.append('ttl=sem-regra-cache')
    return ' | '.join(out)


def main():
    ttl = 1800
    args = sys.argv[1:]
    if '--ttl' in args:
        i = args.index('--ttl'); ttl = int(args[i + 1]); del args[i:i + 2]
    for d in args:
        print(f'  {d:34s} {run(d, ttl)}')


if __name__ == '__main__':
    main()
