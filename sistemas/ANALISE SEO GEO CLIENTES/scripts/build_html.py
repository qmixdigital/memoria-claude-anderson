# -*- coding: utf-8 -*-
"""Gera o relatorio HTML de SEO/GEO de um cliente a partir de dados/analise.json,
dados/narrativa.json, dados/moz.json e dados/pagespeed.txt.

Uso: python build_html.py PASTA_DO_CLIENTE SAIDA.html
"""
import sys, os, json, re, html, datetime, collections

pasta, saida = sys.argv[1], sys.argv[2]
D = lambda n: os.path.join(pasta, "dados", n)
A = json.load(open(D("analise.json"), encoding="utf-8"))
N = json.load(open(D("narrativa.json"), encoding="utf-8"))
M = json.load(open(D("moz.json"), encoding="utf-8")) if os.path.exists(D("moz.json")) else {}
PSI = open(D("pagespeed.txt"), encoding="utf-8", errors="replace").read() if os.path.exists(D("pagespeed.txt")) else ""
ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")
def _b64(n):
    p = os.path.join(ASSETS, n)
    return open(p).read().strip() if os.path.exists(p) else ""
LOGO = _b64("logomarca-qmix-840.b64"); LOGO_BRANCA = _b64("logomarca-qmix-branca-840.b64")
dom = A["dominio"]
BASE = A.get("base") or ("https://" + dom)
CFG = json.load(open(D("config.json"), encoding="utf-8")) if os.path.exists(D("config.json")) else {}
T = N.get("textos", {})  # textos por cliente com defaults
e = lambda s: html.escape(str(s), quote=True)
fmt = lambda n: f"{int(n):,}".replace(",", ".")


# ------------------------------------------------------------------ SVG helpers
def line_chart(pts, labels, w=860, h=260, cor="var(--s1)", fmt_y=fmt, marcas=None, invert=False, ylabel=""):
    """pts: lista de numeros; labels: lista de strings (mesmo tamanho). marcas: [(idx, texto)]"""
    pl, pr, pt, pb = 48, 16, 18, 34
    iw, ih = w - pl - pr, h - pt - pb
    n = len(pts); mx = max(pts) or 1; mn = 0
    if invert:
        mn, mx = 0, max(pts) * 1.05
    def X(i): return pl + (i / max(1, n - 1)) * iw
    def Y(v):
        f = (v - mn) / (mx - mn) if mx != mn else 0
        return pt + (f * ih if invert else (1 - f) * ih)
    path = " ".join(f"{'M' if i == 0 else 'L'}{X(i):.1f},{Y(v):.1f}" for i, v in enumerate(pts))
    area = path + f" L{X(n-1):.1f},{Y(mn) if not invert else pt+ih:.1f} L{X(0):.1f},{Y(mn) if not invert else pt+ih:.1f} Z"
    grid = ""
    for k in range(5):
        v = mn + (mx - mn) * k / 4
        y = Y(v)
        grid += f'<line x1="{pl}" x2="{w-pr}" y1="{y:.1f}" y2="{y:.1f}" class="grid"/><text x="{pl-6}" y="{y+4:.1f}" class="tick" text-anchor="end">{fmt_y(v) if not invert else f"{v:.0f}"}</text>'
    step = max(1, -(-n // max(4, int(iw // 72))))
    xt = "".join(f'<text x="{X(i):.1f}" y="{h-10}" class="tick" text-anchor="middle">{e(labels[i])}</text>' for i in range(0, n, step))
    mk = ""
    for idx, txt in (marcas or []):
        if 0 <= idx < n:
            mk += f'<line x1="{X(idx):.1f}" x2="{X(idx):.1f}" y1="{pt}" y2="{pt+ih}" class="marca"/><text x="{X(idx)+5:.1f}" y="{pt+12}" class="marca-t">{e(txt)}</text>'
    hits = "".join(f'<g class="hit" data-l="{e(labels[i])}" data-v="{fmt_y(v) if not invert else f"{v:.1f}"}"><rect x="{X(i)-iw/n/2:.1f}" y="{pt}" width="{iw/max(1,n-1):.1f}" height="{ih}" fill="transparent"/><circle cx="{X(i):.1f}" cy="{Y(v):.1f}" r="4" class="dot"/></g>' for i, v in enumerate(pts))
    return f'''<svg viewBox="0 0 {w} {h}" class="chart" role="img" aria-label="{e(ylabel)}">{grid}
<path d="{area}" fill="{cor}" opacity=".08"/><path d="{path}" fill="none" stroke="{cor}" stroke-width="2" stroke-linejoin="round"/>
{mk}{xt}{hits}<text x="{pl}" y="{pt-6}" class="ylab">{e(ylabel)}</text></svg>'''


def bar_chart(vals, labels, w=860, h=240, cor="var(--s1)", ylabel=""):
    pl, pr, pt, pb = 48, 16, 18, 34
    iw, ih = w - pl - pr, h - pt - pb
    n = len(vals); mx = max(vals) or 1
    bw = iw / n
    grid = ""
    for k in range(5):
        v = mx * k / 4; y = pt + (1 - v / mx) * ih
        grid += f'<line x1="{pl}" x2="{w-pr}" y1="{y:.1f}" y2="{y:.1f}" class="grid"/><text x="{pl-6}" y="{y+4:.1f}" class="tick" text-anchor="end">{fmt(v)}</text>'
    bars = ""
    for i, v in enumerate(vals):
        bh = (v / mx) * ih; x = pl + i * bw + bw * 0.18; y = pt + ih - bh
        bars += f'<g class="hit" data-l="{e(labels[i])}" data-v="{fmt(v)}"><rect x="{x:.1f}" y="{y:.1f}" width="{bw*0.64:.1f}" height="{bh:.1f}" rx="3" fill="{cor}"/></g>'
    step = max(1, -(-n // max(4, int(iw // 60))))
    xt = "".join(f'<text x="{pl + i*bw + bw/2:.1f}" y="{h-10}" class="tick" text-anchor="middle">{e(labels[i])}</text>' for i in range(0, n, step))
    return f'<svg viewBox="0 0 {w} {h}" class="chart" role="img" aria-label="{e(ylabel)}">{grid}{bars}{xt}<text x="{pl}" y="{pt-6}" class="ylab">{e(ylabel)}</text></svg>'


def hbar(items, w=860, cor_fn=None, fmt_v=fmt, maxv=None):
    """items: [(label, value, extra_text)]"""
    rh = 28; h = len(items) * rh + 8; lw = 300
    mx = maxv or max((v for _, v, _ in items), default=1) or 1
    out = f'<svg viewBox="0 0 {w} {h}" class="chart hbar" role="img">'
    for i, (lab, v, extra) in enumerate(items):
        y = i * rh + 4; bw = (v / mx) * (w - lw - 110)
        c = cor_fn(i, lab, v) if cor_fn else "var(--s1)"
        out += f'<g class="hit" data-l="{e(lab)}" data-v="{fmt_v(v)}"><text x="{lw-10}" y="{y+17}" class="lab" text-anchor="end">{e(lab[:46])}</text><rect x="{lw}" y="{y+5}" width="{max(2,bw):.1f}" height="16" rx="3" fill="{c}"/><text x="{lw+bw+6:.1f}" y="{y+17}" class="val">{fmt_v(v)}{(" " + e(extra)) if extra else ""}</text></g>'
    return out + "</svg>"


# ------------------------------------------------------------------ numbers
mensal = A["mensal"]; semanal = A["semanal"][1:-1] if len(A["semanal"]) > 6 else A["semanal"]
diario = A.get("diario", [])
t90, tant = A["tot90"], A["tot_ant"]
var_clk = 100 * (t90["clk"] - tant["clk"]) / max(1, tant["clk"])
var_imp = 100 * (t90["imp"] - tant["imp"]) / max(1, tant["imp"])
pos90 = sum(x["pos"] * x["imp"] for x in mensal[-3:]) / max(1, sum(x["imp"] for x in mensal[-3:]))
pico = max(mensal[:-1] or mensal, key=lambda x: x["clicks"]); ult = mensal[-2] if len(mensal) > 1 else mensal[-1]
queda_ano = 100 * (ult["clicks"] - pico["clicks"]) / max(1, pico["clicks"])
pags = A["paginas"]
IMG = tuple(CFG.get("img", [])) or ("\x00",)
POUCOS_MESES = len([m for m in mensal if m["dias"] >= 20]) < 4
dias_dados = sum(m["dias"] for m in mensal)
imp_img = sum(p["imp90"] for p in pags if any(k in p["url"] for k in IMG))
clk_img = sum(p["clk90"] for p in pags if any(k in p["url"] for k in IMG))
oculto = 100 * (1 - A["queries_visiveis_clk"] / max(1, t90["clk"]))
cls = {}
for p in pags: cls.setdefault(p["classe"], []).append(p)
B = A["buckets"]
L = A["links"]; P = A["problemas"]


# ------------------------------------------------------------------ PageSpeed parse
def parse_psi(txt):
    """Formato do psi.py: '=== URL  [mobile] ===', 'Scores: Perf 59 | ...', 'LAB (Lighthouse): LCP 7.4 s (RUIM) | CLS 0.008 (BOM) | TBT 350 ms'"""
    res, bloco = [], None
    for ln in txt.splitlines():
        mh = re.match(r"=== (https?://\S+)\s+\[(\w+)\]", ln)
        if mh:
            bloco = {"url": mh.group(1), "strategy": mh.group(2).lower(), "m": {}, "op": []}; res.append(bloco); continue
        if bloco is None:
            continue
        mp = re.search(r"Perf (\d+)", ln)
        if mp:
            bloco["m"]["Performance"] = mp.group(1)
        for k in ("LCP", "CLS", "TBT", "FCP", "INP"):
            mm = re.search(r"\b%s ([0-9][0-9.,]*)\s*(ms|s)?" % k, ln)
            if mm:
                bloco["m"][k] = mm.group(1) + (" " + mm.group(2) if mm.group(2) else "")
        mo = re.match(r"\s+~(\d+ms)\s+(.*)", ln)
        if mo:
            bloco["op"].append("%s (%s)" % (mo.group(2), mo.group(1)))
    return [b for b in res if b["m"]]
psi = parse_psi(PSI)


# ------------------------------------------------------------------ HTML pieces
def tabela(cols, rows, cls_=""):
    th = "".join(f"<th>{e(c)}</th>" for c in cols)
    tr = "".join("<tr>" + "".join(f'<td data-label="{e(cols[i]) if i < len(cols) else ""}">{c}</td>' for i, c in enumerate(r)) + "</tr>" for r in rows)
    cardable = " cardable" if len(cols) <= 5 and cls_ != "tm" else ""
    return f'<div class="tw{cardable}"><table class="{cls_}"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div>'

def destaca(s): return re.sub(r"\[\[(.+?)\]\]", lambda m: '<mark class="hl">' + m.group(1) + '</mark>', s)
def tag(c, t): return f'<span class="tag {c}">{e(t)}</span>'
def link(u, t=None): return f'<a href="{BASE}{u}" target="_blank" rel="noopener">{e(t or u)}</a>'
def card(t, d, c="good"): return f'<div class="card {c}"><div class="ct">{e(t)}</div><div class="cd">{d}</div></div>'

labels_m = [x["mes"][2:].replace("-", "/") for x in mensal]
# marcas de oscilacao: indices dos meses citados
marcas = []
for o in N.get("oscilacoes", []):
    mm = re.search(r"(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)[a-z]*/?(20\d\d)", o["quando"])
    if mm:
        mes = {"jan":1,"fev":2,"mar":3,"abr":4,"mai":5,"jun":6,"jul":7,"ago":8,"set":9,"out":10,"nov":11,"dez":12}[mm.group(1)]
        key = f"{mm.group(2)}-{mes:02d}"
        for i, x in enumerate(mensal):
            if x["mes"] == key: marcas.append((i, o["quando"]))

# top paginas 90d
top_pg = sorted(pags, key=lambda x: -x["clk90"])[:14]
cor_pg = lambda i, lab, v: "var(--s2)" if any(k in top_pg[i]["url"] for k in IMG) else ("var(--s3)" if top_pg[i]["url"] == "/" else "var(--s1)")

# buckets
bk_items = [("Top 3 com CTR ok", sum(q["imp"] for q in B["ok"]), f"({len(B['ok'])} consultas, {sum(q['clk'] for q in B['ok'])} cliques)"),
            ("Top 3 com CTR baixo (imagem / AI Overview)", sum(q["imp"] for q in B["title"]), f"({len(B['title'])} consultas, {sum(q['clk'] for q in B['title'])} cliques)"),
            ("Porta da click zone (4 a 15)", sum(q["imp"] for q in B["porta"]), f"({len(B['porta'])} consultas, {sum(q['clk'] for q in B['porta'])} cliques)"),
            ("Meio (16 a 30)", sum(q["imp"] for q in B["meio"]), f"({len(B['meio'])} consultas)"),
            ("Falta de autoridade (acima de 30)", sum(q["imp"] for q in B["autoridade"]), f"({len(B['autoridade'])} consultas, {sum(q['clk'] for q in B['autoridade'])} cliques)")]
bk_cor = lambda i, l, v: ["var(--good)", "var(--warn)", "var(--s1)", "var(--muted2)", "var(--crit)"][i]

locais_porta = [q for q in A["locais"] if 3 <= q["pos"] <= 15][:25]
locais_fora = [q for q in A["locais"] if q["pos"] > 15][:12]

# poda
ordem = ["excelente", "comercial", "produto", "atualizar", "manter", "fundir", "podar", "utilitaria", "fora"]
nomes = {"excelente": "Excelente", "comercial": "Comercial", "atualizar": "Atualizar", "manter": "Manter", "fundir": "Fundir / 301", "podar": "Podar", "utilitaria": "Utilitária (noindex)", "fora": "Fora do sitemap", "produto": "Produto"}
cores = {"excelente": "good", "comercial": "s1", "atualizar": "warn", "manter": "muted", "fundir": "ser", "podar": "crit", "utilitaria": "muted", "fora": "ser", "produto": "s1"}
poda_rows = []
for p in sorted(pags, key=lambda x: (ordem.index(x["classe"]), -x["clk480"])):
    spark = "".join(f'<i style="height:{max(2, 100*v/max(1,max(p["mensal"])))}%"></i>' for v in p["mensal"])
    poda_rows.append(f'<tr data-c="{p["classe"]}"><td>{tag(cores[p["classe"]], nomes[p["classe"]])}</td><td class="u">{link(p["url"], p["url"][:70])}</td>'
                     f'<td class="n">{p["clk90"]}</td><td class="n">{p["clk_ant"]}</td><td class="n">{p["clk480"]}</td><td class="n">{fmt(p["imp90"])}</td><td class="n">{p["pos90"] or ""}</td>'
                     f'<td class="n">{p["palavras"] or ""}</td><td class="n">{p["inlinks"]}</td><td>{e(p["modified"])}</td><td class="sp"><span class="spark">{spark}</span></td><td class="ac">{e(p["acao"])}</td></tr>')

# links internos comerciais
com = sorted([p for p in pags if p["tipo"] == "comercial"], key=lambda x: -x["inlinks"])
inl_items = [(p["url"], p["inlinks"], f"links  |  {p['clk90']} cliques 90d") for p in com]
inl_cor = lambda i, l, v: "var(--crit)" if v <= 1 else ("var(--warn)" if v <= 3 else "var(--s1)")
ext_hosts = L["ext_hosts"]
ext_suspeitos = [x for x in L["ext_lista"] if not re.search(r"(google|facebook|instagram|linkedin|youtube|whatsapp|wa\.me|twitter|x\.com|tiktok|pinterest|wikipedia|gov\.br|sebrae|canva|elementor|wordpress|behance|mitiendanube|nuvemshop|cloudfront|cdn\.|correios|shopify|wixstatic|gstatic|\.(jpg|jpeg|png|webp|gif|svg|css|js)(\?|$))", x["para"], re.I) and "nofollow" not in x["rel"]]

# primeiro link
pl_rows = []
for p in sorted(pags, key=lambda x: -x["imp90"])[:20]:
    if p["no_crawl"]: continue
    dst = p["primeiro_link"] or ""
    ok = bool(dst) and dst in [c["url"] for c in com]
    pl_rows.append([link(p["url"], p["url"][:58]), (link(dst, dst[:50]) + f' <span class="note" style="border:0;padding:0;display:inline">"{e(p["primeiro_anchor"][:40])}"</span>') if dst else "(nenhum link interno no corpo)",
                    tag("good" if ok else "warn", "comercial" if ok else ("sem link" if not dst else "blog / categoria"))])

# anchors comerciais
anc_rows = []
for u, lst in L["anchors_comerciais"].items():
    anc_rows.append([link(u, u[:55]), str(L["inlinks_comerciais"].get(u, 0)), e("; ".join(f"{a or '(imagem/vazio)'} ×{n}" for a, n in lst)) or "(nenhum link de corpo)"])

# problemas on-page
def lista(items, n=12):
    if not items: return '<span class="ok">nenhum</span>'
    out = "".join(f"<li>{link(i) if isinstance(i, str) and i.startswith('/') else e(i)}</li>" for i in items[:n])
    if len(items) > n: out += f"<li>… e mais {len(items)-n}</li>"
    return f"<ul>{out}</ul>"
onpage = [
    ("Title acima de 65 caracteres (corta na SERP)", P["title_longo"]), ("Title duplicado", P["title_duplicado"]),
    ("Sem meta description", P["sem_meta"]), ("Meta description acima de 165", P["meta_longa"]),
    ("Sem H1", P["sem_h1"]), ("Mais de um H1", P["h1_duplo"]), ("Canonical diferente da URL", P["canonical_errado"]),
    ("Posts com menos de 500 palavras", P["fino"]), ("Imagens sem alt (página, quantidade)", [f"{u} ({n})" for u, n in P["imgs_sem_alt"]]),
    ("Status diferente de 200 no sitemap", [f"{u} ({s})" for u, s in P["status_nao_200"]]),
    ("Com impressão no GSC mas fora do sitemap", P["no_sitemap_mas_gsc"]),
]

# expandir (da revisita): le o md se existir e pega as tabelas "Reforcar" e "Expandir" das 3 comerciais
revis = ""
for f in os.listdir(pasta):
    if "REVISITA" in f and f.endswith(".md"):
        revis = open(os.path.join(pasta, f), encoding="utf-8").read()
exp_blocos = []
if revis:
    for sec in revis.split("\n## ")[1:]:
        url = sec.split("\n")[0].strip()
        if not any(url.endswith(c["url"]) for c in com): continue
        def pega(nome, n=10):
            m = re.search(r"### %s.*?\n\n(\|.*?)(?:\n\n|\Z)" % re.escape(nome), sec, re.S)
            if not m: return []
            rows = [r for r in m.group(1).split("\n")[2:] if r.startswith("|")][:n]
            return [[c.strip() for c in r.strip("|").split("|")] for r in rows]
        exp_blocos.append((url.replace("https://" + dom, ""), pega("Reforcar"), pega("Expandir"), pega("Grafia")))

# GEO
home_schema = next((p["schema"] for p in pags if p["url"] == "/"), [])
geo_sinais = [(x["t"], x.get("ok"), x["d"]) for x in N.get("geo_sinais", [])] or [
    ("Schema de entidade (LocalBusiness / Organization / OnlineStore)", any(k in " ".join(home_schema) for k in ("LocalBusiness", "ProfessionalService", "Organization", "OnlineStore", "Store")), "Sem entidade, o Google e os modelos de IA não sabem quem é a empresa. É o sinal número um para citação em respostas de IA."),
    ("Crawlers de IA liberados (GPTBot, ClaudeBot, PerplexityBot)", all(v == 200 for v in M.get("crawlers_ia", {}).values()) if M.get("crawlers_ia") else None, "Permitir o rastreio é condição para aparecer como fonte em ChatGPT, Perplexity e AI Overview."),
    ("Arquivo llms.txt", M.get("llms_txt", False), "Opcional. Resumo em texto puro do que a empresa faz, para modelos de IA. Custo zero."),
    ("FAQ com schema FAQPage na home", "FAQPage" in home_schema, "Perguntas e respostas curtas são o formato que o AI Overview e os assistentes citam."),
]

# ------------------------------------------------------------------ template
css = """
:root{color-scheme:light;
--bg:#f3f6f9;--surf:#ffffff;--surf2:#eaf0f6;--ink:#03101e;--ink2:#3b4a5c;--muted:#6b7a8c;--muted2:#c7d5e5;--line:#dde5ee;
--navy:#03101e;--navy2:#0a1727;--acc:#00ff66;--acc-ink:#0a8f3a;
--s1:#0070ba;--s2:#b45309;--s3:#0db33f;
--good:#0da84a;--warn:#f0a500;--ser:#e8712a;--crit:#d93030;
--goodbg:#e4f7ea;--warnbg:#fff3d6;--serbg:#fde9dc;--critbg:#fbe3e3;--s1bg:#e3f0fb;
--shadow:0 1px 2px rgba(3,16,30,.05),0 8px 24px -12px rgba(3,16,30,.12);}
:root[data-theme="dark"]{color-scheme:dark;
--bg:#070d14;--surf:#0e1a27;--surf2:#15243a;--ink:#eef4ff;--ink2:#c7d5e5;--muted:#8fa0b3;--muted2:#2e4258;--line:#22344a;
--navy:#02070d;--navy2:#0a1727;--acc:#00ff66;--acc-ink:#3dff8a;
--s1:#7fb0ff;--s2:#ffaa00;--s3:#00ff66;
--good:#2fd36a;--warn:#ffb020;--ser:#ff8a4a;--crit:#ff5a5a;
--goodbg:#0e2a1a;--warnbg:#332607;--serbg:#33190c;--critbg:#331212;--s1bg:#10263d;--shadow:0 1px 0 rgba(255,255,255,.03);}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:64px}html,body{overflow-x:hidden;max-width:100%}.tile,.card,.panel,.step>div,.hero>div,.two>*{min-width:0}.tile .l,.hero .hl,.card .ct{overflow-wrap:anywhere}
body{margin:0;background:var(--bg);color:var(--ink);font:15.5px/1.6 "Open Sans",system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:1140px;margin:0 auto;padding:0 20px 80px}
h1,h2,.v,.hero-n{font-family:"Bricolage Grotesque","Montserrat",system-ui,sans-serif;letter-spacing:-.02em}
h3,.ct,.step .o,.tile .l,.kicker,th,.tag,.filters button,.step .n,.num,.sub-k{font-family:"Montserrat",system-ui,sans-serif}
/* ---- cabecalho navy ---- */
.band{background:var(--navy);color:#e7f1ff;position:relative;overflow:hidden}
.band::before{content:"";position:absolute;inset:0;background:radial-gradient(900px 400px at 85% -10%,rgba(0,255,102,.18),transparent 60%),radial-gradient(600px 300px at 0% 110%,rgba(127,176,255,.14),transparent 60%)}
.band::after{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:40px 40px;mask-image:linear-gradient(180deg,rgba(0,0,0,.9),transparent 90%)}
.band .in{position:relative;max-width:1140px;margin:0 auto;padding:28px 20px 34px}
.band .logo{height:34px;width:auto;display:block}
.band .topline{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.band .topline .date{font-family:"Montserrat",sans-serif;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8899aa}
.kicker{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--acc);font-weight:700;margin-top:34px}
.band h1{font-size:clamp(32px,5vw,52px);line-height:1.02;margin:10px 0 8px;font-weight:800;color:#fff}
.band h1 small{display:block;font:500 16px/1.5 "Open Sans",sans-serif;color:#c7d5e5;letter-spacing:0;margin-top:10px;max-width:80ch}
.band .lead{color:#8899aa;max-width:82ch;font-size:14.5px;margin:6px 0 0}
.hero{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:1px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:14px;overflow:hidden;margin-top:28px;backdrop-filter:blur(6px)}
.hero>div{background:rgba(3,16,30,.72);padding:14px 16px;min-width:0}
.hero .hl{font:700 11px/1 "Montserrat",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#8899aa}
.hero-n{font-size:clamp(24px,3vw,30px);font-weight:800;color:#fff;margin:8px 0 2px;line-height:1}.hero-n b{color:var(--acc);font-weight:800}
.hero .hd{font-size:12.5px;color:#c7d5e5}
@media (max-width:1000px){.hero{grid-template-columns:repeat(3,minmax(0,1fr))}}@media (max-width:560px){.hero{grid-template-columns:repeat(2,minmax(0,1fr))}}
/* ---- navegacao fixa ---- */
.toc{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--surf) 88%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.toc .in{max-width:1140px;margin:0 auto;padding:0 20px;display:flex;align-items:center;gap:10px;height:48px}
.toc .links{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:6px;overflow-x:auto;scrollbar-width:none;mask-image:linear-gradient(90deg,#000 calc(100% - 28px),transparent)}
.toc .links::-webkit-scrollbar{display:none}
.toc a{flex:0 0 auto;font:600 12px/1 "Montserrat",sans-serif;color:var(--ink2);text-decoration:none;padding:7px 10px;border-radius:999px;white-space:nowrap}
.toc a b{color:var(--acc-ink);margin-right:5px}.toc a:hover{background:var(--surf2);color:var(--ink)}
#theme{flex:0 0 auto;border:1px solid var(--line);background:var(--surf);color:var(--ink2);border-radius:999px;width:32px;height:32px;cursor:pointer;font-size:15px;line-height:1}#theme:hover{color:var(--ink);border-color:var(--muted)}
/* ---- secoes ---- */
h2{font-size:26px;margin:56px 0 14px;font-weight:800;display:flex;align-items:center;gap:12px;color:var(--ink)}
h2 .num{display:inline-grid;place-items:center;width:38px;height:38px;border-radius:10px;background:var(--navy);color:var(--acc);font:800 15px/1 "Montserrat",sans-serif;flex:0 0 auto;margin:0;letter-spacing:0}
h3{font-size:16px;margin:24px 0 8px;font-weight:700}
p{margin:0 0 12px;max-width:92ch}p.lead{font-size:17px;color:var(--ink2);max-width:92ch}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(168px,100%),1fr));gap:12px;margin:18px 0}
@media (max-width:1000px){.tiles{grid-template-columns:repeat(3,minmax(0,1fr))}}@media (max-width:560px){.tiles{grid-template-columns:repeat(2,minmax(0,1fr))}}
.tile{background:var(--surf);border:1px solid var(--line);border-radius:14px;padding:16px 18px 14px;box-shadow:var(--shadow);position:relative;overflow:hidden;animation:rise .5s both}
.tile::before{content:"";position:absolute;left:0;top:0;right:0;height:3px;background:linear-gradient(90deg,var(--navy),var(--acc))}
.tile:nth-child(2){animation-delay:.05s}.tile:nth-child(3){animation-delay:.1s}.tile:nth-child(4){animation-delay:.15s}.tile:nth-child(5){animation-delay:.2s}.tile:nth-child(6){animation-delay:.25s}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.tile{animation:none}}
.tile .l{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;font-weight:700}
.tile .v{font-size:clamp(24px,3vw,32px);font-weight:800;margin:6px 0 2px;line-height:1}.tile .d{font-size:13px;color:var(--ink2);line-height:1.45}
.up{color:var(--good)}.down{color:var(--crit)}
.panel{background:var(--surf);border:1px solid var(--line);border-radius:16px;padding:20px 22px;margin:14px 0;box-shadow:var(--shadow)}
.panel h3{margin-top:2px}.panel .sub{font-size:13px;color:var(--muted);margin-bottom:10px}
.panel p{max-width:none}.panel.prose p{font-size:16px;line-height:1.65}
@media (min-width:900px){.panel.prose p{columns:2;column-gap:44px;orphans:3;widows:3}}
.panel.prose h3{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--acc-ink);margin-bottom:10px}
.chart{width:100%;height:auto;display:block;font-family:"Open Sans",sans-serif}.grid{stroke:var(--line);stroke-width:1}.tick{font-size:11px;fill:var(--muted)}.ylab{font-size:11px;fill:var(--muted);font-weight:600;font-family:"Montserrat",sans-serif}
.lab{font-size:12.5px;fill:var(--ink2)}.val{font-size:12px;fill:var(--ink2)}.dot{fill:var(--surf);stroke:var(--s1);stroke-width:2;opacity:0}.hit:hover .dot{opacity:1}
.marca{stroke:var(--crit);stroke-width:1;opacity:.55}.marca-t{font-size:10px;fill:var(--crit);font-family:"Montserrat",sans-serif}
.hit{cursor:crosshair}.hit:hover rect{opacity:.85}
#tip{position:fixed;pointer-events:none;background:var(--navy);color:#e7f1ff;font:12px/1.3 "Montserrat",sans-serif;padding:7px 10px;border-radius:8px;display:none;z-index:9;white-space:nowrap;border:1px solid rgba(0,255,102,.35)}
.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.cards>:nth-child(3n+1):last-child{grid-column:1/-1}
.cards>:nth-child(3n+1):nth-last-child(2){grid-column:span 2}
.cards:has(>:nth-child(2):last-child){grid-template-columns:repeat(2,minmax(0,1fr))}
.cards:has(>:only-child){grid-template-columns:1fr}
@media (max-width:1000px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))}.cards>*{grid-column:auto!important}.cards>:nth-child(odd):last-child{grid-column:1/-1!important}}
@media (max-width:640px){.cards{grid-template-columns:1fr}.cards>*{grid-column:auto!important}}
.card{border-radius:14px;padding:18px 20px;border:1px solid var(--line);background:var(--surf);border-left-width:5px;box-shadow:var(--shadow)}
.card.good{border-left-color:var(--good)}.card.warn{border-left-color:var(--warn)}.card.crit{border-left-color:var(--crit)}.card.s1{border-left-color:var(--s1)}
.card .ct{font-weight:700;margin-bottom:6px;font-size:15px;line-height:1.35}.card .cd{font-size:14px;color:var(--ink2)}
.tw{overflow:auto;border:1px solid var(--line);border-radius:12px;background:var(--surf)}table{border-collapse:collapse;width:100%;font-size:13.5px}
th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);padding:11px 12px;border-bottom:1px solid var(--line);background:var(--surf2);position:sticky;top:0;font-weight:700}
td{padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top;border-left:0;border-right:0}td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
td.u{min-width:240px;max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12.5px}td.ac{font-size:12px;color:var(--ink2);min-width:220px;max-width:260px}
tr:last-child td{border-bottom:0}tbody tr:hover td{background:color-mix(in srgb,var(--surf2) 55%,transparent)}
table.tm td:first-child{white-space:nowrap;max-width:300px;overflow:hidden;text-overflow:ellipsis;font-size:12.5px}table.tm td{padding:6px 8px}
a{color:var(--s1);text-decoration:none}a:hover{text-decoration:underline}
code{font:12px/1.4 ui-monospace,Consolas,monospace;background:var(--surf2);padding:1px 5px;border-radius:4px}
.tag{display:inline-block;font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:999px;white-space:nowrap;letter-spacing:.04em;text-transform:uppercase}
.tag.good{background:var(--goodbg);color:var(--good)}.tag.warn{background:var(--warnbg);color:#7a4a00}.tag.ser{background:var(--serbg);color:var(--ser)}.tag.crit{background:var(--critbg);color:var(--crit)}.tag.s1{background:var(--s1bg);color:var(--s1)}.tag.muted{background:var(--surf2);color:var(--ink2)}
:root[data-theme="dark"] .tag.warn{color:var(--warn)}
.nw{white-space:nowrap;display:inline-block;max-width:320px;overflow:hidden;text-overflow:ellipsis;vertical-align:bottom}
.spark{display:inline-flex;align-items:flex-end;gap:1px;height:18px;width:96px}.spark i{flex:1;background:var(--s1);border-radius:1px;min-height:1px;opacity:.75}
.filters{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.filters button{border:1px solid var(--line);background:var(--surf);color:var(--ink);border-radius:999px;padding:6px 13px;font-size:12px;font-weight:600;cursor:pointer}.filters button.on{background:var(--navy);color:var(--acc);border-color:var(--navy)}
.plan .step{display:grid;grid-template-columns:44px 1fr;gap:16px;padding:18px 0;border-bottom:1px solid var(--line)}.step .n{width:38px;height:38px;border-radius:10px;background:var(--navy);color:var(--acc);display:grid;place-items:center;font-weight:800;font-size:15px}
.step .o{font-weight:700;margin-bottom:5px;font-size:15px;line-height:1.4}.step .w{color:var(--ink2);font-size:14.5px}.step .m{font-size:11px;color:var(--muted);margin-top:8px;font-family:"Montserrat",sans-serif;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
ul{margin:4px 0 10px 18px;padding:0}li{margin:3px 0}.ok{color:var(--good);font-weight:700}
.two{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media (max-width:760px){.two{grid-template-columns:1fr}}
.legend{display:flex;gap:16px;font-size:12px;color:var(--ink2);margin:6px 0 0;flex-wrap:wrap}.legend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
.note{font-size:13px;color:var(--muted);border-left:3px solid var(--acc);padding-left:10px;margin:10px 0}
.alert{background:var(--critbg);border:1px solid color-mix(in srgb,var(--crit) 45%,transparent);border-left:8px solid var(--crit);border-radius:16px;padding:22px 24px;margin:18px 0 22px;display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:22px;box-shadow:0 10px 30px -18px rgba(217,48,48,.55)}
.alert .ak{font:800 12px/1 "Montserrat",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--crit);display:flex;align-items:center;gap:8px}
.alert .ak i{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--crit);color:#fff;font-style:normal;font-size:14px;font-weight:800}
.alert h3{font-family:"Bricolage Grotesque","Montserrat",sans-serif;font-size:clamp(20px,2.4vw,26px);line-height:1.15;margin:10px 0 8px;color:var(--crit)}
.alert p{margin:0 0 8px;font-size:15px;color:var(--ink)}.alert .acao{font-weight:700;color:var(--ink)}
.alert .adados{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;align-content:start}
.alert .adados>div{background:var(--surf);border:1px solid color-mix(in srgb,var(--crit) 30%,transparent);border-radius:12px;padding:12px 14px}
.alert .adados .l{font:700 10.5px/1.3 "Montserrat",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.alert .adados .v{font-family:"Bricolage Grotesque",sans-serif;font-size:26px;font-weight:800;color:var(--crit);line-height:1.1;margin-top:4px}
.alert .adados .d{font-size:12px;color:var(--ink2);margin-top:2px}
@media (max-width:900px){.alert{grid-template-columns:1fr}}
mark.hl{background:var(--critbg);color:var(--crit);padding:1px 6px;border-radius:4px;font-weight:700;box-decoration-break:clone;-webkit-box-decoration-break:clone}
details{margin:8px 0}summary{cursor:pointer;color:var(--s1);font-weight:600}
footer{margin-top:64px;padding-top:18px;border-top:1px solid var(--line);font-size:12.5px;color:var(--muted);display:flex;align-items:center;gap:14px;flex-wrap:wrap}footer img{height:22px;width:auto;opacity:.85}
@media (max-width:640px){
 .tw.cardable{overflow:visible;border:0;background:transparent}.tw.cardable table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
 .tw.cardable table,.tw.cardable tbody,.tw.cardable tr,.tw.cardable td{display:block;width:auto}
 .tw.cardable tbody tr{border:1px solid var(--line);border-radius:12px;padding:4px 16px 12px;margin-bottom:12px;background:var(--surf)}
 .tw.cardable td{border:0;padding:10px 0 0;text-align:left;white-space:normal;max-width:none;min-width:0}
 .tw.cardable td::before{content:attr(data-label);display:block;font:700 10.5px/1.4 "Montserrat",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
 .tw.cardable td:empty{display:none}}
@media print{.filters,#tip,.toc{display:none}.panel,.card,.tile{break-inside:avoid;box-shadow:none}body{font-size:12px}.band{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
"""
js = """
try{const t=localStorage.getItem('tema');if(t)document.documentElement.dataset.theme=t;}catch(e){}
document.getElementById('theme').addEventListener('click',()=>{const r=document.documentElement;const n=r.dataset.theme==='dark'?'light':'dark';r.dataset.theme=n;try{localStorage.setItem('tema',n)}catch(e){}});
const tip=document.getElementById('tip');document.querySelectorAll('.hit').forEach(g=>{g.addEventListener('mousemove',ev=>{tip.style.display='block';tip.textContent=g.dataset.l+': '+g.dataset.v;tip.style.left=(ev.clientX+12)+'px';tip.style.top=(ev.clientY-28)+'px'});g.addEventListener('mouseleave',()=>tip.style.display='none')});
document.querySelectorAll('.filters button').forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.f;b.parentElement.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));document.querySelectorAll('#poda tbody tr').forEach(tr=>tr.style.display=(f==='all'||tr.dataset.c===f)?'':'none')}));
"""

H = []
H.append(f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SEO e GEO: {e(N['cliente'])}</title><meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Montserrat:wght@600;700;800&family=Open+Sans:<<REMOVIDO>>;600;700&display=swap" rel="stylesheet">
<style>{css}</style></head><body><div id="tip"></div>
<header class="band"><div class="in">
<div class="topline"><img class="logo" src="data:image/png;base64,{LOGO_BRANCA}" alt="QMIX Digital"><div class="date">Diagnóstico de SEO e GEO · {datetime.date.today().strftime('%d/%m/%Y')}</div></div>
<div class="kicker">Relatório de cliente</div><h1>{e(N['cliente'])}<small>{e(dom)} · {e(N['segmento'])}</small></h1>
<p class="lead">Dados do Google Search Console pela API ({e(N['periodo'])}), rastreio das {A['crawl_n']} URLs do sitemap, autoridade Moz e PageSpeed Insights.</p>
<div class="hero">
<div><div class="hl">Cliques</div><div class="hero-n">{fmt(t90['clk'])}</div><div class="hd">{"no período" if POUCOS_MESES else "últimos 90 dias"}</div></div>
<div><div class="hl">Impressões</div><div class="hero-n">{fmt(t90['imp'])}</div><div class="hd">{"no período" if POUCOS_MESES else "últimos 90 dias"}</div></div>
<div><div class="hl">Posição média</div><div class="hero-n">{pos90:.1f}</div><div class="hd">busca web</div></div>
<div><div class="hl">Domain Authority</div><div class="hero-n">{M.get('da','-')}</div><div class="hd">Moz · spam {M.get('spam','-')}%</div></div>
<div><div class="hl">URLs no sitemap</div><div class="hero-n">{A['crawl_n']}</div><div class="hd">{len([p for p in pags if p['imp90']>0])} com impressão</div></div>
<div><div class="hl">Plano de ação</div><div class="hero-n"><b>{len(N.get('plano', []))}</b></div><div class="hd">passos em ordem de custo</div></div>
</div></div></header>
<nav class="toc"><div class="in"><div class="links">__TOC__</div><button id="theme" type="button" aria-label="Alternar tema claro e escuro" title="Tema claro / escuro">&#9681;</button></div></nav>
<div class="wrap">""")

# 1 resumo
AL = N.get("alerta")
alerta_html = ""
if AL:
    dados = "".join(f'<div><div class="l">{e(x[0])}</div><div class="v">{e(x[1])}</div><div class="d">{e(x[2]) if len(x) > 2 else ""}</div></div>' for x in AL.get("dados", []))
    alerta_html = f'<div class="alert" role="alert"><div><div class="ak"><i>!</i>{e(AL.get("k", "Atenção"))}</div><h3>{e(AL["t"])}</h3><p>{e(AL["d"])}</p><p class="acao">{e(AL.get("acao", ""))}</p></div><div class="adados">{dados}</div></div>'
H.append(f"""<h2><span class="num">1</span>Resumo executivo</h2>{alerta_html}
<div class="tiles">
<div class="tile"><div class="l">Cliques ({"período" if POUCOS_MESES else "90 dias"})</div><div class="v">{fmt(t90['clk'])}</div><div class="d">{("primeiro período com dados, sem comparação") if tant['clk'] == 0 else (f"<span class='{'up' if var_clk>=0 else 'down'}'>{var_clk:+.0f}%</span> contra os 90 dias anteriores ({fmt(tant['clk'])})")}</div></div>
<div class="tile"><div class="l">Impressões ({"período" if POUCOS_MESES else "90 dias"})</div><div class="v">{fmt(t90['imp'])}</div><div class="d">{("em " + str(dias_dados) + " dias") if tant['imp'] == 0 else (f"<span class='{'up' if var_imp>=0 else 'down'}'>{var_imp:+.0f}%</span>" + (f" · {100*imp_img/max(1,t90['imp']):.0f}% são miniaturas de imagem" if CFG.get("img") else ""))}</div></div>
<div class="tile"><div class="l">Posição média</div><div class="v">{pos90:.1f}</div><div class="d">{("site com só " + str(dias_dados) + " dias de dados") if POUCOS_MESES else ("era " + str(mensal[0]['pos'] if mensal[0]['dias']>20 else mensal[1]['pos']) + " há 16 meses")}</div></div>
{(f'<div class="tile"><div class="l">Dias com dados</div><div class="v">{dias_dados}</div><div class="d">propriedade recente no Search Console: tendência ainda não é conclusiva</div></div>') if POUCOS_MESES else (f'<div class="tile"><div class="l">Variação desde o pico</div><div class="v {"down" if queda_ano < 0 else "up"}">{queda_ano:+.0f}%</div><div class="d">{fmt(pico["clicks"])} cliques em {pico["mes"][5:]}/{pico["mes"][2:4]} para {fmt(ult["clicks"])} em {ult["mes"][5:]}/{ult["mes"][2:4]}</div></div>')}
<div class="tile"><div class="l">Domain Authority (Moz)</div><div class="v">{M.get('da','-')}</div><div class="d">{M.get('ref_domains','-')} domínios de referência · spam {M.get('spam','-')}%</div></div>
<div class="tile"><div class="l">Cliques de marca</div><div class="v">{A['marca_clk90']}</div><div class="d">{100*A['marca_clk90']/max(1,t90['clk']):.0f}% dos cliques são busca pelo nome</div></div>
</div>
<div class="panel prose"><h3>Veredito</h3><p>{destaca(e(N['veredito']))}</p></div>""")

# 2 excelente
H.append('<h2><span class="num">2</span>O que está excelente</h2><div class="cards">' + "".join(card(x["t"], e(x["d"]), "good") for x in N["excelente"]) + "</div>")

# 3 oscilacoes
H.append(f"""<h2><span class="num">3</span>Oscilações: {("os " + str(dias_dados) + " dias de dados") if POUCOS_MESES else "16 meses de histórico"}</h2>
<div class="panel"><h3>{"Cliques e impressões por dia" if POUCOS_MESES else "Cliques por semana"}</h3><div class="sub">Busca web, todas as páginas.{"" if POUCOS_MESES else " As linhas vermelhas marcam os pontos de virada explicados abaixo."}</div>
{line_chart([x['clicks'] for x in diario], [x['dia'][5:].replace('-','/') for x in diario], ylabel='cliques / dia') if POUCOS_MESES else line_chart([x['clicks'] for x in semanal], [x['semana'][5:].replace('-','/') for x in semanal], ylabel='cliques / semana', marcas=[(next((i for i,s in enumerate(semanal) if s['semana'][:7]==mensal[idx]['mes']),-1), t) for idx,t in marcas])}</div>
<div class="two">
<div class="panel"><h3>Impressões por {"dia" if POUCOS_MESES else "mês"}</h3><div class="sub">{e(T.get("impressoes_sub", "Inclui miniaturas de imagem quando o site aparece em carrossel." if CFG.get("img") else "Busca web."))}</div>{bar_chart([x['imp'] for x in diario], [x['dia'][5:].replace('-','/') for x in diario], w=520, h=230, ylabel='impressões / dia') if POUCOS_MESES else bar_chart([x['imp'] for x in mensal], labels_m, w=520, h=230, ylabel='impressões / mês')}</div>
<div class="panel"><h3>Posição média por {"dia" if POUCOS_MESES else "mês"}</h3><div class="sub">Quanto mais baixo o número, melhor.{"" if POUCOS_MESES else f" Foi de {mensal[1]['pos']} para {mensal[-2]['pos']}."}</div>{line_chart([x['pos'] for x in diario], [x['dia'][5:].replace('-','/') for x in diario], w=520, h=230, cor='var(--s3)', invert=True, ylabel='posição média') if POUCOS_MESES else line_chart([x['pos'] for x in mensal], labels_m, w=520, h=230, cor='var(--s3)', invert=True, ylabel='posição média')}</div>
</div>
<div class="cards">{"".join(card(x['quando'] + ': ' + x['o_que'], e(x['por_que']), 'warn') for x in N['oscilacoes'])}</div>
<div class="panel"><h3>Cliques por mês das páginas com mais cliques</h3><div class="sub">Linha = página, coluna = mês. Mostra onde o tráfego está mudando.</div>
{tabela(['Página'] + labels_m, [[link(p['url'], p['url'][:44])] + [f'<span class="n">{v}</span>' for v in p['mensal']] for p in sorted(pags, key=lambda x: -x['clk480'])[:10]], 'tm')}</div>""")

# 4 estrutura
H.append(f"""<h2><span class="num">4</span>Estrutura do tráfego</h2>
<div class="panel"><h3>Cliques por página (90 dias)</h3><div class="sub">{"Laranja: posts que aparecem como imagem. " if CFG.get("img") else ""}Verde: home. Azul: demais.</div>
{hbar([(p['url'], p['clk90'], f"cliques · {fmt(p['imp90'])} imp · pos {p['pos90']}") for p in top_pg], cor_fn=cor_pg)}
<div class="legend"><span><i style="background:var(--s1)"></i>Páginas de texto</span>{'<span><i style="background:var(--s2)"></i>Posts de imagem</span>' if CFG.get("img") else ""}<span><i style="background:var(--s3)"></i>Home</span></div></div>
<div class="tiles">
{(f'<div class="tile"><div class="l">Impressões de imagem</div><div class="v">{fmt(imp_img)}</div><div class="d">{clk_img} cliques. Páginas em "posição" 2 a 6 com CTR quase zero: é a miniatura no carrossel, não o resultado azul.</div></div><div class="tile"><div class="l">Tráfego real (sem imagem)</div><div class="v">{fmt(t90["imp"]-imp_img)}</div><div class="d">impressões e {fmt(t90["clk"]-clk_img)} cliques. É este número que mede o negócio.</div></div>') if CFG.get("img") else (f'<div class="tile"><div class="l">Páginas com impressão</div><div class="v">{len([p for p in pags if p["imp90"]>0])}</div><div class="d">de {A["crawl_n"]} URLs no sitemap. {e(T.get("paginas_sub", ""))}</div></div><div class="tile"><div class="l">Tipos de página</div><div class="v">{len(set(p["tipo"] for p in pags))}</div><div class="d">{e("; ".join(f"{k}: {v} imp" for k, v in sorted(collections.Counter({t: sum(p["imp90"] for p in pags if p["tipo"]==t) for t in set(p["tipo"] for p in pags)}).items(), key=lambda x: -x[1])))}</div></div>')}
<div class="tile"><div class="l">Cauda longa oculta</div><div class="v">{oculto:.0f}%</div><div class="d">dos cliques vêm de consultas que o Google não mostra. Otimizar só pela lista visível subestima as páginas.</div></div>
<div class="tile"><div class="l">Desktop x mobile</div><div class="v">{A['device'].get('DESKTOP',{}).get('clk',0)} / {A['device'].get('MOBILE',{}).get('clk',0)}</div><div class="d">cliques. {e(T.get("device_sub", ""))}</div></div>
</div>""")

# 5 posicao
H.append(f"""<h2><span class="num">5</span>Diagnóstico por posição</h2>
<p>Cada consulta com {CFG.get("min_imp_bucket", 150)} ou mais impressões foi classificada pela posição. Métricas médias do site não dizem nada; o que importa é onde cada batalha está.</p>
<div class="panel"><h3>Impressões por faixa de posição</h3><div class="sub">Consultas com {CFG.get("min_imp_bucket", 150)} ou mais impressões.</div>{hbar(bk_items, cor_fn=bk_cor)}</div>
<div class="cards">{"".join(card(c["t"], e(c["d"]), c.get("c", "s1")) for c in N.get("posicao_cards", []))}</div>
{(f'<div class="panel"><h3>{e(T.get("locais_titulo", "Consultas-alvo na porta da click zone (posição 3 a 15)"))}</h3><div class="sub">É a lista de alvos: cada uma dessas já está na primeira ou segunda página. Backlinks e as frases exatas no texto empurram para o top 3.</div>' + tabela(["Consulta", "Página", "Impressões", "Cliques", "Posição"], [[e(q["q"]), link(q["page"], q["page"][:40]), f"<span class=\'n\'>{q['imp']}</span>", str(q["clk"]), str(q["pos"])] for q in locais_porta]) + '</div><details><summary>Consultas-alvo fora da click zone (posição acima de 15)</summary>' + tabela(["Consulta", "Página", "Impressões", "Posição"], [[e(q["q"]), link(q["page"], q["page"][:40]), str(q["imp"]), str(q["pos"])] for q in locais_fora]) + '</details>') if A["locais"] else ('<div class="panel"><h3>Consultas na porta da click zone (posição 4 a 15)</h3>' + tabela(["Consulta", "Impressões", "Cliques", "Posição"], [[e(q["q"]), str(q["imp"]), str(q["clk"]), str(q["pos"])] for q in B["porta"][:25]]) + '</div>')}""")

# 6 canibalizacao
canib_rows = []
for c in A["canib"][:14]:
    canib_rows.append([f"<b>{e(c['q'])}</b><br><span class='note' style='border:0;padding:0'>{fmt(c['imp'])} impressões</span>",
                       "<br>".join(f"{link(p['page'], p['page'][:55])} · pos {p['pos']} · {p['imp']} imp · {p['clk']} clk" for p in c["paginas"])])
H.append(f"""<h2><span class="num">6</span>Canibalização: páginas do próprio site disputando a mesma consulta</h2>
<p>Quando duas URLs do mesmo domínio aparecem para a mesma busca, elas se revezam e nenhuma consolida posição. Os casos abaixo vêm do cruzamento consulta + página da API.</p>
{tabela(['Consulta', 'Páginas que rotacionam'], canib_rows) if canib_rows else '<p class="ok">Nenhuma canibalização relevante no período (páginas diferentes disputando a mesma consulta).</p>'}
{(f'<div class="panel"><h3>URLs duplicadas por variação de endereço ({len(A["variantes"])})</h3><div class="sub">A mesma página aparece no Google em mais de uma forma (com e sem barra final, com e sem www, parâmetros). Não é canibalização entre páginas, é a mesma página dividida. O canonical resolve parte; o 301 resolve tudo.</div>' + tabela(["Página", "Formas indexadas (impressões no histórico)"], [[link(v["page"], v["page"][:60]), "<br>".join(f"<code>{e(f)}</code> · {n} imp" for f, n in v["formas"])] for v in A["variantes"][:25]]) + '</div>') if A.get("variantes") else ""}
<div class="cards">{"".join(card(c["t"], e(c["d"]), c.get("c", "warn")) for c in N.get("canib_cards", []))}</div>
""")

# 7 poda
cont = {k: len(v) for k, v in cls.items()}
H.append(f"""<h2><span class="num">7</span>Poda de conteúdo: o que manter, atualizar, fundir e remover</h2>
<p>Cada URL do sitemap foi cruzada com {"os dias disponíveis" if POUCOS_MESES else "16 meses"} de Search Console (cliques, impressões, posição), tamanho do texto, data e links internos recebidos. A classificação é uma proposta; página comercial nunca é podada, só fortalecida.</p>
<div class="tiles">
{"".join(f'<div class="tile"><div class="l">{nomes[k]}</div><div class="v">{cont.get(k,0)}</div><div class="d">{ {"excelente":"8+ cliques em 90 dias, no tema","comercial":"páginas de serviço","atualizar":"impressões altas, posição 4 a 30","manter":"tráfego residual","fundir":"duplicata ou página de cidade","podar":"sem retorno no histórico","utilitaria":"páginas de apoio","fora":"tag ou URL antiga com impressão","produto":"páginas de produto"}[k] }</div></div>' for k in ordem)}
</div>
<div class="panel prose"><h3>{e(T.get("poda_titulo", "Por que podar"))}</h3><p>{e(T.get("poda_texto", f"Um site com {len(pags)} URLs indexáveis e {cont.get('comercial',0)} que vendem manda ao Google um sinal de qualidade média baixa quando a maior parte do índice é texto sem clique. Remover (noindex ou 301 para o tema mais próximo) concentra rastreio, autoridade interna e avaliação de qualidade nas páginas que importam."))}</p></div>
<div class="filters"><button class="on" data-f="all">Todas ({len(pags)})</button>{"".join(f'<button data-f="{k}">{nomes[k]} ({cont.get(k,0)})</button>' for k in ordem if cont.get(k))}</div>
<div class="tw" style="max-height:70vh"><table id="poda"><thead><tr><th>Classe</th><th>URL</th><th>Clk 90d</th><th>Clk 90d ant.</th><th>Clk 16m</th><th>Imp 90d</th><th>Pos</th><th>Palavras</th><th>Links int. recebidos</th><th>Modificado</th><th>Histórico</th><th>Ação proposta</th></tr></thead><tbody>{"".join(poda_rows)}</tbody></table></div>""")

# 8 linkagem
H.append(f"""<h2><span class="num">8</span>Linkagem interna e externa</h2>
<div class="panel"><h3>Links internos recebidos pelas páginas comerciais</h3><div class="sub">Links de corpo de texto recebidos de outras páginas (menu e rodapé excluídos). Vermelho: 0 ou 1. Páginas no menu recebem link de navegação de todas as páginas, mas navegação não passa relevância de âncora.</div>{hbar(inl_items, cor_fn=inl_cor)}</div>
<div class="panel"><h3>Leitura</h3><p>{e(T.get("links_leitura", "As páginas comerciais são as que precisam de autoridade interna e costumam ser as que menos recebem link de corpo. A regra: o primeiro link do corpo de cada post é o mais importante, e deve ir para a página comercial do tema, com âncora de palavra-chave."))}</p>
<p>Páginas órfãs (nenhum link interno recebido, fora da navegação): <b>{len(L['orfas'])}</b>.</p>{lista(L['orfas'], 12)}</div>
<div class="panel"><h3>Primeiro link interno do corpo nas 20 páginas com mais impressões</h3><div class="sub">Primeiro link de texto fora do menu e do rodapé. Verde: aponta para página comercial. Amarelo: aponta para blog ou categoria, ou não há link de corpo.</div>{tabela(['Página', 'Primeiro link e âncora', 'Avaliação'], pl_rows)}</div>
<div class="panel"><h3>Âncoras usadas nos links para as páginas comerciais</h3><div class="sub">Âncora com a palavra-chave do destino, variando entre páginas. "(imagem/vazio)" é link em imagem ou botão sem texto, que não passa relevância.</div>{tabela(['Página comercial', 'Links recebidos', 'Âncoras mais usadas'], anc_rows)}</div>
<div class="two">
<div class="panel"><h3>Links externos saindo do site</h3><div class="sub">{L['ext_total']} links para fora em {A['crawl_n']} páginas, {L['ext_nofollow']} com nofollow ou sponsored.</div>{tabela(['Domínio de destino', 'Links'], [[e(h), str(n)] for h, n in ext_hosts[:18]])}</div>
<div class="panel"><h3>Links externos dofollow fora de redes sociais e Google</h3><div class="sub">Conferir um a um: link para concorrente, ferramenta ou site sem relação passa autoridade de graça. {len(ext_suspeitos)} encontrados.</div>{tabela(['De', 'Para', 'Âncora'], [[f"<span class='nw'>{e(x['de'][:34])}</span>", f"<a class='nw' href='{e(x['para'])}' target='_blank' rel='noopener nofollow'>{e(x['para'].replace('https://','').replace('http://','')[:44])}</a>", f"<span class='nw'>{e(x['anchor'][:28])}</span>"] for x in ext_suspeitos[:25]])}</div>
</div>""")

# 9 on-page tecnico
psi_tiles = ""
for b in psi:
    m = b["m"]; perf = m.get("Performance", "")
    try: pv = float(perf.replace("%", "").replace(",", "."))
    except: pv = 0
    c = "up" if pv >= 90 else ("" if pv >= 50 else "down")
    psi_tiles += f'<div class="tile"><div class="l">{e(b["strategy"] or "")} · {e(b["url"].replace("https://"+dom,"") or "/")[:34]}</div><div class="v {c}">{e(perf) or "-"}</div><div class="d">LCP {e(m.get("LCP","-"))} · CLS {e(m.get("CLS","-"))} · TBT {e(m.get("TBT","-"))}<br><span style="font-size:12px">{e("; ".join(b["op"][:2]))}</span></div></div>'
H.append(f"""<h2><span class="num">9</span>On-page e técnico</h2>
<div class="two">{"".join(f'<div class="panel"><h3>{e(t)}</h3>{lista(v)}</div>' for t, v in onpage)}</div>
<div class="panel"><h3>Core Web Vitals (PageSpeed Insights)</h3><div class="sub">Nota de performance de 0 a 100, LCP (carregamento), CLS (estabilidade) e INP (resposta). Meta: LCP abaixo de 2,5 s, CLS abaixo de 0,1, INP abaixo de 200 ms.</div>
<div class="tiles">{psi_tiles or '<div class="tile"><div class="d">PageSpeed não disponível neste relatório.</div></div>'}</div>
{('<details><summary>Saída completa do PageSpeed</summary><pre style="font-size:12px;white-space:pre-wrap">' + e(PSI[:12000]) + '</pre></details>') if PSI else ''}
<div class="note">Tempo médio de resposta do servidor no rastreio: {A['crawl_ms_medio']} ms por página. {e(T.get("plataforma", ""))}</div></div>""")

# 10 autoridade
if M:
    top = M.get("top_links", [])
    H.append(f"""<h2><span class="num">10</span>Autoridade e perfil de backlinks (Moz, {e(M.get('data',''))})</h2>
<div class="tiles"><div class="tile"><div class="l">Domain Authority</div><div class="v">{M['da']}</div><div class="d">Page Authority da home: {M.get('pa_home','-')}</div></div>
<div class="tile"><div class="l">Domínios de referência</div><div class="v">{M['ref_domains']}</div><div class="d">{fmt(M.get('ext_pages',0))} páginas externas linkando</div></div>
<div class="tile"><div class="l">Spam score</div><div class="v up">{M['spam']}%</div><div class="d">limpo (acima de 30% é alerta)</div></div></div>
<div class="two"><div class="panel"><h3>25 domínios mais fortes que linkam</h3>{tabela(['Domínio', 'DA', 'Spam'], [[e(x['dom']), str(x['da']), (tag('crit', str(x['spam'])+'%') if x['spam']>=30 else str(x['spam'])+'%')] for x in top])}</div>
<div class="panel"><h3>Leitura</h3>{"".join(f"<p>{x}</p>" for x in N.get("moz_leitura", []))}</div></div>""")

# 11 GEO
H.append(f"""<h2><span class="num">11</span>GEO e AEO: aparecer em AI Overview, ChatGPT e Perplexity</h2>
<p>{e(T.get("geo_intro", "Busca com IA não substitui o SEO, ela o consome: o modelo cita páginas que o Google já confia, com resposta direta e entidade clara. A resposta é ser a fonte citada, não lutar contra."))}</p>
{tabela(['Sinal', 'Situação', 'Por que importa'], [[e(t), (tag('good','ok') if v is True else (tag('crit','falta') if v is False else tag('muted','não medido'))), e(d)] for t, v, d in geo_sinais])}
<div class="cards">{"".join(card(c["t"], e(c["d"]), c.get("c", "s1")) for c in N.get("geo_cards", []))}</div>""")

# 12 expandir
if exp_blocos:
    bl = ""
    for u, ref, exp, gra in exp_blocos:
        if not (ref or exp or gra):
            continue
        bl += f"<div class='panel'><h3>{link(u)}</h3>"
        if ref: bl += "<div class='sub'>Reforçar: todas as palavras já estão no texto, falta a frase exata. Ajustar uma frase.</div>" + tabela(["Consulta", "Imp", "Cliques", "Pos"], [[e(r[0]), r[1], r[2], r[3]] for r in ref])
        if exp: bl += "<div class='sub' style='margin-top:10px'>Expandir: falta uma palavra da consulta. H2, parágrafo ou item de FAQ na mesma página.</div>" + tabela(["Consulta", "Imp", "Cliques", "Pos"], [[e(r[0]), r[1], r[2], r[3]] for r in exp])
        if gra: bl += "<div class='sub' style='margin-top:10px'>Grafia do usuário: escrever uma vez como ele digita.</div>" + tabela(["Consulta", "Imp", "Cliques", "Pos"], [[e(r[0]), r[1], r[2], r[3]] for r in gra])
        bl += "</div>"
    H.append(f"""<h2><span class="num">12</span>Expandir as páginas comerciais pelo que o Google já associou</h2>
<p>O Google mostra estas páginas para consultas cujo termo não está no texto. Incorporar o termo numa página que já tem confiança cresce mais rápido do que criar página nova. Ordem dos H2: a mesma em que os atributos aparecem nos títulos da SERP.</p>{bl}""")

# 13 plano
H.append(f"""<h2><span class="num">13</span>Plano de ação em ordem de prioridade</h2>
<p>Custo baixo primeiro. Cada item diz o que fazer e por que, com o dado que justifica.</p><div class="plan">
{"".join(f'<div class="step"><div class="n">{s["p"]}</div><div><div class="o">{e(s["o_que"])}</div><div class="w">{e(s["por_que"])}</div><div class="m">custo: {e(s["custo"])} · prazo: {e(s["prazo"])}</div></div></div>' for s in N["plano"])}
</div>""")

H.append(f"""<h2><span class="num">14</span>Método e glossário</h2>
<div class="panel"><ul>
<li><b>Fonte:</b> API do Search Console (busca web, tipo "web"), com cruzamento consulta + página que a exportação não dá. Dados do GSC atrasam 2 a 3 dias e são amostra; posição com poucas impressões é ruído.</li>
<li><b>Click zone:</b> posições 1 a 3 (termos pequenos) ou 1 a 7 (termos grandes). Fora dela o title é irrelevante porque ninguém vê.</li>
<li><b>Porta da click zone:</b> posição 4 a 15. Principal alavanca de crescimento e principal argumento de link building.</li>
<li><b>Canibalização:</b> duas URLs do mesmo site na mesma consulta. Detectada direto pela API, sem inferência por slug.</li>
<li><b>Poda:</b> classificação automática por cliques 90 dias, cliques 16 meses, impressões, posição, tipo de página e tema. É proposta, revisada caso a caso antes de executar.</li>
<li><b>AI Overview:</b> resposta gerada pelo Google no topo da SERP. Sinal nos dados: posição e impressões mantidas, cliques caindo. Confirmar abrindo a busca.</li>
<li><b>DA (Moz):</b> escala 0 a 100 de autoridade do domínio, comparativa. Spam score acima de 30% é alerta.</li>
<li><b>Nunca prometer posição.</b> O relatório reporta probabilidade e mecânica, não resultado garantido.</li>
</ul></div>
<footer><img src="data:image/png;base64,{LOGO}" alt="QMIX Digital"><span>Relatório gerado a partir da API do Search Console, rastreio do site, Moz e PageSpeed · {datetime.date.today().strftime('%d/%m/%Y')}</span></footer>
</div><script>{js}</script></body></html>""")

final = "".join(H)
secs = re.findall(r'<h2><span class="num">(\d+)</span>(.*?)</h2>', final)
toc = "".join(f'<a href="#s{n}"><b>{n}</b>{re.sub(r"<.*?>", "", t).split(":")[0][:28]}</a>' for n, t in secs)
final = re.sub(r'<h2><span class="num">(\d+)</span>', lambda m: f'<h2 id="s{m.group(1)}"><span class="num">{m.group(1)}</span>', final)
final = final.replace("__TOC__", toc)
open(saida, "w", encoding="utf-8").write(final)
print("gravado", saida, len("".join(H)) // 1024, "KB")
