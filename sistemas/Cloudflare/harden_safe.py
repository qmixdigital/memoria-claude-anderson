"""
Hardening SEGURO em massa (pacote anti-bot) para a rede QMIX.

Diferencas para o harden_site.py:
  - SSL 'full' em vez de 'strict'  -> nunca da 526 por cert de origem invalido.
  - NAO aplica a regra 'sem-User-Agent block' -> nao arrisca o receptor do Antonio.
  - Guarda o SSL anterior e REVERTE se a home cair para 5xx apos a mudanca.
  - So aplica nos dominios que ainda NAO estao em sites_hardened.txt.

Uso:
  python harden_safe.py            # todos os nao-hardened
  python harden_safe.py --limit 10 # so os 10 primeiros (validar)
  python harden_safe.py --dry      # so lista o que faria
"""
import json, os, sys, time, requests
from concurrent.futures import ThreadPoolExecutor, as_completed

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONTAS = json.load(open(os.path.join(SCRIPT_DIR, 'contas.json'), encoding='utf-8'))
AI_EXPR = open(os.path.join(SCRIPT_DIR, 'ai_bots_expression.txt'), encoding='utf-8').read().strip()

HARDENED_FILE = os.path.join(SCRIPT_DIR, 'sites_hardened.txt')


def ja_hardened():
    feitos = set()
    if os.path.exists(HARDENED_FILE):
        for ln in open(HARDENED_FILE, encoding='utf-8'):
            ln = ln.strip()
            if not ln or ln.startswith('#'):
                continue
            feitos.add(ln.split()[0].split('#')[0].strip().lower())
    return feitos


def todas_zonas():
    """[(dominio, conta, zone_id, ssl_atual)] de todas as zonas ativas."""
    zonas = []

    def uma(c):
        out = []
        try:
            h = {'Authorization': f'Bearer {c["token"]}'}
            page = 1
            while True:
                r = requests.get(
                    f'https://api.cloudflare.com/client/v4/zones?account.id={c["account_id"]}&per_page=50&page={page}',
                    headers=h, timeout=25)
                d = r.json()
                if not d.get('success'):
                    break
                for z in d['result']:
                    if z['status'] == 'active':
                        out.append((z['name'].lower(), c['nome'], z['id']))
                if page >= d.get('result_info', {}).get('total_pages', 1):
                    break
                page += 1
        except Exception:
            pass
        return out

    with ThreadPoolExecutor(max_workers=8) as ex:
        for lst in ex.map(uma, CONTAS):
            zonas.extend(lst)
    return zonas


def tok(conta_nome):
    return next(c['token'] for c in CONTAS if c['nome'] == conta_nome)


def home_ok(dominio):
    """True se a home responde < 500."""
    try:
        r = requests.get(f'https://{dominio}/', timeout=25,
                         headers={'User-Agent': 'Mozilla/5.0 (compatible; QMIXHardenCheck/1.0)'})
        return r.status_code < 500, r.status_code
    except Exception as e:
        return False, str(e)[:30]


def aplicar(dominio, conta_nome, zid):
    h = {'Authorization': f'Bearer {tok(conta_nome)}', 'Content-Type': 'application/json'}
    BASE = f'https://api.cloudflare.com/client/v4/zones/{zid}'
    out = []

    # 0. guarda SSL atual para poder reverter
    try:
        ssl_antes = requests.get(f'{BASE}/settings/ssl', headers=h, timeout=20).json()['result']['value']
    except Exception:
        ssl_antes = 'full'

    # 1. settings seguros (SSL full, nao strict)
    settings = [
        ('ssl', 'full'),
        ('min_tls_version', '1.2'),
        ('always_use_https', 'on'),
        ('security_level', 'medium'),   # human-safe: high pode desafiar humano em IP de ma reputacao
        ('tls_1_3', 'on'),
        ('brotli', 'on'),
        ('http3', 'on'),
        ('always_online', 'on'),
    ]
    s_ok = 0
    for k, v in settings:
        try:
            if requests.patch(f'{BASE}/settings/{k}', headers=h, json={'value': v}, timeout=20).json().get('success'):
                s_ok += 1
        except Exception:
            pass
    out.append(f'set={s_ok}/{len(settings)}')

    # 2. DNSSEC
    try:
        requests.patch(f'{BASE}/dnssec', headers=h, json={'status': 'active'}, timeout=20)
        out.append('dnssec')
    except Exception:
        pass

    # 3. WAF human-safe: arquivos sensiveis + threat>30 (managed_challenge, NAO block) + challenge admin/login.
    #    NAO bloquear AI bots (decisao do operador 28/07). SEM 'sem-UA'. cliquex.click nunca chega aqui (excluido em main).
    waf_rules = [
        {'action': 'block',
         'expression': '(http.request.uri.path contains "/.env" or http.request.uri.path contains "/.git" or http.request.uri.path contains "/wp-config.php")',
         'description': 'Block arquivos sensiveis (.env, .git, wp-config)', 'enabled': True},
        {'action': 'managed_challenge', 'expression': '(cf.threat_score gt 30)',
         'description': 'Managed Challenge IPs com threat score >30 (human-safe)', 'enabled': True},
        {'action': 'managed_challenge',
         'expression': '(http.request.uri.path contains "/wp-admin" or http.request.uri.path contains "/wp-login")',
         'description': 'Managed Challenge em wp-admin, wp-login', 'enabled': True},
    ]
    try:
        rss = requests.get(f'{BASE}/rulesets', headers=h, timeout=20).json().get('result', [])
        waf_rs = next((r['id'] for r in rss if r.get('phase') == 'http_request_firewall_custom'), None)
        waf_ok = 0
        if waf_rs:
            existentes = {x.get('description', '') for x in
                          requests.get(f'{BASE}/rulesets/{waf_rs}', headers=h, timeout=20).json()['result'].get('rules', [])}
            livres = 5 - len(existentes)  # limite Free
            for rule in waf_rules:
                if rule['description'] in existentes:
                    waf_ok += 1
                    continue
                if livres <= 0:
                    continue
                if requests.post(f'{BASE}/rulesets/{waf_rs}/rules', headers=h, json=rule, timeout=20).json().get('success'):
                    waf_ok += 1
                    livres -= 1
        else:
            body = {'name': 'default', 'kind': 'zone', 'phase': 'http_request_firewall_custom', 'rules': waf_rules}
            if requests.post(f'{BASE}/rulesets', headers=h, json=body, timeout=20).json().get('success'):
                waf_ok = len(waf_rules)
        out.append(f'waf={waf_ok}')
    except Exception:
        out.append('waf=erro')

    # 4. valida a home; se caiu, reverte SSL
    time.sleep(3)
    ok, code = home_ok(dominio)
    if not ok:
        try:
            requests.patch(f'{BASE}/settings/ssl', headers=h, json={'value': ssl_antes}, timeout=20)
        except Exception:
            pass
        time.sleep(3)
        ok2, code2 = home_ok(dominio)
        out.append(f'HOME CAIU ({code}) -> SSL revertido p/ {ssl_antes} -> {"ok" if ok2 else "AINDA "+str(code2)}')
    else:
        out.append(f'home={code}')

    return dominio, conta_nome, ' | '.join(out), (ok if not ok else True)


def main():
    limit = None
    dry = '--dry' in sys.argv
    if '--limit' in sys.argv:
        limit = int(sys.argv[sys.argv.index('--limit') + 1])

    feitos = ja_hardened()
    print(f'Ja hardened: {len(feitos)}')
    zonas = todas_zonas()
    print(f'Zonas ativas: {len(zonas)}')
    # INTOCAVEIS no Cloudflare (decisao do operador): cliquex.click + qmix.com.br (dominio-marca) — nunca entram nos alvos
    alvos = [(d, c, z) for (d, c, z) in zonas
             if d not in feitos and 'cliquex' not in d.lower() and d.lower() != 'qmix.com.br']
    print(f'A endurecer (nao-hardened): {len(alvos)}')
    if limit:
        alvos = alvos[:limit]
        print(f'Limitado a: {len(alvos)}')
    if dry:
        for d, c, z in alvos:
            print(f'  {d}  ({c})')
        return

    caidos = []
    with ThreadPoolExecutor(max_workers=4) as ex:
        futs = {ex.submit(aplicar, d, c, z): d for (d, c, z) in alvos}
        for fut in as_completed(futs):
            d, c, status, ok = fut.result()
            flag = '' if ok else '  <<< VERIFICAR'
            print(f'  {d:38s} {status}{flag}')
            if not ok:
                caidos.append(d)
            # registra no hardened list
            with open(HARDENED_FILE, 'a', encoding='utf-8') as f:
                f.write(f'{d}  # {c}, safe, {time.strftime("%Y-%m-%d")}\n')

    print(f'\nConcluido. {len(alvos)} processados, {len(caidos)} precisaram reverter e ainda com problema: {caidos}')


if __name__ == '__main__':
    main()
