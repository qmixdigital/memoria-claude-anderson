# -*- coding: utf-8 -*-
"""Rastreia as URLs do sitemap de um site e extrai sinais on-page para auditoria.

Uso: python crawl_site.py DOMINIO SAIDA.json [--delay 0.4]
Le sitemap.xml (ou index) e grava uma lista de dicts por URL.
"""
import sys, re, json, time, argparse, html, os
from urllib.parse import urljoin, urlparse
import requests

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36")
H = {"User-Agent": UA, "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
     "Accept-Language": "pt-BR,pt;q=0.9"}


def get(url, timeout=40):
    r = requests.get(url, headers=H, timeout=timeout, allow_redirects=True)
    if "charset" not in (r.headers.get("content-type") or "").lower():
        r.encoding = "utf-8"  # WordPress sem charset no header: requests chuta latin-1 e gera mojibake
    return r


def sitemap_urls(dom):
    seen, out, fila = set(), [], []
    r = get("https://%s/robots.txt" % dom)
    for m in re.findall(r"(?im)^sitemap:\s*(\S+)", r.text if r.ok else ""):
        fila.append(m)
    for c in ("sitemap_index.xml", "sitemap.xml", "wp-sitemap.xml", "sitemaps.xml"):
        fila.append("https://%s/%s" % (dom, c))
    while fila:
        u = fila.pop(0)
        if u in seen:
            continue
        seen.add(u)
        try:
            r = get(u)
        except Exception:
            continue
        if not r.ok or "<" not in r.text[:200]:
            continue
        locs = re.findall(r"<loc>\s*(.*?)\s*</loc>", r.text, re.S)
        for x in locs:
            x = html.unescape(x)
            if "<sitemapindex" in r.text or re.search(r"\.xml/?$", x):
                fila.append(x)  # sitemap aninhado (inclusive listado como <url> no sitemap principal)
            elif x not in out:
                out.append(x)
    return out


def strip_tags(s):
    s = re.sub(r"<script.*?</script>|<style.*?</style>|<noscript.*?</noscript>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    return html.unescape(re.sub(r"\s+", " ", s)).strip()


def corpo(h):
    """Tenta isolar o conteudo principal (article/main/entry-content)."""
    for pat in (r"<article[^>]*>(.*?)</article>", r"<main[^>]*>(.*?)</main>",
                r'class="[^"]*entry-content[^"]*"[^>]*>(.*?)<footer', r"<body[^>]*>(.*?)</body>"):
        m = re.search(pat, h, re.S | re.I)
        if m and len(strip_tags(m.group(1)).split()) > 50:
            return m.group(1)
    return h


def analisar(url, dom, h, status, final_url, elapsed):
    def meta(name, attr="name"):
        m = re.search(r'<meta[^>]+%s=["\']%s["\'][^>]+content=["\'](.*?)["\']' % (attr, re.escape(name)), h, re.I | re.S)
        if not m:
            m = re.search(r'<meta[^>]+content=["\'](.*?)["\'][^>]+%s=["\']%s["\']' % (attr, re.escape(name)), h, re.I | re.S)
        return html.unescape(m.group(1)).strip() if m else ""
    t = re.search(r"<title[^>]*>(.*?)</title>", h, re.S | re.I)
    title = html.unescape(t.group(1)).strip() if t else ""
    canon = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\'](.*?)["\']', h, re.I)
    canon = canon.group(1) if canon else ""
    hs = {k: [strip_tags(x) for x in re.findall(r"<%s[^>]*>(.*?)</%s>" % (k, k), h, re.S | re.I)] for k in ("h1", "h2", "h3")}
    body = corpo(h)
    texto = strip_tags(body)
    palavras = len(texto.split())
    links_in, links_out = [], []
    for m in re.finditer(r'<a\s+([^>]*?)href=["\']([^"\'#]+)[^"\']*["\']([^>]*)>(.*?)</a>', body, re.S | re.I):
        href = html.unescape(m.group(2)).strip()
        attrs = m.group(1) + m.group(3)
        anc = strip_tags(m.group(4))[:80]
        rel = re.search(r'rel=["\']([^"\']+)', attrs, re.I)
        rel = rel.group(1) if rel else ""
        if href.startswith(("mailto:", "tel:", "javascript:", "whatsapp:")):
            continue
        absu = urljoin(url, href)
        host = urlparse(absu).netloc.lower().replace("www.", "")
        if host == dom:
            if "/wp-content/" in absu or "/feed" in absu:
                continue
            links_in.append({"href": absu.split("?")[0], "anchor": anc})
        elif host:
            links_out.append({"href": absu, "anchor": anc, "rel": rel, "host": host})
    imgs = re.findall(r"<img\s[^>]*>", body, re.I)
    sem_alt = sum(1 for i in imgs if not re.search(r'alt=["\'][^"\']+["\']', i, re.I))
    schema = sorted(set(re.findall(r'"@type"\s*:\s*"([^"]+)"', h)))
    return {
        "url": url, "status": status, "final_url": final_url, "ms": int(elapsed * 1000),
        "title": title, "title_len": len(title), "meta_desc": meta("description"), "meta_desc_len": len(meta("description")),
        "robots": meta("robots"), "canonical": canon, "og_title": meta("og:title", "property"),
        "og_image": meta("og:image", "property"), "published": meta("article:published_time", "property"),
        "modified": meta("article:modified_time", "property"),
        "h1": hs["h1"], "h2": hs["h2"][:40], "n_h2": len(hs["h2"]), "n_h3": len(hs["h3"]),
        "palavras": palavras, "links_internos": links_in, "links_externos": links_out,
        "n_imgs": len(imgs), "imgs_sem_alt": sem_alt, "schema": schema,
        "html_kb": len(h) // 1024,
        "primeiro_link": (links_in + links_out and sorted(links_in + links_out, key=lambda x: body.find(x["href"].replace("https://" + dom, "")) if x in links_in else body.find(x["href"]))[0].get("href")) or "",
    }


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("dominio"); ap.add_argument("saida"); ap.add_argument("--delay", type=float, default=0.4)
    ap.add_argument("--merge", action="store_true", help="mantem o que ja esta na saida e rastreia so as URLs novas")
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    dom = a.dominio.replace("https://", "").replace("http://", "").strip("/").replace("www.", "")
    urls = sitemap_urls(dom)
    print("sitemap:", len(urls), "urls")
    out = []
    if a.merge and os.path.exists(a.saida):
        out = json.load(open(a.saida, encoding="utf-8"))
        feitas = {c["url"] for c in out}
        urls = [u for u in urls if u not in feitas]
        print("novas:", len(urls))
    for i, u in enumerate(urls, 1):
        try:
            t0 = time.time(); r = get(u); el = time.time() - t0
            out.append(analisar(u, dom, r.text, r.status_code, r.url, el))
        except Exception as e:
            out.append({"url": u, "status": 0, "erro": str(e)})
        if i % 20 == 0:
            print(i, "/", len(urls))
        time.sleep(a.delay)
    json.dump(out, open(a.saida, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("gravado", a.saida)
