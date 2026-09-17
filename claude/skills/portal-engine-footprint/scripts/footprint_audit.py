# -*- coding: utf-8 -*-
"""
Auditoria de footprint da rede no Cloudflare Pages.

Para cada portal baixa home, um artigo, robots.txt, 404, 410, e as paginas
institucionais linkadas no rodape; extrai sinais que ferramentas de deteccao
usam para agrupar sites (cabecalhos, comentarios, classes CSS, JSON-LD,
IDs de AdSense/Analytics, textos fixos, scripts externos, favicon) e
lista todo valor que se repete em muitos portais.

uso: python footprint_audit.py [dominios.txt] [--min N] [--md saida.md]
"""
import sys, re, json, hashlib, ssl, gzip, io
import urllib.request, urllib.error
from collections import defaultdict, Counter
from concurrent.futures import ThreadPoolExecutor

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
ctx = ssl.create_default_context()

def get(url, timeout=25):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Encoding': 'gzip'})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            raw = r.read()
            if r.headers.get('Content-Encoding') == 'gzip':
                raw = gzip.GzipFile(fileobj=io.BytesIO(raw)).read()
            return r.status, dict(r.headers.items()), raw.decode('utf-8', 'ignore'), r.geturl()
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            if e.headers.get('Content-Encoding') == 'gzip': raw = gzip.GzipFile(fileobj=io.BytesIO(raw)).read()
        except Exception: pass
        return e.code, dict(e.headers.items()), raw.decode('utf-8', 'ignore'), url
    except Exception as e:
        return 0, {}, '', url

def h(s): return hashlib.md5(s.encode('utf-8', 'ignore')).hexdigest()[:10]

def texto(html):
    t = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', html, flags=re.S)
    t = re.sub(r'<[^>]+>', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()

def sinais_pagina(html, headers, prefixo):
    s = {}
    hdr = sorted(k.lower() for k in headers if k.lower() not in ('date', 'cf-ray', 'age', 'content-length', 'last-modified', 'etag', 'cf-cache-status', 'set-cookie', 'report-to', 'nel', 'server-timing', 'alt-svc', 'expires', 'cache-control', 'content-encoding', 'transfer-encoding', 'connection', 'vary', 'accept-ranges', 'content-type', 'x-content-type-options', 'referrer-policy', 'server', 'x-robots-tag', 'location', 'access-control-allow-origin'))
    s[prefixo + 'cabecalhos_extra'] = ','.join(hdr) or '(nenhum)'
    for k, v in headers.items():
        kl = k.lower()
        if kl in ('permissions-policy', 'content-security-policy', 'strict-transport-security', 'x-frame-options', 'x-xss-protection'):
            s[prefixo + 'hdr:' + kl] = v
    for c in re.findall(r'<!--(.*?)-->', html, flags=re.S):
        c = re.sub(r'\s+', ' ', c).strip()[:80]
        if c: s.setdefault(prefixo + 'comentario', set()).add(c)
    m = re.search(r'<meta name="generator" content="([^"]*)"', html)
    if m: s[prefixo + 'generator'] = m.group(1)
    for src in re.findall(r'<script[^>]+src="([^"]+)"', html):
        if src.startswith('http'):
            s.setdefault(prefixo + 'script_externo', set()).add(re.sub(r'\?.*', '', src))
    for href in re.findall(r'<link[^>]+href="(https?://[^"]+)"', html):
        dom = re.sub(r'^https?://([^/]+).*', r'\1', href)
        s.setdefault(prefixo + 'link_externo_dominio', set()).add(dom)
    for pub in re.findall(r'ca-pub-\d+', html): s.setdefault(prefixo + 'adsense', set()).add(pub)
    for ga in re.findall(r'\b(G-[A-Z0-9]{6,}|UA-\d+-\d+|GTM-[A-Z0-9]+)\b', html): s.setdefault(prefixo + 'analytics', set()).add(ga)
    for ld in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, flags=re.S):
        try:
            d = json.loads(ld)
        except Exception:
            continue
        def forma(o):
            if isinstance(o, dict): return '{' + ','.join(sorted(k + ('=' + forma(o[k]) if isinstance(o[k], (dict, list)) else '') for k in o)) + '}'
            if isinstance(o, list): return '[' + (forma(o[0]) if o else '') + ']'
            return ''
        tipos = re.findall(r'"@type":\s*"([^"]+)"', ld)
        s.setdefault(prefixo + 'jsonld_tipos', set()).add(','.join(sorted(set(tipos))))
        s.setdefault(prefixo + 'jsonld_forma', set()).add(h(forma(d)))
    classes = set(re.findall(r'class="([^"]+)"', html))
    cls = set()
    for c in classes: cls.update(c.split())
    s[prefixo + '_classes'] = cls
    fontes = set(re.findall(r"font-family:\s*([^;}]+)", html))
    s[prefixo + 'fontes'] = ';'.join(sorted(f.strip().strip("'\"").split(',')[0].strip("'\" ") for f in fontes))[:120]
    css = ''.join(re.findall(r'<style[^>]*>(.*?)</style>', html, flags=re.S))
    s[prefixo + 'css_inline_hash'] = h(re.sub(r'\s+', '', css)) if css else '(sem css inline)'
    # estrutura do DOM sem atributos: sequencia de tags
    tags = re.findall(r'<(/?[a-z][a-z0-9]*)', html)
    s[prefixo + 'dom_forma'] = h(' '.join(tags))
    s[prefixo + 'dom_tags_qtd'] = str(len(tags) // 50 * 50)
    return s

def audita(dom):
    r = {'dominio': dom, 'sinais': {}}
    st, hd, html, url = get('https://' + dom + '/')
    if st != 200:
        r['erro'] = 'home %s' % st
        return r
    base = re.sub(r'(https?://[^/]+).*', r'\1', url)
    r['base'] = base
    S = r['sinais']
    S.update(sinais_pagina(html, hd, 'home:'))
    S['home:title_sufixo'] = (re.search(r'<title>(.*?)</title>', html, flags=re.S) or [None, ''])[1].split('|')[-1].strip()[:40] if '|' in (re.search(r'<title>(.*?)</title>', html, flags=re.S) or [None, ''])[1] else '(sem |)'
    fav = re.search(r'<link[^>]+rel="(?:shortcut )?icon"[^>]+href="([^"]+)"', html)
    if fav:
        st2, _, fb, _ = get(base + '/' + fav.group(1).lstrip('/') if not fav.group(1).startswith('http') else fav.group(1))
        S['favicon_hash'] = h(fb) if st2 == 200 else 'erro'
    # textos fixos da home: rodape, banner de cookies, busca
    foot = re.search(r'<footer.*?</footer>', html, flags=re.S)
    if foot:
        ft = texto(foot.group(0))
        ft = re.sub(r'\b(19|20)\d\d\b', 'ANO', ft)
        S['home:rodape_frases'] = set(fr.strip() for fr in re.split(r'[.|]', ft) if 12 < len(fr.strip()) < 90)
    for ph in re.findall(r'placeholder="([^"]+)"', html): S.setdefault('home:placeholder', set()).add(ph)
    for bt in re.findall(r'<button[^>]*>(.*?)</button>', html, flags=re.S):
        bt = texto(bt)
        if bt: S.setdefault('home:botao', set()).add(bt[:40])
    # links institucionais do rodape
    inst = {}
    for href, txt in re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', foot.group(0) if foot else html, flags=re.S):
        t = texto(txt).lower()
        if any(k in t for k in ('sobre', 'quem somos', 'contato', 'privacidade', 'termos', 'equipe', 'editorial', 'expediente')):
            inst[t[:30]] = href
    S['home:links_institucionais'] = set(inst.keys())
    for nome, href in list(inst.items())[:5]:
        u = href if href.startswith('http') else base + '/' + href.lstrip('/')
        st3, hd3, h3, _ = get(u)
        if st3 == 200:
            t = texto(re.search(r'<main.*?</main>|<article.*?</article>', h3, flags=re.S).group(0) if re.search(r'<main.*?</main>|<article.*?</article>', h3, flags=re.S) else h3)
            frases = set(fr.strip() for fr in re.split(r'[.!?]', t) if 25 < len(fr.strip()) < 160)
            S['inst:' + nome[:14] + ':frases'] = frases
    # artigo
    st4, _, sm, _ = get(base + '/sitemap.xml')
    urls = re.findall(r'<loc>(.*?)</loc>', sm)
    # artigo de verdade: o ultimo do sitemap que nao e pagina do motor (autor, equipe,
    # editoria, institucional). Antes pegava o primeiro, que era a pagina de autor.
    EXCL = r'/(categoria|category|sobre|contato|equipe|politica|termos|quem-somos|busca|autor|indice|sumario|mapa|linha-editorial|compromisso|privacidade|aviso|expediente|ferramentas|tag)'
    cands = [u for u in urls if u.rstrip('/') != base and not re.search(EXCL, u) and re.search(r'/[a-z0-9-]{12,}/?$', u)]
    art = cands[-1] if cands else None
    if art:
        st5, hd5, ha, _ = get(art)
        if st5 == 200:
            S.update(sinais_pagina(ha, hd5, 'artigo:'))
            for hh in re.findall(r'<h[23][^>]*>(.*?)</h[23]>', ha, flags=re.S):
                tt = texto(hh)
                if tt.lower() in ('leia também', 'veja também', 'relacionados', 'artigos relacionados', 'mais lidos', 'últimas', 'compartilhe', 'siga', 'sobre o autor', 'perguntas frequentes'):
                    S.setdefault('artigo:secoes', set()).add(tt)
            m = re.search(r'<article.*?</article>', ha, flags=re.S)
            if m: S['artigo:dom_article'] = h(' '.join(re.findall(r'<(/?[a-z][a-z0-9]*)', m.group(0))))
    # pagina de autor e de contato: esqueleto do <main> (tags, sem conteudo) e o que a
    # rede tinha igual em 27 e 25 portais; o esqueleto agora varia por portal
    for nome, u in (('autor', next((u for u in urls if '/autor/' in u), None)), ('contato', next((u for u in urls if re.search(r'/(contato|fale)[a-z-]*/?$', u)), None))):
        if not u: continue
        st9, _, h9, _ = get(u)
        m9 = re.search(r'<main.*?</main>', h9, flags=re.S)
        if st9 == 200 and m9:
            tags9 = re.findall(r'<(/?[a-z][a-z0-9]*)', m9.group(0))
            S[nome + ':esqueleto'] = h(' '.join(tags9[:14]))   # so o topo: o miolo e conteudo
    # robots, 404, 410
    st6, _, rb, _ = get(base + '/robots.txt')
    S['robots_hash'] = h(re.sub(r'https?://[^\s]+', 'URL', rb)) if st6 == 200 else 'erro'
    st7, hd7, h7, _ = get(base + '/pagina-que-nao-existe-xq9/')
    S['404:status'] = str(st7)
    S['404:texto'] = h(texto(h7)[:400]) if h7 else 'vazio'
    S['404:frases'] = set(fr.strip() for fr in re.split(r'[.!?]', texto(re.search(r'<main.*?</main>', h7, flags=re.S).group(0) if re.search(r'<main.*?</main>', h7, flags=re.S) else h7)) if 15 < len(fr.strip()) < 120)
    st8, hd8, h8, _ = get(base + '/wp-content/uploads/x.jpg')
    S['410:status'] = str(st8)
    S['410:texto'] = texto(h8)[:120]
    # classes: comparadas depois, entre portais
    return r

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    minimo = int(sys.argv[sys.argv.index('--min') + 1]) if '--min' in sys.argv else 5
    saida = sys.argv[sys.argv.index('--md') + 1] if '--md' in sys.argv else None
    doms = [l.strip() for l in open(args[0], encoding='utf-8') if l.strip() and not l.startswith('#')] if args else sys.stdin.read().split()
    with ThreadPoolExecutor(12) as ex:
        res = list(ex.map(audita, doms))
    ok = [r for r in res if 'erro' not in r]
    print('portais auditados:', len(ok), '| erro:', [(r['dominio'], r['erro']) for r in res if 'erro' in r])
    # valores repetidos
    rep = defaultdict(lambda: defaultdict(list))
    for r in ok:
        for k, v in r['sinais'].items():
            if k.endswith('_classes'): continue
            vals = v if isinstance(v, set) else {v}
            for x in vals:
                rep[k][x].append(r['dominio'])
    linhas = []
    for k in sorted(rep):
        for x, ds in sorted(rep[k].items(), key=lambda kv: -len(kv[1])):
            if len(ds) >= minimo:
                linhas.append((k, x, ds))
    # classes CSS compartilhadas entre portais (Jaccard por par e classes presentes em muitos)
    cont = Counter()
    for r in ok:
        for c in r['sinais'].get('home:_classes', set()): cont[c] += 1
    comuns = [(c, n) for c, n in cont.most_common() if n >= minimo]
    out = []
    out.append('# Footprint da rede no Cloudflare Pages\n')
    out.append('%d portais auditados. Lista: todo valor igual em pelo menos %d portais.\n' % (len(ok), minimo))
    out.append('\n## Valores repetidos\n')
    out.append('| sinal | valor | portais |\n|---|---|---|')
    for k, x, ds in linhas:
        out.append('| %s | %s | %d: %s |' % (k, str(x).replace('|', '\\|')[:110], len(ds), ' '.join(ds[:6]) + (' ...' if len(ds) > 6 else '')))
    out.append('\n## Classes CSS presentes em muitos portais\n')
    out.append('| classe | portais |\n|---|---|')
    for c, n in comuns[:80]: out.append('| `%s` | %d |' % (c, n))
    txt = '\n'.join(out)
    if saida:
        open(saida, 'w', encoding='utf-8').write(txt)
        print('relatorio em', saida, '| linhas repetidas:', len(linhas), '| classes comuns:', len(comuns))
    else:
        print(txt)
    json.dump([{**r, 'sinais': {k: (sorted(v) if isinstance(v, set) else v) for k, v in r.get('sinais', {}).items()}} for r in res], open((saida or 'footprint') + '.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    main()
