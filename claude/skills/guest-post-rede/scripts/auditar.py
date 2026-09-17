# -*- coding: utf-8 -*-
"""O portao do lote de guest post. Roda em dois modos:

  python auditar.py local  lote.json
  python auditar.py ar     lote.json

O `lote.json` e uma lista de objetos:
  {"arquivo": "1.html", "url": "https://portal/cat/slug/", "cliente": "cliente.com.br",
   "termos": ["keyword principal", "variacao"], "titulo": "...", "sufixo": 12,
   "meta": "..."}

No modo `local` so precisa de arquivo, cliente, termos, titulo, sufixo e meta.
No modo `ar` so precisa de url, cliente e termos.

Sai com codigo 1 se houver qualquer erro, para poder ser usado como portao.
"""
import json, re, sys, time, unicodedata, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0 Safari/537.36"}

PAL_MIN, PAL_MAX = 1100, 1400
H2_MIN, H3_MIN = 9, 6
META_MIN, META_MAX = 150, 160
TITULO_MAX = 60
# Regra do operador, 07/09/2026: piso de 1%, teto de 3%.
# O teto comecou em 2% e subiu no mesmo dia: com 2%, keyword de 6 palavras nao
# fechava, porque H1 + linha fina + um H2 + as 3 do corpo ja passavam do limite.
DENS_MIN, DENS_MAX = 1.0, 3.0
INTERNOS = 2
# Camada C: correspondencia exata da keyword. Densidade percentual aprova artigo
# cuja keyword so aparece no title, no H1 e no dek, e some do corpo. Foi o que
# deixou passar um lote inteiro em 07/09/2026. Contagem exata resolve.
KW_MIN, KW_MAX = 3, 8      # ocorrencias exatas no CORPO
TERMO_MIN = 3              # cada palavra forte da keyword, no texto todo
STOP = {"a","o","as","os","de","do","da","dos","das","e","em","no","na","nos",
        "nas","um","uma","para","por","com","que","se","ao","aos","é"}


def fortes(kw):
    """Palavras da keyword que carregam sentido (fora stop words e numeros soltos)."""
    return [w for w in n(kw).split() if w not in STOP and len(w) > 2]


def camada_c(kw, titulo, meta, corpo_txt, h2_lista, primeiros):
    """Correspondencia exata da keyword. Devolve lista de problemas."""
    p, k = [], n(kw)
    if k not in n(titulo):
        p.append("keyword fora do title")
    if k not in n(primeiros):
        p.append("keyword fora das 100 primeiras palavras")
    if not any(k in n(x) for x in h2_lista):
        p.append("keyword fora de todos os H2")
    if k not in n(meta):
        p.append("keyword fora da meta/resumo")
    nk = n(corpo_txt).count(k)
    if nk < KW_MIN:
        p.append("keyword %dx no corpo (minimo %d)" % (nk, KW_MIN))
    elif nk > KW_MAX:
        p.append("keyword %dx no corpo (maximo %d, vira spam)" % (nk, KW_MAX))
    faltam = [w for w in fortes(kw) if n(corpo_txt).count(w) < TERMO_MIN]
    if faltam:
        p.append("termos da keyword usados menos de %dx: %s" % (TERMO_MIN, ", ".join(faltam)))
    return p


def n(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def baixar(u, t=60):
    return urllib.request.urlopen(
        urllib.request.Request(u + ("&" if "?" in u else "?") + "nc=%d" % time.time(),
                               headers=UA), timeout=t).read().decode("utf-8", "replace")


def status(u):
    try:
        return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception:
        return 0


def links_do_corpo(bloco):
    """Links do conteudo, sem menu, autor, compartilhamento nem relacionados."""
    L = []
    for m in re.finditer(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', bloco, re.S):
        x, txt = m.group(1), re.sub(r"<[^>]+>", "", m.group(2)).strip()
        if x.startswith("#") or "/autor/" in x or "google.com/preferences" in x:
            continue
        if any(s in x for s in ("whatsapp.com", "facebook.com", "twitter.com", "linkedin.com")):
            continue
        if re.search(r"\d{1,2} de [a-z]{3}", txt):
            continue
        L.append((x, txt))
    return L


# Bloco "Creditos das imagens" (foto do Wikimedia Commons, padrao desde 10/09/2026):
# links externos com rel=nofollow para o arquivo, o autor ou a licenca. Nao sao
# links internos nem conteudo, entao saem das duas contagens.
CRED_RX = re.compile(r"<h2[^>]*>\s*Cr[eé]ditos das imagens\s*</h2>.*?</ul>", re.S | re.I)
CRED_DOM = ("commons.wikimedia.org", "creativecommons.org", "flickr.com", "wikimedia.org", "wikipedia.org")

def _sem_creditos(html):
    return CRED_RX.sub(" ", html)

# 🔴 Desde 10/09/2026 o bloco de credito e PROIBIDO: saia byte-identico em 10
# portais e uma busca no Google devolvia a rede inteira. A foto vem de
# banco_img.py, que so aceita fonte sem obrigacao de credito. Qualquer uma
# destas marcas no HTML reprova o artigo, local ou no ar.
MARCAS_CREDITO = (
    (re.compile(r"Cr[eé]ditos? d[ae]s? imagens?", re.I), "bloco 'Creditos das imagens'"),
    (re.compile(r"recortada para este artigo", re.I), "frase 'recortada para este artigo'"),
    (re.compile(r"via Wikimedia Commons", re.I), "'via Wikimedia Commons' no texto"),
    (re.compile(r"link no final do artigo", re.I), "legenda 'Creditos e link no final do artigo'"),
    (re.compile(r'class="credito-imagem"', re.I), "legenda de fonte sob a foto"),
    (re.compile(r"(?:commons\.wikimedia|creativecommons)\.org", re.I), "link de saida para Commons/CC"),
)

def _marcas_de_credito(html):
    """Lista o que ainda denuncia o padrao antigo de credito de imagem."""
    return [nome for rx, nome in MARCAS_CREDITO if rx.search(html or "")]

def _e_credito(url, tag=""):
    return any(d in url for d in CRED_DOM) or 'rel="nofollow' in tag


# ---------------------------------------------------------------- modo local
def auditar_local(a):
    p = []
    _cru = open(a["arquivo"], encoding="utf-8").read()
    for m in _marcas_de_credito(_cru):
        p.append("credito de imagem proibido: " + m)
    c = _sem_creditos(_cru)
    corpo = re.sub(r"<aside.*?</aside>", " ", c, flags=re.S)
    txt = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", corpo))
    pal = len(re.findall(r"[\wÀ-ÿ]+", txt))
    h2, h3 = c.count("<h2"), c.count("<h3")
    L = links_do_corpo(c)
    internos = [x for x, t in L if a["cliente"] not in x and not _e_credito(x)]

    if not (PAL_MIN <= pal <= PAL_MAX):
        p.append("%d palavras (faixa %d-%d)" % (pal, PAL_MIN, PAL_MAX))
    if h2 < H2_MIN:
        p.append("%d H2 (minimo %d)" % (h2, H2_MIN))
    if h3 < H3_MIN:
        p.append("%d H3 (minimo %d)" % (h3, H3_MIN))
    if c.count("<table") != 1:
        p.append("%d tabelas (esperado 1)" % c.count("<table"))
    if c.count("<ol") != 1:
        p.append("%d listas ordenadas (esperado 1)" % c.count("<ol"))
    if "<table" in c and "data-rotulo" not in c:
        p.append("tabela sem data-rotulo (nao vira card no mobile)")
    if c.count("pe-leia-meio") != 1:
        p.append("bloco Leia tambem ausente ou duplicado")
    if "—" in c:
        p.append("travessao no texto")
    if not L or a["cliente"] not in L[0][0]:
        p.append("primeiro link nao e do cliente")
    if len(internos) != INTERNOS:
        p.append("%d links internos (esperado %d)" % (len(internos), INTERNOS))
    # o link do cliente tem que vir antes do terceiro H2
    pos_link = c.find("<a href")
    h2s = [m.start() for m in re.finditer(r"<h2", c)]
    if len(h2s) >= 3 and pos_link > h2s[2]:
        p.append("link do cliente depois do 3o H2")
    t = len(a["titulo"]) + a.get("sufixo", 0)
    if t > TITULO_MAX:
        p.append("title %d com sufixo (max %d)" % (t, TITULO_MAX))
    if not (META_MIN <= len(a["meta"]) <= META_MAX):
        p.append("meta %d chars (faixa %d-%d)" % (len(a["meta"]), META_MIN, META_MAX))
    # A densidade precisa medir o MESMO texto que o modo ar mede, senao o portao
    # local reprova artigo que esta correto no ar. No ar, o bloco comeca no H1 e
    # inclui a linha fina; aqui isso so e possivel se o lote trouxer h1 e dek.
    # Sem eles, mede-se o corpo e avisa-se que a conta e parcial.
    extra = " ".join(x for x in (a.get("h1", ""), a.get("dek", "")) if x)
    txt_dens = (extra + " " + txt) if extra else txt
    pal_dens = pal + len(re.findall(r"[\wÀ-ÿ]+", extra))
    dens = 100.0 * n(txt_dens).count(n(a["termos"][0])) * len(a["termos"][0].split()) / max(pal_dens, 1)
    if not extra:
        p.append("AVISO densidade %.2f%% medida so no corpo (lote sem h1/dek)" % dens)
    if dens > DENS_MAX:
        p.append("densidade %.2f%% (maximo %.1f%%)" % (dens, DENS_MAX))
    if dens < DENS_MIN:
        p.append("densidade %.2f%% (minimo %.1f%%)" % (dens, DENS_MIN))
    h2_txt = [re.sub(r"<[^>]+>", "", x).strip()
              for x in re.findall(r"<h2[^>]*>(.*?)</h2>", c, re.S)]
    p += camada_c(a["termos"][0], a["titulo"], a["meta"], txt_dens, h2_txt,
                  " ".join(txt_dens.split()[:100]))
    return dict(nome=a["arquivo"], pal=pal, h2=h2, h3=h3, prob=p)


# ------------------------------------------------------------------- modo ar
def auditar_ar(a):
    url, cliente, termos = a["url"], a["cliente"], a["termos"]
    dom = url.split("/")[2]
    p = []
    _cru = baixar(url)
    _art_cru = _cru.split("</article>")[0]
    for m in _marcas_de_credito(_art_cru):
        p.append("credito de imagem proibido: " + m)
    h = _sem_creditos(_cru)
    art = h.split("</article>")[0]
    m = re.search(r"<h1", art)
    bloco = art[m.start():] if m else art

    tit = re.sub(r"\s+", " ", re.search(r"<title[^>]*>(.*?)</title>", h, re.S).group(1)).strip()
    md = re.search(r'name="description"\s+content="([^"]*)"', h)
    md = md.group(1) if md else ""
    h1s = re.findall(r"<h1[^>]*>(.*?)</h1>", art, re.S)
    h1 = re.sub(r"<[^>]+>", "", h1s[0]).strip() if h1s else ""
    h2 = [re.sub(r"<[^>]+>", "", x).strip() for x in re.findall(r"<h2[^>]*>(.*?)</h2>", bloco, re.S)]

    limpo = re.sub(r"<aside.*?</aside>", " ", bloco, flags=re.S)
    ps = [re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", x)).strip()
          for x in re.findall(r"<p[^>]*>(.*?)</p>", bloco, re.S)]
    dek = ps[0] if ps else ""
    for x in re.findall(r"<p[^>]*>(.*?)</p>", limpo, re.S):
        if re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", x)).strip() == dek:
            limpo = limpo.replace(x, "", 1)
    txt = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", limpo))
    pal = re.findall(r"[\wÀ-ÿ]+", txt)

    tipos = set()
    for b in re.findall(r'application/ld\+json[^>]*>(.*?)</script>', h, re.S):
        try:
            d = json.loads(b)
        except Exception:
            p.append("JSON-LD invalido"); continue
        for o in (d if isinstance(d, list) else [d]):
            for x in (o.get("@graph") or [o]):
                tt = x.get("@type")
                tipos |= set(tt if isinstance(tt, list) else [str(tt)])

    if len(tit) > TITULO_MAX:
        p.append("title %d" % len(tit))
    if not (META_MIN <= len(md) <= META_MAX):
        p.append("meta %d" % len(md))
    if len(h1s) != 1:
        p.append("%d H1" % len(h1s))
    if n(h1) == n(tit):
        p.append("H1 igual ao title")
    if not any(n(t) in n(h1) for t in termos):
        p.append("keyword fora do H1")
    if not any(any(n(t) in n(x) for t in termos) for x in h2):
        p.append("keyword fora dos H2")
    if n(termos[0]) not in " ".join(n(txt).split()[:100]):
        p.append("keyword fora das 100 primeiras palavras")
    if len(pal) < PAL_MIN:
        p.append("%d palavras" % len(pal))
    dens = 100.0 * len(re.findall(re.escape(n(termos[0])), n(txt))) * len(termos[0].split()) / max(len(pal), 1)
    if dens > DENS_MAX:
        p.append("densidade %.2f%%" % dens)
    if dens < DENS_MIN:
        p.append("densidade %.2f%% abaixo do piso" % dens)
    nk = n(txt).count(n(termos[0]))
    if nk < KW_MIN:
        p.append("keyword %dx no corpo no ar (minimo %d)" % (nk, KW_MIN))
    faltam_ar = [w for w in fortes(termos[0]) if n(txt).count(w) < TERMO_MIN]
    if faltam_ar:
        p.append("termos pouco usados no ar: %s" % ", ".join(faltam_ar))
    for t in ("NewsArticle", "FAQPage", "BreadcrumbList"):
        if t not in tipos:
            p.append("sem %s" % t)
    can = re.search(r'rel="canonical"[^>]*href="([^"]*)"', h)
    if not can:
        p.append("sem canonical")
    elif can.group(1).rstrip("/") != url.rstrip("/"):
        p.append("canonical aponta para outro endereco")
    if len(set(re.findall(r'property="(og:[a-z:]+)"', h))) < 6:
        p.append("menos de 6 tags Open Graph")
    if len(set(re.findall(r'name="(twitter:[a-z:]+)"', h))) < 3:
        p.append("menos de 3 tags Twitter")
    if "viewport" not in h:
        p.append("sem viewport")
    rb = re.search(r'name="robots"\s+content="([^"]*)"', h)
    if rb and "noindex" in rb.group(1):
        p.append("NOINDEX")
    img = re.search(r"<img[^>]+>", bloco)
    tag = img.group(0) if img else ""
    if not re.search(r'alt="[^"]{10,}"', tag):
        p.append("imagem sem alt descritivo")
    if "width=" not in tag or "height=" not in tag:
        p.append("imagem sem width/height")
    if ".webp" not in tag:
        p.append("imagem fora de WebP")
    if "<table" in bloco and "data-rotulo" not in bloco:
        p.append("tabela sem data-rotulo")

    L = links_do_corpo(bloco)
    if not L or cliente not in L[0][0]:
        p.append("primeiro link nao e do cliente")
    internos = [x for x, t in L if cliente not in x and not _e_credito(x)]
    if len(internos) != INTERNOS:
        p.append("internos=%d" % len(internos))
    if [t for x, t in L if n(t) in ("clique aqui", "saiba mais", "veja mais", "aqui")]:
        p.append("ancora generica")
    for x, t in L:
        alvo = x if x.startswith("http") else "https://" + dom + x
        if status(alvo) >= 400:
            p.append("link quebrado: %s" % alvo[:60])
    try:
        if url not in baixar("https://%s/sitemap.xml" % dom):
            p.append("fora do sitemap")
    except Exception:
        p.append("sitemap inacessivel")
    return dict(nome=dom, pal=len(pal), h2=len(h2), h3=len(re.findall(r"<h3", bloco)),
                tit=len(tit), md=len(md), dens=dens, prob=p)


def main():
    if len(sys.argv) < 3 or sys.argv[1] not in ("local", "ar"):
        print(__doc__); return 2
    modo, lote = sys.argv[1], json.load(open(sys.argv[2], encoding="utf-8"))
    fn = auditar_local if modo == "local" else auditar_ar
    with ThreadPoolExecutor(5 if modo == "ar" else 1) as ex:
        R = list(ex.map(fn, lote))
    erros = 0
    for r in R:
        marca = "OK" if not r["prob"] else "!! " + "; ".join(r["prob"])
        extra = ""
        if modo == "ar":
            extra = " t%d m%d dens%.2f" % (r["tit"], r["md"], r["dens"])
        print("%-30s %4d pal h2=%d h3=%d%s\n     %s" % (
            r["nome"], r["pal"], r["h2"], r["h3"], extra, marca))
        erros += len(r["prob"])
    print("\n>>> %d erros em %d artigos (modo %s)" % (erros, len(R), modo))
    return 1 if erros else 0


if __name__ == "__main__":
    sys.exit(main())
