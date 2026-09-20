# -*- coding: utf-8 -*-
"""Paginas de destino pelo Search Console, e impressao de uma pagina hospedeira.

    python gsc_paginas.py DOMINIO                     paginas do site atendido com pos 8 a 25 e 100+ imp em 28 dias
    python gsc_paginas.py DOMINIO --dias 90 --min-imp 20
    python gsc_paginas.py DOMINIO --url URL_COMPLETA  impressoes/posicao de UMA pagina (vetting do hospedeiro, 90 dias)

Usa as service accounts da skill google-console-analise (gsc_api.py acha a chave
que enxerga a propriedade, sc-domain: ou prefixo https://). Se nenhuma pagina
bate o corte, mostra as de maior impressao na faixa de posicao e avisa, que e o
fallback previsto na skill para site novo.
"""
import argparse, sys, os
sys.path.insert(0, os.path.join(os.path.expanduser("~"), ".claude", "skills", "google-console-analise", "scripts"))
from gsc_api import sessao_para, consultar  # noqa: E402

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("dominio")
    ap.add_argument("--dias", type=int, default=28)
    ap.add_argument("--min-imp", type=int, default=100)
    ap.add_argument("--pos", default="8-25")
    ap.add_argument("--url", help="conferir uma pagina especifica (hospedeira) em vez de listar destinos")
    ap.add_argument("--top", type=int, default=15)
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    s, prop = sessao_para(a.dominio)
    if not s:
        print("nenhuma chave enxerga", a.dominio); sys.exit(1)
    if a.url:
        rows = consultar(s, prop, ["page"], max(a.dias, 90), filtros=[{"dimension": "page", "operator": "equals", "expression": a.url}])
        if not rows:
            print("SEM IMPRESSAO nos ultimos %d dias: %s (reprovar como hospedeira)" % (max(a.dias, 90), a.url)); sys.exit(2)
        r = rows[0]
        print("%d imp %d clk pos %.1f em %d dias: %s" % (r["impressions"], r["clicks"], r["position"], max(a.dias, 90), a.url)); return
    lo, hi = (float(x) for x in a.pos.split("-"))
    rows = [r for r in consultar(s, prop, ["page"], a.dias) if lo <= r["position"] <= hi]
    rows.sort(key=lambda r: -r["impressions"])
    corte = [r for r in rows if r["impressions"] >= a.min_imp]
    if corte:
        print("propriedade %s, %d dias, posicao %s, %d+ impressoes: %d paginas" % (prop, a.dias, a.pos, a.min_imp, len(corte)))
        lista = corte
    else:
        print("propriedade %s: NENHUMA pagina com %d+ impressoes em %d dias na faixa %s. Fallback: as de maior impressao na faixa (dizer isso na entrega)." % (prop, a.min_imp, a.dias, a.pos))
        lista = rows
    for r in lista[:a.top]:
        print("%6d imp %4d clk pos %5.1f  %s" % (r["impressions"], r["clicks"], r["position"], r["keys"][0]))

if __name__ == "__main__":
    main()
