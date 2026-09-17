# -*- coding: utf-8 -*-
"""
Redirect rule www -> apex, em UM salto.

Problema que resolve: com "Always Use HTTPS" ligado, uma requisicao para
http://www.dominio/x/ leva dois 301 (http://www -> https://www -> https://apex).
Uma Redirect Rule no phase http_request_dynamic_redirect resolve em um salto,
porque roda antes do Always Use HTTPS.

Uso:
    python cf_www_apex.py <dominio>            # aplica
    python cf_www_apex.py <dominio> --dry-run  # so mostra o que faria

Le a conta/token de contas.json procurando a zona pelo nome.
"""
import io
import json
import sys
import urllib.error
import urllib.request

API = "https://api.cloudflare.com/client/v4"


def chamada(token, url, metodo="GET", corpo=None):
    dados = json.dumps(corpo).encode() if corpo is not None else None
    cab = {"Authorization": "Bearer " + token}
    if dados:
        cab["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=dados, method=metodo, headers=cab)
    return json.load(urllib.request.urlopen(req, timeout=30))


def achar_zona(dominio):
    contas = json.load(io.open("contas.json", encoding="utf-8"))
    for c in contas:
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
    dry = "--dry-run" in sys.argv

    conta, zona = achar_zona(dominio)
    if not zona:
        print("zona %s nao encontrada em nenhuma conta de contas.json" % dominio)
        return 1
    token = conta["token"]
    print("conta: %s | zona: %s (%s)" % (conta["nome"], zona["name"], zona["id"]))

    entrypoint = "%s/zones/%s/rulesets/phases/http_request_dynamic_redirect/entrypoint" % (API, zona["id"])

    # regras que ja existem no phase — nao sobrescrever o que nao e nosso
    existentes = []
    try:
        atual = chamada(token, entrypoint)
        existentes = atual["result"].get("rules", []) or []
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise
    print("regras ja no phase: %d" % len(existentes))

    descricao = "www -> apex em um salto (301), preservando caminho e query"
    nova = {
        "action": "redirect",
        "action_parameters": {
            "from_value": {
                "status_code": 301,
                "target_url": {"expression": 'concat("https://%s", http.request.uri)' % dominio},
                "preserve_query_string": False,
            }
        },
        "expression": '(http.host eq "www.%s")' % dominio,
        "description": descricao,
    }

    limpas = []
    for r in existentes:
        if r.get("description") == descricao:
            continue  # substitui a nossa versao anterior
        limpas.append({k: r[k] for k in ("action", "action_parameters", "expression", "description", "enabled") if k in r})
    limpas.append(nova)

    if dry:
        print(json.dumps({"rules": limpas}, ensure_ascii=False, indent=2))
        return 0

    try:
        r = chamada(token, entrypoint, "PUT", {"rules": limpas})
    except urllib.error.HTTPError as e:
        detalhe = e.read().decode("utf-8", "replace")
        try:
            j = json.loads(detalhe)
            for x in j.get("errors", []):
                print("  HTTP %s | codigo %s | %s" % (e.code, x.get("code"), x.get("message")))
        except ValueError:
            print("  HTTP %s | %s" % (e.code, detalhe[:400]))
        print("\nSe for 403/9109, o token e somente leitura para Rulesets.")
        print("Adicione a permissao Zone > Dynamic Redirect > Edit ao token e rode de novo.")
        return 1
    print("aplicado:", r["success"])
    for x in r["result"]["rules"]:
        print("  -", x["expression"], "->", x["action_parameters"]["from_value"]["target_url"]["expression"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
