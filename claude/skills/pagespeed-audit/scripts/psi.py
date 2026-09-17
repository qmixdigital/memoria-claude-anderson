#!/usr/bin/env python3
"""
PageSpeed Insights (Lighthouse lab + CrUX field) para uma ou mais URLs.
Uso:
  python3 psi.py URL [URL2 ...] [--strategy mobile|desktop|both] [--json]
Ex:
  python3 psi.py https://exemplo.com/ https://exemplo.com/pagina --strategy both
Chave lida de PSI_API_KEY (env) ou do default embutido.
"""
import json, sys, urllib.request, urllib.parse, urllib.error, os

API_KEY = os.environ.get("PSI_API_KEY", "<<REMOVIDO>>")

# Limiares oficiais Core Web Vitals (bom / precisa-melhorar / ruim)
CWV = {
    "LCP": (2500, 4000),   # ms
    "CLS": (0.1, 0.25),    # score
    "INP": (200, 500),     # ms
    "FCP": (1800, 3000),   # ms
    "TTFB": (800, 1800),   # ms
}

def verdict(metric, value):
    if value is None: return "?"
    good, poor = CWV[metric]
    if value <= good: return "BOM"
    if value <= poor: return "MELHORAR"
    return "RUIM"

def run(url, strategy):
    q = urllib.parse.urlencode({"url": url, "key": API_KEY, "strategy": strategy})
    u = f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?{q}&category=performance&category=accessibility&category=seo&category=best-practices"
    try:
        d = json.load(urllib.request.urlopen(u, timeout=120))
    except urllib.error.HTTPError as e:
        return {"error": e.read().decode()[:400]}
    lh = d.get("lighthouseResult", {})
    cats = lh.get("categories", {})
    au = lh.get("audits", {})
    def score(c):
        s = cats.get(c, {}).get("score")
        return round(s * 100) if s is not None else None
    def num(k):
        return au.get(k, {}).get("numericValue")
    def disp(k):
        return au.get(k, {}).get("displayValue", "?")
    # Campo real (CrUX) — dados de usuários reais dos últimos 28 dias
    field = d.get("loadingExperience", {}).get("metrics", {})
    def crux(k):
        m = field.get(k)
        if not m: return None
        return m.get("percentile"), m.get("category")
    # Oportunidades (ordenadas por economia de ms)
    opps = []
    for k, a in au.items():
        det = a.get("details", {})
        sav = det.get("overallSavingsMs")
        if sav and sav > 100 and a.get("score", 1) not in (None, 1):
            opps.append((sav, a.get("title", k)))
    opps.sort(reverse=True)
    return {
        "perf": score("performance"),
        "a11y": score("accessibility"),
        "seo": score("seo"),
        "bp": score("best-practices"),
        "lab": {
            "LCP": (num("largest-contentful-paint"), disp("largest-contentful-paint")),
            "FCP": (num("first-contentful-paint"), disp("first-contentful-paint")),
            "CLS": (num("cumulative-layout-shift"), disp("cumulative-layout-shift")),
            "TBT": (num("total-blocking-time"), disp("total-blocking-time")),
            "SI": (num("speed-index"), disp("speed-index")),
        },
        "field": {
            "LCP": crux("LARGEST_CONTENTFUL_PAINT_MS"),
            "CLS": crux("CUMULATIVE_LAYOUT_SHIFT_SCORE"),
            "INP": crux("INTERACTION_TO_NEXT_PAINT"),
        },
        "opps": opps[:6],
    }

def fmt(url, strategy, r):
    print(f"\n=== {url}  [{strategy}] ===")
    if "error" in r:
        print("  ERRO:", r["error"]); return
    print(f"  Scores: Perf {r['perf']} | SEO {r['seo']} | A11y {r['a11y']} | BestPractices {r['bp']}")
    lab = r["lab"]
    def unit(metric, tup):
        val, dv = tup
        v = None
        if val is not None:
            v = val if metric == "CLS" else val  # ms para tempos, score p/ CLS
        vd = verdict(metric, v) if metric in CWV else ""
        return f"{dv} ({vd})" if vd else dv
    print(f"  LAB (Lighthouse): LCP {unit('LCP',lab['LCP'])} | CLS {unit('CLS',lab['CLS'])} | TBT {lab['TBT'][1]} | FCP {unit('FCP',lab['FCP'])} | SI {lab['SI'][1]}")
    f = r["field"]
    if any(f.values()):
        parts = []
        for k in ("LCP", "CLS", "INP"):
            if f[k]:
                pct, cat = f[k]
                disp = f"{pct/1000:.2f}s" if k in ("LCP","INP") and pct>50 else (f"{pct/100:.3f}" if k=="CLS" else f"{pct}ms")
                parts.append(f"{k} {disp} [{cat}]")
        print(f"  CAMPO (CrUX, usuários reais): {' | '.join(parts)}")
    else:
        print("  CAMPO (CrUX): sem dados suficientes (site novo/pouco tráfego) — usar métricas de laboratório")
    if r["opps"]:
        print("  Oportunidades:")
        for sav, title in r["opps"]:
            print(f"    ~{int(sav)}ms  {title}")

def main():
    args = sys.argv[1:]
    strat = "mobile"
    if "--strategy" in args:
        i = args.index("--strategy"); strat = args[i+1]; del args[i:i+2]
    as_json = "--json" in args
    if as_json: args.remove("--json")
    urls = [a for a in args if a.startswith("http")]
    if not urls:
        print("uso: python3 psi.py URL [URL...] [--strategy mobile|desktop|both]"); sys.exit(1)
    strategies = ["mobile", "desktop"] if strat == "both" else [strat]
    out = {}
    for url in urls:
        for s in strategies:
            r = run(url, s)
            out.setdefault(url, {})[s] = r
            if not as_json: fmt(url, s, r)
    if as_json:
        print(json.dumps(out, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
