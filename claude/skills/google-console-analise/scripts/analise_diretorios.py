# -*- coding: utf-8 -*-
"""Analise GSC dos diretorios (vidracariaperto / marmorariasperto), 28/09/2026.

Segue o fluxo da skill: trajetoria, gap de cauda longa, buckets de posicao,
canibalizacao por query+page, oportunidades de CTR e material para revisita.
"""
import sys, io, datetime, collections
sys.path.insert(0, __file__.rsplit("\\", 1)[0].rsplit("/", 1)[0])
from gsc_api import sessao_para, consultar

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
DOM = sys.argv[1]
DIAS = int(sys.argv[2]) if len(sys.argv) > 2 else 90

s, prop = sessao_para(DOM)
if not s:
    sys.exit("sem acesso a " + DOM)
print("=" * 70)
print("PROPRIEDADE:", prop, "| janela:", DIAS, "dias")
print("=" * 70)

fim = datetime.date.today() - datetime.timedelta(days=3)


def tot(linhas):
    c = sum(r["clicks"] for r in linhas)
    i = sum(r["impressions"] for r in linhas)
    return c, i, (100.0 * c / i if i else 0)


# --- trajetoria por mes ----------------------------------------------------
dias_ = consultar(s, prop, ["date"], dias=DIAS)
por_mes = collections.defaultdict(lambda: [0, 0])
for r in dias_:
    m = r["keys"][0][:7]
    por_mes[m][0] += r["clicks"]
    por_mes[m][1] += r["impressions"]
print("\n1) TRAJETORIA POR MES")
for m in sorted(por_mes):
    c, i = por_mes[m]
    print("   %s  %5d cliques  %7d impressoes  CTR %.2f%%" % (m, c, i, 100.0 * c / i if i else 0))

# ultimos 28 x 28 anteriores
a = consultar(s, prop, ["date"], dias=28)
b = consultar(s, prop, ["date"], dias=28, fim=fim - datetime.timedelta(days=28))
ca, ia, _ = tot(a)
cb, ib, _ = tot(b)
print("\n   ultimos 28 dias : %4d cliques / %6d impressoes" % (ca, ia))
print("   28 dias antes   : %4d cliques / %6d impressoes" % (cb, ib))
if ib:
    print("   variacao impressoes: %+.0f%%" % (100.0 * (ia - ib) / ib))

# --- paginas e queries -----------------------------------------------------
pgs = consultar(s, prop, ["page"], dias=DIAS)
qrs = consultar(s, prop, ["query"], dias=DIAS)
cp, ip_, ctrp = tot(pgs)
cq, iq, _ = tot(qrs)
print("\n2) ESTRUTURA")
print("   paginas com impressao: %d | cliques %d | impressoes %d | CTR %.2f%%" % (len(pgs), cp, ip_, ctrp))
print("   queries visiveis: %d | cliques %d" % (len(qrs), cq))
if cp:
    print("   cauda longa oculta: %.0f%% dos cliques" % (100.0 * (cp - cq) / cp))

# --- buckets de posicao ----------------------------------------------------
print("\n3) BUCKETS DE POSICAO (paginas)")
bk = collections.Counter()
imp_bk = collections.Counter()
for r in pgs:
    p = r["position"]
    k = "1-3" if p <= 3 else "4-10" if p <= 10 else "11-15" if p <= 15 else "16-30" if p <= 30 else "31+"
    bk[k] += 1
    imp_bk[k] += r["impressions"]
for k in ["1-3", "4-10", "11-15", "16-30", "31+"]:
    print("   pos %-6s %5d paginas  %7d impressoes" % (k, bk[k], imp_bk[k]))

# porta da click zone: paginas 4-15 com mais impressao
print("\n   PORTA DA CLICK ZONE (pos 4 a 15, por impressao):")
alvo = sorted([r for r in pgs if 4 <= r["position"] <= 15], key=lambda x: -x["impressions"])[:15]
for r in alvo:
    print("   %5d imp  %3d clk  pos %4.1f  %s" % (
        r["impressions"], r["clicks"], r["position"], r["keys"][0].replace("https://" + DOM, "")))

# --- queries: buckets ------------------------------------------------------
print("\n4) QUERIES COM MAIS IMPRESSAO (top 25)")
for r in sorted(qrs, key=lambda x: -x["impressions"])[:25]:
    print("   %5d imp %3d clk pos %5.1f  CTR %5.2f%%  %s" % (
        r["impressions"], r["clicks"], r["position"], 100.0 * r["clicks"] / r["impressions"], r["keys"][0]))

# --- canibalizacao: query + page -------------------------------------------
print("\n5) CANIBALIZACAO (mesma query, varias paginas, 30+ impressoes)")
qp = consultar(s, prop, ["query", "page"], dias=DIAS)
por_q = collections.defaultdict(list)
for r in qp:
    por_q[r["keys"][0]].append(r)
achou = 0
for q, rs in sorted(por_q.items(), key=lambda kv: -sum(x["impressions"] for x in kv[1])):
    if len(rs) < 2:
        continue
    imp = sum(x["impressions"] for x in rs)
    if imp < 30:
        continue
    achou += 1
    if achou > 12:
        break
    print('   "%s"  %d impressoes em %d paginas:' % (q, imp, len(rs)))
    for x in sorted(rs, key=lambda y: -y["impressions"])[:4]:
        print("      %4d imp %2d clk pos %5.1f  %s" % (
            x["impressions"], x["clicks"], x["position"], x["keys"][1].replace("https://" + DOM, "")))
if not achou:
    print("   nenhuma query com 30+ impressoes dividida entre paginas")

# --- tipos de pagina -------------------------------------------------------
print("\n6) DE ONDE VEM A IMPRESSAO (por tipo de pagina)")
tipo = collections.Counter()
tipo_clk = collections.Counter()
for r in pgs:
    u = r["keys"][0].replace("https://" + DOM, "")
    t = ("home" if u in ("/", "") else
         "ficha da empresa" if u.startswith("/vidracaria/") or u.startswith("/marmoraria/") else
         "cidade/bairro" if u.startswith("/vidracarias/") or u.startswith("/marmorarias/") else
         "servico" if u.startswith("/servicos/") else
         "material/preco" if u.startswith("/materiais/") or u.startswith("/precos/") else
         "blog" if u.startswith("/blog") else "outra")
    tipo[t] += r["impressions"]
    tipo_clk[t] += r["clicks"]
for t, i in tipo.most_common():
    print("   %-18s %7d impressoes  %4d cliques  CTR %.2f%%" % (t, i, tipo_clk[t], 100.0 * tipo_clk[t] / i if i else 0))
