#!/usr/bin/env python3
"""Lista as paginas que tiveram impressao no Google nos ultimos 16 meses.

Precisa das service accounts (ver docstring de
C:/Users/User/.claude/skills/google-console-analise/scripts/gsc_api.py: as variaveis
BACKLINKGUARD_GOOGLE_SA / ENJAI_493011_5BC78FF8F355 / SEOQMIX_024E9465E9D9 apontando
para os JSON das chaves, que ficam no cofre KeePassXC).

Uso:  python gsc_keep.py notebookx.com.br > gsc_notebookx.txt
Saida: "url<TAB>impressoes<TAB>cliques", ordenado por impressoes.
"""
import sys, datetime
sys.path.insert(0, r"C:/Users/User/.claude/skills/google-console-analise/scripts")
from gsc_api import sessao_para  # noqa: E402

API = "https://www.googleapis.com/webmasters/v3/sites/{}/searchAnalytics/query"

def main(dominio):
    s, prop = sessao_para(dominio)
    if not s:
        sys.exit(f"nenhuma service account enxerga {dominio}")
    fim = datetime.date.today() - datetime.timedelta(days=3)
    ini = fim - datetime.timedelta(days=480)
    import urllib.parse
    url = API.format(urllib.parse.quote(prop, safe=""))
    linhas, start = [], 0
    while True:
        r = s.post(url, json={"startDate": str(ini), "endDate": str(fim), "dimensions": ["page"],
                              "rowLimit": 25000, "startRow": start, "dataState": "all"})
        r.raise_for_status()
        rows = r.json().get("rows", [])
        linhas += rows
        if len(rows) < 25000:
            break
        start += 25000
    linhas.sort(key=lambda x: -x["impressions"])
    for l in linhas:
        print(f'{l["keys"][0]}\t{int(l["impressions"])}\t{int(l["clicks"])}')
    print(f"# {len(linhas)} paginas com impressao ({ini}..{fim})", file=sys.stderr)

if __name__ == "__main__":
    main(sys.argv[1])
