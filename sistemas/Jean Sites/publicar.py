#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Publicacao direta em sites WordPress (sem MCP) + aviso no bot do Telegram.

Le as credenciais do site em sites.json, sobe a imagem, cria o post e avisa no
Telegram com "Anderson publicou em <site>".

Uso:
  python publicar.py --site slug --titulo "..." --html artigo.html \
    [--imagem img.webp] [--alt "..."] [--legenda "..."] \
    [--categoria 1] [--tags "a, b"] [--slug slug-url] [--resumo "..."] \
    [--status publish|draft|pending] [--agendar 2026-09-10T12:00:00]

Ver PUBLICACAO-DIRETA.md para detalhes.
"""
import argparse
import base64
import json
import os
import sys
import urllib.request
import urllib.error
import urllib.parse

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")

# Bot do Telegram (@qmixparceiros_bot) - avisos de "Anderson publicou"
TELEGRAM_TOKEN = "<<REMOVIDO>>"
TELEGRAM_CHAT_ID = "<<REMOVIDO>>"

AQUI = os.path.dirname(os.path.abspath(__file__))


def carregar_site(slug):
    caminho = os.path.join(AQUI, "sites.json")
    if not os.path.exists(caminho):
        sys.exit("sites.json nao encontrado. Crie a partir de sites.exemplo.json.")
    with open(caminho, encoding="utf-8") as f:
        sites = json.load(f)
    for s in sites:
        if s.get("slug") == slug:
            return s
    sys.exit(f"Site '{slug}' nao esta em sites.json. Slugs: "
             + ", ".join(s.get("slug", "?") for s in sites))


def auth_header(site):
    raw = f"{site['usuario']}:{site['senha_app']}".encode("utf-8")
    return "Basic " + base64.b64encode(raw).decode("ascii")


def req(site, metodo, path, corpo=None, content_type="application/json", binario=False):
    url = f"{site['url'].rstrip('/')}/wp-json/wp/v2{path}"
    headers = {"Authorization": auth_header(site), "User-Agent": UA,
               "Accept": "application/json"}
    data = None
    if corpo is not None:
        if binario:
            headers["Content-Type"] = content_type
            data = corpo
        else:
            headers["Content-Type"] = "application/json"
            data = json.dumps(corpo).encode("utf-8")
    r = urllib.request.Request(url, data=data, headers=headers, method=metodo)
    try:
        resp = urllib.request.urlopen(r, timeout=60)
        return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode("utf-8"))
        except Exception:
            return e.code, {}


def subir_imagem(site, caminho, alt, legenda):
    ext = os.path.splitext(caminho)[1].lower().lstrip(".") or "jpg"
    ctype = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
             "webp": "image/webp", "gif": "image/gif"}.get(ext, "image/jpeg")
    filename = os.path.basename(caminho)
    with open(caminho, "rb") as f:
        binario = f.read()
    url = f"{site['url'].rstrip('/')}/wp-json/wp/v2/media"
    headers = {"Authorization": auth_header(site), "User-Agent": UA,
               "Accept": "application/json", "Content-Type": ctype,
               "Content-Disposition": f'attachment; filename="{filename}"'}
    r = urllib.request.Request(url, data=binario, headers=headers, method="POST")
    resp = urllib.request.urlopen(r, timeout=120)
    media = json.loads(resp.read().decode("utf-8"))
    mid = media["id"]
    if alt or legenda:
        req(site, "POST", f"/media/{mid}",
            {"alt_text": alt or "", "caption": legenda or ""})
    return mid


def resolver_tags(site, nomes):
    ids = []
    for nome in [n.strip() for n in nomes if n.strip()]:
        _, achados = req(site, "GET",
                         f"/tags?search={urllib.parse.quote(nome)}&per_page=100&_fields=id,name")
        exato = next((t for t in (achados or []) if t.get("name", "").lower() == nome.lower()), None)
        if exato:
            ids.append(exato["id"])
            continue
        status, criada = req(site, "POST", "/tags", {"name": nome})
        if status < 300 and criada.get("id"):
            ids.append(criada["id"])
        elif criada.get("code") == "term_exists":
            tid = (criada.get("data") or {}).get("term_id")
            if tid:
                ids.append(int(tid))
    return ids


def avisar_telegram(site_nome, titulo, link):
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        return
    def esc(s):
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    texto = "\n".join([
        f"✍️ <b>Anderson</b> publicou em <b>{esc(site_nome)}</b>",
        esc(titulo),
        f"\U0001f517 {esc(link)}",
    ])
    payload = json.dumps({"chat_id": TELEGRAM_CHAT_ID, "text": texto,
                          "parse_mode": "HTML",
                          "disable_web_page_preview": False}).encode("utf-8")
    try:
        r = urllib.request.Request(
            f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
            data=payload, headers={"Content-Type": "application/json"})
        urllib.request.urlopen(r, timeout=15)
    except Exception as e:
        print(f"[aviso] falha ao notificar Telegram: {e}", file=sys.stderr)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--site", required=True)
    p.add_argument("--titulo", required=True)
    p.add_argument("--html", required=True, help="arquivo .html com o conteudo")
    p.add_argument("--imagem")
    p.add_argument("--alt", default="")
    p.add_argument("--legenda", default="")
    p.add_argument("--categoria", type=int, action="append", default=[])
    p.add_argument("--tags", default="")
    p.add_argument("--slug")
    p.add_argument("--resumo")
    p.add_argument("--status", default="publish",
                   choices=["publish", "draft", "pending"])
    p.add_argument("--agendar", help="ISO GMT, ex.: 2026-09-10T12:00:00")
    args = p.parse_args()

    site = carregar_site(args.site)

    with open(args.html, encoding="utf-8") as f:
        conteudo = f.read()

    media_id = None
    if args.imagem:
        media_id = subir_imagem(site, args.imagem, args.alt, args.legenda)
        print(f"imagem subida: media_id={media_id}")

    corpo = {"title": args.titulo, "content": conteudo, "status": args.status}
    if args.resumo:
        corpo["excerpt"] = args.resumo
    if args.slug:
        corpo["slug"] = args.slug
    if args.categoria:
        corpo["categories"] = args.categoria
    if args.tags:
        ids = resolver_tags(site, args.tags.split(","))
        if ids:
            corpo["tags"] = ids
    if media_id:
        corpo["featured_media"] = media_id
    if args.agendar:
        corpo["date_gmt"] = args.agendar
        corpo["status"] = "future"

    status, post = req(site, "POST", "/posts", corpo)
    if status >= 300:
        sys.exit(f"FALHA ao publicar ({status}): {post.get('message', post)}")

    link = post.get("link", "")
    print(f"OK: post {post.get('id')} status={post.get('status')} -> {link}")

    # Aviso no bot so apos publicacao confirmada.
    avisar_telegram(site.get("nome", site.get("url", args.site)), args.titulo, link)
    print("aviso enviado ao Telegram.")


if __name__ == "__main__":
    main()
