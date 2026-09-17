# -*- coding: utf-8 -*-
"""
Liga Early Hints (103) na zona.

O Cloudflare guarda os `Link: rel=preload` da resposta e, na visita seguinte,
manda um 103 Early Hints antes da resposta final. O navegador comeca a baixar
fonte e CSS enquanto a origem ainda monta o HTML, o que ataca direto o FCP.

Requer HTTP/2 ou HTTP/3, que a zona ja usa.

    python cf_early_hints.py <dominio> [on|off]
"""
import io, json, sys, urllib.error, urllib.request

API = "https://api.cloudflare.com/client/v4"


def chamada(token, url, metodo="GET", corpo=None):
    dados = json.dumps(corpo).encode() if corpo is not None else None
    cab = {"Authorization": "Bearer " + token}
    if dados:
        cab["Content-Type"] = "application/json"
    return json.load(urllib.request.urlopen(
        urllib.request.Request(url, data=dados, method=metodo, headers=cab), timeout=30))


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
    valor = sys.argv[2] if len(sys.argv) > 2 else "on"

    conta, zona = achar_zona(dominio)
    if not zona:
        print("zona nao encontrada")
        return 1
    token = conta["token"]
    url = "%s/zones/%s/settings/early_hints" % (API, zona["id"])

    print("antes:", chamada(token, url)["result"]["value"])
    try:
        r = chamada(token, url, "PATCH", {"value": valor})
        print("depois:", r["result"]["value"])
    except urllib.error.HTTPError as e:
        detalhe = e.read().decode("utf-8", "replace")
        try:
            for x in json.loads(detalhe).get("errors", []):
                print("  HTTP %s | %s | %s" % (e.code, x.get("code"), x.get("message")))
        except ValueError:
            print("  HTTP %s | %s" % (e.code, detalhe[:300]))
        print("\nSe for 403, falta Zone > Zone Settings > Edit no token.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
