# -*- coding: utf-8 -*-
"""Cruza gsc_dump.json + crawl.json e gera analise.json com tudo que o relatorio HTML precisa.

Uso: python build_analise.py PASTA_DO_CLIENTE DOMINIO
"""
import sys, json, re, collections, os
from urllib.parse import urlparse

pasta, dom = sys.argv[1], sys.argv[2]
d = json.load(open(os.path.join(pasta, "dados", "gsc_dump.json"), encoding="utf-8"))
CFG = json.load(open(os.path.join(pasta, "dados", "config.json"), encoding="utf-8"))
TH = CFG.get("thresholds", {})
crawl = json.load(open(os.path.join(pasta, "dados", "crawl.json"), encoding="utf-8"))


def fix_moji(x):
    """Desfaz mojibake (pagina UTF-8 lida como latin-1) em qualquer string do crawl."""
    if isinstance(x, str):
        if "Ã" in x or "Â" in x:
            try:
                return x.encode("latin-1").decode("utf-8")
            except (UnicodeEncodeError, UnicodeDecodeError):
                return x
        return x
    if isinstance(x, list):
        return [fix_moji(i) for i in x]
    if isinstance(x, dict):
        return {k: fix_moji(v) for k, v in x.items()}
    return x
crawl = fix_moji(crawl)
base = CFG.get("base") or ("https://%s" % dom)


def path(u):
    u = u.replace(base, "").split("#")[0].split("?")[0]
    if not u:
        return "/"
    return u if u.endswith("/") or "." in u.rsplit("/", 1)[-1] else u + "/"


# ---------- serie mensal ----------
m = collections.OrderedDict()
for r in sorted(d["date_16m"], key=lambda x: x["keys"][0]):
    k = r["keys"][0][:7]
    a = m.setdefault(k, {"mes": k, "clicks": 0, "imp": 0, "pw": 0.0, "dias": 0})
    a["clicks"] += r["clicks"]; a["imp"] += r["impressions"]; a["pw"] += r["position"] * r["impressions"]; a["dias"] += 1
mensal = []
for a in m.values():
    a["pos"] = round(a["pw"] / a["imp"], 1) if a["imp"] else 0
    a["ctr"] = round(100 * a["clicks"] / a["imp"], 2) if a["imp"] else 0
    del a["pw"]; mensal.append(a)

diario = [{"dia": r["keys"][0], "clicks": r["clicks"], "imp": r["impressions"], "pos": round(r["position"], 1)} for r in sorted(d["date_16m"], key=lambda x: x["keys"][0])]
# serie semanal (suaviza oscilacao)
sem = collections.OrderedDict()
import datetime
for r in sorted(d["date_16m"], key=lambda x: x["keys"][0]):
    dt = datetime.date.fromisoformat(r["keys"][0]); k = (dt - datetime.timedelta(days=dt.weekday())).isoformat()
    a = sem.setdefault(k, {"semana": k, "clicks": 0, "imp": 0, "pw": 0.0})
    a["clicks"] += r["clicks"]; a["imp"] += r["impressions"]; a["pw"] += r["position"] * r["impressions"]
semanal = []
for a in sem.values():
    a["pos"] = round(a["pw"] / a["imp"], 1) if a["imp"] else 0; del a["pw"]; semanal.append(a)

# ---------- paginas ----------
def agrega(rows):
    """Soma variantes da mesma URL (#ancora, sem barra, ?query) numa so."""
    out = {}
    for r in rows:
        u = path(r["keys"][0]); a = out.setdefault(u, {"clicks": 0, "impressions": 0, "pw": 0.0})
        a["clicks"] += r["clicks"]; a["impressions"] += r["impressions"]; a["pw"] += r["position"] * r["impressions"]
    for a in out.values():
        a["position"] = a["pw"] / a["impressions"] if a["impressions"] else 0
        a["ctr"] = a["clicks"] / a["impressions"] if a["impressions"] else 0
    return out
p90 = agrega(d["page_90"]); p180 = agrega(d["page_180"]); p480 = agrega(d["page_480"])
pm = collections.defaultdict(lambda: collections.defaultdict(int))
for r in d["page_date_480"]:
    pm[path(r["keys"][0])][r["keys"][1][:7]] += r["clicks"]

# crawl por path
cr = {}
for c in crawl:
    cr[path(c["url"])] = c
inlinks_tot = collections.Counter()
for c in crawl:
    for dst in {path(l["href"]) for l in c.get("links_internos", [])}:
        inlinks_tot[dst] += 1
NAV = {u for u, n in inlinks_tot.items() if n >= 0.4 * len(crawl)}  # menu e rodape
# ancoras de navegacao: par (destino, ancora) presente em 60%+ das paginas
norm_anc = lambda t: re.sub(r"[^a-z0-9 ]", "", t.lower()).strip()  # tolera mojibake de acento
par_tot = collections.Counter()
for c in crawl:
    for dst, anc in {(path(l["href"]), norm_anc(l["anchor"])) for l in c.get("links_internos", [])}:
        par_tot[(dst, anc)] += 1
NAV_ANC = {k for k, n in par_tot.items() if n >= 0.4 * len(crawl) or (k[0] in NAV and n >= 0.15 * len(crawl))}  # par repetido em template
inlinks = collections.Counter(); inlink_anchors = collections.defaultdict(list)
for c in crawl:
    src = path(c["url"]); seen = set()
    for l in c.get("links_internos", []):
        dst = path(l["href"]); anc = norm_anc(l["anchor"])
        if dst == src or dst in seen:
            continue
        if (dst, anc) in NAV_ANC or (dst in NAV and not anc):
            continue  # link de menu/rodape ou link em imagem para pagina de menu
        seen.add(dst); inlinks[dst] += 1; inlink_anchors[dst].append(l["anchor"])
# ancoras de navegacao (uma vez), para as comerciais que estao no menu
nav_anchor = {}
if crawl:
    for l in crawl[0].get("links_internos", []):
        nav_anchor.setdefault(path(l["href"]), l["anchor"])

OFFTOPIC = tuple(CFG.get("offtopic", []))
COMERCIAL = tuple(CFG.get("comercial_exatas", []))
COMERCIAL_PREF = tuple(CFG.get("comercial_prefixos", []))
CIDADE = tuple(CFG.get("cidade", []))
TIPOS = CFG.get("tipos", [])


def tipo_de(u):
    if u in COMERCIAL or any(u.startswith(p) for p in COMERCIAL_PREF):
        return "comercial"
    if any(x in u for x in CIDADE):
        return "cidade"
    for pref, t in TIPOS:
        if pref == "/" and u == "/":
            return t
        if pref != "/" and u.startswith(pref):
            return t
    return "post"

DIAS_DADOS = len(d["date_16m"])
paginas = []
todos = set(p480) | set(cr)
for u in todos:
    if "/category/" in u or "#" in u or u.startswith("/wp-") or re.search(r"\.xml/?$", u):
        continue
    c = cr.get(u, {}); a90 = p90.get(u, {}); a180 = p180.get(u, {}); a480 = p480.get(u, {})
    tipo = tipo_de(u)
    # primeiro link interno de corpo: primeiro <a> interno fora do menu/rodape com texto
    pl_corpo = ""
    for l in c.get("links_internos", []):
        dst = path(l["href"]); anc = norm_anc(l["anchor"])
        if dst == u or (dst, anc) in NAV_ANC or (dst in NAV and not anc) or not anc:
            continue
        pl_corpo = dst; pl_anc = l["anchor"]; break
    clk90 = a90.get("clicks", 0); imp90 = a90.get("impressions", 0); pos90 = a90.get("position", 0)
    clk480 = a480.get("clicks", 0); imp480 = a480.get("impressions", 0)
    clk_ant = a180.get("clicks", 0) - clk90
    off = any(x in u for x in OFFTOPIC)
    if u not in cr and imp480 < 20:
        continue
    # classificacao de poda
    if u not in cr:
        classe = "fora"; acao = "fora do sitemap mas com impressões: tag, URL antiga ou página removida. Tags: noindex. URL antiga: 301 para a equivalente"
    elif tipo == "utilitaria":
        classe = "utilitaria"; acao = "noindex ou manter fora do foco: página de apoio, não disputa busca"
    elif tipo == "produto":
        if imp480 == 0:
            classe = "produto"; acao = "produto sem nenhuma impressão: conferir indexação (URL Inspection), título com nome completo e marca, descrição própria"
        elif clk90 >= TH.get("excelente_clk90", 8):
            classe = "excelente"; acao = "produto que já traz clique: reforçar com avaliações, FAQ e link do blog"
        else:
            classe = "produto"; acao = "produto indexado com pouca busca: título e descrição únicos, link a partir da categoria e do blog"
    elif tipo == "comercial":
        classe = "comercial"; acao = "manter; precisa de links internos e autoridade" if imp90 < 100 else "manter e fortalecer"
    elif tipo == "cidade":
        classe = "fundir"; acao = "301 para a página de criação de sites BH com H2 regional (página de cidade sem tráfego)" if clk480 < 5 else "manter; avaliar"
    elif clk90 >= TH.get("excelente_clk90", 8) and not off:
        classe = "excelente"; acao = "manter; é das páginas que mais trazem cliques, revisar a cada 6 meses"
    elif clk90 >= 10 and off:
        classe = "manter"; acao = "manter; traz cliques mas fora do negócio, adicionar CTA para serviço"
    elif imp90 >= TH.get("atualizar_imp90", 300) and 4 <= pos90 <= 30:
        classe = "atualizar"; acao = "atualizar e reforçar: impressões altas e posição na porta da click zone"
    elif DIAS_DADOS < 60 and imp480 < TH.get("podar_imp480", 150):
        classe = "manter"; acao = "site novo: ainda sem dados para decidir; conferir indexação e linkar da categoria"
    elif imp480 < TH.get("podar_imp480", 150) and clk480 <= TH.get("podar_clk480", 1):
        classe = "podar"; acao = "podar: 16 meses sem cliques e quase sem impressões; 301 para o tema mais próximo ou noindex"
    elif off and clk480 <= 3 and imp480 < TH.get("manter_img_imp480", 3000):
        classe = "podar"; acao = "podar: fora do negócio e sem retorno em 16 meses"
    elif off and imp480 >= TH.get("manter_img_imp480", 3000):
        classe = "manter"; acao = "manter: tráfego de imagem fora do negócio; não custa nada e pode levar CTA para o serviço"
    else:
        classe = "manter"; acao = "manter; tráfego residual, sem prioridade"
    paginas.append({
        "url": u, "tipo": tipo, "classe": classe, "acao": acao,
        "clk90": clk90, "imp90": imp90, "pos90": round(pos90, 1), "ctr90": round(100 * a90.get("ctr", 0), 2),
        "clk_ant": clk_ant, "clk480": clk480, "imp480": imp480,
        "mensal": [pm[u].get(x["mes"], 0) for x in mensal],
        "title": c.get("title", ""), "title_len": c.get("title_len", 0), "meta_len": c.get("meta_desc_len", 0),
        "h1": (c.get("h1") or [""])[0], "n_h1": len(c.get("h1") or []), "n_h2": c.get("n_h2", 0),
        "palavras": c.get("palavras", 0), "status": c.get("status", 0), "robots": c.get("robots", ""),
        "canonical_ok": (c.get("canonical", "") or "").rstrip("/") == (base + u).rstrip("/"),
        "schema": c.get("schema", []), "imgs_sem_alt": c.get("imgs_sem_alt", 0), "n_imgs": c.get("n_imgs", 0),
        "inlinks": inlinks.get(u, 0), "inlinks_nav": u in NAV, "outlinks_int": len({path(l["href"]) for l in c.get("links_internos", [])}),
        "outlinks_ext": len(c.get("links_externos", [])), "modified": (c.get("modified") or c.get("published") or "")[:10],
        "no_crawl": u not in cr, "primeiro_link": pl_corpo, "primeiro_anchor": (pl_anc if pl_corpo else ""),
    })
paginas.sort(key=lambda x: -x["clk480"])

# ---------- queries e buckets ----------
buckets = {"ok": [], "title": [], "porta": [], "meio": [], "autoridade": []}
for r in d["query_90"]:
    if r["impressions"] < CFG.get("min_imp_bucket", 150):
        continue
    q = {"q": r["keys"][0], "imp": r["impressions"], "clk": r["clicks"], "pos": round(r["position"], 1), "ctr": round(100 * r["ctr"], 2)}
    p = r["position"]
    if p <= 3: buckets["ok" if r["ctr"] >= 0.015 else "title"].append(q)
    elif p <= 15: buckets["porta"].append(q)
    elif p <= 30: buckets["meio"].append(q)
    else: buckets["autoridade"].append(q)
for k in buckets: buckets[k].sort(key=lambda x: -x["imp"])

# consultas locais (bh / belo horizonte / mg / minas) por pagina
locais = []
for r in d["query_page_90"]:
    q = r["keys"][0]
    if CFG.get("local_regex") and re.search(CFG["local_regex"], q) and r["impressions"] >= CFG.get("min_imp_locais", 15) and not re.search(CFG.get("marca_regex", "$^"), q):
        locais.append({"q": q, "page": path(r["keys"][1]), "imp": r["impressions"], "clk": r["clicks"], "pos": round(r["position"], 1)})
locais.sort(key=lambda x: -x["imp"])

# canibalizacao
byq = collections.defaultdict(dict)
for r in d["query_page_90"]:
    if "#" in r["keys"][1]:
        continue
    pg = path(r["keys"][1])  # soma variantes com/sem barra, www, query string
    a = byq[r["keys"][0]].setdefault(pg, {"keys": [r["keys"][0], base + pg], "clicks": 0, "impressions": 0, "pw": 0.0})
    a["clicks"] += r["clicks"]; a["impressions"] += r["impressions"]; a["pw"] += r["position"] * r["impressions"]
for q in byq:
    for a in byq[q].values():
        a["position"] = a["pw"] / a["impressions"] if a["impressions"] else 0
canib = []
for q, rows in byq.items():
    rows = list(rows.values())
    if len(rows) < 2: continue
    imp = sum(r["impressions"] for r in rows)
    segunda = sorted(rows, key=lambda x: -x["impressions"])[1]["impressions"]
    if imp < CFG.get("min_imp_canib", 150) or segunda < CFG.get("min_segunda_canib", max(2, CFG.get("min_imp_canib", 150) // 8)): continue
    canib.append({"q": q, "imp": imp, "paginas": [{"page": path(r["keys"][1]), "imp": r["impressions"], "clk": r["clicks"], "pos": round(r["position"], 1)} for r in sorted(rows, key=lambda x: -x["impressions"])[:4]]})
canib.sort(key=lambda x: -x["imp"])

# variantes de URL que o Google indexou separadamente (com/sem barra, www, maiusculas)
formas = collections.defaultdict(dict)
for r in d["page_480"]:
    raw = r["keys"][0].split("#")[0]
    formas[path(raw)][raw.replace(base, "") or "/"] = formas[path(raw)].get(raw.replace(base, "") or "/", 0) + r["impressions"]
variantes = [{"page": p, "formas": sorted(f.items(), key=lambda x: -x[1])} for p, f in formas.items() if len(f) > 1]
variantes.sort(key=lambda x: -sum(v for _, v in x["formas"]))

# marca
marca = sum(r["clicks"] for r in d["query_90"] if re.search(CFG.get("marca_regex", "$^"), r["keys"][0]))

# ---------- linkagem ----------
ext_hosts = collections.Counter(); ext_nofollow = 0; ext_total = 0; ext_lista = []
for c in crawl:
    for l in c.get("links_externos", []):
        if re.search(r"\.(jpg|jpeg|png|webp|gif|svg|css|js|pdf)(\?|$)", l["href"], re.I):
            continue  # asset, nao link
        ext_total += 1; ext_hosts[l["host"]] += 1
        if "nofollow" in (l.get("rel") or "") or "sponsored" in (l.get("rel") or ""): ext_nofollow += 1
        ext_lista.append({"de": path(c["url"]), "para": l["href"], "anchor": l["anchor"], "rel": l.get("rel", "")})
orfas = [p for p in paginas if p["inlinks"] == 0 and not p["inlinks_nav"] and p["tipo"] != "utilitaria" and not p["no_crawl"]]
comerciais = [p for p in paginas if p["tipo"] == "comercial"]
anchors_comerciais = {p["url"]: collections.Counter(inlink_anchors.get(p["url"], [])).most_common(6) for p in comerciais}
home = cr.get("/", {})
home_links = [path(l["href"]) for l in home.get("links_internos", [])]

# on-page
problemas = {
    "title_longo": [p["url"] for p in paginas if p["title_len"] > 65],
    "title_curto": [p["url"] for p in paginas if 0 < p["title_len"] < 30],
    "sem_meta": [p["url"] for p in paginas if not p["no_crawl"] and p["meta_len"] == 0],
    "meta_longa": [p["url"] for p in paginas if p["meta_len"] > 165],
    "sem_h1": [p["url"] for p in paginas if not p["no_crawl"] and p["n_h1"] == 0],
    "h1_duplo": [p["url"] for p in paginas if p["n_h1"] > 1],
    "canonical_errado": [p["url"] for p in paginas if not p["no_crawl"] and not p["canonical_ok"]],
    "imgs_sem_alt": [(p["url"], p["imgs_sem_alt"]) for p in paginas if p["imgs_sem_alt"] > 0],
    "fino": [p["url"] for p in paginas if not p["no_crawl"] and p["tipo"] == "post" and 0 < p["palavras"] < 500],
    "sem_schema_local": not any("LocalBusiness" in s or "ProfessionalService" in s or "Organization" in s for s in home.get("schema", [])),
    "status_nao_200": [(p["url"], p["status"]) for p in paginas if not p["no_crawl"] and p["status"] != 200],
    "no_sitemap_mas_gsc": [p["url"] for p in paginas if p["no_crawl"] and p["imp480"] > 50],
}
titles = collections.Counter(p["title"] for p in paginas if p["title"])
problemas["title_duplicado"] = [t for t, n in titles.items() if n > 1]

out = {
    "dominio": dom, "base": base, "gerado": d["gerado"], "dias_dados": DIAS_DADOS, "mensal": mensal, "semanal": semanal, "diario": diario, "paginas": paginas,
    "buckets": buckets, "locais": locais[:60], "canib": canib[:20], "variantes": variantes[:40], "marca_clk90": marca,
    "tot90": {"clk": sum(r["clicks"] for r in d["page_90"]), "imp": sum(r["impressions"] for r in d["page_90"])},
    "tot_ant": {"clk": sum(r["clicks"] for r in d["page_180"]) - sum(r["clicks"] for r in d["page_90"]),
                "imp": sum(r["impressions"] for r in d["page_180"]) - sum(r["impressions"] for r in d["page_90"])},
    "queries_visiveis_clk": sum(r["clicks"] for r in d["query_90"]),
    "device": {r["keys"][0]: {"clk": r["clicks"], "imp": r["impressions"], "pos": round(r["position"], 1)} for r in d["device_90"]},
    "links": {"ext_total": ext_total, "ext_nofollow": ext_nofollow, "ext_hosts": ext_hosts.most_common(25), "ext_lista": ext_lista,
              "orfas": [p["url"] for p in orfas], "anchors_comerciais": anchors_comerciais, "home_links": home_links,
              "inlinks_comerciais": {p["url"]: p["inlinks"] for p in comerciais}, "nav": sorted(NAV), "nav_anchor": {u: nav_anchor.get(u, "") for u in NAV}},
    "problemas": problemas,
    "crawl_n": len(crawl), "crawl_ms_medio": int(sum(c.get("ms", 0) for c in crawl) / max(1, len(crawl))),
}
json.dump(out, open(os.path.join(pasta, "dados", "analise.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("paginas", len(paginas), "| classes:", collections.Counter(p["classe"] for p in paginas))
print("orfas", len(orfas), "| ext links", ext_total, "nofollow", ext_nofollow)
print("problemas:", {k: (len(v) if isinstance(v, list) else v) for k, v in problemas.items()})
