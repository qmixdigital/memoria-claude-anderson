# -*- coding: utf-8 -*-
"""
Limpa o cache da borda de uma zona.

Obrigatorio depois de qualquer deploy em site com regra de cache de HTML
(cf_cache_html.py): sem isso o Cloudflare continua servindo o HTML da versao
anterior ate o TTL expirar, e o deploy parece nao ter surtido efeito.

    python cf_purge.py <dominio>                # limpa tudo
    python cf_purge.py <dominio> /a/ /b/ ...    # limpa URLs especificas
"""
import io, json, sys, urllib.error, urllib.request

API = "https://api.cloudflare.com/client/v4"


def chamada(token, url, metodo="GET", corpo=None):
    dados = json.dumps(corpo).encode() if corpo is not None else None
    cab = {"Authorization": "Bearer " + token}
    if dados:
        cab["Content-Type"] = "application/json"
    return json.load(urllib.request.urlopen(
        urllib.request.Request(url, data=dados, method=metodo, headers=cab), timeout=60))


def achar_zona(dominio):
    for c in json.load(io.open("contas.json", encoding="utf-8")):
        try:
            r = chamada(c["token"], "%s/zones?name=%s" % (API, dominio))
        except Exception:
            continue
        if r.get("success") and r.get("result"):
            return c, r["result"][0]
    return None, None


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    dominio = sys.argv[1].strip().lower()
    caminhos = [a for a in sys.argv[2:] if not a.startswith("--")]

    conta, zona = achar_zona(dominio)
    if not zona:
        print("zona nao encontrada em contas.json")
        return 1
    token = conta["token"]
    url = "%s/zones/%s/purge_cache" % (API, zona["id"])

    if caminhos:
        alvos = ["https://%s%s" % (dominio, c) if c.startswith("/") else c for c in caminhos]
        corpo = {"files": alvos}
        print("limpando %d URL(s)" % len(alvos))
    else:
        corpo = {"purge_everything": True}
        print("limpando a zona inteira")

    try:
        r = chamada(token, url, "POST", corpo)
        print("purge:", r["success"])
    except urllib.error.HTTPError as e:
        detalhe = e.read().decode("utf-8", "replace")
        try:
            for x in json.loads(detalhe).get("errors", []):
                print("  HTTP %s | %s | %s" % (e.code, x.get("code"), x.get("message")))
        except ValueError:
            print("  HTTP %s | %s" % (e.code, detalhe[:300]))
        print("\nSe for 403, falta a permissao Zone > Cache Purge no token.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
