# -*- coding: utf-8 -*-
"""Classifica a demanda do diretorio por tipo de intencao.

Num diretorio, a mesma palavra-chave generica se espalha por milhares de
fichas e nenhuma consolida. Separar a demanda por intencao mostra onde o
clique e alcancavel e onde ele nunca vai vir.
"""
import sys, re, collections
sys.path.insert(0, __file__.rsplit("\\", 1)[0].rsplit("/", 1)[0])
from gsc_api import sessao_para, consultar

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
DOM = sys.argv[1]
NICHO = "vidra" if "vidrac" in DOM else "marmor"
DIAS = int(sys.argv[2]) if len(sys.argv) > 2 else 90

s, prop = sessao_para(DOM)
qrs = consultar(s, prop, ["query"], dias=DIAS)

GENERICO = re.compile(NICHO, re.I)
PERTO = re.compile(r"perto de mim|proxim|perto", re.I)
INFO = re.compile(r"pre[çc]o|quanto custa|valor|como |o que |vale a pena|melhor|tipos? de|m2|m²", re.I)

grupos = collections.defaultdict(lambda: [0, 0, 0.0, 0])  # imp, clk, soma_pos, n


def cls(q):
    if PERTO.search(q):
        return "A. perto de mim / proximidade"
    if GENERICO.search(q):
        # generico do nicho: tem cidade/bairro junto?
        resto = GENERICO.sub("", q).strip()
        resto = re.sub(r"\b(em|no|na|de|do|da|os|as|a|o|s)\b", "", resto).strip()
        if len(resto) >= 3:
            return "B. nicho + lugar (vidraçaria em X)"
        return "C. nicho puro (sem lugar)"
    if INFO.search(q):
        return "D. informacional (preço, como, tipos)"
    return "E. nome de empresa (navegacional)"


for r in qrs:
    q = r["keys"][0]
    g = cls(q)
    grupos[g][0] += r["impressions"]
    grupos[g][1] += r["clicks"]
    grupos[g][2] += r["position"] * r["impressions"]
    grupos[g][3] += 1

tot_i = sum(g[0] for g in grupos.values())
print("=" * 78)
print("DEMANDA POR INTENCAO:", DOM, "|", DIAS, "dias |", len(qrs), "queries visiveis")
print("=" * 78)
print("%-36s %7s %6s %6s %6s %6s" % ("grupo", "impr", "%", "cliques", "CTR", "pos"))
for g in sorted(grupos, key=lambda x: -grupos[x][0]):
    i, c, sp, n = grupos[g]
    print("%-36s %7d %5.0f%% %6d %5.2f%% %6.1f   (%d queries)" % (
        g, i, 100.0 * i / tot_i, c, 100.0 * c / i if i else 0, sp / i if i else 0, n))

# as melhores oportunidades reais: nicho+lugar e perto de mim
print("\nMELHORES ALVOS (nicho + lugar, ou perto de mim), por impressao:")
alvos = [r for r in qrs if cls(r["keys"][0]).startswith(("A.", "B."))]
for r in sorted(alvos, key=lambda x: -x["impressions"])[:20]:
    print("   %4d imp %3d clk pos %5.1f  %s" % (
        r["impressions"], r["clicks"], r["position"], r["keys"][0]))

print("\nINFORMACIONAL (onde conteudo proprio ganha clique), por impressao:")
for r in sorted([r for r in qrs if cls(r["keys"][0]).startswith("D.")], key=lambda x: -x["impressions"])[:15]:
    print("   %4d imp %3d clk pos %5.1f  %s" % (
        r["impressions"], r["clicks"], r["position"], r["keys"][0]))
