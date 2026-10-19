#!/usr/bin/env python3
"""Expande um sitemap (index ou urlset, recursivo) e imprime todas as URLs.

Uso:  python sitemap_urls.py https://notebookx.com.br/sitemap-index.xml > todas.txt
Para o ebookcult use https://ebookcult.com.br/sitemap-diretorio.xml
"""
import re, sys, time, urllib.request

UA = "Mozilla/5.0 (compatible; qmix-static-export/1.0)"

def get(url):
    for _ in range(3):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60).read().decode("utf-8", "replace")
        except Exception as e:
            err = e; time.sleep(3)
    print("ERRO", url, err, file=sys.stderr); return ""

def expand(url, seen):
    if url in seen:
        return
    seen.add(url)
    xml = get(url)
    locs = [l.strip() for l in re.findall(r"<loc>\s*([^<]+?)\s*</loc>", xml)]
    if "<sitemapindex" in xml:
        for l in locs:
            expand(l, seen)
    else:
        for l in locs:
            print(l.replace("&amp;", "&"))

if __name__ == "__main__":
    expand(sys.argv[1], set())
