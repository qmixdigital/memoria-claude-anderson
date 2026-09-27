# -*- coding: utf-8 -*-
"""
Foto de banco gratis SEM obrigacao de credito, para a imagem de destaque do
guest post. Tres fontes atras de uma busca so:

    pixabay   licenca propria, atribuicao opcional. A API PROIBE hotlink e
              exige baixar para o nosso servidor, que e o que fazemos.
    pexels    licenca propria, atribuicao opcional.
    commons   Wikimedia Commons filtrado em CC0 e dominio publico. E a unica
              das tres com assunto brasileiro (cidade, orgao, autoridade).

Por que existe: o lote da grafotecnia de 09/09/2026 saiu com um bloco
"Creditos das imagens" byte-identico em 10 portais, com a frase "recortada
para este artigo" e dois links de saida iguais em todos. Uma busca no Google
devolvia a rede inteira. Como nenhuma das tres fontes acima exige credito, o
bloco simplesmente deixa de existir. A fonte fica gravada no JSON, para
registro interno, e nunca vai para o HTML.

🔴 O TERMO DE BUSCA E EM INGLES, nas tres fontes. Ordem do Anderson em
10/09/2026: o resultado e melhor em ingles em todas elas. Portugues so serve
para o alt, que quem redige escreve olhando a foto.

Uso:
    python banco_img.py buscar "search term in english" [--n 8] [--fonte todas|pixabay|pexels|commons]
                               [--portal slug]
    python banco_img.py pegar  --termo "search term in english" --slug meu-slug --saida DIR
                               [--fonte ...] [--portal slug] [--id pixabay:123456]
                               [--largura 1216] [--altura 640] [--foco 0.40]

O "buscar" lista candidatos aptos, em ordem. O "pegar" escolhe o primeiro
(ou o `--id` indicado), baixa, recorta em cover, grava WebP e imprime a ficha
em JSON. A ficha traz `credito_obrigatorio: false` sempre: se uma fonte devolver
algo que exija credito, ela e recusada aqui dentro.

Chaves: C:/Users/User/Documents/APIs/pixabay.txt e pexels.txt, ou as variaveis
PIXABAY_KEY e PEXELS_KEY.
"""
import argparse, hashlib, io, json, os, re, sys, time, urllib.parse, urllib.request, urllib.error

sys.stdout.reconfigure(encoding="utf-8")

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import commons_img  # noqa: E402

PASTA_CHAVES = "C:/Users/User/Documents/APIs"
CACHE = os.path.join(AQUI, ".cache_banco")
# a API do Pixabay exige cache de 24 h por consulta. Vale para as tres.
CACHE_TTL = 24 * 3600

# ⚠️ a API do Pexels fica atras da Cloudflare e recusa o User-Agent padrao do
# Python com "403 error code: 1010". Parece chave errada, e nao e: chave errada
# devolve 401. Um User-Agent de navegador resolve.
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) qmix-banco-img/1.0"

# O Pixabay aceita upload gerado por IA e etiqueta nas tags. Nao existe
# parametro de API para excluir, entao o filtro e aqui, pela tag.
RX_IA = re.compile(r"\b(ai[- ]?generated|ai[- ]?art|generated|midjourney|stable diffusion|dall-?e|"
                   r"artificial intelligence|intelig[eê]ncia artificial|gerad[ao] por ia|\bia\b|\bai\b|"
                   r"\b3d\b|render)", re.I)

FONTES = ("pixabay", "pexels", "commons")


def chave(nome):
    v = os.environ.get(nome.upper() + "_KEY")
    if v:
        return v.strip()
    p = os.path.join(PASTA_CHAVES, nome + ".txt")
    if not os.path.exists(p):
        raise SystemExit(f"sem chave do {nome}: crie {p} ou exporte {nome.upper()}_KEY")
    return io.open(p, encoding="utf-8").read().strip()


def _cache_get(k):
    os.makedirs(CACHE, exist_ok=True)
    p = os.path.join(CACHE, hashlib.sha1(k.encode()).hexdigest() + ".json")
    if os.path.exists(p) and time.time() - os.path.getmtime(p) < CACHE_TTL:
        return json.load(io.open(p, encoding="utf-8"))
    return None


def _cache_put(k, dados):
    p = os.path.join(CACHE, hashlib.sha1(k.encode()).hexdigest() + ".json")
    io.open(p, "w", encoding="utf-8").write(json.dumps(dados, ensure_ascii=False))


def _json(url, headers=None):
    hit = _cache_get(url)
    if hit is not None:
        return hit
    h = {"User-Agent": UA, "Accept": "application/json"}
    h.update(headers or {})
    try:
        d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=40))
    except urllib.error.HTTPError as e:
        corpo = e.read()[:200].decode("utf-8", "replace")
        raise SystemExit(f"HTTP {e.code} em {url.split('?')[0]}: {corpo}")
    _cache_put(url, d)
    return d


# ---------------------------------------------------------------- fontes ----

def buscar_pixabay(termo, n=8, min_larg=1200):
    q = urllib.parse.urlencode({
        "key": chave("pixabay"), "q": termo[:100], "lang": "en", "image_type": "photo",
        "orientation": "horizontal", "min_width": min_larg, "safesearch": "true",
        "per_page": max(20, n * 3)})
    d = _json("https://pixabay.com/api/?" + q)
    fora, out = [], []
    for h in d.get("hits", []):
        tags = h.get("tags", "")
        if RX_IA.search(tags) or RX_IA.search(h.get("user", "")):
            fora.append((tags, "gerada por IA"))
            continue
        out.append({
            "fonte": "pixabay", "id": f'pixabay:{h["id"]}',
            "arquivo_url": h.get("largeImageURL") or h.get("webformatURL"),
            "pagina_url": h.get("pageURL"),
            "largura": h.get("imageWidth"), "altura": h.get("imageHeight"),
            "autor": h.get("user", ""), "autor_url": f'https://pixabay.com/users/{h.get("user","")}-{h.get("user_id","")}/',
            "licenca": "Pixabay Content License", "licenca_url": "https://pixabay.com/service/license-summary/",
            "descricao": tags, "credito_obrigatorio": False,
        })
    return out[:n], fora


def buscar_pexels(termo, n=8, min_larg=1200):
    q = urllib.parse.urlencode({"query": termo[:100], "locale": "en-US", "orientation": "landscape",
                                "size": "large", "per_page": max(20, n * 3)})
    d = _json("https://api.pexels.com/v1/search?" + q, {"Authorization": chave("pexels")})
    out = []
    for p in d.get("photos", []):
        if (p.get("width") or 0) < min_larg:
            continue
        out.append({
            "fonte": "pexels", "id": f'pexels:{p["id"]}',
            "arquivo_url": p["src"].get("large2x") or p["src"].get("original"),
            "pagina_url": p.get("url"),
            "largura": p.get("width"), "altura": p.get("height"),
            "autor": p.get("photographer", ""), "autor_url": p.get("photographer_url", ""),
            "licenca": "Pexels License", "licenca_url": "https://www.pexels.com/license/",
            "descricao": p.get("alt") or "", "credito_obrigatorio": False,
        })
    return out[:n], []


def buscar_commons(termo, n=8, min_larg=1200):
    aptos, recusados = commons_img.buscar(termo, n=n * 3, min_larg=min_larg)
    out, fora = [], [(f["titulo"], m) for f, m in recusados]
    for f in aptos:
        # SO CC0 e dominio publico: e o que dispensa credito. CC BY sai.
        if commons_img.peso_licenca(f["licenca"]) != 0:
            fora.append((f["titulo"], f"exige credito: {f['licenca']}"))
            continue
        out.append({
            "fonte": "commons", "id": "commons:" + f["titulo"],
            "arquivo_url": f["arquivo_url"], "pagina_url": f["pagina_url"],
            "largura": f["largura"], "altura": f["altura"],
            "autor": f["autor"] if f["autor"] != "(autor nao informado)" else "",
            "autor_url": f["autor_url"],
            "licenca": f["licenca"], "licenca_url": f["licenca_url"],
            "descricao": f["descricao"], "credito_obrigatorio": False,
        })
    return out[:n], fora


BUSCA = {"pixabay": buscar_pixabay, "pexels": buscar_pexels, "commons": buscar_commons}


def ordem_por_portal(portal):
    """A rede nao pode sair 100% de uma fonte so. O portal decide por onde a
    busca comeca, sempre do mesmo jeito para o mesmo portal."""
    if not portal:
        return list(FONTES)
    h = int(hashlib.sha1(portal.encode()).hexdigest(), 16) % len(FONTES)
    return list(FONTES[h:]) + list(FONTES[:h])


def buscar(termo, n=8, fonte="todas", portal=None, min_larg=1200):
    fontes = list(FONTES) if fonte == "todas" else [fonte]
    if fonte == "todas":
        fontes = ordem_por_portal(portal)
    todos, fora = [], []
    for f in fontes:
        try:
            a, r = BUSCA[f](termo, n=n, min_larg=min_larg)
        except SystemExit as e:
            fora.append((f, str(e)))
            continue
        todos.extend(a)
        fora.extend(r)
    return todos, fora


# ------------------------------------------------------------------ pegar ----

def recorta(bruto, largura, altura, foco):
    from PIL import Image
    im = Image.open(io.BytesIO(bruto)).convert("RGB")
    alvo = largura / altura
    l, a = im.size
    if l / a > alvo:
        nova_l = round(a * alvo)
        esq = round((l - nova_l) * 0.5)
        im = im.crop((esq, 0, esq + nova_l, a))
    else:
        nova_a = round(l / alvo)
        topo = max(0, round((a - nova_a) * foco))
        im = im.crop((0, topo, l, topo + nova_a))
    return im.resize((largura, altura), Image.LANCZOS)


def pegar(termo=None, slug=None, saida=None, fonte="todas", portal=None,
          id_=None, largura=1216, altura=640, foco=0.40, escolha=0):
    cands, fora = buscar(termo, n=12, fonte=fonte, portal=portal)
    if id_:
        cands = [c for c in cands if c["id"] == id_] or cands
        if not cands or cands[0]["id"] != id_:
            raise SystemExit(f"id {id_} nao esta entre os candidatos desta busca")
    if not cands:
        raise SystemExit("nenhuma foto apta. Recusadas: " + json.dumps(fora[:6], ensure_ascii=False))
    f = dict(cands[min(escolha, len(cands) - 1)])
    if f.get("credito_obrigatorio"):
        raise SystemExit("candidato exige credito, e este modulo nao publica credito")

    bruto = urllib.request.urlopen(urllib.request.Request(
        f["arquivo_url"], headers={"User-Agent": UA}), timeout=90).read()
    im = recorta(bruto, largura, altura, foco)
    os.makedirs(saida, exist_ok=True)
    dest = os.path.join(saida, f"{slug}.webp")
    im.save(dest, "WEBP", quality=82, method=6)
    f["arquivo_local"] = dest
    f["dimensoes_finais"] = [largura, altura]
    f["recortada"] = True
    f["termo_busca"] = termo
    # o alt e escrito por quem redige, olhando a foto. `descricao` e so pista.
    return f


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("buscar"); b.add_argument("termo"); b.add_argument("--n", type=int, default=8)
    b.add_argument("--fonte", choices=("todas",) + FONTES, default="todas")
    b.add_argument("--portal")
    g = sub.add_parser("pegar"); g.add_argument("--termo", required=True); g.add_argument("--slug", required=True)
    g.add_argument("--saida", required=True); g.add_argument("--fonte", choices=("todas",) + FONTES, default="todas")
    g.add_argument("--portal"); g.add_argument("--id")
    g.add_argument("--escolha", type=int, default=0, help="posicao na lista do buscar, 0 = primeira")
    g.add_argument("--largura", type=int, default=1216); g.add_argument("--altura", type=int, default=640)
    g.add_argument("--foco", type=float, default=0.40)
    a = ap.parse_args()

    if a.cmd == "buscar":
        aptos, fora = buscar(a.termo, a.n, a.fonte, a.portal)
        print(f"APTOS ({len(aptos)}), ordem: {', '.join(ordem_por_portal(a.portal)) if a.fonte == 'todas' else a.fonte}")
        for f in aptos:
            print(f'  [{f["id"]}] {f["largura"]}x{f["altura"]} | {f["licenca"]} | {f["autor"][:40]}')
            print(f'      {f["descricao"][:110]}')
            print(f'      {f["pagina_url"]}')
        if fora:
            print(f"\nFORA ({len(fora)}):")
            for t, m in fora[:8]:
                print(f"  {str(t)[:70]} -> {m}")
    else:
        f = pegar(a.termo, a.slug, a.saida, a.fonte, a.portal, a.id, a.largura, a.altura, a.foco, a.escolha)
        print(json.dumps(f, ensure_ascii=False, indent=1))
