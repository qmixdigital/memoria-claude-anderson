#!/usr/bin/env python3
"""Congela tendenciasmarketing.news (Next na opengravity) em HTML estatico p/ Cloudflare Pages.

Uso:  python 04_tendencias_mirror.py SAIDA_DIR
- parte do sitemap + home e segue links internos (mesmo dominio)
- grava cada pagina como <caminho>/index.html
- baixa /_next/static/*, /favicon, imagens locais e fontes citadas no CSS
- reescreve /_next/image?url=X&w=..  para a imagem original X (baixada se local)
- remove srcset de _next/image (deixa so o src)
- gera _redirects (www -> apex) e copia a 404 do proprio site para 404.html
"""
import os, re, sys, time, urllib.parse, urllib.request, html

BASE = "https://tendenciasmarketing.news"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
OUT = sys.argv[1] if len(sys.argv) > 1 else "tendencias-static"
SKIP_PREFIX = ("/api/", "/admin", "/painel", "/login", "/dashboard")

def get(url):
    for i in range(3):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=40)
            return r.status, r.read(), r.headers.get("content-type", "")
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return 404, e.read(), e.headers.get("content-type", "")
            time.sleep(2)
        except Exception:
            time.sleep(2)
    return 0, b"", ""

def save(path, data):
    path = urllib.parse.unquote(path.split("?")[0].split("#")[0])
    full = os.path.join(OUT, path.lstrip("/"))
    if path.endswith("/") or path == "":
        full = os.path.join(full, "index.html")
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "wb") as f:
        f.write(data)

assets = set()
def fix_next_image(m):
    q = urllib.parse.parse_qs(urllib.parse.urlparse(html.unescape(m.group(0))).query)
    src = q.get("url", [""])[0]
    if src.startswith("/"):
        assets.add(src)
    return src

def process_html(txt):
    txt = re.sub(r'/_next/image\?url=[^"\'\s,]+', fix_next_image, txt)
    # srcset de next/image vira lixo apos reescrita: remove
    txt = re.sub(r'\s(?:srcSet|srcset|imageSrcSet|imagesrcset)="[^"]*"', "", txt)
    for a in re.findall(r'(?:src|href)="(/[^"#]+)"', txt):
        if a.startswith("/_next/") or re.search(r"\.(png|jpe?g|webp|avif|gif|svg|ico|css|js|woff2?|xml|txt|webmanifest)$", a.split("?")[0]):
            assets.add(html.unescape(a))
    return txt

def main():
    os.makedirs(OUT, exist_ok=True)
    queue, seen = ["/"], set()
    _, sm, _ = get(BASE + "/sitemap.xml")
    for loc in re.findall(rb"<loc>([^<]+)</loc>", sm):
        u = urllib.parse.urlparse(loc.decode().strip())
        queue.append(u.path or "/")
    while queue:
        p = queue.pop(0)
        if p in seen or p.startswith(SKIP_PREFIX):
            continue
        seen.add(p)
        st, body, ct = get(BASE + p)
        if st != 200 or "html" not in ct:
            print("  !", st, p); continue
        txt = process_html(body.decode("utf-8", "replace"))
        save(p if p.endswith("/") else p + "/", txt.encode())
        for href in re.findall(r'href="(/[^"#?]*)"', txt):
            if href not in seen and not re.search(r"\.\w{2,5}$", href) and not href.startswith("/_next"):
                queue.append(href)
        print(len(seen), p)
    # assets (e fontes/urls dentro do CSS)
    done = set()
    while assets - done:
        a = (assets - done).pop(); done.add(a)
        st, body, ct = get(BASE + a)
        if st != 200:
            print("  ! asset", st, a); continue
        if a.split("?")[0].endswith(".css"):
            for u in re.findall(rb"url\((/[^)\"']+)\)", body):
                assets.add(u.decode())
        save(a, body)
    for extra in ("/robots.txt", "/sitemap.xml", "/favicon.ico", "/manifest.webmanifest"):
        st, body, _ = get(BASE + extra)
        if st == 200:
            save(extra, body.replace(b"https://www.tendenciasmarketing.news", BASE.encode()))
    st, body, _ = get(BASE + "/pagina-que-nao-existe-404-teste")
    save("/404.html", process_html(body.decode("utf-8", "replace")).encode())
    with open(os.path.join(OUT, "_redirects"), "w") as f:
        f.write("https://www.tendenciasmarketing.news/* https://tendenciasmarketing.news/:splat 301\n")
    with open(os.path.join(OUT, "_headers"), "w") as f:
        f.write("/_next/static/*\n  Cache-Control: public, max-age=31536000, immutable\n")
    print("paginas:", len(seen), "assets:", len(done))

if __name__ == "__main__":
    main()
