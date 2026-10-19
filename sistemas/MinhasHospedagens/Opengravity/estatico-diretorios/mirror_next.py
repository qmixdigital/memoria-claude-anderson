#!/usr/bin/env python3
"""Congela um app Next em HTML estatico a partir de uma lista de caminhos.

Roda NA opengravity e busca direto na porta do app (sem passar pelo Cloudflare,
sem rate limit e sem gastar banda). Todos os apps tem trailingSlash: true, entao
cada pagina vira <caminho>/index.html.

Uso:
  python3 mirror_next.py --dominio notebookx.com.br --porta 3025 \
      --lista congelar.txt --saida /srv/static/notebookx.com.br [--workers 4]

O que faz em cada pagina:
  - /_next/image?url=X&w=..  -> X (e baixa X se for local); remove srcset
  - remove <form>...</form> (busca, newsletter, comentario, contato: precisam de servidor)
  - remove <a> que apontam para rotas que deixam de existir (painel, login, etc.)
  - junta todos os assets citados (/_next/static, imagens, fontes do CSS) e baixa
No fim: robots.txt, ads.txt, favicons, manifest, rss.xml, 404.html e sitemap.xml
novo (so com as paginas congeladas, quebrado em arquivos de 40 mil).
Pode ser interrompido e rodado de novo: pula pagina que ja existe na saida.
"""
import argparse, html, os, re, sys, threading, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor

MORTAS = r"/(?:painel|admin|admin-diretorio|painel-diretorio|login|cadastrar|cadastro-livraria|precos|newsletter|busca|esqueci-senha|reset-senha|contato|remocao-diretorio)(?:/[^\"']*)?|[^\"']*/reivindicar/?"
RE_LINK_MORTO = re.compile(r'<a\b[^>]*href="(?:' + MORTAS + r')"[^>]*>.*?</a>', re.S)
RE_FORM = re.compile(r"<form\b.*?</form>", re.S | re.I)
RE_NEXT_IMG = re.compile(r'/_next/image/?\?url=[^"\'\s,]+')   # com trailingSlash o Next gera /_next/image/?url=
RE_SRCSET = re.compile(r'\s(?:srcSet|srcset|imageSrcSet|imagesrcset)="[^"]*"')
RE_ASSET = re.compile(r'(?:src|href)="(/[^"#]+)"')
ASSET_EXT = re.compile(r"\.(png|jpe?g|webp|avif|gif|svg|ico|css|js|woff2?|ttf|otf|mp4|webm|pdf|json|webmanifest)$", re.I)

lock = threading.Lock()
assets = set()
CONGELADAS = set()      # caminhos que vao existir no estatico
PODAVEL = None          # regex: link interno que casa e NAO esta em CONGELADAS vira texto
RE_A = re.compile(r'<a\s[^>]*?href="(/[^"#?]*)[^"]*"[^>]*>(.*?)</a>', re.S)

def desfaz_link(m):
    alvo = m.group(1)
    if not alvo.endswith("/") and "." not in alvo.rsplit("/", 1)[-1]:
        alvo += "/"
    if PODAVEL and PODAVEL.search(alvo):
        href = re.search(r'href="([^"]*)"', m.group(0)).group(1)
        # pagina podada, ou filtro por query string (?seg=...) que o estatico nao executa
        if alvo not in CONGELADAS or "?" in href:
            return m.group(2)      # mantem o texto, tira o link
    return m.group(0)

def fetch(a, path):
    path = urllib.parse.quote(path, safe="/%?=&:@+,;~!*()'")      # nome com ® ™ etc. nao vai cru para o urllib
    req = urllib.request.Request(f"http://127.0.0.1:{a.porta}{path}", headers={
        "Host": a.dominio, "X-Forwarded-Proto": "https", "X-Forwarded-Host": a.dominio,
        "User-Agent": "Mozilla/5.0 (compatible; qmix-static-export/1.0)"})
    for i in range(4):
        try:
            r = urllib.request.urlopen(req, timeout=90)
            return r.status, r.read(), r.headers.get("content-type", "")
        except urllib.error.HTTPError as e:
            if e.code in (404, 410):
                return e.code, e.read(), e.headers.get("content-type", "")
            if e.code in (301, 302, 307, 308):
                return e.code, b"", e.headers.get("location", "")
            time.sleep(2 * (i + 1))
        except Exception:
            time.sleep(2 * (i + 1))
    return 0, b"", ""

def dest(a, path):
    p = urllib.parse.unquote(path.split("?")[0].split("#")[0])
    full = os.path.join(a.saida, p.lstrip("/"))
    if p.endswith("/"):
        full = os.path.join(full, "index.html")
    return full

def write(full, data):
    os.makedirs(os.path.dirname(full), exist_ok=True)
    tmp = full + ".tmp"
    with open(tmp, "wb") as f:
        f.write(data)
    os.replace(tmp, full)

def fix_img(m):
    q = urllib.parse.parse_qs(urllib.parse.urlparse(html.unescape(m.group(0))).query)
    src = q.get("url", [""])[0]
    if src.startswith("/"):
        with lock:
            assets.add(src)
    return src

def process(txt):
    txt = RE_NEXT_IMG.sub(fix_img, txt)
    txt = RE_SRCSET.sub("", txt)
    txt = RE_FORM.sub("", txt)
    txt = RE_LINK_MORTO.sub("", txt)
    if PODAVEL:
        txt = RE_A.sub(desfaz_link, txt)
    found = {html.unescape(x) for x in RE_ASSET.findall(txt)
             if x.startswith("/_next/static/") or ASSET_EXT.search(x.split("?")[0])}
    with lock:
        assets.update(found)
    return txt

stats = {"ok": 0, "pulada": 0, "erro": 0}
def do_page(a, path):
    full = dest(a, path)
    if os.path.exists(full):
        stats["pulada"] += 1
        # ainda precisa registrar os assets dessa pagina
        process(open(full, encoding="utf-8", errors="replace").read())
        return
    st, body, ct = fetch(a, path)
    if st != 200 or "html" not in ct:
        stats["erro"] += 1
        print(f"  ! {st} {path} {ct if st in (301,302,307,308) else ''}", file=sys.stderr)
        return
    write(full, process(body.decode("utf-8", "replace")).encode("utf-8"))
    stats["ok"] += 1
    n = stats["ok"] + stats["pulada"]
    if n % 500 == 0:
        print(f"{n} paginas ({stats['erro']} erros)", file=sys.stderr)

def do_asset(a, path):
    full = dest(a, path)
    if os.path.exists(full):
        return []
    st, body, ct = fetch(a, path)
    if st != 200:
        print(f"  ! asset {st} {path}", file=sys.stderr)
        return []
    write(full, body)
    novos = []
    if path.split("?")[0].endswith(".css"):
        base = path.rsplit("/", 1)[0]
        for u in re.findall(rb"url\(\s*['\"]?([^)'\"]+)['\"]?\s*\)", body):
            u = u.decode()
            if u.startswith(("data:", "http", "#", "%23")):
                continue
            novos.append(u if u.startswith("/") else urllib.parse.urljoin(base + "/", u))
    return novos

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dominio", required=True)
    ap.add_argument("--porta", required=True, type=int)
    ap.add_argument("--lista", required=True)
    ap.add_argument("--saida", required=True)
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--podavel", default="", help="mesma regex do montar_lista; links para paginas podadas viram texto")
    ap.add_argument("--sitemap-nome", default="sitemap", help="ebookcult: sitemap-diretorio (o portal ja tem sitemap.xml)")
    a = ap.parse_args()
    paths = [l.strip() for l in open(a.lista, encoding="utf-8") if l.strip() and not l.startswith("#")]
    global PODAVEL
    CONGELADAS.update(paths)
    PODAVEL = re.compile(a.podavel) if a.podavel else None
    print(f"{len(paths)} paginas para {a.saida}", file=sys.stderr)
    with ThreadPoolExecutor(a.workers) as ex:
        list(ex.map(lambda p: do_page(a, p), paths))
    feitos = set()
    while assets - feitos:
        lote = list(assets - feitos)
        feitos.update(lote)
        with ThreadPoolExecutor(a.workers) as ex:
            for novos in ex.map(lambda p: do_asset(a, p), lote):
                assets.update(novos)
    for extra in ("/robots.txt", "/ads.txt", "/favicon.ico", "/favicon.svg", "/apple-touch-icon.png",
                  "/manifest.webmanifest", "/site.webmanifest", "/rss.xml"):
        st, body, _ = fetch(a, extra)
        if st == 200:
            if extra == "/robots.txt":
                linha = f"\n\nSitemap: https://{a.dominio}/{a.sitemap_nome}.xml\n"
                body = re.sub(rb"(?im)^sitemap:.*$", b"", body).rstrip() + linha.encode()
            write(dest(a, extra), body)
    st, body, _ = fetch(a, "/pagina-inexistente-404-export/")
    write(os.path.join(a.saida, "404.html"), process(body.decode("utf-8", "replace")).encode("utf-8"))
    # sitemap novo: so o que foi congelado
    ok = [p for p in paths if os.path.exists(dest(a, p))]
    partes = [ok[i:i + 40000] for i in range(0, len(ok), 40000)]
    for i, parte in enumerate(partes, 1):
        corpo = "".join(f"<url><loc>https://{a.dominio}{html.escape(p)}</loc></url>" for p in parte)
        write(os.path.join(a.saida, f"{a.sitemap_nome}-{i}.xml"),
              f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{corpo}</urlset>'.encode())
    idx = "".join(f"<sitemap><loc>https://{a.dominio}/{a.sitemap_nome}-{i}.xml</loc></sitemap>" for i in range(1, len(partes) + 1))
    write(os.path.join(a.saida, f"{a.sitemap_nome}.xml"),
          f'<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{idx}</sitemapindex>'.encode())
    print(f"fim: {stats} | assets {len(feitos)} | sitemap {len(ok)} urls em {len(partes)} arquivos", file=sys.stderr)

if __name__ == "__main__":
    main()
