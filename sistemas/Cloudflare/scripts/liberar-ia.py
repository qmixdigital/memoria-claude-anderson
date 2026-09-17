# -*- coding: utf-8 -*-
"""Desliga o bloqueio gerenciado de rastreadores de IA nas zonas Cloudflare
do proprio usuario, autorizado por ele nesta sessao.

Muda apenas o campo ai_bots_protection de "block" para "disabled".
Nao toca em WAF, DDoS, rate limit nem em qualquer outra protecao: a
defesa contra abuso continua inteira. Reversivel a qualquer momento
gravando "block" de volta no mesmo campo.
"""
import os, sys, json, ssl, urllib.request, concurrent.futures as cf

# "python liberar-ia.py"         -> libera os rastreadores de IA
# "python liberar-ia.py bloquear" -> desfaz, voltando ao bloqueio
DESTINO = "block" if "bloquear" in sys.argv else "disabled"

T = os.environ["CF_USER_TOKEN"]
C = ssl.create_default_context(); C.check_hostname = False; C.verify_mode = ssl.CERT_NONE


def api(path, metodo="GET", corpo=None):
    dados = json.dumps(corpo).encode() if corpo else None
    req = urllib.request.Request(
        "https://api.cloudflare.com/client/v4" + path, data=dados, method=metodo,
        headers={"Authorization": "Bearer " + T, "Content-Type": "application/json"})
    try:
        return json.loads(urllib.request.urlopen(req, timeout=35, context=C).read())
    except Exception as e:
        return {"success": False, "errors": str(e)[:80]}


zonas, pagina = [], 1
while True:
    d = api("/zones?per_page=50&page=%d" % pagina)
    if not d.get("success"):
        raise SystemExit("  falhou ao listar zonas: %s" % d.get("errors"))
    zonas += d["result"]
    if pagina >= d["result_info"]["total_pages"]:
        break
    pagina += 1
print("  %d zonas na conta" % len(zonas))


def estado(z):
    r = api("/zones/%s/bot_management" % z["id"]).get("result") or {}
    return z["id"], z["name"], r.get("ai_bots_protection", "?")


atual = list(cf.ThreadPoolExecutor(max_workers=6).map(estado, zonas))
alvo = [t for t in atual if t[2] != DESTINO]
print("  %d zonas ainda bloqueando ou indefinidas\n" % len(alvo))


def liberar(t):
    zid, nome, antes = t
    d = api("/zones/%s/bot_management" % zid, "PUT", {"ai_bots_protection": DESTINO})
    depois = (d.get("result") or {}).get("ai_bots_protection")
    ok = d.get("success") and depois == DESTINO
    return ok, nome, antes, depois, str(d.get("errors"))[:70]


res = list(cf.ThreadPoolExecutor(max_workers=5).map(liberar, alvo))
for ok, nome, antes, depois, err in res:
    if not ok:
        print("  FALHOU  %-36s %s -> %s | %s" % (nome, antes, depois, err))
print("\n  liberadas: %d | falhas: %d" % (sum(1 for r in res if r[0]),
                                          sum(1 for r in res if not r[0])))
