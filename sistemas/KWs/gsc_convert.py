# -*- coding: utf-8 -*-
"""
Conversor Google Search Console -> formato Semrush-like para o find_opportunities.

O GSC exporta Consultas (keywords) e Paginas (URLs) em arquivos SEPARADOS, sem
o mapeamento keyword->URL. Este script casa cada consulta a sua pagina mais
provavel (via slug) e gera um CSV com Keyword, Position, Search Volume(=Impressoes),
URL -- que o find_opportunities.py consome normalmente.

Uso:
  1. Descompacte o ZIP do GSC numa pasta.
  2. python gsc_convert.py <pasta_extraida> <dominio>
     ex: python gsc_convert.py gsc_tmp cirurgiadecolunagoiania.com.br
  3. Gera input/<dominio>-gsc.csv
  4. python find_opportunities.py
"""
import csv, glob, os, re, sys, difflib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import find_opportunities as F

MATCH_STRONG = 0.5   # cobertura p/ casar com confianca
MATCH_WEAK = 0.30    # cobertura minima p/ best-guess quando a consulta ja ranqueia
WEAK_MAX_POS = 15    # ate esta posicao, aceita best-guess (a pagina existe)


def num(x):
    """GSC = formato ingles: '.' decimal, sem separador de milhar."""
    x = (x or "").replace("%", "").replace(",", "").strip()
    try:
        return float(x)
    except ValueError:
        return 0.0


def load_by(folder, colsub):
    for f in glob.glob(os.path.join(folder, "*.csv")):
        try:
            rows = list(csv.DictReader(open(f, encoding="utf-8-sig")))
        except Exception:
            continue
        if rows and any(colsub in k for k in rows[0]):
            return rows
    return []


def key(row, sub):
    return next(k for k in row if sub in k)


def main():
    folder = sys.argv[1] if len(sys.argv) > 1 else "gsc_tmp"
    domain = sys.argv[2] if len(sys.argv) > 2 else "site"
    cons = load_by(folder, "Top consultas")
    pags = load_by(folder, "ginas principais")
    if not cons or not pags:
        print("Nao achei Consultas/Paginas em", folder)
        sys.exit(1)
    kImC = key(cons[0], "mpress"); kPosC = key(cons[0], "osi")
    kP = key(pags[0], "ginas principais")

    pages = []
    for r in pags:
        u = (r[kP] or "").strip()
        if not u.startswith("http"):
            continue
        ds = re.sub(r"[^a-z0-9]", "", F.strip_accents(F.slug_of(u)).lower())
        pages.append((u, F.slug_tokens(u), ds))

    def match(kw):
        kt = F.content_tokens(kw)
        if not kt:
            return "", 0
        best, bc = "", 0
        for u, st, ds in pages:
            cov = sum(1 for t in kt if t in st
                      or (len(t) >= 4 and t in ds)
                      or any(len(t) >= 5 and
                             difflib.SequenceMatcher(None, t, s).ratio() >= 0.88
                             for s in st)) / len(kt)
            if cov > bc:
                bc, best = cov, u
        return best, bc

    out = os.path.join("input", "%s-gsc.csv" % domain)
    os.makedirs("input", exist_ok=True)
    rows, nm = [], 0
    for r in cons:
        kw = (r["Top consultas"] or "").strip()
        if not kw:
            continue
        pos = max(1, round(num(r[kPosC]))); imp = int(num(r[kImC]))
        u, cov = match(kw)
        # casa com confianca; ou best-guess se ja ranqueia bem (pagina existe)
        if not (cov >= MATCH_STRONG or (cov >= MATCH_WEAK and pos <= WEAK_MAX_POS)):
            u = ""
        if u:
            nm += 1
        rows.append([kw, pos, imp, "", u])
    with open(out, "w", encoding="utf-8", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["Keyword", "Position", "Search Volume", "Keyword Difficulty", "URL"])
        w.writerows(rows)
    print("convertido -> %s | consultas: %d | casadas: %d | sem pagina: %d"
          % (out, len(rows), nm, len(rows) - nm))


if __name__ == "__main__":
    main()
