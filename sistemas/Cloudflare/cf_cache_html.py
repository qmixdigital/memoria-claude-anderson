# -*- coding: utf-8 -*-
"""
Cacheia o HTML de paginas publicas na borda do Cloudflare.

Por padrao o Cloudflare NAO cacheia HTML: cada visita vai ate a origem, o que
aparece como `cf-cache-status: DYNAMIC` e custa o TTFB completo em toda visita,
de qualquer lugar do mundo. Para site de conteudo com ISR isso e desperdicio:
a pagina ja e estatica por uma hora.

A regra respeita o `Cache-Control` que o Next envia (`s-maxage`), entao a
revalidacao continua funcionando: quem manda no tempo de vida e a aplicacao.

SEGURANCA: a regra exclui explicitamente area administrativa, painel do
cliente, API e fluxos de autenticacao, e ainda desiste do cache quando existe
cookie de sessao. Sem isso, uma pagina de usuario logado poderia ser servida a
outra pessoa.

    python cf_cache_html.py <dominio> [--dry-run] [--remover]
"""
import io
import json
import sys
import urllib.error
import urllib.request

API = "https://api.cloudflare.com/client/v4"
DESCRICAO = "cache de HTML publico na borda, respeitando o Cache-Control da origem"

# caminhos que nunca podem ser cacheados
PRIVADOS = ["/admin", "/painel", "/api", "/login", "/cadastro", "/reivindicar",
            "/esqueci-senha", "/verificar-email", "/wp-json"]
# cookies que indicam sessao ativa
COOKIES = ["next-auth", "authjs", "__Secure-next-auth", "session"]


def chamada(token, url, metodo="GET", corpo=None):
    dados = json.dumps(corpo).encode() if corpo is not None else None
    cab = {"Authorization": "Bearer " + token}
    if dados:
        cab["Content-Type"] = "application/json"
    return json.load(urllib.request.urlopen(
        urllib.request.Request(url, data=dados, method=metodo, headers=cab), timeout=30))


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


def expressao(dominio):
    partes = ['(http.host eq "%s")' % dominio]
    for p in PRIVADOS:
        partes.append('(not starts_with(http.request.uri.path, "%s"))' % p)
    for c in COOKIES:
        partes.append('(not http.cookie contains "%s")' % c)
    return " and ".join(partes)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    dominio = sys.argv[1].strip().lower()
    dry = "--dry-run" in sys.argv
    remover = "--remover" in sys.argv

    conta, zona = achar_zona(dominio)
    if not zona:
        print("zona %s nao encontrada em contas.json" % dominio)
        return 1
    token = conta["token"]
    print("conta: %s | zona: %s" % (conta["nome"], zona["id"]))

    entry = "%s/zones/%s/rulesets/phases/http_request_cache_settings/entrypoint" % (API, zona["id"])
    existentes = []
    try:
        existentes = chamada(token, entry)["result"].get("rules", []) or []
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise
    print("regras ja no phase de cache: %d" % len(existentes))

    limpas = [{k: r[k] for k in ("action", "action_parameters", "expression", "description", "enabled") if k in r}
              for r in existentes if r.get("description") != DESCRICAO]

    if not remover:
        limpas.append({
            "action": "set_cache_settings",
            "action_parameters": {
                "cache": True,
                "edge_ttl": {"mode": "respect_origin"},
                "browser_ttl": {"mode": "respect_origin"},
                "origin_cache_control": True,
            },
            "expression": expressao(dominio),
            "description": DESCRICAO,
        })

    if dry:
        print(json.dumps({"rules": limpas}, ensure_ascii=False, indent=2))
        return 0

    try:
        r = chamada(token, entry, "PUT", {"rules": limpas})
    except urllib.error.HTTPError as e:
        detalhe = e.read().decode("utf-8", "replace")
        try:
            for x in json.loads(detalhe).get("errors", []):
                print("  HTTP %s | codigo %s | %s" % (e.code, x.get("code"), x.get("message")))
        except ValueError:
            print("  HTTP %s | %s" % (e.code, detalhe[:400]))
        print("\nSe for 403, falta a permissao Zone > Cache Rules > Edit no token.")
        return 1

    print("aplicado:", r["success"])
    for x in r["result"].get("rules", []):
        print("  -", x["description"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
