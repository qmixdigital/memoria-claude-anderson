# -*- coding: utf-8 -*-
"""Acesso ao Search Console pela API, com as service accounts da QMIX.

Uso como modulo:
    from gsc_api import sessao_para, consultar
    s, prop = sessao_para("facoqr.com.br")
    linhas = consultar(s, prop, ["query", "page"], dias=90)

Uso direto:
    python gsc_api.py <dominio> [dias]           # lista paginas e consultas
    python gsc_api.py --propriedades             # lista o que cada chave enxerga

As tres chaves cobrem os 103 dominios. A funcao sessao_para testa uma a uma e
devolve a primeira que tem a propriedade. Propriedade pode ser sc-domain:X ou
https://X/ (URL prefix); as duas formas sao tentadas.
"""
import sys, json, datetime
from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession

import os
# As service accounts vivem no cofre (KeePassXC). Rodar pelo cofre_run com
# segredos=["backlinkguard-google-sa","enjai-493011-5bc78ff8f355","seoqmix-024e9465e9d9"]:
# cada variavel recebe o caminho de um arquivo temporario.
CHAVES = [os.environ[v] for v in ("BACKLINKGUARD_GOOGLE_SA", "ENJAI_493011_5BC78FF8F355", "SEOQMIX_024E9465E9D9") if os.environ.get(v)]
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
_cache = {}


def _sessao(chave):
    if chave not in _cache:
        _cache[chave] = AuthorizedSession(
            service_account.Credentials.from_service_account_file(chave, scopes=SCOPES))
    return _cache[chave]


def propriedades():
    """{propriedade: chave} de tudo que as tres contas enxergam."""
    out = {}
    for k in CHAVES:
        try:
            r = _sessao(k).get("https://www.googleapis.com/webmasters/v3/sites", timeout=60)
            for x in r.json().get("siteEntry", []):
                out.setdefault(x["siteUrl"], k)
        except Exception as e:
            print("falha em", k, e, file=sys.stderr)
    return out


def sessao_para(dominio):
    """Devolve (sessao, propriedade) para o dominio, ou (None, None)."""
    dominio = dominio.replace("https://", "").replace("http://", "").strip("/")
    props = propriedades()
    for cand in ("sc-domain:" + dominio, "https://" + dominio + "/", "https://www." + dominio + "/"):
        if cand in props:
            return _sessao(props[cand]), cand
    return None, None


def consultar(s, prop, dims, dias=90, filtros=None, limite=25000, fim=None):
    """Linhas do searchAnalytics. dims ex.: ["query","page"]. filtros: lista de
    {"dimension":"page","operator":"equals","expression":URL}."""
    fim = fim or (datetime.date.today() - datetime.timedelta(days=3))
    ini = fim - datetime.timedelta(days=dias)
    url = "https://www.googleapis.com/webmasters/v3/sites/%s/searchAnalytics/query" % prop.replace(":", "%3A").replace("/", "%2F")
    linhas, start = [], 0
    while True:
        body = {"startDate": ini.isoformat(), "endDate": fim.isoformat(),
                "dimensions": dims, "rowLimit": 25000, "startRow": start}
        if filtros:
            body["dimensionFilterGroups"] = [{"filters": filtros}]
        r = s.post(url, json=body, timeout=120)
        if r.status_code != 200:
            raise RuntimeError("GSC %s: %s" % (r.status_code, r.text[:200]))
        rows = r.json().get("rows", [])
        linhas += rows
        if len(rows) < 25000 or len(linhas) >= limite:
            break
        start += 25000
    return linhas


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if len(sys.argv) > 1 and sys.argv[1] == "--propriedades":
        for p, k in sorted(propriedades().items()):
            print("%-45s %s" % (p, k.split("\\")[-1]))
        sys.exit()
    dom = sys.argv[1]
    dias = int(sys.argv[2]) if len(sys.argv) > 2 else 90
    s, prop = sessao_para(dom)
    if not s:
        print("nenhuma chave tem acesso a", dom); sys.exit(1)
    print("propriedade:", prop)
    for r in sorted(consultar(s, prop, ["page"], dias), key=lambda x: -x["impressions"])[:40]:
        print("%6d imp %4d clk pos %5.1f  %s" % (r["impressions"], r["clicks"], r["position"], r["keys"][0]))
