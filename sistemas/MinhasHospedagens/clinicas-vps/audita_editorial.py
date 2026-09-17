# -*- coding: utf-8 -*-
"""Auditoria do pacote editorial e das regras institucionais, portal a portal.

Roda direto no servidor, lendo o HTML publicado, para nao depender de cache.
"""
import io, json, os, re, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
CFG = json.load(io.open('/opt/portal-engine/sites.json', encoding='utf-8'))
SITES = CFG if isinstance(CFG, list) else CFG['sites']

def ler(slug, *partes):
    p = os.path.join('/srv/portais', slug, 'public', *partes, 'index.html')
    try:
        return io.open(p, encoding='utf-8').read()
    except Exception:
        return None

print("%-22s %-4s %-4s %-4s %-5s %-5s %-4s %-4s %-4s %-4s %-4s" % (
    "portal", "qsm", "eqp", "pol", "autor", "avat", "ogh", "lgp", "auth", "prof", "trv"))
print("-" * 86)
resumo = {}
for v in SITES:
    slug = v['slug']
    home = ler(slug)
    if home is None:
        continue
    eq = ler(slug, 'equipe')
    qs = ler(slug, 'quem-somos')
    pol = ler(slug, 'politica-editorial')
    autores = [e for e in (v.get('equipe') or [])]
    paut = [ler(slug, 'autor', e['slug']) for e in autores]
    paut = [x for x in paut if x]
    # avatar: imagem dentro da pagina de autor ou da equipe
    avat = 0
    for x in paut + ([eq] if eq else []):
        if re.search(r'<img[^>]+(avatar|autor|equipe)', x or '', re.I):
            avat = 1
            break
    ogh = 1 if home and 'og:image' in home else 0
    lgp = 1 if home and re.search(r'cookie_consent|Apenas necess', home) else 0
    # assinatura clicavel com rel=author num artigo qualquer
    # o artigo de amostra sai da propria base de dados do portal, e nao de um
    # os.walk: caminhando pelo disco o script caia em pagina institucional e
    # dava falso negativo de rel=author
    import glob as _g
    art, faltando = None, 0
    for f in sorted(_g.glob('/srv/portais/%s/data/*.json' % slug))[:400]:
        try:
            d = json.load(io.open(f, encoding='utf-8'))
        except Exception:
            continue
        cat = (d.get('category') or {}).get('slug') or 'noticias'
        for cam in ('/srv/portais/%s/public/%s/%s/index.html' % (slug, cat, d.get('slug')),
                    '/srv/portais/%s/public/%s/index.html' % (slug, d.get('slug'))):
            if os.path.exists(cam):
                h = io.open(cam, encoding='utf-8').read()
                art = art or h
                if 'rel="author"' not in h:
                    faltando += 1
                break
    auth = 1 if (art and not faltando) else 0
    prof = 1 if paut and 'ProfilePage' in (paut[0] or '') else 0
    cont = ler(slug, 'contato')
    trv = 1 if cont and '\u2014' in re.sub(r'<[^>]+>', ' ', cont) else 0
    resumo[slug] = dict(qsm=bool(qs), eqp=bool(eq), pol=bool(pol), autor=len(paut),
                        avat=avat, ogh=ogh, lgp=lgp, auth=auth, prof=prof, trv=trv,
                        equipe=len(autores))
    print("%-22s %-4s %-4s %-4s %-5s %-5s %-4s %-4s %-4s %-4s %-4s" % (
        slug, 'sim' if qs else 'NAO', 'sim' if eq else 'NAO', 'sim' if pol else 'NAO',
        '%d/%d' % (len(paut), len(autores)), 'sim' if avat else 'NAO',
        'sim' if ogh else 'NAO', 'sim' if lgp else 'NAO',
        'sim' if auth else 'NAO', 'sim' if prof else 'NAO', 'TEM' if trv else '-'))

io.open('/tmp/audit_editorial.json', 'w', encoding='utf-8').write(json.dumps(resumo, ensure_ascii=False, indent=1))
print()
print("legenda: qsm=quem-somos eqp=equipe pol=politica-editorial autor=paginas/assinaturas")
print("         avat=avatar nas paginas de autor  ogh=og:image na home  lgp=banner LGPD")
print("         auth=rel=author no artigo  prof=ProfilePage no schema  trv=travessao no contato")
