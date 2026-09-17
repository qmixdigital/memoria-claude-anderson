# -*- coding: utf-8 -*-
"""
Busca imagem no Wikimedia Commons, recorta e (ANTES) montava o bloco de credito.

⚠️ Para a imagem de destaque use banco_img.py, que chama este modulo por baixo e
filtra em CC0/dominio publico. Este arquivo continua util para o "buscar" cru.

Substitui a geracao por IA (Runware) quando o assunto tem foto real disponivel.
O Google trata foto documental melhor que ilustracao sintetica, e o credito com
link para a pagina do arquivo satisfaz a licenca.

Uso:
    python commons_img.py buscar "termo em ingles" [--n 12]
    python commons_img.py pegar "File:Nome.jpg" --slug meu-slug --saida DIR
                                 [--largura 1216] [--altura 640] [--foco 0.40]

O "buscar" so lista e filtra. O "pegar" baixa, recorta, grava WebP e imprime o
JSON com os dados de credito, que devem ir para o FIM do artigo.
"""
import argparse, io, json, os, re, sys, urllib.parse, urllib.request

sys.stdout.reconfigure(encoding="utf-8")

API = "https://commons.wikimedia.org/w/api.php"
UA = "QMIX-ImageSourcing/1.0 (https://qmix.digital; contato@qmix.digital)"

# Commons so aceita licenca livre, mas arquivo com essas marcas nao serve para
# uso comercial ou nao permite recorte. Recortar e obra derivada.
PROIBIDO = re.compile(r"\bNC\b|non-?commercial|\bND\b|no-?deriv|fair use|non-?free", re.I)
# Ordem de preferencia: quanto menor o numero, menos obrigacao o credito carrega.
def peso_licenca(nome):
    n = (nome or "").lower()
    if "cc0" in n or "public domain" in n or n.startswith("pd"): return 0
    if "cc by-sa" in n: return 2
    if "cc by" in n: return 1
    return 3


def _get(url):
    return urllib.request.urlopen(
        urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60)


def _limpa(html):
    t = re.sub(r"<[^>]+>", " ", html or "")
    t = t.replace("&amp;", "&").replace("&quot;", '"').replace("&#039;", "'").replace("&nbsp;", " ")
    return re.sub(r"\s+", " ", t).strip()


def _autor_link(artist_html):
    """O campo Artist vem em HTML e costuma trazer o link do perfil do autor."""
    m = re.search(r'href="([^"]+)"', artist_html or "")
    url = m.group(1) if m else ""
    if url.startswith("//"): url = "https:" + url
    if url.startswith("/"): url = "https://commons.wikimedia.org" + url
    # redlink e pagina de usuario que nao existe: linkar para ela leva o leitor
    # (e o rastreador) a uma tela de criacao de artigo. Melhor so o nome.
    if "redlink=1" in url or "action=edit" in url:
        url = ""
    return _limpa(artist_html), url


def consulta(params):
    params.update({"action": "query", "format": "json", "formatversion": "2",
                   "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata",
                   "iiextmetadatafilter": ("LicenseShortName|LicenseUrl|Artist|Credit|"
                                           "ImageDescription|AttributionRequired|Restrictions|"
                                           "UsageTerms|DateTimeOriginal")})
    d = json.loads(_get(API + "?" + urllib.parse.urlencode(params)).read().decode())
    return d.get("query", {}).get("pages", []) or []


def ficha(pagina):
    ii = pagina["imageinfo"][0]
    em = ii.get("extmetadata", {})
    v = lambda k: (em.get(k, {}).get("value", "") or "")
    autor, autor_url = _autor_link(v("Artist"))
    return {
        "titulo": pagina["title"],
        "arquivo_url": ii["url"],
        "pagina_url": ii["descriptionurl"],
        "largura": ii["width"], "altura": ii["height"],
        "mime": ii["mime"], "bytes": ii["size"],
        "licenca": _limpa(v("LicenseShortName")),
        "licenca_url": v("LicenseUrl"),
        "autor": autor or "(autor nao informado)",
        "autor_url": autor_url,
        "descricao": _limpa(v("ImageDescription"))[:300],
        "data": _limpa(v("DateTimeOriginal"))[:40],
        "restricoes": _limpa(v("Restrictions")),
        "atribuicao_obrigatoria": v("AttributionRequired"),
    }


def utilizavel(f, min_larg=900):
    """Devolve (ok, motivo)."""
    if f["mime"] not in ("image/jpeg", "image/png", "image/webp"):
        return False, f"formato {f['mime']}"
    if PROIBIDO.search(f["licenca"]) or PROIBIDO.search(f["restricoes"]):
        return False, f"licenca/restricao proibe uso ou recorte: {f['licenca']} {f['restricoes']}"
    if not f["licenca"]:
        return False, "sem licenca declarada"
    if f["restricoes"]:
        return False, f"restricao: {f['restricoes']}"
    if f["largura"] < min_larg:
        return False, f"largura {f['largura']}px abaixo de {min_larg}"
    return True, ""


def buscar(termo, n=12, min_larg=900):
    pgs = consulta({"generator": "search", "gsrsearch": f"filetype:bitmap {termo}",
                    "gsrnamespace": "6", "gsrlimit": str(max(n * 3, 20))})
    aptos, recusados = [], []
    for p in pgs:
        f = ficha(p)
        ok, motivo = utilizavel(f, min_larg)
        (aptos if ok else recusados).append(f if ok else (f, motivo))
    aptos.sort(key=lambda f: (peso_licenca(f["licenca"]), -f["largura"]))
    return aptos[:n], recusados


def pegar(titulo, slug, saida, largura=1216, altura=640, foco=0.40, min_larg=900):
    pgs = consulta({"titles": titulo})
    if not pgs or "imageinfo" not in pgs[0]:
        raise SystemExit(f"arquivo nao encontrado: {titulo}")
    f = ficha(pgs[0])
    ok, motivo = utilizavel(f, min_larg)
    if not ok:
        raise SystemExit(f"RECUSADO: {motivo}")

    from PIL import Image
    bruto = _get(f["arquivo_url"]).read()
    im = Image.open(io.BytesIO(bruto)).convert("RGB")

    # recorte "cover": preenche o quadro sem deformar, puxando o enquadramento
    # para cima, que e onde costuma estar o assunto.
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
    im = im.resize((largura, altura), Image.LANCZOS)

    os.makedirs(saida, exist_ok=True)
    dest = os.path.join(saida, f"{slug}.webp")
    im.save(dest, "WEBP", quality=82, method=6)
    f["arquivo_local"] = dest
    f["dimensoes_finais"] = [largura, altura]
    f["recortada"] = True
    return f


# O nome da licenca vem em ingles da API. Site pt-BR pede traducao; sigla de
# Creative Commons e padrao internacional e fica como esta.
TRADUZ_LICENCA = {
    "public domain": "domínio público",
    "pd-old": "domínio público",
    "pd-us": "domínio público",
    "no restrictions": "sem restrições de uso",
}


# 🔴 DESATIVADO em 10/09/2026. legenda() e bloco_credito() saiam byte-identicos
# em todos os portais ("Creditos das imagens" + "recortada para este artigo") e
# uma busca no Google devolvia a rede inteira. A imagem de destaque agora vem
# de banco_img.py, que so aceita foto SEM obrigacao de credito (Pixabay, Pexels,
# Commons em CC0/dominio publico), entao nao ha bloco nenhum para gerar.
# As duas funcoes ficam aqui so para o auditar.py reconhecer o bloco antigo.
def legenda(fonte="Wikimedia Commons"):
    """DESATIVADA. Linha curta que ia LOGO ABAIXO da imagem de destaque.

    Fica sem link de proposito. Em guest post, qualquer <a> aqui apareceria antes
    do link do cliente e quebraria a regra de que ele e o primeiro do conteudo.
    O link de verdade fica no bloco_credito(), no fim do artigo.
    """
    return (f'<p class="credito-imagem"><em>Imagem: {fonte} '
            f'(Créditos e link no final do artigo)</em></p>')


def bloco_credito(fichas, rel="nofollow noopener", titulo_secao="Créditos das imagens"):
    """DESATIVADA, ver o aviso acima. HTML do bloco que ia no FIM do artigo.

    Cada ficha aceita `nome_exibido`: use uma descricao curta em portugues, porque
    o nome cru do arquivo do Commons costuma ser ilegivel como texto ancora.
    """
    itens = []
    for f in fichas:
        nome = f.get("nome_exibido") or f["titulo"].replace("File:", "").rsplit(".", 1)[0].replace("_", " ")
        f["licenca"] = TRADUZ_LICENCA.get(f["licenca"].strip().lower(), f["licenca"])
        autor = (f'<a href="{f["autor_url"]}" target="_blank" rel="{rel}">{f["autor"]}</a>'
                 if f.get("autor_url") else f["autor"])
        lic = (f'<a href="{f["licenca_url"]}" target="_blank" rel="{rel}">{f["licenca"]}</a>'
               if f.get("licenca_url") else f["licenca"])
        mod = ", recortada para este artigo" if f.get("recortada") else ""
        itens.append(
            f'<li>"<a href="{f["pagina_url"]}" target="_blank" rel="{rel}">{nome}</a>", '
            f'de {autor}, via Wikimedia Commons, sob licença {lic}{mod}.</li>')
    return (f"<h2>{titulo_secao}</h2>\n<ul>\n" + "\n".join(itens) + "\n</ul>")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("buscar"); b.add_argument("termo"); b.add_argument("--n", type=int, default=12)
    b.add_argument("--min-larg", type=int, default=900)
    g = sub.add_parser("pegar"); g.add_argument("titulo"); g.add_argument("--slug", required=True)
    g.add_argument("--saida", required=True); g.add_argument("--largura", type=int, default=1216)
    g.add_argument("--altura", type=int, default=640); g.add_argument("--foco", type=float, default=0.40)
    a = ap.parse_args()

    if a.cmd == "buscar":
        aptos, recusados = buscar(a.termo, a.n, a.min_larg)
        print(f"APTOS ({len(aptos)}):")
        for f in aptos:
            print(f'  [{f["licenca"]}] {f["titulo"]}')
            print(f'      {f["largura"]}x{f["altura"]} | {f["autor"][:60]}')
            print(f'      {f["descricao"][:110]}')
            print(f'      {f["pagina_url"]}')
        print(f"\nRECUSADOS ({len(recusados)}):")
        for f, motivo in recusados[:8]:
            print(f'  {f["titulo"][:70]} -> {motivo}')
    else:
        f = pegar(a.titulo, a.slug, a.saida, a.largura, a.altura, a.foco)
        print(json.dumps(f, ensure_ascii=False, indent=1))
        print("\n--- bloco de credito ---")
        print(bloco_credito([f]))
